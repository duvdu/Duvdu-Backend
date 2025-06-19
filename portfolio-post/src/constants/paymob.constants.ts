// ===========================
// PAYMOB CONSTANTS
// ===========================

/**
 * Default Paymob API endpoints and URLs
 */
export const PAYMOB_ENDPOINTS = {
  BASE_URL: 'https://accept.paymob.com',
  INTENTION: '/v1/intention/',
  AUTH_TOKENS: '/api/auth/tokens',
  TRANSACTIONS: '/api/acceptance/transactions',
  ORDERS: '/api/ecommerce/orders',
  UNIFIED_CHECKOUT: '/unifiedcheckout',
} as const;

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = ['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED'] as const;

/**
 * Default payment configuration
 */
export const PAYMENT_DEFAULTS = {
  CURRENCY: 'EGP',
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * Webhook verification field order as per Paymob documentation
 */
export const WEBHOOK_FIELD_ORDER = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
] as const;

/**
 * Required environment variables for Paymob configuration
 */
export const REQUIRED_ENV_VARS = [
  'PAYMOB_API_KEY',
  'PAYMOB_SECRET_KEY',
  'PAYMOB_PUBLIC_KEY',
  'PAYMOB_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET',
] as const;

/**
 * Optional environment variables with defaults
 */
export const OPTIONAL_ENV_VARS = {
  PAYMOB_BASE_URL: PAYMOB_ENDPOINTS.BASE_URL,
  PAYMOB_LOG_LEVEL: 'info',
  PAYMOB_TIMEOUT_MS: PAYMENT_DEFAULTS.TIMEOUT_MS.toString(),
  PAYMOB_RETRY_ATTEMPTS: PAYMENT_DEFAULTS.RETRY_ATTEMPTS.toString(),
} as const;

/**
 * HTTP status codes for API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Transaction statuses
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  VOIDED: 'voided',
} as const;

/**
 * Payment method types
 */
export const PAYMENT_METHODS = {
  CARD: 'card',
  WALLET: 'wallet',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cod',
} as const;

/**
 * Validation regex patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  CURRENCY_CODE: /^[A-Z]{3}$/,
  MERCHANT_ORDER_ID: /^[a-zA-Z0-9_-]+$/,
} as const;

/**
 * Default billing data for Egypt
 */
export const DEFAULT_BILLING_DATA = {
  apartment: '123',
  floor: '1',
  street: '123 Main St',
  building: '123',
  city: 'Cairo',
  state: 'Cairo',
  country: 'EGY',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Amount must be a positive number',
  INVALID_CURRENCY: 'Invalid currency code',
  MISSING_BILLING_DATA: 'Billing data is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  WEBHOOK_VERIFICATION_FAILED: 'Webhook verification failed',
  PAYMENT_CREATION_FAILED: 'Failed to create payment',
  AUTH_FAILED: 'Authentication failed',
  ORDER_NOT_FOUND: 'Order not found',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timeout',
  UNKNOWN_ERROR: 'Unknown error occurred',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PAYMENT_CREATED: 'Payment created successfully',
  WEBHOOK_VERIFIED: 'Webhook verified successfully',
  AUTH_SUCCESS: 'Authentication successful',
  ORDER_RETRIEVED: 'Order details retrieved successfully',
  TRANSACTION_STATUS_RETRIEVED: 'Transaction status retrieved successfully',
} as const;

/**
 * API request headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'Paymob-Node-SDK/1.0.0',
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
  BURST_LIMIT: 10,
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  AUTH_TOKEN_TTL_SECONDS: 3600, // 1 hour
  ORDER_DETAILS_TTL_SECONDS: 300, // 5 minutes
  TRANSACTION_STATUS_TTL_SECONDS: 60, // 1 minute
} as const;
