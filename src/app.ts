import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import authRoutes from './routes/auth.routes';
import midtransRoutes from './routes/midtrans.routes';
import shopifyRoutes from './routes/shopify.routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BEBR API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/midtrans', midtransRoutes);
app.use('/api/shopify', shopifyRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app; 