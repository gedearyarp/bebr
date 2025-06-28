import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import midtransClient from 'midtrans-client';
import supabase from '../config/db';
import {
    CreateTransactionInput,
    MidtransWebhookPayload,
    TransactionStatus,
} from '../models/transaction.model';

dotenv.config();

// Initialize Midtrans Snap client
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
    throw new Error('Midtrans credentials are not defined in environment variables');
}

const snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey,
    clientKey,
});

// Create transaction controller
export const createTransaction = async (req: Request, res: Response) => {
    try {
        const { userId, amount }: CreateTransactionInput = req.body;

        // Validate input
        if (!userId || !amount) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID and amount are required',
            });
        }

        // Check if user exists
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        // Generate unique order ID
        const midtransOrderId = `ORDER-${uuidv4()}`;

        // Create transaction in database
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                userId,
                amount,
                status: TransactionStatus.PENDING,
                midtransOrderId,
            })
            .select()
            .single();

        if (transactionError || !transaction) {
            console.error('Error creating transaction:', transactionError);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create transaction',
            });
        }

        // Create Midtrans transaction
        const webhookUrl = process.env.MIDTRANS_WEBHOOK_URL;
        if (!webhookUrl) {
            throw new Error('MIDTRANS_WEBHOOK_URL is not defined in environment variables');
        }

        const parameter = {
            transaction_details: {
                order_id: midtransOrderId,
                gross_amount: amount,
            },
            customer_details: {
                first_name: user.username,
                email: user.email,
            },
            callbacks: {
                finish: webhookUrl,
            },
        };

        // Get Snap token
        const snapToken = await snap.createTransaction(parameter);

        return res.status(200).json({
            status: 'success',
            message: 'Transaction created successfully',
            data: {
                transaction,
                snapToken,
            },
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while creating transaction',
        });
    }
};

// Handle Midtrans webhook
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const notification: MidtransWebhookPayload = req.body;

        // Verify signature key
        const merchantId = process.env.MIDTRANS_MERCHANT_ID;
        const serverKey = process.env.MIDTRANS_SERVER_KEY;

        if (!merchantId || !serverKey) {
            throw new Error('Midtrans credentials are not defined in environment variables');
        }

        // Find transaction by order ID
        const { data: transaction, error: findError } = await supabase
            .from('transactions')
            .select('*')
            .eq('midtransOrderId', notification.order_id)
            .single();

        if (findError || !transaction) {
            return res.status(404).json({
                status: 'error',
                message: 'Transaction not found',
            });
        }

        // Map Midtrans status to our status
        let status: TransactionStatus;
        switch (notification.transaction_status) {
            case 'capture':
            case 'settlement':
                status = TransactionStatus.SUCCESS;
                break;
            case 'deny':
            case 'cancel':
            case 'failure':
                status = TransactionStatus.FAILED;
                break;
            case 'expire':
                status = TransactionStatus.EXPIRED;
                break;
            case 'pending':
            default:
                status = TransactionStatus.PENDING;
                break;
        }

        // Update transaction status
        const { error: updateError } = await supabase
            .from('transactions')
            .update({ status })
            .eq('id', transaction.id);

        if (updateError) {
            console.error('Error updating transaction status:', updateError);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to update transaction status',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Webhook processed successfully',
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong while processing webhook',
        });
    }
};
