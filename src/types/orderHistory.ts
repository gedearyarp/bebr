export type OrderStatus = 'abandoned' | 'pending' | 'paid' | 'cancelled';

export interface OrderHistory {
  id: string;
  userId: string;
  orderId: string;
  status: OrderStatus;
  checkoutUrl?: string;
  orderData?: any;
  createdAt: string;
  updatedAt: string;
} 