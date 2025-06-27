# Vercel Deployment Guide

This guide will help you deploy your Node.js/TypeScript backend to Vercel.

## Prerequisites

1. A Vercel account
2. Your project connected to a Git repository (GitHub, GitLab, or Bitbucket)
3. All environment variables configured

## Environment Variables Setup

Before deploying, you need to configure the following environment variables in your Vercel project:

### Required Environment Variables

1. **JWT Configuration**
   - `JWT_SECRET` - Your JWT secret key
   - `JWT_REFRESH_SECRET` - Your JWT refresh secret key
   - `JWT_EXPIRES_IN` - JWT expiration time (e.g., "1h")
   - `JWT_REFRESH_EXPIRES_IN` - JWT refresh expiration time (e.g., "7d")

2. **Supabase Configuration**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase API key

3. **Midtrans Configuration**
   - `MIDTRANS_CLIENT_KEY` - Your Midtrans client key
   - `MIDTRANS_SERVER_KEY` - Your Midtrans server key
   - `MIDTRANS_MERCHANT_ID` - Your Midtrans merchant ID
   - `MIDTRANS_WEBHOOK_URL` - Your webhook URL (will be your Vercel domain + `/api/midtrans/webhook`)

4. **Shopify Configuration**
   - `SHOPIFY_SHOP_NAME` - Your Shopify shop name
   - `SHOPIFY_API_KEY` - Your Shopify API key
   - `SHOPIFY_API_SECRET` - Your Shopify API secret
   - `SHOPIFY_API_VERSION` - Shopify API version (e.g., "2023-10")
   - `SHOPIFY_WEBHOOK_SECRET` - Your Shopify webhook secret

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing this backend

### 2. Configure Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add each environment variable listed above
3. Make sure to set them for "Production", "Preview", and "Development" environments

### 3. Deploy

1. Vercel will automatically detect the `vercel.json` configuration
2. Click "Deploy" to start the deployment process
3. Vercel will build and deploy your application

### 4. Update Webhook URLs

After deployment, update your webhook URLs in external services:

- **Midtrans**: Update `MIDTRANS_WEBHOOK_URL` to your Vercel domain + `/api/midtrans/webhook`
- **Shopify**: Update webhook URLs to your Vercel domain + the appropriate endpoints

## API Endpoints

Your API will be available at:
- Base URL: `https://your-project-name.vercel.app`
- API Documentation: `https://your-project-name.vercel.app/api-docs`
- Health Check: `https://your-project-name.vercel.app/health`

## Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Make sure all required environment variables are set in Vercel
   - Check that variable names match exactly (case-sensitive)

2. **Database Connection Issues**
   - Verify your Supabase credentials are correct
   - Ensure your Supabase project is accessible from Vercel's servers

3. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are properly installed

### Local Testing

To test locally before deploying:

1. Copy your environment variables to a `.env` file
2. Run `npm run dev` to start the development server
3. Test all endpoints to ensure they work correctly

## File Structure

The deployment uses the following structure:
- `api/index.ts` - Serverless function entry point
- `vercel.json` - Vercel configuration
- `src/` - Your source code
- `.vercelignore` - Files to exclude from deployment

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test endpoints locally first
4. Check the Vercel documentation for serverless function best practices 