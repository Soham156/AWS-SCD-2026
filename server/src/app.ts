import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passesRouter from './features/passes/passesRouter.js';
import checkoutRouter from './features/checkout/checkoutRouter.js';
import webhookRouter from './features/webhook/webhookRouter.js';
import scannerRouter from './features/scanner/scannerRouter.js';
import adminRouter from './features/admin/adminRouter.js';
import applicationsRouter from './features/applications/applicationsRouter.js';
import settingsRouter from './features/settings/settingsRouter.js';
import emailRouter from './features/email/emailRouter.js';
import ordersRouter from './features/orders/ordersRouter.js';
import authRouter from './features/auth/authRouter.js';
import ticketsRouter from './features/tickets/ticketsRouter.js';
import { startEmailProcessor } from './features/email/emailProcessor.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

const app = express();
app.set('trust proxy', 1);
const PORT = parseInt(process.env.PORT || '3001');

// Fail-safe startup checks
const requiredEnvVars = ['ADMIN_SECRET', 'SCANNER_SECRET', 'CASHFREE_SECRET_KEY', 'QR_HMAC_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Server cannot start securely without these secrets. Please configure them in your .env file.');
  process.exit(1);
}

// Non-fatal: warn if email provider is not configured
if (!process.env.RESEND_API_KEY) {
  console.warn('[WARN] RESEND_API_KEY is not set. Email delivery will be disabled.');
}

app.use(helmet());
const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');

app.use(cors({
  origin: [
    'https://aws-scd-dhule.tech',
    'https://www.aws-scd-dhule.tech',
    'https://aws-scd-2026.vercel.app',
    'http://localhost:5173',
    frontendUrl
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({
  verify: (req: any, _res, buf) => {
    // Store raw body for Cashfree webhook signature verification
    req.rawBody = buf.toString();
  }
}));

// Mount feature routers
app.use('/api/passes', passesRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/scan', scannerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/email', emailRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Cleanup of expired sessions / abandoned registrations is now request-driven
// and self-throttled (see shared/lib/cleanup.ts, called from the passes/orders/
// checkout routes) so it works on serverless where setInterval never fires.

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);

  // Start background email processor after server is ready
  startEmailProcessor();
});
