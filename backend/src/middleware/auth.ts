import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-store-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  tenantId?: string | null;
  email: string;
  role: 'CUSTOMER' | 'MANAGER' | 'SUPERADMIN';
}

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload | null;
  }
}

export function generateJwtToken(payload: TokenPayload, expiresIn: any = '7d'): string {
  return jwt.sign({ ...payload }, JWT_SECRET, { expiresIn });
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  // 1. Check if authenticated via WoxxApp Proxy headers (SSO)
  const woxxAppUser = req.headers['x-woxxapp-user'] as string;
  const woxxAppEmail = req.headers['x-user-email'] as string;

  if (woxxAppUser && woxxAppUser !== 'woxx:public') {
    const isWoxxAdmin = woxxAppUser.includes('admin') || woxxAppEmail?.includes('admin@woxxapp.de');
    req.user = {
      userId: woxxAppUser,
      tenantId: req.tenant?.id || null,
      email: woxxAppEmail || `${woxxAppUser}@woxxapp.de`,
      role: isWoxxAdmin ? 'SUPERADMIN' : 'MANAGER'
    };
    return;
  }

  // 2. Check Standard Authorization Bearer Header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Authentification WoxxApp requise.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
  } catch (err) {
    return reply.code(401).send({ error: 'Session WoxxApp expirée ou jeton invalide.' });
  }
}

export async function requireManager(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply);
  if (reply.sent) return;

  const user = req.user;
  if (!user) return;

  if (user.role === 'SUPERADMIN') {
    return;
  }

  if (user.role !== 'MANAGER') {
    return reply.code(403).send({ error: 'Accès réservé au compte gestionnaire WoxxApp de la boutique.' });
  }

  // Tenant Boundary Check: verify user's tenant matches request tenant
  if (req.tenant && user.tenantId && user.tenantId !== req.tenant.id) {
    return reply.code(403).send({ error: 'Accès non autorisé pour cette boutique.' });
  }
}

export async function requireSuperAdmin(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply);
  if (reply.sent) return;

  const user = req.user;
  if (!user || user.role !== 'SUPERADMIN') {
    return reply.code(403).send({ error: 'Accès réservé aux administrateurs de la plateforme WoxxApp.' });
  }
}
