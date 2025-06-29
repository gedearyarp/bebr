import { Request, Response } from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Shopify from 'shopify-api-node';
import { OrderHistoryService } from '../services/orderHistory.service';

dotenv.config();

// Initialize Shopify client
const shopify = new Shopify({
    shopName: process.env.SHOPIFY_SHOP_NAME || '',
    apiKey: process.env.SHOPIFY_API_KEY || '',
    password: process.env.SHOPIFY_API_SECRET || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2023-10',
});

// Create checkout controller
export const createCheckout = async (req: Request, res: Response) => {
    try {
        const { lineItems, customerInfo } = req.body;

        // Validate input
        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Line items are required and must be an array',
            });
        }

        if (!customerInfo || !customerInfo.email) {
            return res.status(400).json({
                status: 'error',
                message: 'Customer information with email is required',
            });
        }

        // Create draft order
        const draftOrder = await shopify.draftOrder.create({
            line_items: lineItems.map((item: any) => ({
                variant_id: item.variantId,
                quantity: item.quantity,
            })),
            email: customerInfo.email,
            shipping_address: customerInfo.shippingAddress,
            billing_address: customerInfo.billingAddress || customerInfo.shippingAddress,
        });

        // Get checkout URL
        const checkoutUrl = draftOrder.invoice_url;

        return res.status(200).json({
            status: 'success',
            message: 'Checkout created successfully',
            data: {
                checkoutUrl,
                draftOrderId: draftOrder.id,
            },
        });
    } catch (error) {
        console.error('Create checkout error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while creating checkout',
        });
    }
};

// Handle Shopify webhook
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        // Verify webhook signature
        const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
        const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

        console.log('webhookSecret', webhookSecret);

        if (!webhookSecret) {
            console.log('salah1');
            throw new Error('SHOPIFY_WEBHOOK_SECRET is not defined in environment variables');
        }

        if (!hmacHeader) {
            console.log('salah2');
            return res.status(401).json({
                status: 'error',
                message: 'Missing HMAC header',
            });
        }

        // Gunakan raw body (buffer) untuk verifikasi HMAC
        const body = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
        const hmac = crypto.createHmac('sha256', webhookSecret!).update(body).digest('base64');

        if (hmac !== hmacHeader) {
            console.log('salah3');
            return res.status(401).json({
                status: 'error',
                message: 'HMAC verification failed',
            });
        }

        // Parse buffer ke object JSON jika perlu
        let shopifyData: any = req.body;
        if (req.body instanceof Buffer) {
            shopifyData = JSON.parse(req.body.toString('utf8'));
        }

        // Process webhook based on topic
        const topic = req.headers['x-shopify-topic'] as string;

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
            message: 'Webhook processed successfully',
        });
    } catch (error) {
        console.error('Shopify webhook error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while processing webhook',
        });
    }
};

// Helper functions for webhook processing
async function handleOrderCreated(orderData: any) {
    // Only record for registered emails
    const email = orderData.email;
    await OrderHistoryService.createOrderHistory({
        email,
        orderId: orderData.id,
        status: 'abandoned',
        orderData,
    });
}

async function handleOrderPaid(orderData: any) {
    // Only insert for registered emails
    const email = orderData.email;
    await OrderHistoryService.createOrderHistory({
        email,
        orderId: orderData.id,
        status: 'paid',
        orderData,
    });
}

async function handleOrderCancelled(orderData: any) {
    // Only update for registered emails
    const email = orderData.email;
    const userStatus = await OrderHistoryService.isUserRegistered(email);
    if (!userStatus.isRegistered) return;
    await OrderHistoryService.updateOrderHistory(orderData.id, {
        status: 'cancelled',
        orderData,
    });
}
