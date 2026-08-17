import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getAvailableSlotsForDate, validateSlotCapacity } from '../services/slots.js';
import { sendOrderConfirmationEmail } from '../services/mailer.js';
import { createWoxxPayCheckoutSession } from '../services/woxxpay.js';

const prisma = new PrismaClient();

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  selectedOptions: z.record(z.any()).optional()
});

const placeOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  pickupSlotStart: z.string().datetime(),
  paymentMethod: z.enum(['ONLINE_WOXXPAY', 'ON_SITE']),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1)
});

export default async function storeRoutes(app: FastifyInstance) {
  // 1. Informations publiques de la boutique (Vitrine, CMS, Thème)
  app.get('/api/store/info', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(404).send({ error: 'Boutique introuvable.' });
    }

    return reply.send({
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name,
      tagline: tenant.tagline,
      description: tenant.description,
      themePreset: tenant.themePreset,
      themeConfig: tenant.themeConfig,
      cmsConfig: tenant.cmsConfig,
      heroImageUrl: tenant.heroImageUrl,
      logoUrl: tenant.logoUrl,
      contactPhone: tenant.contactPhone,
      contactEmail: tenant.contactEmail,
      address: tenant.address,
      acceptUnpaidOrders: tenant.acceptUnpaidOrders,
      slotDurationMinutes: tenant.slotDurationMinutes,
      maxItemsPerSlot: tenant.maxItemsPerSlot,
      openingHours: tenant.openingHours,
      hasWoxxPayEnabled: !!tenant.stripeAccountId
    });
  });

  // 2. Catalogue de produits groupés par catégories
  app.get('/api/store/catalog', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(404).send({ error: 'Boutique introuvable.' });
    }

    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Also get uncategorized products if any
    const uncategorizedProducts = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        categoryId: null,
        isAvailable: true
      }
    });

    return reply.send({
      categories,
      uncategorized: uncategorizedProducts
    });
  });

  // 3. Obtenir les créneaux disponibles pour une date
  app.get('/api/store/slots', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(404).send({ error: 'Boutique introuvable.' });
    }

    const { date } = req.query as { date?: string };
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      const slots = await getAvailableSlotsForDate(tenant.id, targetDate);
      return reply.send({ date: targetDate, slots });
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Impossible de calculer les créneaux.' });
    }
  });

  // 4. Passer une commande Click & Collect
  app.post('/api/store/order', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(404).send({ error: 'Boutique introuvable.' });
    }

    const parse = placeOrderSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({ error: 'Données de commande invalides', details: parse.error.format() });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      pickupSlotStart,
      paymentMethod,
      notes,
      items
    } = parse.data;

    // Check payment rule: if paymentMethod is ON_SITE, check if tenant allows it
    if (paymentMethod === 'ON_SITE' && !tenant.acceptUnpaidOrders) {
      return reply.code(400).send({
        error: 'Cette boutique exige un règlement en ligne sécurisé pour valider la réservation.'
      });
    }

    // Verify slot availability & capacity
    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
    const hasCapacity = await validateSlotCapacity(tenant.id, pickupSlotStart, totalQuantity);
    if (!hasCapacity) {
      return reply.code(409).send({
        error: 'Ce créneau horaire est complet ou n\'a plus assez de capacité. Veuillez choisir un autre créneau.'
      });
    }

    // Fetch products from database to calculate real prices securely
    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId: tenant.id,
        isAvailable: true
      }
    });

    if (dbProducts.length !== productIds.length) {
      return reply.code(400).send({ error: 'Un ou plusieurs produits sélectionnés ne sont plus disponibles.' });
    }

    // Compute totals & build order items
    let totalCents = 0;
    const orderItemsData: Array<{
      tenantId: string;
      productId: string;
      productName: string;
      unitPriceCents: number;
      quantity: number;
      selectedOptions?: any;
    }> = [];

    for (const item of items) {
      const prod = dbProducts.find(p => p.id === item.productId)!;
      let unitPrice = prod.priceCents;

      // Add options price if applicable
      if (item.selectedOptions && typeof item.selectedOptions === 'object') {
        for (const val of Object.values(item.selectedOptions)) {
          if (typeof val === 'object' && val !== null && (val as any).priceCents) {
            unitPrice += (val as any).priceCents;
          }
        }
      }

      totalCents += unitPrice * item.quantity;
      orderItemsData.push({
        tenantId: tenant.id,
        productId: prod.id,
        productName: prod.name,
        unitPriceCents: unitPrice,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions
      });
    }

    const slotDuration = tenant.slotDurationMinutes || 15;
    const slotStartDate = new Date(pickupSlotStart);
    const slotEndDate = new Date(slotStartDate.getTime() + slotDuration * 60000);

    // Generate unique order number (e.g. KB-14285)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = (tenant.subdomain || 'CMD').slice(0, 3).toUpperCase();
    const orderNumber = `${prefix}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const initialPaymentStatus = paymentMethod === 'ONLINE_WOXXPAY' ? 'PENDING' : 'PENDING';
    const initialOrderStatus = paymentMethod === 'ONLINE_WOXXPAY' ? 'NEW' : 'NEW';

    // Create order in database
    const createdOrder = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        totalCents,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: initialOrderStatus,
        pickupSlotStart: slotStartDate,
        pickupSlotEnd: slotEndDate,
        notes,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    // 5. If Online Payment via WoxxPay requested
    if (paymentMethod === 'ONLINE_WOXXPAY') {
      try {
        const origin = req.headers.origin || `https://${tenant.subdomain}.woxxapp.de`;
        const checkoutSession = await createWoxxPayCheckoutSession({
          tenant: {
            id: tenant.id,
            subdomain: tenant.subdomain,
            stripeAccountId: tenant.stripeAccountId
          },
          orderNumber: createdOrder.orderNumber,
          customerEmail: createdOrder.customerEmail,
          customerName: createdOrder.customerName,
          items: orderItemsData.map(i => ({
            product_code: i.productId,
            name: i.productName,
            unit_price_cents: i.unitPriceCents,
            quantity: i.quantity
          })),
          successUrl: `${origin}/#/order/${createdOrder.orderNumber}?payment=success`,
          cancelUrl: `${origin}/#/cart?payment=cancelled`
        });

        await prisma.order.update({
          where: { id: createdOrder.id },
          data: { woxxpayPaymentId: checkoutSession.payment_id }
        });

        return reply.send({
          orderNumber: createdOrder.orderNumber,
          checkoutUrl: checkoutSession.checkout_url,
          requiresRedirect: true
        });
      } catch (err: any) {
        req.log.error(err);
        return reply.code(500).send({
          error: 'Impossible d\'initialiser le paiement en ligne sécurisé. Veuillez réessayer ou choisir le paiement sur place.'
        });
      }
    }

    // Send confirmation email for on-site pay orders
    sendOrderConfirmationEmail(createdOrder, tenant).catch(console.error);

    return reply.code(201).send({
      orderNumber: createdOrder.orderNumber,
      requiresRedirect: false,
      order: createdOrder
    });
  });

  // 5. Suivi de commande en direct par numéro
  app.get('/api/store/order/:orderNumber', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) {
      return reply.code(404).send({ error: 'Boutique introuvable.' });
    }

    const { orderNumber } = req.params as { orderNumber: string };
    const order = await prisma.order.findUnique({
      where: {
        tenantId_orderNumber: {
          tenantId: tenant.id,
          orderNumber
        }
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return reply.code(404).send({ error: 'Commande introuvable.' });
    }

    return reply.send(order);
  });
}
