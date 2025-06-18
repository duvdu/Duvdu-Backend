import * as crypto from 'crypto';

import axios, { AxiosError } from 'axios';

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
    order: {
      id: number;
      created_at: string;
      delivery_needed: boolean;
      merchant: {
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
      };
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
      items: any[];
      order_url: string;
      commission_fee: number;
      delivery_fee_cents: number;
      delivery_voucher_cost: number;
      discount: number;
      metadata: Record<string, any>;
    };
    created_at: string;
    transaction_processed_callback_responses: null;
    currency: string;
    source_data: {
      type: string;
      pan: string;
      sub_type: string;
    };
    api_source: string;
    terminal_id: string;
    merchant_commission: number;
    merchant_staff_tag: null;
    hmac: string;
  };
}

/**
 * Paymob Service Configuration
 * 
 * Required Keys:
 * - apiKey: Your Paymob API Key (used for authentication)
 * - integrationId: Your Paymob Integration ID (found in your Paymob dashboard)
 * - iframeId: Your Paymob Iframe ID (found in your Paymob dashboard)
 * 
 * Note: 
 * - Public Key: Used for client-side encryption (not needed for this service)
 * - Secret Key: Used for webhook signature verification (handled internally)
 */
export class PaymobService {
  private readonly apiKey: string;
  private readonly integrationId: number;
  private readonly iframeId: number;
  private readonly baseUrl: string;
  private readonly hmacSecret: string;

  constructor() {
    this.apiKey = 'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBek9URXpPQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS41WG01anpmQVdVM3E4MzFkT2pUQUg5bGo1QklWY3EzeEhCMU1tMTNwM1FpcVlpRDJSRkRZa05fWmVaQkE2WGFKWUJCNVdkR2Z0SndoRW10Wi1XUk5wUQ==';
    this.integrationId = 5060202;
    this.iframeId = 915609;
    this.baseUrl = 'https://accept.paymob.com/api';
    // TODO: Replace with your actual HMAC secret key from Paymob dashboard
    this.hmacSecret = 'B133E76ACDA6A4BF822E3BF4B0E8DAD8';
  }

  async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.apiKey,
      });
      return response.data.token;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get Paymob auth token: ${axiosError.message}`);
    }
  }

  async createOrder(
    amount: number,
    currency: string = 'EGP',
    items: any[] = [],
  ): Promise<{ orderId: number; token: string }> {
    try {
      const authToken = await this.getAuthToken();
      const response = await axios.post(
        `${this.baseUrl}/ecommerce/orders`,
        {
          auth_token: authToken,
          delivery_needed: false,
          amount_cents: amount * 100,
          currency,
          items,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        orderId: response.data.id,
        token: authToken,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(axiosError);
      throw new Error(`Failed to create Paymob order: ${axiosError.message}`);
    }
  }

  async getPaymentKey(
    orderId: number,
    token: string,
    amount: number,
    billingData: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      apartment: string;
      floor: string;
      street: string;
      building: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    },
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: token,
          amount_cents: amount * 100,
          expiration: 3600,
          order_id: orderId,
          billing_data: billingData,
          currency: 'EGP',
          integration_id: this.integrationId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.token;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get payment key: ${axiosError.message}`);
    }
  }

  createPaymentUrl(paymentKey: string): string {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
  }

  async verifyPayment(hmac: string, data: any): Promise<boolean> {
    const concatenatedString = Object.entries(data)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.apiKey)
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
      'success'
    ];

    // Concatenate values in the exact order (no keys, just values)
    const concatenatedString = orderedFields
      .map(field => queryParams[field] || '')
      .join('');

    // Calculate HMAC using the secret key
    const calculatedHmac = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac === queryParams.hmac;
  }

  async handleWebhook(webhookData: PaymobWebhookData): Promise<{
    isValid: boolean;
    transactionData: {
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
    } | null;
  }> {
    try {
      // Verify the webhook signature
      const isValid = await this.verifyPayment(webhookData.obj.hmac, webhookData.obj);

      if (!isValid) {
        return { isValid: false, transactionData: null };
      }

      // Extract relevant transaction data
      const transactionData = {
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
  handleWebhookQuery(queryParams: Record<string, string>): {
    isValid: boolean;
    transactionData: {
      orderId: number;
      amount: number;
      success: boolean;
      currency: string;
      transactionId: number;
      createdAt: string;
      isRefunded: boolean;
      isCaptured: boolean;
      isVoided: boolean;
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
    } | null;
  } {
    try {
      // Verify the webhook HMAC signature
      const isValid = this.verifyWebhookHmac(queryParams);

      if (!isValid) {
        return { isValid: false, transactionData: null };
      }

      // Extract and parse transaction data from query parameters
      const transactionData = {
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
      };

      return { isValid: true, transactionData };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle webhook query: ${errorMessage}`);
    }
  }

  async getTransactionStatus(transactionId: number): Promise<{
    success: boolean;
    status: string;
    amount: number;
    currency: string;
  }> {
    try {
      const authToken = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/acceptance/transactions/${transactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
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
   * Get order details including metadata
   */
  async getOrderDetails(orderId: number): Promise<{
    id: number;
    amount_cents: number;
    currency: string;
    items: any[];
    created_at: string;
    merchant_order_id: string;
  }> {
    try {
      const authToken = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/ecommerce/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      return {
        id: response.data.id,
        amount_cents: response.data.amount_cents,
        currency: response.data.currency,
        items: response.data.items || [],
        created_at: response.data.created_at,
        merchant_order_id: response.data.merchant_order_id,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get order details: ${axiosError.message}`);
    }
  }

  /**
   * Handle webhook query and fetch items from order
   */
  async handleWebhookQueryWithItems(queryParams: Record<string, string>): Promise<{
    isValid: boolean;
    transactionData: {
      orderId: number;
      amount: number;
      success: boolean;
      currency: string;
      transactionId: number;
      createdAt: string;
      isRefunded: boolean;
      isCaptured: boolean;
      isVoided: boolean;
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
      items: any[];
    } | null;
  }> {
    try {
      // First verify the webhook
      const webhookResult = this.handleWebhookQuery(queryParams);
      
      if (!webhookResult.isValid || !webhookResult.transactionData) {
        return { isValid: false, transactionData: null };
      }

      // Fetch order details to get items
      const orderDetails = await this.getOrderDetails(webhookResult.transactionData.orderId);

      console.log('orderDetails======================');
      console.log('Full API Response:', JSON.stringify(orderDetails, null, 2));
      console.log('orderDetails======================');

      // Combine webhook data with items
      const transactionData = {
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
