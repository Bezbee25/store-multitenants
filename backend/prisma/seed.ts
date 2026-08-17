import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { PRESETS } from '../src/presets/data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma seeding for Store Multitenants...');

  // 1. Configuration Globale & SMTP
  await prisma.globalConfig.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      smtpHost: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || '',
      smtpPass: process.env.SMTP_PASS || '',
      smtpFromName: 'WoxxApp Stores',
      smtpFromEmail: process.env.SMTP_FROM || 'no-reply@woxxapp.de',
      smtpSecure: false,
      allowSelfRegistration: true,
      defaultSlotDuration: 15
    }
  });
  console.log('✅ Global config ready');

  // 2. Super-Admin User
  const adminPasswordHash = await argon2.hash(process.env.SUPERADMIN_PASSWORD || 'AdminWoxx2026!');
  const superAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: '',
        email: 'admin@woxxapp.de'
      }
    },
    update: {},
    create: {
      email: 'admin@woxxapp.de',
      passwordHash: adminPasswordHash,
      fullName: 'WoxxApp SuperAdmin',
      phone: '+33600000000',
      role: 'SUPERADMIN'
    }
  });
  console.log(`✅ SuperAdmin initialized (${superAdmin.email})`);

  // 3. Demo Tenant : Smash Burger
  const burgerPreset = PRESETS['burger'];
  const demoManagerPassword = await argon2.hash('Manager2026!');

  const burgerTenant = await prisma.tenant.upsert({
    where: { subdomain: 'smash-burger' },
    update: {},
    create: {
      subdomain: 'smash-burger',
      name: 'Smash Burger Club',
      tagline: burgerPreset.tagline,
      description: burgerPreset.description,
      themePreset: 'burger',
      themeConfig: burgerPreset.themeConfig as any,
      cmsConfig: burgerPreset.cmsConfig as any,
      heroImageUrl: burgerPreset.heroImageUrl,
      logoUrl: burgerPreset.logoUrl,
      contactPhone: '+33 1 42 68 00 00',
      contactEmail: 'contact@smashburger.com',
      address: '14 Rue des Gourmets, 75002 Paris',
      acceptUnpaidOrders: true,
      slotDurationMinutes: 15,
      maxItemsPerSlot: 20,
      openingHours: [
        { day: 'lun', open: '11:30', close: '22:30', closed: false },
        { day: 'mar', open: '11:30', close: '22:30', closed: false },
        { day: 'mer', open: '11:30', close: '22:30', closed: false },
        { day: 'jeu', open: '11:30', close: '23:00', closed: false },
        { day: 'ven', open: '11:30', close: '23:30', closed: false },
        { day: 'sam', open: '12:00', close: '23:30', closed: false },
        { day: 'dim', open: '12:00', close: '22:00', closed: false }
      ],
      users: {
        create: {
          email: 'gerant@smashburger.com',
          passwordHash: demoManagerPassword,
          fullName: 'Alexandre Gérant',
          phone: '+33612345678',
          role: 'MANAGER'
        }
      }
    }
  });

  // Create Categories & Products for Smash Burger
  for (const cat of burgerPreset.categories) {
    const createdCat = await prisma.category.create({
      data: {
        tenantId: burgerTenant.id,
        name: cat.name,
        slug: cat.slug,
        orderIndex: cat.orderIndex
      }
    });

    for (const prod of cat.products) {
      await prisma.product.create({
        data: {
          tenantId: burgerTenant.id,
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

  // 4. Demo Tenant : Kebab Gourmet
  const kebabPreset = PRESETS['kebab'];
  const kebabTenant = await prisma.tenant.upsert({
    where: { subdomain: 'berliner-kebab' },
    update: {},
    create: {
      subdomain: 'berliner-kebab',
      name: 'Berliner Kebab Maison',
      tagline: kebabPreset.tagline,
      description: kebabPreset.description,
      themePreset: 'kebab',
      themeConfig: kebabPreset.themeConfig as any,
      cmsConfig: kebabPreset.cmsConfig as any,
      heroImageUrl: kebabPreset.heroImageUrl,
      logoUrl: kebabPreset.logoUrl,
      contactPhone: '+33 1 45 20 12 34',
      contactEmail: 'berlin@kebab-gourmet.fr',
      address: '45 Avenue de la République, 75011 Paris',
      acceptUnpaidOrders: true,
      slotDurationMinutes: 15,
      maxItemsPerSlot: 25,
      users: {
        create: {
          email: 'chef@berlinerkebab.fr',
          passwordHash: demoManagerPassword,
          fullName: 'Chef Mehmet',
          phone: '+33698765432',
          role: 'MANAGER'
        }
      }
    }
  });

  for (const cat of kebabPreset.categories) {
    const createdCat = await prisma.category.create({
      data: {
        tenantId: kebabTenant.id,
        name: cat.name,
        slug: cat.slug,
        orderIndex: cat.orderIndex
      }
    });

    for (const prod of cat.products) {
      await prisma.product.create({
        data: {
          tenantId: kebabTenant.id,
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

  // 5. Demo Tenant : Fleurs
  const fleursPreset = PRESETS['fleurs'];
  const fleursTenant = await prisma.tenant.upsert({
    where: { subdomain: 'atelier-floral' },
    update: {},
    create: {
      subdomain: 'atelier-floral',
      name: 'Atelier Floral & Poésie',
      tagline: fleursPreset.tagline,
      description: fleursPreset.description,
      themePreset: 'fleurs',
      themeConfig: fleursPreset.themeConfig as any,
      cmsConfig: fleursPreset.cmsConfig as any,
      heroImageUrl: fleursPreset.heroImageUrl,
      logoUrl: fleursPreset.logoUrl,
      contactPhone: '+33 4 78 90 00 11',
      contactEmail: 'contact@atelierfloral.fr',
      address: '8 Place Bellecour, 69002 Lyon',
      acceptUnpaidOrders: false, // For florist: requires online payment
      slotDurationMinutes: 30,
      maxItemsPerSlot: 10,
      users: {
        create: {
          email: 'claire@atelierfloral.fr',
          passwordHash: demoManagerPassword,
          fullName: 'Claire Fleuriste',
          phone: '+33655443322',
          role: 'MANAGER'
        }
      }
    }
  });

  for (const cat of fleursPreset.categories) {
    const createdCat = await prisma.category.create({
      data: {
        tenantId: fleursTenant.id,
        name: cat.name,
        slug: cat.slug,
        orderIndex: cat.orderIndex
      }
    });

    for (const prod of cat.products) {
      await prisma.product.create({
        data: {
          tenantId: fleursTenant.id,
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

  console.log('🎉 Seeding successfully completed with 3 demo tenants (smash-burger, berliner-kebab, atelier-floral)!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
