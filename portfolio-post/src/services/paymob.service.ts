import * as crypto from 'crypto';

import axios, { AxiosError, AxiosResponse } from 'axios';

// PayMob API Types
interface PaymobMerchant {
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

interface PaymobOrderDetailsResponse {
  id: number;
  amount_cents: number;
  currency: string;
  items: PaymobOrderItem[];
  created_at: string;
  merchant_order_id: string;
}

interface PaymobOrder {
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

interface PaymobOrderItem {
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

interface PaymobSourceData {
  type: string;
  pan: string;
  sub_type: string;
}

interface PaymobWebhookData {
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

interface PaymobIntentionResponse {
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

interface PaymobTransactionStatusResponse {
  success: boolean;
  status: string;
  amount_cents: number;
  currency: string;
}



// Request Types
interface PaymobIntentionRequest {
  amount: number;
  currency: string;
  payment_methods: (string | number)[];
  items: PaymobOrderItem[];
  billing_data: PaymobBillingData;
  customer?: PaymobCustomer;
  extras?: Record<string, any>;
}

interface PaymobBillingData {
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

interface PaymobCustomer {
  first_name: string;
  last_name: string;
  email: string;
  extras?: Record<string, any>;
}

// Response Types
interface TransactionData {
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

interface WebhookQueryTransactionData extends TransactionData {
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

interface WebhookQueryWithItemsTransactionData extends WebhookQueryTransactionData {
  items: PaymobOrderItem[];
}

interface WebhookResult<T> {
  isValid: boolean;
  transactionData: T | null;
}

interface TransactionStatusResult {
  success: boolean;
  status: string;
  amount: number;
  currency: string;
}

interface OrderDetailsResult {
  id: number;
  amount_cents: number;
  currency: string;
  items: PaymobOrderItem[];
  created_at: string;
  merchant_order_id: string;
}

interface PaymobAuthResponse {
  token: string;
}

/**
 * Paymob Service Configuration for Flash Integration
 *
 * Required Keys:
 * - secretKey: Your Paymob Secret Key (for API authentication)
 * - publicKey: Your Paymob Public Key (for client-side)
 * - integrationId: Your Paymob Integration ID
 * - hmacSecret: Your Paymob HMAC Secret (for webhook verification)
 */
export class PaymobService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly integrationId: number;
  private readonly baseUrl: string;
  private readonly hmacSecret: string;

  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY!;
    this.secretKey = process.env.PAYMOB_SECRET_KEY!;
    this.publicKey = process.env.PAYMOB_PUBLIC_KEY!;
    this.integrationId = parseInt(process.env.PAYMOB_INTEGRATION_ID!);
    this.baseUrl = process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com';
    this.hmacSecret = process.env.PAYMOB_HMAC_SECRET!;

    console.log('PayMob configuration:', {
      integrationId: this.integrationId,
      publicKey: this.publicKey,
      baseUrl: this.baseUrl,
    });
  }


  async createPaymentIntention(
    amount: number,
    billingData: PaymobBillingData,
    items: PaymobOrderItem[],
    currency: string = 'EGP',
    extras?: Record<string, any>,
  ): Promise<{ paymentUrl: string; clientSecret: string }> {
    try {
      const intentionData: PaymobIntentionRequest = {
        amount,
        currency,
        payment_methods: [this.integrationId, 'card'],
        items,
        billing_data: billingData,
        customer: {
          first_name: billingData.first_name,
          last_name: billingData.last_name,
          email: billingData.email,
          extras: extras || {},
        },
        extras: extras || {},
      };

      const response: AxiosResponse<PaymobIntentionResponse> = await axios.post(
        `${this.baseUrl}/v1/intention/`,
        intentionData,
        {
          headers: {
            'Authorization': `Token ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Create the payment URL for Flash Checkout
      const paymentUrl = `${this.baseUrl}/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${response.data.client_secret}`;
      
      return {
        paymentUrl,
        clientSecret: response.data.client_secret,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log('PayMob intention error:', axiosError.response?.data);
      throw new Error(`Failed to create Paymob payment intention: ${axiosError.message}`);
    }
  }


  async createPaymentUrlWithUserData(
    amount: number,
    userId: string,
    contractId: string,
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
    serviceType: string,
  ): Promise<{ paymentUrl: string }> {
    // Create metadata with custom data
    const customData = {
      contractId,
      userId,
      service_type: serviceType,
      booking_id: 'BOOK_' + Date.now(),
      timestamp: new Date().toISOString(),
    };

    const extras = customData;

    const billingData: PaymobBillingData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone_number: userData.phone,
      apartment: contractId, // Store contractId in apartment field
      floor: userId, // Store userId in floor field  
      street: serviceType, // Store serviceType in street field
      building: JSON.stringify(customData), // Store full custom data in building field
      state: 'Cairo',
      country: 'EGY',
    };

    const items: PaymobOrderItem[] = [
      {
        name: `${serviceType} Payment`,
        description: `CUSTOM_DATA:${JSON.stringify(customData)}:END_CUSTOM_DATA Payment for contract ${contractId}`,
        amount,
        quantity: 1,
      },
    ];

    // Store custom data in extras field and also try merchant_order_id
    const intentionData = {
      amount,
      currency: 'EGP',
      payment_methods: [this.integrationId, 'card'],
      items,
      billing_data: billingData,
      customer: {
        first_name: billingData.first_name,
        last_name: billingData.last_name,
        email: billingData.email,
        extras: extras || {},
      },
      extras: extras || {},
      merchant_order_id: JSON.stringify(customData), // Try this field too
    };

    try {
      console.log('=======================');
      console.log('Creating payment intention with data:', JSON.stringify(intentionData, null, 2));
      console.log('merchant_order_id being sent:', intentionData.merchant_order_id);
      console.log('=======================');

      const response: AxiosResponse<PaymobIntentionResponse> = await axios.post(
        `${this.baseUrl}/v1/intention/`,
        intentionData,
        {
          headers: {
            'Authorization': `Token ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('=======================');
      console.log('Payment intention response:', JSON.stringify(response.data, null, 2));
      console.log('=======================');

      // Create the payment URL for Flash Checkout
      const paymentUrl = `${this.baseUrl}/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${response.data.client_secret}`;
      
      return { paymentUrl };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log('PayMob intention error:', axiosError.response?.data);
      throw new Error(`Failed to create Paymob payment intention: ${axiosError.message}`);
    }
  }

  async verifyPayment(hmac: string, data: Record<string, any>): Promise<boolean> {
    const concatenatedString = Object.entries(data)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.secretKey)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac === hmac;
  }

  /**
   * Verify webhook HMAC signature for query parameters
   * Uses the correct field order as per Paymob documentation
   */
  verifyWebhookHmac(queryParams: Record<string, string>): boolean {
    // Define the exact order of fields for HMAC calculation as per Paymob docs
    const orderedFields = [
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
    ];

    // Concatenate values in the exact order (no keys, just values)
    const concatenatedString = orderedFields.map((field) => queryParams[field] || '').join('');

    // Calculate HMAC using the secret key
    const calculatedHmac = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac === queryParams.hmac;
  }

  async handleWebhook(webhookData: PaymobWebhookData): Promise<WebhookResult<TransactionData>> {
    try {
      // Verify the webhook signature
      const isValid = await this.verifyPayment(webhookData.obj.hmac, webhookData.obj);

      if (!isValid) {
        return { isValid: false, transactionData: null };
      }

      // Extract relevant transaction data
      const transactionData: TransactionData = {
        orderId: webhookData.obj.order.id,
        amount: webhookData.obj.amount_cents / 100, // Convert from cents to actual currency
        success: webhookData.obj.success,
        currency: webhookData.obj.currency,
        transactionId: webhookData.obj.id,
        createdAt: webhookData.obj.created_at,
        isRefunded: webhookData.obj.is_refunded,
        isCaptured: webhookData.obj.is_captured,
        isVoided: webhookData.obj.is_voided,
        metadata: webhookData.obj.order.metadata || {},
      };

      return { isValid: true, transactionData };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle webhook: ${errorMessage}`);
    }
  }

  /**
   * Handle webhook with query parameters (GET request)
   * This is for webhooks that come as URL query parameters instead of JSON body
   */
  handleWebhookQuery(
    queryParams: Record<string, string>,
  ): WebhookResult<WebhookQueryTransactionData> {
    try {
      // Verify the webhook HMAC signature
      const isValid = this.verifyWebhookHmac(queryParams);

      if (!isValid) {
        return { isValid: false, transactionData: null };
      }

      // Extract and parse transaction data from query parameters
      const transactionData: WebhookQueryTransactionData = {
        orderId: parseInt(queryParams.order || '0'),
        amount: parseInt(queryParams.amount_cents || '0') / 100, // Convert from cents
        success: queryParams.success === 'true',
        currency: queryParams.currency || 'EGP',
        transactionId: parseInt(queryParams.id || '0'),
        createdAt: queryParams.created_at || '',
        isRefunded: queryParams.is_refunded === 'true',
        isCaptured: queryParams.is_capture === 'true',
        isVoided: queryParams.is_voided === 'true',
        isAuth: queryParams.is_auth === 'true',
        isStandalone: queryParams.is_standalone_payment === 'true',
        is3dSecure: queryParams.is_3d_secure === 'true',
        sourceData: {
          type: queryParams['source_data.type'] || '',
          pan: queryParams['source_data.pan'] || '',
          subType: queryParams['source_data.sub_type'] || '',
        },
        responseCode: queryParams.txn_response_code || '',
        message: queryParams['data.message'] || '',
        metadata: {}, // Adding the missing metadata property
      };

      return { isValid: true, transactionData };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle webhook query: ${errorMessage}`);
    }
  }

  async getTransactionStatus(transactionId: number): Promise<TransactionStatusResult> {
    try {
      const response: AxiosResponse<PaymobTransactionStatusResponse> = await axios.get(
        `${this.baseUrl}/api/acceptance/transactions/${transactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.secretKey}`,
          },
        },
      );

      return {
        success: response.data.success,
        status: response.data.status,
        amount: response.data.amount_cents / 100,
        currency: response.data.currency,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get transaction status: ${axiosError.message}`);
    }
  }

  /**
   * Authenticate with Paymob to get Bearer token
   */
  async getAuthToken(): Promise<string> {
    try {
      const response: AxiosResponse<PaymobAuthResponse> = await axios.post(
        `${this.baseUrl}/api/auth/tokens`,
        {
          api_key: this.apiKey,
        },
      );
      return response.data.token;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get Paymob auth token: ${axiosError.message}`);
    }
  }

  /**
   * Get order details including metadata
   */
  async getOrderDetails(orderId: number): Promise<OrderDetailsResult> {
    try {
      const authToken = await this.getAuthToken();
      const response: AxiosResponse<PaymobOrderDetailsResponse> = await axios.get(
        `${this.baseUrl}/api/ecommerce/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      console.log('=======================');
      console.log('Raw Paymob order API response:', JSON.stringify(response.data, null, 2));
      console.log('merchant_order_id from API:', response.data.merchant_order_id);
      console.log('=======================');

      return {
        id: response.data.id,
        amount_cents: response.data.amount_cents,
        currency: response.data.currency,
        items: response.data.items || [],
        created_at: response.data.created_at,
        merchant_order_id: response.data.merchant_order_id,
      };
    } catch (error) {
      console.log('Failed to get order details:', error);
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get order details: ${axiosError.message}`);
    }
  }

  /**
   * Handle webhook query and fetch items from order
   */
  async handleWebhookQueryWithItems(
    queryParams: Record<string, string>,
  ): Promise<WebhookResult<WebhookQueryWithItemsTransactionData>> {
    try {
      // First verify the webhook
      const webhookResult = this.handleWebhookQuery(queryParams);

      if (!webhookResult.isValid || !webhookResult.transactionData) {
        return { isValid: false, transactionData: null };
      }

      // Fetch order details to get items
      const orderDetails = await this.getOrderDetails(webhookResult.transactionData.orderId);

      // Combine webhook data with items
      const transactionData: WebhookQueryWithItemsTransactionData = {
        ...webhookResult.transactionData,
        items: orderDetails.items,
      };

      return { isValid: true, transactionData };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle webhook with items: ${errorMessage}`);
    }
  }
}
