import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passesRouter from './features/passes/passesRouter.js';
import ticketsRouter from './features/tickets/ticketsRouter.js';
import checkoutRouter from './features/checkout/checkoutRouter.js';
import webhookRouter from './features/webhook/webhookRouter.js';
import scannerRouter from './features/scanner/scannerRouter.js';
import adminRouter from './features/admin/adminRouter.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
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
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    // Find pending registrations older than 2 hours
    const { data: pendingRegs, error: fetchErr } = await supabase
      .from('registrations')
      .select('*')
      .eq('payment_status', 'PENDING')
      .lt('created_at', twoHoursAgo);

    if (fetchErr) {
      console.error('[Cleanup] Failed to fetch pending registrations:', fetchErr);
      return;
    }

    if (pendingRegs && pendingRegs.length > 0) {
      console.log(`[Cleanup] Found ${pendingRegs.length} abandoned registrations. Archiving...`);
      
      // Move to archive
      const { error: archiveErr } = await supabase
        .from('archived_registrations')
        .insert(pendingRegs);
        
      if (archiveErr) {
        console.error('[Cleanup] Failed to archive registrations:', archiveErr);
        return;
      }
      
      // Delete from active
      const idsToDelete = pendingRegs.map(r => r.id);
      const { error: deleteErr } = await supabase
        .from('registrations')
        .delete()
        .in('id', idsToDelete);
        
      if (deleteErr) {
        console.error('[Cleanup] Failed to delete archived registrations:', deleteErr);
      } else {
        console.log(`[Cleanup] Successfully archived and deleted ${pendingRegs.length} registrations.`);
      }
    }
  } catch (err) {
    console.error('[Cleanup] Unexpected error:', err);
  }
}, 30 * 60 * 1000); // Run every 30 minutes

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
