export interface OrderHistory {
  id: string;
  userId: string;
  orderId: string;
  status: OrderStatus;
  checkoutUrl?: string;
  orderData?: any; // Shopify order payload
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'abandoned' | 'pending' | 'paid' | 'cancelled';

export interface CreateOrderHistoryInput {
  userId: string;
  orderId: string;
  status: OrderStatus;
  checkoutUrl?: string;
  orderData?: any;
}

export interface UpdateOrderHistoryInput {
  status?: OrderStatus;
  checkoutUrl?: string;
  orderData?: any;
}

export interface OrderHistoryResponse {
  id: string;
  shopifyOrderId: string;
  userId?: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus?: string;
  lineItems?: any[];
  shippingAddress?: any;
  billingAddress?: any;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopifyOrderData {
  id: string;
  email: string;
  customer?: {
    id: string;
    email: string;
  };
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status?: string;
  line_items: any[];
  shipping_address?: any;
  billing_address?: any;
  created_at: string;
  updated_at: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  REFUNDED = 'refunded',
  VOIDED = 'voided'
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  RESTOCKED = 'restocked'
} 