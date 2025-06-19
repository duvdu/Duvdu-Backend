// ===========================
// PAYMOB TYPE DEFINITIONS
// ===========================

export interface PaymobMerchant {
  id: number;
  created_at: string;
  phones: string[];
  company_emails: string[];
  company_name: string;
  state: string;
  country: string;
  city: string;
  postal_code: string;
  street: string;
}

export interface PaymobOrderDetailsResponse {
  id: number;
  amount_cents: number;
  currency: string;
  items: PaymobOrderItem[];
  created_at: string;
  merchant_order_id: string;
}

export interface PaymobOrder {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: PaymobMerchant;
  collector: null;
  amount_cents: number;
  shipping_data: null;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_order_id: string;
  wallet_notification: null;
  paid_amount_cents: number;
  notify_user_with_email: boolean;
  items: PaymobOrderItem[];
  order_url: string;
  commission_fee: number;
  delivery_fee_cents: number;
  delivery_voucher_cost: number;
  discount: number;
  metadata: Record<string, any>;
}

export interface PaymobOrderItem {
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface PaymobSourceData {
  type: string;
  pan: string;
  sub_type: string;
}

export interface PaymobWebhookData {
  obj: {
    id: number;
    amount_cents: number;
    success: boolean;
    is_refunded: boolean;
    is_captured: boolean;
    is_voided: boolean;
    is_standalone_payment: boolean;
    is_void: boolean;
    is_refund: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: PaymobOrder;
    created_at: string;
    transaction_processed_callback_responses: null;
    currency: string;
    source_data: PaymobSourceData;
    api_source: string;
    terminal_id: string;
    merchant_commission: number;
    merchant_staff_tag: null;
    hmac: string;
  };
}

export interface PaymobIntentionResponse {
  id: string;
  amount: number;
  currency: string;
  payment_methods: any[];
  items: PaymobOrderItem[];
  billing_data: PaymobBillingData;
  customer: PaymobCustomer;
  extras: Record<string, any>;
  client_secret: string;
  status: string;
  created_at: string;
}

export interface PaymobTransactionStatusResponse {
  success: boolean;
  status: string;
  amount_cents: number;
  currency: string;
}

export interface PaymobIntentionRequest {
  amount: number;
  currency: string;
  payment_methods: (string | number)[];
  items: PaymobOrderItem[];
  billing_data: PaymobBillingData;
  customer?: PaymobCustomer;
  extras?: Record<string, any>;
  merchant_order_id?: string;
}

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city?: string;
  state: string;
  country: string;
}

export interface PaymobCustomer {
  first_name: string;
  last_name: string;
  email: string;
  extras?: Record<string, any>;
}

export interface PaymobAuthResponse {
  token: string;
}

// ===========================
// SERVICE RESPONSE TYPES
// ===========================

export interface TransactionData {
  orderId: number;
  amount: number;
  success: boolean;
  currency: string;
  transactionId: number;
  createdAt: string;
  isRefunded: boolean;
  isCaptured: boolean;
  isVoided: boolean;
  metadata: Record<string, any>;
}

export interface WebhookQueryTransactionData extends TransactionData {
  isAuth: boolean;
  isStandalone: boolean;
  is3dSecure: boolean;
  sourceData: {
    type: string;
    pan: string;
    subType: string;
  };
  responseCode: string;
  message: string;
}

export interface WebhookQueryWithItemsTransactionData extends WebhookQueryTransactionData {
  items: PaymobOrderItem[];
}

export interface WebhookResult<T> {
  isValid: boolean;
  transactionData: T | null;
}

export interface TransactionStatusResult {
  success: boolean;
  status: string;
  amount: number;
  currency: string;
}

export interface OrderDetailsResult {
  id: number;
  amount_cents: number;
  currency: string;
  items: PaymobOrderItem[];
  created_at: string;
  merchant_order_id: string;
}

export interface PaymentIntentionResult {
  paymentUrl: string;
  clientSecret: string;
}

export interface UserPaymentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// ===========================
// CONFIGURATION TYPES
// ===========================

export interface PaymobConfigOptions {
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  integrationId?: number;
  baseUrl?: string;
  hmacSecret?: string;
}

// ===========================
// ERROR TYPES
// ===========================

export class PaymobError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'PaymobError';
  }
}

export class PaymobWebhookError extends PaymobError {
  constructor(message: string, details?: any) {
    super(message, 'WEBHOOK_ERROR', details);
    this.name = 'PaymobWebhookError';
  }
}

export class PaymobAuthError extends PaymobError {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'PaymobAuthError';
  }
}

export class PaymobPaymentError extends PaymobError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_ERROR', details);
    this.name = 'PaymobPaymentError';
  }
}

// ===========================
// VALIDATION TYPES
// ===========================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PaymentValidationRules {
  minAmount?: number;
  maxAmount?: number;
  allowedCurrencies?: string[];
  requiredBillingFields?: string[];
}
