import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getTransporter() {
  const config = await prisma.globalConfig.findUnique({ where: { id: 'global' } });
  if (!config || !config.smtpHost) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort || 587,
    secure: config.smtpSecure || false,
    auth: config.smtpUser ? {
      user: config.smtpUser,
      pass: config.smtpPass || ''
    } : undefined
  });

  return { transporter, config };
}

export async function sendOrderConfirmationEmail(order: any, tenant: any) {
  try {
    const smtp = await getTransporter();
    if (!smtp) {
      console.log(`[mailer] SMTP not configured. Skipping email to ${order.customerEmail}`);
      return;
    }

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.productName} x ${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${(item.unitPriceCents * item.quantity / 100).toFixed(2)} €</td>
      </tr>
    `).join('');

    const pickupTimeFormatted = new Date(order.pickupSlotStart).toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">${tenant.name} — Commande Confirmée !</h2>
        <p>Bonjour <strong>${order.customerName}</strong>,</p>
        <p>Votre commande <strong>#${order.orderNumber}</strong> a bien été enregistrée.</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Créneau de retrait Click & Collect :</p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #0284c7;">⏰ ${pickupTimeFormatted}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px;"><strong>Lieu de retrait :</strong> ${tenant.address || 'Au magasin'}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 8px;">Article</th>
              <th style="padding: 8px; text-align: right;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 12px 8px; font-weight: bold;">Total (${order.paymentMethod === 'ONLINE_WOXXPAY' ? 'Payé en ligne' : 'À régler sur place'})</td>
              <td style="padding: 12px 8px; font-weight: bold; text-align: right; font-size: 18px;">${(order.totalCents / 100).toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>

        <p style="color: #64748b; font-size: 13px; margin-top: 30px;">Merci de votre confiance et à très vite chez <strong>${tenant.name}</strong> !</p>
      </div>
    `;

    await smtp.transporter.sendMail({
      from: `"${tenant.name}" <${smtp.config.smtpFromEmail || 'noreply@woxxapp.de'}>`,
      to: order.customerEmail,
      subject: `[${tenant.name}] Confirmation de votre commande #${order.orderNumber}`,
      html
    });

    console.log(`[mailer] Confirmation email sent for order #${order.orderNumber}`);
  } catch (err) {
    console.error('[mailer] Error sending order confirmation email:', err);
  }
}

export async function sendOrderReadyEmail(order: any, tenant: any) {
  try {
    const smtp = await getTransporter();
    if (!smtp) return;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #16a34a; margin-top: 0;">🎉 Votre commande #${order.orderNumber} est prête !</h2>
        <p>Bonjour <strong>${order.customerName}</strong>,</p>
        <p>Vos articles sont prêts et emballés. Vous pouvez dès à présent venir les retirer :</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-weight: bold; color: #166534;">📍 ${tenant.name}</p>
          <p style="margin: 4px 0 0 0; color: #15803d;">${tenant.address || 'Au comptoir de retrait'}</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">Munissez-vous de votre numéro de commande <strong>#${order.orderNumber}</strong>.</p>
      </div>
    `;

    await smtp.transporter.sendMail({
      from: `"${tenant.name}" <${smtp.config.smtpFromEmail || 'noreply@woxxapp.de'}>`,
      to: order.customerEmail,
      subject: `[${tenant.name}] Votre commande #${order.orderNumber} est PRÊTE ! 🛍️`,
      html
    });
  } catch (err) {
    console.error('[mailer] Error sending order ready email:', err);
  }
}

export async function testSmtpConnection(host: string, port: number, user?: string, pass?: string, secure?: boolean, testEmail?: string) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: !!secure,
    auth: user ? { user, pass: pass || '' } : undefined
  });

  await transporter.verify();

  if (testEmail) {
    await transporter.sendMail({
      from: `"WoxxApp Test" <${user || 'test@woxxapp.de'}>`,
      to: testEmail,
      subject: 'Test de configuration SMTP WoxxApp',
      text: 'Félicitations, la configuration SMTP globale fonctionne parfaitement !'
    });
  }
  return true;
}
