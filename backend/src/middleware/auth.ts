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
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Authentification requise.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
  } catch (err) {
    return reply.code(401).send({ error: 'Session expirée ou jeton invalide.' });
  }
}

export async function requireManager(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply);
  if (reply.sent) return;

  const user = req.user;
  if (!user) return;

  if (user.role === 'SUPERADMIN') {
    // SuperAdmin has manager access
    return;
  }

  if (user.role !== 'MANAGER') {
    return reply.code(403).send({ error: 'Accès réservé aux gérants de boutique.' });
  }

  // Tenant Boundary Check: verify user's tenant matches request tenant
  if (req.tenant && user.tenantId !== req.tenant.id) {
    return reply.code(403).send({ error: 'Accès non autorisé pour cette boutique.' });
  }
}

export async function requireSuperAdmin(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply);
  if (reply.sent) return;

  const user = req.user;
  if (!user || user.role !== 'SUPERADMIN') {
    return reply.code(403).send({ error: 'Accès réservé aux administrateurs de la plateforme.' });
  }
}
