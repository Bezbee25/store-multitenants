import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { z } from 'zod';
import { requireSuperAdmin } from '../middleware/auth.js';
import { testSmtpConnection } from '../services/mailer.js';
import { PRESETS } from '../presets/data.js';

const prisma = new PrismaClient();

const createTenantSchema = z.object({
  name: z.string().min(2),
  subdomain: z.string().min(2).regex(/^[a-z0-9-]+$/),
  presetId: z.string().default('burger'),
  managerEmail: z.string().email(),
  managerPassword: z.string().min(6),
  managerName: z.string().min(2).optional()
});

export default async function adminRoutes(app: FastifyInstance) {
  // Apply superadmin guard
  app.addHook('preHandler', async (req, reply) => {
    if (req.url.startsWith('/api/admin')) {
      await requireSuperAdmin(req, reply);
    }
  });

  // 1. Statistiques globales de la plateforme
  app.get('/api/admin/stats', async (_req, reply) => {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const totalSalesAgg = await prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { paymentStatus: 'PAID' }
    });

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { tenant: true }
    });

    return reply.send({
      totalTenants,
      activeTenants,
      totalOrders,
      totalSalesCents: totalSalesAgg._sum.totalCents || 0,
      recentOrders
    });
  });

  // 2. Liste complète de tous les tenants
  app.get('/api/admin/tenants', async (_req, reply) => {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: 'MANAGER' },
          select: { id: true, email: true, fullName: true, phone: true }
        },
        _count: {
          select: { orders: true, products: true }
        }
      }
    });

    return reply.send(tenants);
  });

  // 3. Provisioning instantané d'un nouveau tenant (Zero-Config au départ)
  app.post('/api/admin/tenants', async (req, reply) => {
    const parse = createTenantSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({ error: 'Données invalides', details: parse.error.format() });
    }

    const { name, subdomain, presetId, managerEmail, managerPassword, managerName } = parse.data;

    // Check subdomain uniqueness
    const exists = await prisma.tenant.findUnique({ where: { subdomain } });
    if (exists) {
      return reply.code(409).send({ error: `Le sous-domaine "${subdomain}" est déjà utilisé.` });
    }

    const preset = PRESETS[presetId] || PRESETS['burger'];
    const passwordHash = await argon2.hash(managerPassword);

    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain,
        tagline: preset.tagline,
        description: preset.description,
        themePreset: preset.id,
        themeConfig: preset.themeConfig as any,
        cmsConfig: preset.cmsConfig as any,
        heroImageUrl: preset.heroImageUrl,
        logoUrl: preset.logoUrl,
        users: {
          create: {
            email: managerEmail,
            passwordHash,
            fullName: managerName || 'Gérant Boutique',
            role: 'MANAGER'
          }
        }
      }
    });

    // Populate initial sample products from preset
    for (const cat of preset.categories) {
      const createdCat = await prisma.category.create({
        data: {
          tenantId: tenant.id,
          name: cat.name,
          slug: cat.slug,
          orderIndex: cat.orderIndex
        }
      });

      for (const prod of cat.products) {
        await prisma.product.create({
          data: {
            tenantId: tenant.id,
            categoryId: createdCat.id,
            name: prod.name,
            description: prod.description,
            priceCents: prod.priceCents,
            imageUrl: prod.imageUrl,
            stockQuantity: prod.stockQuantity,
            preparationTimeMinutes: prod.preparationTimeMinutes,
            options: prod.options as any
          }
        });
      }
    }

    return reply.code(201).send({
      success: true,
      tenantId: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name
    });
  });

  // 4. Activer / Désactiver un tenant
  app.patch('/api/admin/tenants/:id/toggle', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };

    const updated = await prisma.tenant.update({
      where: { id },
      data: { isActive }
    });

    return reply.send(updated);
  });

  // 5. Configuration SMTP Globale
  app.get('/api/admin/smtp', async (_req, reply) => {
    const config = await prisma.globalConfig.findUnique({ where: { id: 'global' } });
    return reply.send(config || {});
  });

  app.put('/api/admin/smtp', async (req, reply) => {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFromName,
      smtpFromEmail,
      smtpSecure,
      allowSelfRegistration
    } = req.body as any;

    const updated = await prisma.globalConfig.upsert({
      where: { id: 'global' },
      update: {
        smtpHost,
        smtpPort: smtpPort ? parseInt(smtpPort) : 587,
        smtpUser,
        smtpPass: smtpPass || undefined,
        smtpFromName,
        smtpFromEmail,
        smtpSecure: !!smtpSecure,
        allowSelfRegistration: allowSelfRegistration !== undefined ? !!allowSelfRegistration : true
      },
      create: {
        id: 'global',
        smtpHost,
        smtpPort: smtpPort ? parseInt(smtpPort) : 587,
        smtpUser,
        smtpPass,
        smtpFromName,
        smtpFromEmail,
        smtpSecure: !!smtpSecure,
        allowSelfRegistration: allowSelfRegistration !== undefined ? !!allowSelfRegistration : true
      }
    });

    return reply.send(updated);
  });

  // 6. Tester la configuration SMTP
  app.post('/api/admin/smtp/test', async (req, reply) => {
    const { host, port, user, pass, secure, testEmail } = req.body as any;

    try {
      await testSmtpConnection(
        host,
        port ? parseInt(port) : 587,
        user,
        pass,
        secure,
        testEmail
      );
      return reply.send({ success: true, message: 'Connexion SMTP réussie et email de test envoyé !' });
    } catch (err: any) {
      return reply.code(400).send({
        error: 'Échec de la connexion SMTP',
        details: err.message
      });
    }
  });
}
