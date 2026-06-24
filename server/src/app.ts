import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passesRouter from './features/passes/passesRouter.js';
import ticketsRouter from './features/tickets/ticketsRouter.js';
import checkoutRouter from './features/checkout/checkoutRouter.js';
import webhookRouter from './features/webhook/webhookRouter.js';
import scannerRouter from './features/scanner/scannerRouter.js';
import adminRouter from './features/admin/adminRouter.js';
import applicationsRouter from './features/applications/applicationsRouter.js';
import settingsRouter from './features/settings/settingsRouter.js';
import emailRouter from './features/email/emailRouter.js';
import { startEmailProcessor } from './features/email/emailProcessor.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Fail-safe startup checks
const requiredEnvVars = ['ADMIN_SECRET', 'SCANNER_SECRET', 'CASHFREE_SECRET_KEY'];
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
app.use('/api/tickets', ticketsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/scan', scannerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/email', emailRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

import { supabase } from './shared/lib/supabase.js';

// Background cleanup for abandoned registrations
setInterval(async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Find pending registrations older than 24 hours
    const { data: pendingRegs, error: fetchErr } = await supabase
      .from('registrations')
      .select('*')
      .eq('payment_status', 'PENDING')
      .lt('created_at', twentyFourHoursAgo);

    if (fetchErr) {
      console.error('[Cleanup] Failed to fetch pending registrations:', fetchErr);
      return;
    }

    if (pendingRegs && pendingRegs.length > 0) {
      // Move to archive (upsert handles records that might already be archived)
      const { error: archiveErr } = await supabase
        .from('archived_registrations')
        .upsert(pendingRegs, { onConflict: 'id' });
        
      if (archiveErr) {
        console.error('[Cleanup] Failed to archive registrations:', archiveErr);
        return;
      }
      
      const idsToDelete = pendingRegs.map(r => r.id);

      // Delete associated payments first to prevent foreign key errors
      const { error: paymentsDeleteErr } = await supabase
        .from('payments')
        .delete()
        .in('registration_id', idsToDelete);

      if (paymentsDeleteErr) {
        console.error('[Cleanup] Failed to delete associated payments:', paymentsDeleteErr);
        return;
      }

      // Delete from active registrations
      const { error: deleteErr } = await supabase
        .from('registrations')
        .delete()
        .in('id', idsToDelete);
        
      if (deleteErr) {
        console.error('[Cleanup] Failed to delete archived registrations:', deleteErr);
      } else {
        console.log(`[Cleanup] Successfully archived and cleaned up ${idsToDelete.length} abandoned registration(s) older than 24h.`);
      }
    }
  } catch (err) {
    console.error('[Cleanup] Unexpected error:', err);
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// Background cleanup for abandoned checkout sessions (release reserved tickets)
setInterval(async () => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    // Find payments initiated > 15 mins ago
    const { data: expiredPayments, error } = await supabase
      .from('payments')
      .select('id, registrations(pass_type_id)')
      .eq('status', 'initiated')
      .lt('created_at', fifteenMinsAgo);

    if (error) {
      console.error('[Session Cleanup] Error fetching expired payments:', error);
      return;
    }

    if (expiredPayments && expiredPayments.length > 0) {
      for (const p of expiredPayments) {
        // Mark as expired
        await supabase.from('payments').update({ status: 'expired' }).eq('id', p.id);
        
        // Release the ticket by decrementing the sold count
        const passId = (p.registrations as any)?.pass_type_id;
        if (passId) {
          await supabase.rpc('decrement_sold', { pass_id: passId });
        }
      }
      console.log(`[Session Cleanup] Released ${expiredPayments.length} reserved tickets.`);
    }
  } catch (err) {
    console.error('[Session Cleanup] Unexpected error:', err);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);

  // Start background email processor after server is ready
  startEmailProcessor();
});
