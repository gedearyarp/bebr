import supabase from '../config/db';
import {
    CreateOrderHistoryInput,
    UpdateOrderHistoryInput,
    OrderHistory,
} from '../models/orderHistory.model';

export class OrderHistoryService {
    /**
     * Create a new order history record
     */
    static async createOrderHistory(data: CreateOrderHistoryInput): Promise<OrderHistory> {
        const { email, orderId, status, orderData } = data;
        const { data: orderHistory, error } = await supabase
            .from('order_history')
            .insert({
                email,
                order_id: orderId,
                status,
                order_data: orderData,
            })
            .select()
            .single();
        if (error) throw error;
        return this.mapToOrderHistory(orderHistory);
    }

    /**
     * Update an existing order history record
     */
    static async updateOrderHistory(
        orderId: string,
        updates: UpdateOrderHistoryInput
    ): Promise<OrderHistory | null> {
        const { data, error } = await supabase
            .from('order_history')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('order_id', orderId)
            .select()
            .single();
        if (error) throw error;
        return data ? this.mapToOrderHistory(data) : null;
    }

    /**
     * Get order history by order ID
     */
    static async getOrderHistoryByOrderId(orderId: string): Promise<OrderHistory | null> {
        const { data, error } = await supabase
            .from('order_history')
            .select('*')
            .eq('order_id', orderId)
            .single();
        if (error) throw error;
        return data ? this.mapToOrderHistory(data) : null;
    }

    /**
     * Get order history for a specific email
     */
    static async getOrderHistoryByEmail(email: string): Promise<OrderHistory[]> {
        const { data, error } = await supabase
            .from('order_history')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(this.mapToOrderHistory);
    }

    /**
     * Check if user is registered by email
     */
    static async isUserRegistered(email: string): Promise<{ isRegistered: boolean }> {
        const { error } = await supabase.from('users').select('email').eq('email', email).single();
        if (error) {
            if (error.code === 'PGRST116') return { isRegistered: false };
            throw error;
        }
        return { isRegistered: true };
    }

    /**
     * Map database record to response format
     */
    private static mapToOrderHistory(row: any): OrderHistory {
        return {
            id: row.id,
            email: row.email,
            orderId: row.order_id,
            status: row.status,
            orderData: row.order_data,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
