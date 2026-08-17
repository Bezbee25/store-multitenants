import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { z } from 'zod';
import { generateJwtToken, authenticate } from '../middleware/auth.js';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['CUSTOMER', 'MANAGER', 'SUPERADMIN']).optional()
});

export default async function authRoutes(app: FastifyInstance) {
  // 1. Inscription Client pour le tenant en cours
  app.post('/api/auth/register', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(400).send({ error: 'Sous-domaine boutique requis pour s\'inscrire.' });
    }

    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({ error: 'Champs invalides', details: parse.error.format() });
    }

    const { email, password, fullName, phone } = parse.data;

    // Check if customer already exists for this tenant
    const existing = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email
        }
      }
    });

    if (existing) {
      return reply.code(409).send({ error: 'Un compte avec cet email existe déjà pour cette boutique.' });
    }

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        fullName,
        phone,
        role: 'CUSTOMER'
      }
    });

    const token = generateJwtToken({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: user.role
    });

    return reply.code(201).send({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    });
  });

  // 2. Connexion (Client, Gérant ou Super-Admin)
  app.post('/api/auth/login', async (req, reply) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({ error: 'Email et mot de passe requis.' });
    }

    const { email, password, role } = parse.data;

    // A. Check if it is a SuperAdmin login
    if (role === 'SUPERADMIN' || email.includes('admin@woxxapp.de')) {
      const superAdmin = await prisma.user.findFirst({
        where: { email, role: 'SUPERADMIN' }
      });

      if (superAdmin && superAdmin.passwordHash) {
        const valid = await argon2.verify(superAdmin.passwordHash, password);
        if (valid) {
          const token = generateJwtToken({
            userId: superAdmin.id,
            tenantId: null,
            email: superAdmin.email,
            role: 'SUPERADMIN'
          });
          return reply.send({
            token,
            user: {
              id: superAdmin.id,
              email: superAdmin.email,
              fullName: superAdmin.fullName,
              role: 'SUPERADMIN'
            }
          });
        }
      }
    }

    // B. Tenant-scoped login (Manager or Customer)
    const tenant = req.tenant;
    if (!tenant) {
      // Check if user is manager for ANY tenant
      const managerUser = await prisma.user.findFirst({
        where: { email, role: 'MANAGER' },
        include: { tenant: true }
      });

      if (managerUser && managerUser.passwordHash) {
        const valid = await argon2.verify(managerUser.passwordHash, password);
        if (valid) {
          const token = generateJwtToken({
            userId: managerUser.id,
            tenantId: managerUser.tenantId,
            email: managerUser.email,
            role: 'MANAGER'
          });
          return reply.send({
            token,
            tenantSubdomain: managerUser.tenant?.subdomain,
            user: {
              id: managerUser.id,
              email: managerUser.email,
              fullName: managerUser.fullName,
              role: managerUser.role,
              tenantId: managerUser.tenantId
            }
          });
        }
      }

      return reply.code(400).send({ error: 'Sous-domaine requis ou identifiants incorrects.' });
    }

    const user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email
        }
      }
    });

    if (!user || !user.passwordHash) {
      return reply.code(401).send({ error: 'Email ou mot de passe incorrect.' });
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      return reply.code(401).send({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = generateJwtToken({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: user.role
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    });
  });

  // 3. Connexion Google OAuth / Social Login
  app.post('/api/auth/google', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(400).send({ error: 'Sous-domaine requis.' });
    }

    const { email, fullName, googleId, phone } = req.body as any;
    if (!email || !googleId) {
      return reply.code(400).send({ error: 'Données Google incomplètes.' });
    }

    let user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email
        }
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          fullName: fullName || email.split('@')[0],
          googleId,
          phone: phone || '',
          role: 'CUSTOMER'
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    }

    const token = generateJwtToken({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: user.role
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      }
    });
  });

  // 4. Récupérer le profil courant (compatible WoxxApp Proxy SSO)
  app.get('/api/auth/me', { preHandler: [authenticate] }, async (req, reply) => {
    const userPayload = req.user!;
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    });

    if (user) {
      return reply.send({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId
      });
    }

    // Return proxy SSO user payload
    return reply.send({
      id: userPayload.userId,
      email: userPayload.email,
      fullName: userPayload.email.split('@')[0],
      role: userPayload.role,
      tenantId: userPayload.tenantId
    });
  });
}
