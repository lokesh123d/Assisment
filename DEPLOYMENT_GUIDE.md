# Deploying QuizMaster Application

This guide will walk you through deploying your MERN stack application. We will deploy the **Backend** to **Render** and the **Frontend** to **Vercel**.

## Prerequisites
1.  **GitHub Account**: Your code must be pushed to a GitHub repository.
2.  **Render Account**: [Sign up here](https://render.com/).
3.  **Vercel Account**: [Sign up here](https://vercel.com/).
4.  **MongoDB Atlas**: Your database should be online (MongoDB Atlas).

---

## Part 1: Backend Deployment (Render)

1.  **Log in to Render** and click **"New +"** -> **"Web Service"**.
2.  **Connect GitHub**: Select your repository.
3.  **Configure Settings**:
    *   **Name**: `quiz-app-backend` (or similar)
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
4.  **Environment Variables**:
    Scroll down to "Environment Variables" and add these keys (from your `backend/.env`):
    *   `MONGO_URI`: `your_mongodb_connection_string`
    *   `JWT_SECRET`: `your_secret_key`
    *   `NODE_ENV`: `production`
    *   `FRONTEND_URL`: *Leave this blank for now, we will come back after deploying the frontend.*
5.  **Click "Create Web Service"**.
6.  **Wait**: Render will build your app. Once done, it will give you a URL like `https://quiz-app-backend.onrender.com`. **Copy this URL.**

---

## Part 2: Frontend Deployment (Vercel)

1.  **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import Git Repository**: Select your repository.
3.  **Configure Project**:
    *   **Root Directory**: Leave as `./` (default).
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Build Command**: `npm run build` (default).
    *   **Output Directory**: `dist` (default).
4.  **Environment Variables**:
    *   Click "Environment Variables".
    *   Key: `VITE_API_URL`
    *   Value: `https://quiz-app-backend.onrender.com/api` (**Paste the Render URL from Part 1 and add `/api` at the end**).
5.  **Click "Deploy"**.
6.  **Wait**: Vercel will build your site. Once done, it will give you a domain like `https://quiz-app-frontend.vercel.app`. **Copy this URL.**

---

## Part 3: Final Configuration

1.  **Go back to Render Dashboard**.
2.  Select your Backend service.
3.  Go to **"Environment"** tab.
4.  Add/Edit the `FRONTEND_URL` variable:
    *   Key: `FRONTEND_URL`
    *   Value: `https://quiz-app-frontend.vercel.app` (The Vercel URL you just got).
5.  **Save Changes**. Render will automatically restart your server.

---

## Part 4: Database Access (Important)

If you are using **MongoDB Atlas**:
1.  Go to your MongoDB Atlas dashboard.
2.  Go to **Network Access** (Security tab).
3.  Ensure your IP Access List includes `0.0.0.0/0` (Allow Access from Anywhere). This is required primarily because Render's IP addresses are dynamic.

---

## Done! 🚀
Your application is now live!
- **Frontend**: visited via the Vercel URL.
- **Backend**: running securely on Render.
