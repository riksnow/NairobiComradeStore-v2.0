import type {
  OrderStatus,
  PaymentMethod,
  UserRole,
  NotificationType,
  CouponType,
} from "@/lib/constants";

/* DTOs are the plain, JSON-safe shapes produced by serialize(). ObjectIds are
   strings and Dates are ISO strings here. */

export interface AddressDTO {
  _id: string;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  isDefault: boolean;
}

export interface CustomerDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  addresses: AddressDTO[];
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  listPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  tags: string[];
  sizes: string[];
  colors: string[];
  countInStock: number;
  numSales: number;
  avgRating: number;
  numReviews: number;
  isPublished: boolean;
  isFeatured: boolean;
  flashSale: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export interface StatusHistoryDTO {
  status: OrderStatus;
  note?: string;
  timestamp: string;
  updatedBy?: string;
}

export interface OrderDTO {
  _id: string;
  user: string;
  items: OrderItemDTO[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    area: string;
    city: string;
  };
  paymentMethod: PaymentMethod;
  paymentResult?: {
    id?: string;
    status?: string;
    transactionId?: string;
    phone?: string;
    amount?: number;
    updatedAt?: string;
  };
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  isPaid: boolean;
  paidAt?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryDTO[];
  notes?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDTO {
  _id: string;
  product: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDTO {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponDTO {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerDTO {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Cart/wishlist line shape used by the Zustand stores (client-side). */
export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  countInStock: number;
}
