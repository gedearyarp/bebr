export type OrderStatus = 'abandoned' | 'pending' | 'paid' | 'cancelled';

export interface OrderHistory {
    id: string;
    orderId: string;
    status: OrderStatus;
    orderData?: any;
    createdAt: string;
    updatedAt: string;
}
