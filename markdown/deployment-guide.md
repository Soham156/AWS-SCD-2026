# Deployment Guide: Vercel & Render

I have configured the codebase to be production-ready. I added a `vercel.json` file for the frontend to handle React routing, and updated the `server/package.json` and `server/tsconfig.json` so Render can properly build your Node.js API.

Here are the step-by-step instructions to get your app live.

---

## Part 1: Deploy Backend to Render

You must deploy your backend first so you have a live API URL to give to your frontend.

### 1. Create a Web Service
1. Push your entire project to a GitHub repository.
2. Go to [Render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.

### 2. Configure the Service
During setup, use the following settings:
- **Name:** `aws-scd-2026-api` (or whatever you prefer)
- **Environment:** `Node`
- **Root Directory:** `server` *(CRITICAL: You must specify `server` as the root directory because this is a monorepo).*
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** Free tier is fine to start with.

### 3. Add Environment Variables
Click on "Advanced" to add your Environment Variables. Copy everything from your `server/.env` file:
```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
ADMIN_KEY=your_admin_dashboard_password
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret_key
CASHFREE_WEBHOOK_SECRET=your_production_webhook_secret
FRONTEND_URL=your_vercel_url (Update this later once Vercel is deployed)
```

### 4. Deploy
Click **Create Web Service**. Once it finishes deploying, Render will give you a URL (e.g., `https://aws-scd-2026-api.onrender.com`). Copy this URL.

---

## Part 2: Deploy Frontend to Vercel

### 1. Import Project
1. Go to [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import the same GitHub repository.

### 2. Configure the Build
Vercel should automatically detect that this is a **Vite** project.
Leave the Root Directory as `/` (default).

### 3. Add Environment Variables
Add the variables from your frontend `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://aws-scd-2026-api.onrender.com  <-- VERY IMPORTANT (Use the Render URL you copied earlier)
```

### 4. Deploy
Click **Deploy**. Vercel will build the frontend and give you a live URL (e.g., `https://aws-scd-2026.vercel.app`).

---

## Part 3: Final Link-Ups

Because the two services need to talk to each other, you must update two places after both are deployed:

1. **Update Render:** Go back to Render -> Environment. Change `FRONTEND_URL` to your new Vercel URL (e.g., `https://aws-scd-2026.vercel.app`). This ensures Cashfree knows where to send users after payment.
2. **Update Cashfree Webhook:** Go to the Cashfree Dashboard -> Developers -> Webhooks. Change the webhook URL to point to your Render backend:
   `https://aws-scd-2026-api.onrender.com/api/webhooks/cashfree`
3. **CORS (Optional but Recommended):** Once you are 100% sure of your Vercel URL, go to `server/src/app.ts` and change `app.use(cors())` to `app.use(cors({ origin: 'https://your-vercel-app.vercel.app' }))` and push to GitHub to lock down your API.
