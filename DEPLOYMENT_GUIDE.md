# 🚀 Deployment Guide: Smart Cafeteria System

This guide outlines the steps to deploy all components of the NutriSense Smart Cafeteria System.

## 🏗️ Architecture Overview
- **Landing Page**: React + Vite (Static Site)
- **Admin Dashboard**: React + Vite (Static Site)
- **Mobile App**: React + Vite (PWA / Static Site)
- **Backend Service**: Node.js + Express (REST API)
- **ML Service**: Python + Flask (AI Recommendations)
- **Database**: Supabase (PostgreSQL + Realtime)

---

## 1. 🗄️ Database & Auth (Supabase)
1.  **Create Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Schema Setup**:
    - Run the SQL scripts found in `Backend/supabase_schema.sql` and `Mobile_app/SUPABASE_SETUP.sql` in the Supabase SQL Editor.
3.  **Seed Data**:
    - Run `node Backend/seed_supabase_food.js` locally (after setting `.env` with your Supabase URL/Key) to populate the menu.
4.  **Auth**:
    - Enable Email/Password or Google OAuth in the Supabase Auth settings.
    - Set `Authorized Redirect URIs` to your deployed frontend/mobile URLs.

---

## 2. 🧠 ML Service (Python/Flask)
*Recommended: [Render](https://render.com/) or [Google Cloud Run]*

1.  **Environment**: Ensure `requirements.txt` is updated.
2.  **Deployment**:
    - Link your GitHub repo to Render.
    - Create a **Web Service**.
    - Build Command: `pip install -r requirements.txt`
    - Start Command: `python app.py` (or `gunicorn app:app`)
3.  **URL**: Note the generated URL (e.g., `https://nutrisense-ml.onrender.com`).

---

## 3. ⚙️ Backend Service (Node.js)
*Recommended: [Render](https://render.com/) or [Railway]*

1.  **Environment**: Create a `.env` file in the production environment with:
    - `SUPABASE_URL`
    - `SUPABASE_KEY`
    - `STRIPE_SECRET_KEY`
    - `PORT=5000`
2.  **Deployment**:
    - Create a **Web Service**.
    - Build Command: `npm install`
    - Start Command: `node server.js`
3.  **URL**: Note the generated URL (e.g., `https://nutrisense-api.onrender.com`).

---

## 4. 🌐 Frontends (Landing & Admin)
*Recommended: [Vercel](https://vercel.com/)*

### Landing Page (`/Landing_page`)
1.  Add project to Vercel.
2.  **Root Directory**: `Landing_page`
3.  **Framework Preset**: Vite
4.  **Environment Variables**:
    - `VITE_DASHBOARD_URL`: URL of your Admin Dashboard.
    - `VITE_MOBILE_URL`: URL of your Mobile App.

### Admin Dashboard (`/Frontend`)
1.  Add project to Vercel.
2.  **Root Directory**: `Frontend`
3.  **Environment Variables**:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_API_URL`: Your deployed Backend URL.

---

## 📱 5. Mobile App Student Portal
*Recommended: [Netlify](https://www.netlify.com/) or [Vercel]*

1.  **PWA Setup**: The project is already configured with Vite.
2.  **Deployment**:
    - Root Directory: `Mobile_app`
    - Build Command: `npm run build`
    - Output Directory: `dist`
3.  **Environment Variables**:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_STRIPE_PUBLISHABLE_KEY`
    - `VITE_ML_API_URL`: Your deployed ML Service URL.

---

## 💳 6. Stripe Integration
1.  **Dashboard**: Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
2.  **Keys**: Copy `Publishable key` to Mobile App env and `Secret key` to Backend env.
3.  **Webhooks**: (Optional) If using webhooks for order confirmation, set the endpoint to `https://your-backend-url.com/webhook`.

---

## ✅ Final Integration Check
1.  Update the **Landing Page** links to point to the production URLs instead of `localhost`.
2.  Ensure CORS is enabled on the Backend and ML Service for your frontend domains.
3.  Update Supabase `Authorized Redirect URIs` for OAuth login.

---
*Good luck with the deployment! 🚀*
