# Jupiter Payment Gateway Backend

A payment gateway service built on Solana blockchain using Jupiter aggregator for token swaps and settlements.

## Features

- Merchant registration and API key management
- Payment processing with automatic USDC settlement
- Token swap integration via Jupiter
- Webhook notifications for payment status updates
- Secure authentication middleware
- Health monitoring endpoints

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Solana wallet
- Access to Solana RPC endpoint

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/payment-gateway
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JWT_SECRET=your-secret-key
```

## Development

Start the development server:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

Run production server:
```bash
npm start
```

## API Endpoints

### Merchants
- `POST /api/merchants/register` - Register new merchant
- `GET /api/merchants/profile/:merchantId` - Get merchant profile
- `PUT /api/merchants/settings/:merchantId` - Update merchant settings
- `POST /api/merchants/apikey/:merchantId/regenerate` - Regenerate API key

### Payments
- `POST /api/payments/create` - Create new payment
- `POST /api/payments/process` - Process payment

### System
- `GET /health` - Check system health

## Authentication

API requests must include one of the following:
- Bearer token in Authorization header
- API key in X-API-Key header

## Error Handling

The API returns standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 