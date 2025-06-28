import express from 'express';
import { createCheckout, handleWebhook } from '../controllers/shopify.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCheckoutInput:
 *       type: object
 *       required:
 *         - userId
 *         - variantId
 *         - quantity
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user creating the checkout
 *         variantId:
 *           type: string
 *           description: The Shopify variant ID
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity of items
 *     CheckoutResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, error]
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             checkoutUrl:
 *               type: string
 *               format: uri
 *     ShopifyWebhookPayload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         total_price:
 *           type: string
 *         currency:
 *           type: string
 *         customer:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 */

/**
 * @swagger
 * /api/shopify/create-checkout:
 *   post:
 *     summary: Create a new Shopify checkout
 *     tags: [Shopify]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCheckoutInput'
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
    '/create-checkout',
    authenticate as unknown as express.RequestHandler,
    createCheckout as unknown as express.RequestHandler
);

/**
 * @swagger
 * /api/shopify/webhook:
 *   post:
 *     summary: Handle Shopify webhook notifications
 *     tags: [Shopify]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShopifyWebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *       500:
 *         description: Server error
 */
router.post('/webhook', handleWebhook as unknown as express.RequestHandler);

export default router;
