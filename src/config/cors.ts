import { CorsOptions } from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://demo.beyond-running.com',
    'https://beyond-running.vercel.app',
    'https://beyond-running.com',
    'https://www.beyond-running.com',
];

const corsOptions: CorsOptions = {
    origin: function (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) {
        console.log('CORS request from origin:', origin);
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // callback(new Error('Not allowed by CORS'));
            callback(null, false); // Return false instead of error to avoid 500
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400, // 24 hours cache for preflight requests
};

export default corsOptions;
