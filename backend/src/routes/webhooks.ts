import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '../services/mailer.js';

const prisma = new PrismaClient();

export default async function webhookRoutes(app: FastifyInstance) {
  // Callback webhook signé WoxxPay
  app.post('/api/webhooks/woxx-pay', {
    config: {
      rawBody: true
    }
  }, async (req, reply) => {
    const signature = req.headers['x-woxx-signature'] as string;
    const eventTs = req.headers['x-woxx-event-ts'] as string;
    const eventId = req.headers['x-woxx-event-id'] as string;

    const publicKeyBase64 = process.env.WOXX_PAY_PUBLIC_KEY;

    // In production, enforce Ed25519 signature verification if public key is present
    if (publicKeyBase64 && signature && eventTs && eventId) {
      // Replay attack prevention (< 5 minutes)
      const eventAge = Date.now() - new Date(eventTs).getTime();
      if (eventAge > 5 * 60 * 1000) {
        return reply.code(400).send({ error: 'Événement expiré (> 5 min)' });
      }

      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const payload = `${rawBody}${eventTs}${eventId}`;

      try {
        const verifier = crypto.createVerify('ed25519');
        verifier.update(payload);
        const isValid = verifier.verify(
          Buffer.from(publicKeyBase64, 'base64'),
          Buffer.from(signature, 'base64')
        );

        if (!isValid) {
          return reply.code(400).send({ error: 'Signature Ed25519 invalide' });
        }
      } catch (err: any) {
        req.log.error('Signature verification error', err);
        return reply.code(400).send({ error: 'Erreur de vérification signature' });
      }
    }

    const event = req.body as any;
    req.log.info({ eventType: event?.event_type, paymentId: event?.payload?.payment_id }, 'WoxxPay webhook received');

    if (event?.event_type === 'payment.captured' || event?.event_type === 'checkout.session.completed') {
      const paymentId = event.payload?.payment_id || event.payload?.id;
      const orderNumber = event.payload?.metadata?.orderNumber;
      const tenantId = event.payload?.metadata?.tenantId;

      let order = null;
      if (paymentId) {
        order = await prisma.order.findFirst({
          where: { woxxpayPaymentId: paymentId },
          include: { tenant: true, items: true }
        });
      }

      if (!order && orderNumber && tenantId) {
        order = await prisma.order.findUnique({
          where: {
            tenantId_orderNumber: {
              tenantId,
              orderNumber
            }
          },
          include: { tenant: true, items: true }
        });
      }

      if (order) {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'IN_PREPARATION' // Transition directly to IN_PREPARATION once paid
          },
          include: { items: true, tenant: true }
        });

        // Send email confirmation
        sendOrderConfirmationEmail(updatedOrder, updatedOrder.tenant).catch(console.error);
        req.log.info(`Order #${order.orderNumber} successfully marked as PAID`);
      }
    }

    return reply.send({ received: true });
  });
}
