import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyRequest {
    tenant: any | null;
  }
}

export async function tenantResolver(req: FastifyRequest, reply: FastifyReply) {
  // 1. Check explicit header if provided by frontend or proxy
  let subdomain = (req.headers['x-tenant-slug'] as string) || '';

  // 2. Check Host header (e.g. kebab-delice.woxxapp.de or smash-burger.localhost)
  if (!subdomain) {
    const host = req.headers.host || '';
    const hostParts = host.split(':')[0].split('.');
    if (hostParts.length >= 2) {
      const candidate = hostParts[0];
      if (candidate !== 'store' && candidate !== 'www' && candidate !== 'api' && candidate !== 'localhost') {
        subdomain = candidate;
      }
    }
  }

  // 3. Path-based resolution for proxy routing: /catalog/{subdomain}/... or /store/{subdomain}/...
  if (!subdomain) {
    const url = req.url || '';
    const pathSegments = url.split('?')[0].split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      const first = pathSegments[0];
      if (first === 'catalog' || first === 'tenant' || first === 'store') {
        subdomain = pathSegments[1];
      }
    }
  }

  // 4. Fallback to Referer header for proxied API calls
  if (!subdomain && req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      // Try hostname from referer
      const refHostParts = refUrl.hostname.split('.');
      if (refHostParts.length >= 2 && refHostParts[0] !== 'store' && refHostParts[0] !== 'www') {
        subdomain = refHostParts[0];
      } else {
        const refSegments = refUrl.pathname.split('/').filter(Boolean);
        if (refSegments.length >= 2 && (refSegments[0] === 'catalog' || refSegments[0] === 'store')) {
          subdomain = refSegments[1];
        }
      }
    } catch {
      // Ignore URL parse errors
    }
  }

  const path = req.url || '';
  const isPublicSystemRoute =
    path.startsWith('/health') ||
    path.startsWith('/certs') ||
    path.startsWith('/api/admin') || // Super-admin doesn't require a tenant
    path.startsWith('/api/setup') ||
    path.startsWith('/api/webhooks');

  if (!subdomain) {
    // If no subdomain was resolved and it's a tenant-specific API route, return 404
    if (path.startsWith('/api/store') || path.startsWith('/api/manager')) {
      return reply.code(404).send({ error: 'Sous-domaine requis ou boutique introuvable.' });
    }
    req.tenant = null;
    return;
  }

  // Find tenant in database
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!tenant && !isPublicSystemRoute) {
    return reply.code(404).send({
      error: 'Boutique introuvable',
      message: `Aucune boutique active associée au sous-domaine "${subdomain}".`
    });
  }

  req.tenant = tenant || null;
}
