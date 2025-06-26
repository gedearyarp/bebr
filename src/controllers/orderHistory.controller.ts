import { Request, Response } from 'express';
import { OrderHistoryService } from '../services/orderHistory.service';
import { getOrderHistoryByUser, getOrderHistoryByOrderId } from '../services/orderHistory.service';

/**
 * Get order history for the authenticated user
 */
export const getUserOrderHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    const orderHistory = await OrderHistoryService.getUserOrderHistory(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Order history retrieved successfully',
      data: orderHistory
    });
  } catch (error) {
    console.error('getUserOrderHistory error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order history'
    });
  }
};

/**
 * Get order history by email (for guest users or admin purposes)
 */
export const getOrderHistoryByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Email parameter is required'
      });
    }

    const orderHistory = await OrderHistoryService.getOrderHistoryByEmail(email);

    return res.status(200).json({
      status: 'success',
      message: 'Order history retrieved successfully',
      data: orderHistory
    });
  } catch (error) {
    console.error('getOrderHistoryByEmail error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order history'
    });
  }
};

/**
 * Get specific order history by Shopify order ID
 */
export const getOrderHistoryByShopifyId = async (req: Request, res: Response) => {
  try {
    const { shopifyOrderId } = req.params;

    if (!shopifyOrderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Shopify order ID is required'
      });
    }

    const orderHistory = await OrderHistoryService.getOrderHistoryByShopifyId(shopifyOrderId);

    if (!orderHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Order history not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Order history retrieved successfully',
      data: orderHistory
    });
  } catch (error) {
    console.error('getOrderHistoryByShopifyId error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order history'
    });
  }
};

/**
 * Check if user is signed in by email
 */
export const checkUserSignInStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Email parameter is required'
      });
    }

    const { isSignedIn, userId } = await OrderHistoryService.isUserSignedIn(email);

    return res.status(200).json({
      status: 'success',
      message: 'User sign in status checked successfully',
      data: {
        isSignedIn,
        userId
      }
    });
  } catch (error) {
    console.error('checkUserSignInStatus error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check user sign in status'
    });
  }
};

export const getMyOrderHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const orders = await OrderHistoryService.getUserOrderHistory(userId);
    return res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch order history' });
  }
};

export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await OrderHistoryService.getOrderHistoryByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    // Only allow access if the user owns the order
    if (order.userId !== req.user?.id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    return res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch order' });
  }
}; 