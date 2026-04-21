# Deployment Guide

This project is prepared for a split deployment:
- **Frontend**: Vercel
- **Backend**: Render

## 1. Backend Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your repository.
3. Render should automatically detect the `render.yaml` file. If not, use these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `FRONTEND_URL`: Your Vercel deployment URL (e.g., `https://your-portfolio.vercel.app`). You can update this after deploying the frontend.
5. Note your backend URL (e.g., `https://retro-portfolio-backend.onrender.com`).

## 2. Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com/).
2. Connect your repository.
3. In the **Project Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Update `frontend/vercel.json`:
   - Replace `https://retro-portfolio-backend.onrender.com` with your actual Render backend URL.
5. Deploy!

## 3. Post-Deployment

- After Vercel gives you a production URL, go back to Render and update the `FRONTEND_URL` environment variable to match your Vercel URL. This ensures CORS works correctly.
- If you use the search feature, ensure `GEMINI_API_KEY` is set on Render.
