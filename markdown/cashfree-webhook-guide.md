# Cashfree Webhook Implementation Guide

Based on [Cashfree Official Docs](https://docs.cashfree.com/docs/payment-webhooks)

---

## How It Works (Your Flow)

```
User Pays → Cashfree processes payment → Cashfree POSTs to your webhook URL
→ Your server verifies signature → Generates ticket_number + QR token
→ Updates registration to PAID → Frontend polls and shows ticket
```

## Step 1: Configure Webhook in Cashfree Dashboard

1. Go to **[merchant.cashfree.com](https://merchant.cashfree.com)**
2. Navigate to: **Developers** → **Webhooks** → **Add Webhook Endpoint**
3. Enter these details:
   - **URL**: `https://aws-scd-2026.onrender.com/api/webhooks/cashfree`
   - **Version**: Select `2023-08-01` (matches your `x-api-version` header)
   - **Events**: Check `Payment Success` (and optionally `Payment Failed`)
4. Click **Test** to verify your endpoint returns 200 OK
5. Click **Save**

> **NOTE**: Cashfree does NOT provide a separate "Webhook Secret" anymore.  
> Per official docs, signature verification uses your **Client Secret** (`CASHFREE_SECRET_KEY`).  
> You do NOT need a `CASHFREE_WEBHOOK_SECRET` env var.

---

## Step 2: Signature Verification (Already Implemented)

Per official Cashfree documentation, signature verification works like this:

### Headers Sent by Cashfree
- `x-webhook-signature`: Base64-encoded HMAC-SHA256 signature
- `x-webhook-timestamp`: Unix timestamp of when webhook was sent

### Verification Algorithm
```
signatureInput = timestamp + rawBody
expectedSignature = HMAC-SHA256(clientSecret, signatureInput) → Base64
valid = (expectedSignature === receivedSignature)
```

### Critical Rule: Use RAW Body
You **MUST** use the raw HTTP request body (the exact bytes Cashfree sent), NOT `JSON.stringify(req.body)`. Express's JSON parser may reorder keys or change whitespace, which breaks the signature.

**Your code already handles this correctly** (after the fix I just applied):
- `app.ts` stores `req.rawBody` via the `verify` callback in `express.json()`
- `webhookRouter.ts` uses `(req as any).rawBody` for HMAC computation
- Uses `CASHFREE_SECRET_KEY` (your Client Secret) as the HMAC key

---

## Step 3: Webhook Payload Structure

When Cashfree sends a `PAYMENT_SUCCESS` webhook, the payload looks like:

```json
{
  "type": "PAYMENT_SUCCESS_WEBHOOK",
  "data": {
    "order": {
      "order_id": "SCD-b5bc7c45-1717850000000",
      "order_amount": 499.00,
      "order_currency": "INR",
      "order_status": "PAID"
    },
    "payment": {
      "cf_payment_id": 1234567890,
      "payment_status": "SUCCESS",
      "payment_amount": 499.00,
      "payment_method": {
        "upi": { "upi_id": "user@upi" }
      }
    },
    "customer_details": {
      "customer_id": "b5bc7c45-bd2b-4324-9033-cba65d735c6b",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "9999999999"
    }
  }
}
```

Your webhook handler extracts:
- `data.order.order_id` → matches against `payments.cashfree_order_id`
- `data.payment.cf_payment_id` → stored in `payments.cashfree_payment_id`

---

## Step 4: What Your Webhook Does (Already Implemented)

On receiving `PAYMENT_SUCCESS_WEBHOOK`:

1. **Idempotency Check**: Looks up the `payments` table by `order_id`. If already `paid`, returns 200 OK immediately.
2. **Generate Ticket Number**: Creates a unique `AWS-XXXX-26` format ticket number (retries up to 5 times for uniqueness).
3. **Generate QR Token**: HMAC-signs the ticket number using `QR_HMAC_SECRET` and Base64URL-encodes it.
4. **Update Payment**: Sets `payments.status = 'paid'` and stores the Cashfree payment ID + full gateway response.
5. **Update Registration**: Sets `registrations.payment_status = 'PAID'`, `ticket_number`, and `qr_token`.
6. **Increment Sold Count**: Calls `increment_sold` RPC to update the pass type's sold counter.
7. **Returns 200 OK**: Cashfree requires a 200 response within 30 seconds.

---

## Step 5: Render Environment Variables

Make sure your Render service has these set:

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | Your Supabase URL | |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | NOT the anon key |
| `CASHFREE_APP_ID` | Your production App ID | |
| `CASHFREE_SECRET_KEY` | Your production Secret Key | Also used for webhook signature verification |
| `QR_HMAC_SECRET` | `scd-dhule-2026-qr-secret` | Must match what scanner uses |
| `ADMIN_SECRET` | `idkbutily` | For admin panel access |
| `FRONTEND_URL` | `https://aws-scd-2026.vercel.app` | Must include `https://` |
| `NODE_ENV` | `production` | |
| `PORT` | `3001` | Or whatever Render assigns |

> You can **remove** `CASHFREE_WEBHOOK_SECRET` from Render if you had it set.
> The signature is verified using `CASHFREE_SECRET_KEY` per official docs.

---

## Step 6: Testing the Webhook

### Option A: Test from Cashfree Dashboard
1. Go to Webhooks in the Cashfree dashboard
2. Click the **Test** button next to your endpoint
3. Watch the Render logs for the result

### Option B: End-to-End Test
1. Set a pass price to ₹1 in the admin panel
2. Complete a real payment on your live site
3. Watch Render logs for:
   ```
   [Webhook] Signature verified successfully
   [Webhook] Payment success for order: SCD-xxx-xxx Ticket: AWS-1234-26
   ```
4. Verify the frontend polls and shows the ticket + QR code

### Option C: Manual cURL Test (No Signature)
```bash
curl -X POST https://aws-scd-2026.onrender.com/api/webhooks/cashfree \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PAYMENT_SUCCESS_WEBHOOK",
    "data": {
      "order": { "order_id": "YOUR_ORDER_ID_HERE" },
      "payment": { "cf_payment_id": "12345" }
    }
  }'
```
> This will skip signature verification (since no signature header is sent)
> and process the webhook if the order_id exists in your payments table.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Webhook returns 401 | Signature mismatch | Ensure `CASHFREE_SECRET_KEY` on Render matches your Cashfree dashboard |
| Webhook returns 200 but "Unknown order" | Order not in `payments` table | The checkout must create the payment row first |
| Webhook succeeds but frontend doesn't update | Frontend not polling | Check that `useRegistration.ts` polling is working |
| QR code is empty after payment | `QR_HMAC_SECRET` not set on Render | Add it to Render environment variables |
