import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PickupSlot {
  start: string; // ISO String
  end: string;   // ISO String
  displayTime: string; // "12:15 - 12:30"
  available: boolean;
  remainingCapacity: number;
}

export async function getAvailableSlotsForDate(
  tenantId: string,
  targetDateStr: string // YYYY-MM-DD
): Promise<PickupSlot[]> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) throw new Error('Tenant introuvable');

  const slotDuration = tenant.slotDurationMinutes || 15;
  const maxCapacity = tenant.maxItemsPerSlot || 20;

  // Day of week index: 0 is Sun, 1 is Mon...
  const dateObj = new Date(`${targetDateStr}T00:00:00.000Z`);
  const dayNames = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
  const dayName = dayNames[dateObj.getUTCDay()];

  // Read schedules from tenant openingHours
  const defaultHours = [
    { day: 'lun', open: '11:30', close: '22:00', closed: false },
    { day: 'mar', open: '11:30', close: '22:00', closed: false },
    { day: 'mer', open: '11:30', close: '22:00', closed: false },
    { day: 'jeu', open: '11:30', close: '22:30', closed: false },
    { day: 'ven', open: '11:30', close: '23:00', closed: false },
    { day: 'sam', open: '11:30', close: '23:00', closed: false },
    { day: 'dim', open: '12:00', close: '21:30', closed: false }
  ];

  const openingHours = Array.isArray(tenant.openingHours) ? (tenant.openingHours as any[]) : defaultHours;
  const daySchedule = openingHours.find((h: any) => h.day === dayName) || { closed: false, open: '11:30', close: '22:00' };

  if ((daySchedule as any).closed) {
    return [];
  }

  // Parse open and close times (HH:MM)
  const [openHour, openMin] = ((daySchedule as any).open || '11:30').split(':').map(Number);
  const [closeHour, closeMin] = ((daySchedule as any).close || '22:00').split(':').map(Number);

  const startDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), openHour, openMin, 0));
  const endDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), closeHour, closeMin, 0));

  // Fetch all existing orders for this tenant on this date
  const dayStartIso = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0));
  const dayEndIso = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 23, 59, 59));

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      pickupSlotStart: {
        gte: dayStartIso,
        lte: dayEndIso
      },
      orderStatus: {
        notIn: ['CANCELLED']
      }
    },
    include: {
      items: true
    }
  });

  const slots: PickupSlot[] = [];
  let current = new Date(startDay);
  const now = new Date();

  while (current.getTime() + slotDuration * 60000 <= endDay.getTime()) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + slotDuration * 60000);

    // Calculate item count in this slot
    const slotOrders = orders.filter((o) => {
      const oStart = new Date(o.pickupSlotStart).getTime();
      return oStart >= slotStart.getTime() && oStart < slotEnd.getTime();
    });

    const itemsBooked = slotOrders.reduce((acc, order) => {
      const sumItems = order.items.reduce((s, i) => s + i.quantity, 0);
      return acc + sumItems;
    }, 0);

    const remaining = Math.max(0, maxCapacity - itemsBooked);
    // Minimum 15 minutes preparation window in the future
    const isPast = slotStart.getTime() <= now.getTime() + 15 * 60000;

    const startFormatted = slotStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    const endFormatted = slotEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      displayTime: `${startFormatted} - ${endFormatted}`,
      available: !isPast && remaining > 0,
      remainingCapacity: remaining
    });

    current = new Date(current.getTime() + slotDuration * 60000);
  }

  return slots;
}

export async function validateSlotCapacity(
  tenantId: string,
  slotStartIso: string,
  totalItemsCount: number
): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return false;

  const slotStart = new Date(slotStartIso);
  const slotDuration = tenant.slotDurationMinutes || 15;
  const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
  const maxCapacity = tenant.maxItemsPerSlot || 20;

  const existingOrders = await prisma.order.findMany({
    where: {
      tenantId,
      pickupSlotStart: {
        gte: slotStart,
        lt: slotEnd
      },
      orderStatus: { notIn: ['CANCELLED'] }
    },
    include: { items: true }
  });

  const currentBooked = existingOrders.reduce((acc, o) => {
    return acc + o.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  return (currentBooked + totalItemsCount) <= maxCapacity;
}
