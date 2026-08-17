import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getOrCreateKeys } from './keys.js';

export function generateAppToken(tenantId: string, applicationId: string = 'store-multitenant-app'): string {
  const { privateKey } = getOrCreateKeys();

  return jwt.sign(
    {
      sub: `store-multitenant-${tenantId}`,
      tenant_id: tenantId,
      application_id: applicationId,
      scope: 'payments:write'
    },
    privateKey,
    {
      algorithm: 'RS256',
      keyid: 'store-multitenant-key',
      expiresIn: '15m',
      issuer: 'https://store.woxxapp.de',
      audience: 'woxx-pay-service'
    }
  );
}

export interface WoxxPayCheckoutItem {
  product_code: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
}

export async function createWoxxPayCheckoutSession(params: {
  tenant: { id: string; subdomain: string; stripeAccountId?: string | null };
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: WoxxPayCheckoutItem[];
  successUrl: string;
  cancelUrl: string;
}) {
  const woxxPayApiUrl = process.env.WOXX_PAY_API_URL || 'http://woxx-pay-api:8000';
  const token = generateAppToken(params.tenant.id);

  const payload = {
    customer: {
      email: params.customerEmail,
      display_name: params.customerName,
      country_code: 'FR'
    },
    external_customer_ref: `tenant:${params.tenant.id}:order:${params.orderNumber}`,
    stripe_account_id: params.tenant.stripeAccountId || undefined,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    line_items: params.items.map(item => ({
      product_code: item.product_code,
      name: item.name,
      unit_amount: item.unit_price_cents,
      quantity: item.quantity
    })),
    metadata: {
      tenantId: params.tenant.id,
      orderNumber: params.orderNumber
    }
  };

  const response = await fetch(`${woxxPayApiUrl}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WoxxPay Checkout error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as { checkout_url: string; payment_id: string };
}
