declare module 'midtrans-client' {
    interface Config {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
    }

    interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    interface CustomerDetails {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    }

    interface TransactionOptions {
        transaction_details: TransactionDetails;
        customer_details?: CustomerDetails;
        item_details?: Array<{
            id: string;
            price: number;
            quantity: number;
            name: string;
        }>;
        callbacks?: {
            finish?: string;
            error?: string;
            pending?: string;
        };
    }

    class CoreApi {
        constructor(config: Config);
        charge(parameter: TransactionOptions): Promise<any>;
        capture(parameter: any): Promise<any>;
        cardToken(parameter: any): Promise<any>;
        cardRegister(parameter: any): Promise<any>;
        expire(transactionId: string): Promise<any>;
        status(transactionId: string): Promise<any>;
        statusb2b(transactionId: string): Promise<any>;
        approve(transactionId: string): Promise<any>;
        deny(transactionId: string): Promise<any>;
        cancel(transactionId: string): Promise<any>;
        refund(transactionId: string, parameter?: any): Promise<any>;
        directRefund(transactionId: string, parameter?: any): Promise<any>;
    }

    class Snap {
        constructor(config: Config);
        createTransaction(parameter: TransactionOptions): Promise<{
            token: string;
            redirect_url: string;
        }>;
        createTransactionToken(parameter: TransactionOptions): Promise<string>;
        createTransactionRedirectUrl(parameter: TransactionOptions): Promise<string>;
    }

    export = {
        CoreApi,
        Snap,
    };
}
