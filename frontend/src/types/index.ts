export interface ProductOptionChoice {
  label: string;
  priceCents?: number;
}

export interface ProductOption {
  name: string;
  type: 'select' | 'checkbox';
  required: boolean;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  priceCents: number;
  imageUrl?: string | null;
  imageGallery?: string[];
  stockQuantity: number;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  options?: ProductOption[] | null;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  orderIndex: number;
  isActive: boolean;
  products?: Product[];
}

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface TenantThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
  heroOverlayOpacity: number;
  badgeStyle: 'pill' | 'square' | 'soft';
}

export interface TenantCmsConfig {
  aboutTitle?: string;
  aboutText?: string;
  features?: Array<{ icon: string; title: string; desc: string }>;
  announcement?: string;
}

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  themePreset: string;
  themeConfig?: TenantThemeConfig | null;
  cmsConfig?: TenantCmsConfig | null;
  heroImageUrl?: string | null;
  logoUrl?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  acceptUnpaidOrders: boolean;
  slotDurationMinutes: number;
  maxItemsPerSlot: number;
  openingHours?: OpeningHour[] | null;
  stripeAccountId?: string | null;
  hasWoxxPayEnabled?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, any>;
  unitPriceCents: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  selectedOptions?: any;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalCents: number;
  paymentMethod: 'ONLINE_WOXXPAY' | 'ON_SITE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'NEW' | 'IN_PREPARATION' | 'READY' | 'COMPLETED' | 'CANCELLED';
  pickupSlotStart: string;
  pickupSlotEnd: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  tenant?: Tenant;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'MANAGER' | 'SUPERADMIN';
  tenantId?: string | null;
}
