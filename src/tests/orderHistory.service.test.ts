import { OrderHistoryService } from '../services/orderHistory.service';
import { CreateOrderHistoryInput, ShopifyOrderData } from '../models/orderHistory.model';
import supabase from '../config/db';

// Mock Supabase client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn()
        }))
      }))
    }))
  }
}));

describe('OrderHistoryService', () => {
  const userId = 'test-user-id';
  const orderId = 'test-order-id';
  const email = 'test@example.com';
  const orderData = { id: orderId, email };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderHistory', () => {
    it('should create order history successfully', async () => {
      const mockData: CreateOrderHistoryInput = {
        shopifyOrderId: 'test-order-123',
        userId: 'user-123',
        customerEmail: 'test@example.com',
        amount: 100000,
        currency: 'IDR',
        status: 'pending',
        paymentStatus: 'pending'
      };

      const mockResponse = {
        id: 'order-history-123',
        shopify_order_id: 'test-order-123',
        user_id: 'user-123',
        customer_email: 'test@example.com',
        amount: 100000,
        currency: 'IDR',
        status: 'pending',
        payment_status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const supabase = require('../config/db').default;
      const mockInsert = supabase.from().insert().select().single;
      mockInsert.mockResolvedValue({ data: mockResponse, error: null });

      const result = await OrderHistoryService.createOrderHistory(mockData);

      expect(result).toEqual({
        id: 'order-history-123',
        shopifyOrderId: 'test-order-123',
        userId: 'user-123',
        customerEmail: 'test@example.com',
        amount: 100000,
        currency: 'IDR',
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should throw error when creation fails', async () => {
      const mockData: CreateOrderHistoryInput = {
        shopifyOrderId: 'test-order-123',
        customerEmail: 'test@example.com',
        amount: 100000,
        status: 'pending',
        paymentStatus: 'pending'
      };

      const supabase = require('../config/db').default;
      const mockInsert = supabase.from().insert().select().single;
      mockInsert.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      await expect(OrderHistoryService.createOrderHistory(mockData))
        .rejects
        .toThrow('Failed to create order history: Database error');
    });
  });

  describe('isUserSignedIn', () => {
    it('should return true for signed in user', async () => {
      const mockUser = { id: 'user-123' };
      const supabase = require('../config/db').default;
      const mockSelect = supabase.from().select().eq().single;
      mockSelect.mockResolvedValue({ data: mockUser, error: null });

      const result = await OrderHistoryService.isUserSignedIn('test@example.com');

      expect(result).toEqual({
        isSignedIn: true,
        userId: 'user-123'
      });
    });

    it('should return false for guest user', async () => {
      const supabase = require('../config/db').default;
      const mockSelect = supabase.from().select().eq().single;
      mockSelect.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const result = await OrderHistoryService.isUserSignedIn('guest@example.com');

      expect(result).toEqual({
        isSignedIn: false
      });
    });
  });

  describe('processShopifyOrder', () => {
    it('should create order history for signed in user', async () => {
      const mockOrderData: ShopifyOrderData = {
        id: 'shopify-order-123',
        email: 'signedin@example.com',
        customer: { id: 'customer-123', email: 'signedin@example.com' },
        total_price: '100000',
        currency: 'IDR',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        line_items: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockUser = { id: 'user-123' };
      const mockOrderHistory = {
        id: 'order-history-123',
        shopify_order_id: 'shopify-order-123',
        user_id: 'user-123',
        customer_email: 'signedin@example.com',
        amount: 100000,
        currency: 'IDR',
        status: 'fulfilled',
        payment_status: 'paid',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const supabase = require('../config/db').default;
      
      // Mock getOrderHistoryByShopifyId (returns null - order doesn't exist)
      const mockGetOrder = supabase.from().select().eq().single;
      mockGetOrder.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      
      // Mock isUserSignedIn
      mockGetOrder.mockResolvedValueOnce({ data: mockUser, error: null });
      
      // Mock createOrderHistory
      const mockInsert = supabase.from().insert().select().single;
      mockInsert.mockResolvedValue({ data: mockOrderHistory, error: null });

      const result = await OrderHistoryService.processShopifyOrder(mockOrderData);

      expect(result.shopifyOrderId).toBe('shopify-order-123');
      expect(result.userId).toBe('user-123');
    });

    it('should skip order history for guest user', async () => {
      const mockOrderData: ShopifyOrderData = {
        id: 'shopify-order-123',
        email: 'guest@example.com',
        total_price: '100000',
        currency: 'IDR',
        financial_status: 'paid',
        line_items: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const supabase = require('../config/db').default;
      
      // Mock getOrderHistoryByShopifyId (returns null - order doesn't exist)
      const mockGetOrder = supabase.from().select().eq().single;
      mockGetOrder.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      
      // Mock isUserSignedIn (returns false for guest)
      mockGetOrder.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(OrderHistoryService.processShopifyOrder(mockOrderData))
        .rejects
        .toThrow('Guest users are not eligible for order history');
    });

    it('should update existing order history', async () => {
      const mockOrderData: ShopifyOrderData = {
        id: 'shopify-order-123',
        email: 'signedin@example.com',
        total_price: '100000',
        currency: 'IDR',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        line_items: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const existingOrder = {
        id: 'order-history-123',
        shopify_order_id: 'shopify-order-123',
        user_id: 'user-123',
        customer_email: 'signedin@example.com',
        amount: 100000,
        currency: 'IDR',
        status: 'pending',
        payment_status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const updatedOrder = {
        ...existingOrder,
        status: 'fulfilled',
        payment_status: 'paid'
      };

      const supabase = require('../config/db').default;
      
      // Mock getOrderHistoryByShopifyId (returns existing order)
      const mockGetOrder = supabase.from().select().eq().single;
      mockGetOrder.mockResolvedValueOnce({ data: existingOrder, error: null });
      
      // Mock updateOrderHistory
      const mockUpdate = supabase.from().update().eq().select().single;
      mockUpdate.mockResolvedValue({ data: updatedOrder, error: null });

      const result = await OrderHistoryService.processShopifyOrder(mockOrderData);

      expect(result.status).toBe('fulfilled');
      expect(result.paymentStatus).toBe('paid');
    });
  });

  it('should create order history', async () => {
    const result = await OrderHistoryService.createOrderHistory({
      userId,
      orderId,
      status: 'abandoned',
      checkoutUrl: 'https://checkout.url',
      orderData
    });
    expect(result).toHaveProperty('id');
    expect(result.userId).toBe(userId);
    expect(result.orderId).toBe(orderId);
    expect(result.status).toBe('abandoned');
  });

  it('should update order history', async () => {
    const result = await OrderHistoryService.updateOrderHistory(orderId, {
      status: 'paid',
      orderData: { ...orderData, paid: true }
    });
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('paid');
    expect(result.orderData.paid).toBe(true);
  });

  it('should get order history by user', async () => {
    const results = await OrderHistoryService.getUserOrderHistory(userId);
    expect(Array.isArray(results)).toBe(true);
    expect(results[0].userId).toBe(userId);
  });

  it('should get order history by orderId', async () => {
    const result = await OrderHistoryService.getOrderHistoryByOrderId(orderId);
    expect(result).not.toBeNull();
    expect(result?.orderId).toBe(orderId);
  });
}); 