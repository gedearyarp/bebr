import express from 'express';
import { 
  getUserOrderHistory, 
  getOrderHistoryByEmail, 
  getOrderHistoryByShopifyId,
  checkUserSignInStatus,
  getMyOrderHistory,
  getOrderHistory
} from '../controllers/orderHistory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderHistoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         shopifyOrderId:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
 *         customerEmail:
 *           type: string
 *           format: email
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *         paymentStatus:
 *           type: string
 *         fulfillmentStatus:
 *           type: string
 *         lineItems:
 *           type: array
 *           items:
 *             type: object
 *         shippingAddress:
 *           type: object
 *         billingAddress:
 *           type: object
 *         paidAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserSignInStatus:
 *       type: object
 *       properties:
 *         isSignedIn:
 *           type: boolean
 *         userId:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /api/order-history/user:
 *   get:
 *     summary: Get order history for authenticated user
 *     tags: [Order History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success, error]
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderHistoryResponse'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/user', authenticate as unknown as express.RequestHandler, getUserOrderHistory as unknown as express.RequestHandler);

/**
 * @swagger
 * /api/order-history/email:
 *   get:
 *     summary: Get order history by customer email
 *     tags: [Order History]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Customer email address
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success, error]
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderHistoryResponse'
 *       400:
 *         description: Email parameter is required
 *       500:
 *         description: Server error
 */
router.get('/email', getOrderHistoryByEmail as unknown as express.RequestHandler);

/**
 * @swagger
 * /api/order-history/shopify/{shopifyOrderId}:
 *   get:
 *     summary: Get order history by Shopify order ID
 *     tags: [Order History]
 *     parameters:
 *       - in: path
 *         name: shopifyOrderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shopify order ID
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success, error]
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/OrderHistoryResponse'
 *       400:
 *         description: Shopify order ID is required
 *       404:
 *         description: Order history not found
 *       500:
 *         description: Server error
 */
router.get('/shopify/:shopifyOrderId', getOrderHistoryByShopifyId as unknown as express.RequestHandler);

/**
 * @swagger
 * /api/order-history/check-signin:
 *   get:
 *     summary: Check if user is signed in by email
 *     tags: [Order History]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to check
 *     responses:
 *       200:
 *         description: User sign in status checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success, error]
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserSignInStatus'
 *       400:
 *         description: Email parameter is required
 *       500:
 *         description: Server error
 */
router.get('/check-signin', checkUserSignInStatus as unknown as express.RequestHandler);

// Get all order history for the authenticated user
router.get('/my', authenticate as any, getMyOrderHistory as any);

// Get a specific order by orderId (Shopify order ID)
router.get('/:orderId', authenticate as any, getOrderHistory as any);

export default router; 