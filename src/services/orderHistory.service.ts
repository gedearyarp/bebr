import supabase from '../config/db';
import { CreateOrderHistoryInput, UpdateOrderHistoryInput, OrderHistory } from '../models/orderHistory.model';

export class OrderHistoryService {
  /**
   * Create a new order history record
   */
  static async createOrderHistory(data: CreateOrderHistoryInput): Promise<OrderHistory> {
    const { userId, orderId, status, checkoutUrl, orderData } = data;
    const { data: orderHistory, error } = await supabase
      .from('order_history')
      .insert({
        user_id: userId,
        order_id: orderId,
        status,
        checkout_url: checkoutUrl,
        order_data: orderData
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapToOrderHistory(orderHistory);
  }

  /**
   * Update an existing order history record
   */
static async updateOrderHistory(orderId: string, updates: UpdateOrderHistoryInput): Promise<OrderHistory | null> {
    const { data, error } = await supabase
      .from('order_history')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
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
   * Get order history for a specific user
   */
  static async getUserOrderHistory(userId: string): Promise<OrderHistory[]> {
    const { data, error } = await supabase
      .from('order_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(this.mapToOrderHistory);
  }

  /**
   * Check if user is signed in by email
   */
  static async isUserSignedIn(email: string): Promise<{ isSignedIn: boolean; userId?: string }> {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return { isSignedIn: false };
      throw error;
    }
    return { isSignedIn: true, userId: user.id };
  }

  /**
   * Map database record to response format
   */
  private static mapToOrderHistory(row: any): OrderHistory {
    return {
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      status: row.status,
      checkoutUrl: row.checkout_url,
      orderData: row.order_data,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
} 