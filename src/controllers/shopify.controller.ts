import { Request, Response } from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Shopify from 'shopify-api-node';

dotenv.config();

// Initialize Shopify client
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME || '',
  apiKey: process.env.SHOPIFY_API_KEY || '',
  password: process.env.SHOPIFY_API_SECRET || '',
  apiVersion: process.env.SHOPIFY_API_VERSION || '2023-10'
});

// Create checkout controller
export const createCheckout = async (req: Request, res: Response) => {
  try {
    const { lineItems, customerInfo } = req.body;

    // Validate input
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Line items are required and must be an array'
      });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer information with email is required'
      });
    }

    // Create draft order
    const draftOrder = await shopify.draftOrder.create({
      line_items: lineItems.map((item: any) => ({
        variant_id: item.variantId,
        quantity: item.quantity
      })),
      email: customerInfo.email,
      shipping_address: customerInfo.shippingAddress,
      billing_address: customerInfo.billingAddress || customerInfo.shippingAddress
    });

    // Get checkout URL
    const checkoutUrl = draftOrder.invoice_url;

    return res.status(200).json({
      status: 'success',
      message: 'Checkout created successfully',
      data: {
        checkoutUrl,
        draftOrderId: draftOrder.id
      }
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while creating checkout'
    });
  }
};

// Handle Shopify webhook
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('SHOPIFY_WEBHOOK_SECRET is not defined in environment variables');
    }

    if (!hmacHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing HMAC header'
      });
    }

    const body = JSON.stringify(req.body);
    const hmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('base64');

    if (hmac !== hmacHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'HMAC verification failed'
      });
    }

    // Process webhook based on topic
    const topic = req.headers['x-shopify-topic'] as string;
    const shopifyData = req.body;

    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(shopifyData);
        break;
      case 'orders/paid':
        await handleOrderPaid(shopifyData);
        break;
      case 'orders/cancelled':
        await handleOrderCancelled(shopifyData);
        break;
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Shopify webhook error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while processing webhook'
    });
  }
};

// Helper functions for webhook processing
async function handleOrderCreated(orderData: any) {
  // Store order information in database or trigger any business logic
  console.log('Order created:', orderData.id);
}

async function handleOrderPaid(orderData: any) {
  // Update order status or trigger fulfillment
  console.log('Order paid:', orderData.id);
}

async function handleOrderCancelled(orderData: any) {
  // Handle cancellation logic
  console.log('Order cancelled:', orderData.id);
} 