# BEBR API

A TypeScript backend API with authentication, Midtrans payment integration, and Shopify integration.

## Features

- 🔐 Authentication with JWT (signup, login, refresh token)
- 💸 Midtrans payment integration
- 🛒 Shopify integration
- 🔒 Security features (password hashing, JWT, webhook verification)

## Tech Stack

- TypeScript
- Express.js
- Supabase (PostgreSQL)
- Midtrans Client
- Shopify API

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Supabase account
- Midtrans account
- Shopify Partner account

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bebr
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key

   # Midtrans Configuration
   MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   MIDTRANS_MERCHANT_ID=your_midtrans_merchant_id
   MIDTRANS_WEBHOOK_URL=http://localhost:3000/api/midtrans/webhook

   # Shopify Configuration
   SHOPIFY_SHOP_NAME=your_shopify_shop_name
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_API_SECRET=your_shopify_api_secret
   SHOPIFY_API_VERSION=2023-10
   SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
   ```

4. Set up your Supabase database with the following tables:
   - users
   - transactions

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  midtransOrderId TEXT UNIQUE NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Development

Run the development server:
```
npm run dev
```

## Building for Production

Build the project:
```
npm run build
```

Start the production server:
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login and get access token
- `POST /api/auth/refresh-token`: Refresh access token

### Midtrans
- `POST /api/midtrans/create-transaction`: Create a new payment transaction
- `POST /api/midtrans/webhook`: Webhook for Midtrans payment notifications

### Shopify
- `POST /api/shopify/create-checkout`: Create a checkout with Shopify
- `POST /api/shopify/webhook`: Webhook for Shopify order notifications

## Testing Shopify Webhook Locally with ngrok

To test Shopify webhooks on your local development environment, follow these steps:

1. **Start your local server**
   ```sh
   npm run dev
   ```
   Ensure your server is running (e.g., on http://localhost:3000 or your chosen port).

2. **Install ngrok (if not already installed)**
   ```sh
   npm install -g ngrok
   ```
   Or download from [ngrok.com](https://ngrok.com/download).

3. **Expose your local server with ngrok**
   ```sh
   ngrok http 3000
   ```
   Replace `3000` with your local port if different. ngrok will provide a public URL like `https://xxxxxx.ngrok.io`.

4. **Register the webhook in Shopify Admin**
   - Go to **Shopify Admin → Settings → Notifications → Webhooks**.
   - Click **Add webhook**.
   - Choose the event you want to test (e.g., Order creation).
   - Set the URL to: `https://xxxxxx.ngrok.io/api/shopify/webhook`
   - Save the webhook.

5. **Send a test notification**
   - In Shopify Admin, click the webhook you just created.
   - Click **Send test notification**.

6. **Check your local server logs/response**
   - The payload from Shopify will be printed in your terminal and returned in the API response (in non-production mode).

**Note:**
- Make sure your local server is accessible and not blocked by firewall.
- The `/api/shopify/webhook` endpoint is ready to receive and log payloads for development/testing.

## License

MIT 