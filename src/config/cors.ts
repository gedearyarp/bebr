import { CorsOptions } from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://beyond-running.vercel.app'
];

const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  credentials: true,
  exposedHeaders: [
    'Content-Length',
    'X-Total-Count'
  ],
  maxAge: 86400 // 24 hours cache for preflight requests
};

export default corsOptions; 