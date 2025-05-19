export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  status: TransactionStatus;
  midtransOrderId: string;
  createdAt: Date;
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELED = 'canceled'
}

export interface CreateTransactionInput {
  userId: string;
  amount: number;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  amount: number;
  status: TransactionStatus;
  midtransOrderId: string;
  createdAt: Date;
}

export interface MidtransWebhookPayload {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
} 