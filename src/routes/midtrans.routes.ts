import express from 'express';
import { createTransaction, handleWebhook } from '../controllers/midtrans.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTransactionInput:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user making the transaction
 *         amount:
 *           type: number
 *           description: The transaction amount
 *     TransactionResponse:
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
 *             transaction:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [PENDING, SUCCESS, FAILED, EXPIRED]
 *                 midtransOrderId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *             snapToken:
 *               type: string
 *     MidtransWebhookPayload:
 *       type: object
 *       properties:
 *         order_id:
 *           type: string
 *         transaction_status:
 *           type: string
 *           enum: [capture, settlement, deny, cancel, failure, expire, pending]
 *         signature_key:
 *           type: string
 */

/**
 * @swagger
 * /api/midtrans/create-transaction:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Midtrans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionInput'
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/create-transaction', authenticate as unknown as express.RequestHandler, createTransaction as unknown as express.RequestHandler);

/**
 * @swagger
 * /api/midtrans/webhook:
 *   post:
 *     summary: Handle Midtrans webhook notifications
 *     tags: [Midtrans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MidtransWebhookPayload'
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
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.post('/webhook', handleWebhook as unknown as express.RequestHandler);

export default router; 