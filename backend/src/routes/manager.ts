import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireManager } from '../middleware/auth.js';
import { sendOrderReadyEmail } from '../services/mailer.js';
import { PRESETS } from '../presets/data.js';

const prisma = new PrismaClient();

export default async function managerRoutes(app: FastifyInstance) {
  // Apply manager auth guard on all manager routes
  app.addHook('preHandler', async (req, reply) => {
    if (req.url.startsWith('/api/manager')) {
      await requireManager(req, reply);
    }
  });

  // 1. Liste des commandes pour le Kanban
  app.get('/api/manager/orders', async (req, reply) => {
    const tenant = req.tenant;
    if (!tenant) return reply.code(404).send({ error: 'Boutique introuvable.' });

    const orders = await prisma.order.findMany({
      where: { tenantId: tenant.id },
      orderBy: { pickupSlotStart: 'asc' },
      include: { items: true }
    });

    return reply.send(orders);
  });

  // 2. Mettre à jour le statut d'une commande (Kanban drag-and-drop ou action)
  app.patch('/api/manager/orders/:id/status', async (req, reply) => {
    const tenant = req.tenant;
    const { id } = req.params as { id: string };
    const { orderStatus, paymentStatus } = req.body as { orderStatus?: any; paymentStatus?: any };

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
      where: { id, tenantId: tenant.id },
      data: updateData,
      include: { items: true }
    });

    // If order transitioned to READY, trigger customer email
    if (orderStatus === 'READY') {
      sendOrderReadyEmail(updated, tenant).catch(console.error);
    }

    return reply.send(updated);
  });

  // 3. Gestion des Produits (CRUD)
  app.get('/api/manager/products', async (req, reply) => {
    const tenant = req.tenant;
    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });
    return reply.send(products);
  });

  app.post('/api/manager/products', async (req, reply) => {
    const tenant = req.tenant;
    const {
      name,
      description,
      priceCents,
      categoryId,
      imageUrl,
      stockQuantity,
      isAvailable,
      preparationTimeMinutes,
      options
    } = req.body as any;

    if (!name || priceCents === undefined) {
      return reply.code(400).send({ error: 'Nom et prix obligatoires.' });
    }

    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name,
        description,
        priceCents: parseInt(priceCents),
        categoryId: categoryId || null,
        imageUrl,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 999,
        isAvailable: isAvailable !== undefined ? !!isAvailable : true,
        preparationTimeMinutes: preparationTimeMinutes ? parseInt(preparationTimeMinutes) : 15,
        options: options || null
      }
    });

    return reply.code(201).send(product);
  });

  app.put('/api/manager/products/:id', async (req, reply) => {
    const tenant = req.tenant;
    const { id } = req.params as { id: string };
    const {
      name,
      description,
      priceCents,
      categoryId,
      imageUrl,
      stockQuantity,
      isAvailable,
      preparationTimeMinutes,
      options
    } = req.body as any;

    const product = await prisma.product.update({
      where: { id, tenantId: tenant.id },
      data: {
        name,
        description,
        priceCents: priceCents !== undefined ? parseInt(priceCents) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        imageUrl,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        isAvailable: isAvailable !== undefined ? !!isAvailable : undefined,
        preparationTimeMinutes: preparationTimeMinutes !== undefined ? parseInt(preparationTimeMinutes) : undefined,
        options: options !== undefined ? options : undefined
      }
    });

    return reply.send(product);
  });

  app.delete('/api/manager/products/:id', async (req, reply) => {
    const tenant = req.tenant;
    const { id } = req.params as { id: string };

    await prisma.product.delete({
      where: { id, tenantId: tenant.id }
    });

    return reply.send({ success: true });
  });

  // 4. Gestion des Catégories
  app.get('/api/manager/categories', async (req, reply) => {
    const tenant = req.tenant;
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { orderIndex: 'asc' }
    });
    return reply.send(categories);
  });

  app.post('/api/manager/categories', async (req, reply) => {
    const tenant = req.tenant;
    const { name, slug, orderIndex } = req.body as any;
    if (!name) return reply.code(400).send({ error: 'Nom requis.' });

    const category = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        orderIndex: orderIndex || 0
      }
    });

    return reply.code(201).send(category);
  });

  // 5. Configuration Générale, Thème, CMS et Horaires
  app.get('/api/manager/settings', async (req, reply) => {
    const tenant = req.tenant;
    return reply.send(tenant);
  });

  app.put('/api/manager/settings', async (req, reply) => {
    const tenant = req.tenant;
    const {
      name,
      tagline,
      description,
      themePreset,
      themeConfig,
      cmsConfig,
      heroImageUrl,
      logoUrl,
      contactPhone,
      contactEmail,
      address,
      acceptUnpaidOrders,
      slotDurationMinutes,
      maxItemsPerSlot,
      openingHours,
      stripeAccountId
    } = req.body as any;

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name,
        tagline,
        description,
        themePreset,
        themeConfig,
        cmsConfig,
        heroImageUrl,
        logoUrl,
        contactPhone,
        contactEmail,
        address,
        acceptUnpaidOrders: acceptUnpaidOrders !== undefined ? !!acceptUnpaidOrders : undefined,
        slotDurationMinutes: slotDurationMinutes ? parseInt(slotDurationMinutes) : undefined,
        maxItemsPerSlot: maxItemsPerSlot ? parseInt(maxItemsPerSlot) : undefined,
        openingHours: openingHours || undefined,
        stripeAccountId: stripeAccountId !== undefined ? stripeAccountId : undefined
      }
    });

    return reply.send(updated);
  });

  // 6. Application en 1 clic d'un Preset Métier complet
  app.post('/api/manager/preset/apply', async (req, reply) => {
    const tenant = req.tenant;
    const { presetId, replaceProducts } = req.body as { presetId: string; replaceProducts?: boolean };

    const preset = PRESETS[presetId];
    if (!preset) {
      return reply.code(400).send({ error: 'Preset inconnu. Choix: burger, kebab, fleurs, bijoux.' });
    }

    // Update tenant styling & CMS
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        themePreset: preset.id,
        themeConfig: preset.themeConfig as any,
        cmsConfig: preset.cmsConfig as any,
        heroImageUrl: preset.heroImageUrl,
        logoUrl: preset.logoUrl
      }
    });

    if (replaceProducts) {
      // Clean previous categories & products
      await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
      await prisma.category.deleteMany({ where: { tenantId: tenant.id } });

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
    }

    return reply.send({ success: true, tenant: updatedTenant });
  });
}
