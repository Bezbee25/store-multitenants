import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { tenantResolver } from './middleware/tenant.js';
import { getOrCreateKeys } from './services/keys.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/store.js';
import managerRoutes from './routes/manager.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';

const app = Fastify({
  logger: process.env.NODE_ENV !== 'production' ? {
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' }
    }
  } : true
});

// Security plugins
await app.register(helmet, {
  contentSecurityPolicy: false // Managed by Nginx proxy
});

await app.register(cors, {
  origin: true,
  credentials: true
});

await app.register(cookie);
await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max upload
  }
});

await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute'
});

// JWKS Certs endpoint for WoxxPay M2M integration
app.get('/certs', async (_req, reply) => {
  const { jwk } = getOrCreateKeys();
  return reply.send({ keys: [jwk] });
});

// Health check endpoint
app.get('/health', async (_req, reply) => {
  return reply.send({ status: 'ok', time: new Date().toISOString() });
});

// Add global preHandler hook for multi-tenant resolution
app.addHook('preHandler', tenantResolver);

// Register routes
await app.register(authRoutes);
await app.register(storeRoutes);
await app.register(managerRoutes);
await app.register(adminRoutes);
await app.register(webhookRoutes);

// Error handler
app.setErrorHandler((error: any, _request, reply) => {
  app.log.error(error);
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: error.name || 'InternalServerError',
    message: error.message || 'Une erreur interne est survenue.'
  });
});

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Store Multitenants Backend listening on ${address}`);
});
