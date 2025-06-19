# Enhanced Paymob Service

A comprehensive, modular TypeScript service for integrating with Paymob's payment gateway. This enhanced version provides improved readability, maintainability, and robust error handling while preserving all original functionality.

## 🚀 Features

- **Modular Architecture**: Separated concerns with dedicated classes for different functionalities
- **Comprehensive Validation**: Input validation for all payment data and configurations
- **Structured Logging**: Detailed logging with configurable levels for debugging and monitoring
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Custom error classes and comprehensive error management
- **Configuration Management**: Centralized configuration with environment variable validation
- **Webhook Security**: Robust HMAC verification for webhook authenticity
- **Flash Integration**: Support for Paymob's Flash checkout experience

## 📁 Project Structure

```
portfolio-post/src/
├── services/
│   └── paymob.service.ts          # Main service with modular classes
├── types/
│   └── paymob.types.ts            # Type definitions and interfaces
├── utils/
│   ├── paymob-validators.ts       # Input validation utilities
│   └── paymob-logger.ts           # Structured logging system
├── constants/
│   └── paymob.constants.ts        # Constants and configuration values
└── README-paymob.md               # This documentation
```

## 🛠 Installation & Setup

### Environment Variables

Create a `.env` file with the following required variables:

```bash
# Required Paymob Configuration
PAYMOB_API_KEY=your_api_key_here
PAYMOB_SECRET_KEY=your_secret_key_here
PAYMOB_PUBLIC_KEY=your_public_key_here
PAYMOB_INTEGRATION_ID=your_integration_id_here
PAYMOB_HMAC_SECRET=your_hmac_secret_here

# Optional Configuration
PAYMOB_BASE_URL=https://accept.paymob.com
PAYMOB_LOG_LEVEL=info
PAYMOB_TIMEOUT_MS=30000
PAYMOB_RETRY_ATTEMPTS=3
```

### Basic Usage

```typescript
import { PaymobService } from './services/paymob.service';
import { PaymobBillingData, PaymobOrderItem } from './types/paymob.types';

// Initialize the service
const paymobService = new PaymobService();

// Create a payment
const billingData: PaymobBillingData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_number: '+201234567890',
  apartment: '123',
  floor: '1',
  street: '123 Main St',
  building: '123',
  state: 'Cairo',
  country: 'EGY',
};

const items: PaymobOrderItem[] = [
  {
    name: 'Product Name',
    description: 'Product Description',
    amount: 100,
    quantity: 1,
  },
];

try {
  const result = await paymobService.createPaymentIntention(
    100, // amount in EGP
    billingData,
    items,
    'EGP',
  );

  console.log('Payment URL:', result.paymentUrl);
  console.log('Client Secret:', result.clientSecret);
} catch (error) {
  console.error('Payment creation failed:', error.message);
}
```

## 📚 API Reference

### Main Service Methods

#### `createPaymentIntention(amount, billingData, items, currency?, extras?)`

Creates a payment intention with Paymob Flash Integration.

**Parameters:**

- `amount` (number): Payment amount
- `billingData` (PaymobBillingData): Customer billing information
- `items` (PaymobOrderItem[]): Array of order items
- `currency` (string, optional): Payment currency (default: 'EGP')
- `extras` (Record<string, any>, optional): Additional metadata

**Returns:** `Promise<PaymentIntentionResult>`

```typescript
const result = await paymobService.createPaymentIntention(100, billingData, items);
```

#### `createPaymentUrlWithUserData(amount, userId, contractId, userData, serviceType)`

Creates a payment URL for contract-based payments.

**Parameters:**

- `amount` (number): Payment amount
- `userId` (string): User identifier
- `contractId` (string): Contract identifier
- `userData` (UserPaymentData): User payment data
- `serviceType` (string): Type of service

**Returns:** `Promise<{paymentUrl: string}>`

```typescript
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+201234567890',
};

const result = await paymobService.createPaymentUrlWithUserData(
  100,
  'user123',
  'contract456',
  userData,
  'portfolio_service',
);
```

#### `handleWebhook(webhookData)`

Processes Paymob webhook data (JSON format).

**Parameters:**

- `webhookData` (PaymobWebhookData): Webhook payload from Paymob

**Returns:** `Promise<WebhookResult<TransactionData>>`

```typescript
const result = await paymobService.handleWebhook(webhookData);
if (result.isValid) {
  console.log('Transaction data:', result.transactionData);
}
```

#### `handleWebhookQuery(queryParams)`

Processes Paymob webhook query parameters (GET format).

**Parameters:**

- `queryParams` (Record<string, string>): Query parameters from webhook URL

**Returns:** `WebhookResult<WebhookQueryTransactionData>`

```typescript
const result = paymobService.handleWebhookQuery(req.query);
if (result.isValid) {
  console.log('Transaction data:', result.transactionData);
}
```

#### `getTransactionStatus(transactionId)`

Retrieves transaction status by ID.

**Parameters:**

- `transactionId` (number): Transaction ID to check

**Returns:** `Promise<TransactionStatusResult>`

```typescript
const status = await paymobService.getTransactionStatus(123456);
console.log('Transaction status:', status.status);
```

#### `getOrderDetails(orderId)`

Retrieves detailed order information.

**Parameters:**

- `orderId` (number): Order ID to fetch

**Returns:** `Promise<OrderDetailsResult>`

```typescript
const orderDetails = await paymobService.getOrderDetails(789);
console.log('Order details:', orderDetails);
```

### Validation Utilities

The service includes comprehensive validation utilities:

```typescript
import {
  validateAmount,
  validateBillingData,
  validatePaymentRequest,
} from './utils/paymob-validators';

// Validate payment amount
const amountValidation = validateAmount(100);
if (!amountValidation.isValid) {
  console.error('Amount validation errors:', amountValidation.errors);
}

// Validate billing data
const billingValidation = validateBillingData(billingData);
if (!billingValidation.isValid) {
  console.error('Billing validation errors:', billingValidation.errors);
}

// Comprehensive payment validation
const paymentValidation = validatePaymentRequest(100, billingData, items);
if (!paymentValidation.isValid) {
  console.error('Payment validation errors:', paymentValidation.errors);
}
```

### Logging System

The enhanced service includes structured logging:

```typescript
import { logger } from './utils/paymob-logger';

// Configure log level via environment variable
// PAYMOB_LOG_LEVEL=debug|info|warn|error

// The service automatically logs:
// - Payment requests and responses
// - Webhook events and verification
// - Authentication attempts
// - API requests and responses
// - Validation errors
// - Configuration loading
```

## 🔒 Security Features

### Webhook Verification

All webhooks are automatically verified using HMAC signatures:

```typescript
// Webhook verification is handled automatically
const result = await paymobService.handleWebhook(webhookData);
if (result.isValid) {
  // Webhook is authentic and verified
  processPayment(result.transactionData);
} else {
  // Webhook verification failed - potential security issue
  logger.warn('Invalid webhook received');
}
```

### Environment Variable Validation

The service validates all required environment variables on startup:

```typescript
// Automatic validation ensures all required variables are present
// Missing variables will throw detailed error messages
```

### Data Sanitization

All sensitive data is automatically sanitized in logs:

```typescript
// API keys and secrets are masked in log outputs
// Personal data is limited to necessary fields only
```

## 🧪 Error Handling

The service provides custom error classes for different scenarios:

```typescript
import {
  PaymobError,
  PaymobWebhookError,
  PaymobAuthError,
  PaymobPaymentError,
} from './types/paymob.types';

try {
  await paymobService.createPaymentIntention(amount, billingData, items);
} catch (error) {
  if (error instanceof PaymobPaymentError) {
    console.error('Payment error:', error.message, error.details);
  } else if (error instanceof PaymobAuthError) {
    console.error('Authentication error:', error.message);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## 🔧 Configuration

### Payment Configuration

```typescript
// Default configuration can be found in constants/paymob.constants.ts
export const PAYMENT_DEFAULTS = {
  CURRENCY: 'EGP',
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
} as const;
```

### Supported Currencies

```typescript
export const SUPPORTED_CURRENCIES = ['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED'] as const;
```

## 📊 Monitoring & Debugging

### Log Levels

- **ERROR**: Critical errors and failures
- **WARN**: Warnings and validation failures
- **INFO**: General information and success messages
- **DEBUG**: Detailed debugging information

### Log Examples

```bash
[2024-01-01T12:00:00.000Z] [INFO] [PaymentProcessor] Payment request initiated | Data: {"amount":100,"currency":"EGP","userId":"user123"}

[2024-01-01T12:00:01.000Z] [DEBUG] [ApiClient] API request | Data: {"method":"POST","url":"/v1/intention/","hasData":true}

[2024-01-01T12:00:02.000Z] [INFO] [PaymentProcessor] Payment completed successfully | Data: {"transactionId":123456,"amount":100,"currency":"EGP"}
```

## 🚀 Best Practices

1. **Always validate input data** before processing payments
2. **Use environment variables** for all sensitive configuration
3. **Enable appropriate logging level** for your environment
4. **Verify webhook signatures** before processing webhook data
5. **Handle errors gracefully** with proper user feedback
6. **Monitor transaction statuses** for payment reconciliation
7. **Use HTTPS** for all webhook endpoints
8. **Implement retry logic** for failed API requests

## 🤝 Contributing

This enhanced service maintains backward compatibility while adding new features. When contributing:

1. Follow the existing modular architecture
2. Add comprehensive tests for new features
3. Update type definitions for new interfaces
4. Document new functionality in this README
5. Ensure all validation utilities cover new use cases

## 📄 License

This service is part of the duvdu_backend project and follows the project's licensing terms.

---

**Note**: This enhanced version preserves all original functionality while significantly improving code organization, maintainability, and debugging capabilities. All existing API calls will continue to work without modification.
