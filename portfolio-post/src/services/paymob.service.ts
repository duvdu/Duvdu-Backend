import * as crypto from 'crypto';

import axios, { AxiosError, AxiosResponse } from 'axios';

import {
  PaymobAuthResponse,
  PaymobWebhookData,
  WebhookResult,
  TransactionData,
  WebhookQueryTransactionData,
  OrderDetailsResult,
  TransactionStatusResult,
  PaymentIntentionResult,
  UserPaymentData,
  PaymobBillingData,
  PaymobOrderItem,
  PaymobIntentionRequest,
  PaymobIntentionResponse,
  PaymobOrderDetailsResponse,
  PaymobTransactionStatusResponse,
  WebhookQueryWithItemsTransactionData,
} from '../types/paymob.types';

class PaymobConfig {
  public readonly apiKey: string;
  public readonly secretKey: string;
  public readonly publicKey: string;
  public readonly integrationId: number;
  public readonly baseUrl: string;
  public readonly hmacSecret: string;

  constructor() {
    this.validateEnvironmentVariables();

    this.apiKey = process.env.PAYMOB_API_KEY!;
    this.secretKey = process.env.PAYMOB_SECRET_KEY!;
    this.publicKey = process.env.PAYMOB_PUBLIC_KEY!;
    this.integrationId = parseInt(process.env.PAYMOB_INTEGRATION_ID!);
    this.baseUrl = process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com';
    this.hmacSecret = process.env.PAYMOB_HMAC_SECRET!;

    this.logConfiguration();
  }

  /**
   * Validates that all required environment variables are present
   */
  private validateEnvironmentVariables(): void {
    const requiredVars = [
      'PAYMOB_API_KEY',
      'PAYMOB_SECRET_KEY',
      'PAYMOB_PUBLIC_KEY',
      'PAYMOB_INTEGRATION_ID',
      'PAYMOB_HMAC_SECRET',
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  /**
   * Logs configuration details (without sensitive data)
   */
  private logConfiguration(): void {
    console.log('PayMob configuration initialized:', {
      integrationId: this.integrationId,
      publicKey: this.publicKey,
      baseUrl: this.baseUrl,
    });
  }
}

// ===========================
// AUTHENTICATION CLASS
// ===========================

/**
 * Handles Paymob authentication operations
 */
class PaymobAuth {
  constructor(private config: PaymobConfig) {}

  /**
   * Authenticate with Paymob to get Bearer token
   * @returns Promise<string> Authentication token
   */
  async getAuthToken(): Promise<string> {
    try {
      const response: AxiosResponse<PaymobAuthResponse> = await axios.post(
        `${this.config.baseUrl}/api/auth/tokens`,
        {
          api_key: this.config.apiKey,
        },
      );
      return response.data.token;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get Paymob auth token: ${axiosError.message}`);
    }
  }

  /**
   * Get authorization headers for API requests
   * @returns Promise<Record<string, string>> Headers object
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      Authorization: `Token ${this.config.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get bearer token headers for API requests
   * @returns Promise<Record<string, string>> Headers object with bearer token
   */
  async getBearerHeaders(): Promise<Record<string, string>> {
    const authToken = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };
  }
}

// ===========================
// WEBHOOK HANDLER CLASS
// ===========================

/**
 * Handles Paymob webhook operations and verification
 */
class PaymobWebhookHandler {
  private readonly WEBHOOK_FIELD_ORDER = [
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

  constructor(private config: PaymobConfig) {}

  /**
   * Verify payment using HMAC signature
   * @param hmac HMAC signature to verify
   * @param data Payment data to verify
   * @returns Promise<boolean> Verification result
   */
  async verifyPayment(hmac: string, data: Record<string, any>): Promise<boolean> {
    const concatenatedString = Object.entries(data)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.config.secretKey)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac === hmac;
  }

  /**
   * Verify webhook HMAC signature for query parameters
   * Uses the correct field order as per Paymob documentation
   * @param queryParams Query parameters from webhook
   * @returns boolean Verification result
   */
  verifyWebhookHmac(queryParams: Record<string, string>): boolean {
    const concatenatedString = this.WEBHOOK_FIELD_ORDER.map(
      (field) => queryParams[field] || '',
    ).join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.config.hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac === queryParams.hmac;
  }

  /**
   * Handle webhook with JSON data (POST request)
   * @param webhookData Webhook data from Paymob
   * @returns Promise<WebhookResult<TransactionData>> Webhook processing result
   */
  async handleWebhook(webhookData: PaymobWebhookData): Promise<WebhookResult<TransactionData>> {
    try {
      const isValid = await this.verifyPayment(webhookData.obj.hmac, webhookData.obj);

      if (!isValid) {
        return { isValid: false, transactionData: null };
      }

      const transactionData: TransactionData = this.extractTransactionData(webhookData);
      return { isValid: true, transactionData };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle webhook: ${errorMessage}`);
    }
  }

  /**
   * Handle webhook with query parameters (GET request)
   * @param queryParams Query parameters from webhook URL
   * @returns WebhookResult<WebhookQueryTransactionData> Webhook processing result
   */
  handleWebhookQuery(
    queryParams: Record<string, string>,
  ): WebhookResult<WebhookQueryTransactionData> {
    try {
      const isValid = this.verifyWebhookHmac(queryParams);

      if (!isValid) {
        return { isValid: false, transactionData: null };
      }

      const transactionData: WebhookQueryTransactionData =
        this.extractQueryTransactionData(queryParams);
      return { isValid: true, transactionData };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to handle webhook query: ${errorMessage}`);
    }
  }

  /**
   * Extract transaction data from webhook JSON data
   * @private
   */
  private extractTransactionData(webhookData: PaymobWebhookData): TransactionData {
    return {
      orderId: webhookData.obj.order.id,
      amount: webhookData.obj.amount_cents / 100,
      success: webhookData.obj.success,
      currency: webhookData.obj.currency,
      transactionId: webhookData.obj.id,
      createdAt: webhookData.obj.created_at,
      isRefunded: webhookData.obj.is_refunded,
      isCaptured: webhookData.obj.is_captured,
      isVoided: webhookData.obj.is_voided,
      metadata: webhookData.obj.order.metadata || {},
    };
  }

  /**
   * Extract transaction data from webhook query parameters
   * @private
   */
  private extractQueryTransactionData(
    queryParams: Record<string, string>,
  ): WebhookQueryTransactionData {
    return {
      orderId: parseInt(queryParams.order || '0'),
      amount: parseInt(queryParams.amount_cents || '0') / 100,
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
      metadata: {},
    };
  }
}

// ===========================
// ORDER MANAGER CLASS
// ===========================

/**
 * Handles Paymob order operations
 */
class PaymobOrderManager {
  constructor(
    private config: PaymobConfig,
    private auth: PaymobAuth,
  ) {}

  /**
   * Get order details including metadata
   * @param orderId Order ID to fetch details for
   * @returns Promise<OrderDetailsResult> Order details
   */
  async getOrderDetails(orderId: number): Promise<OrderDetailsResult> {
    try {
      const headers = await this.auth.getBearerHeaders();
      const response = await axios.get(
        `${this.config.baseUrl}/api/ecommerce/orders/${orderId}`,
        { headers },
      );

      console.log('=======================');
      console.log('response from order details', response.data);
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
      const axiosError = error as AxiosError;
      throw new Error(`Failed to get order details: ${axiosError.message}`);
    }
  }

  /**
   * Get transaction status by transaction ID
   * @param transactionId Transaction ID to check status for
   * @returns Promise<TransactionStatusResult> Transaction status
   */
  async getTransactionStatus(transactionId: number): Promise<TransactionStatusResult> {
    try {
      const headers = await this.auth.getAuthHeaders();
      const response: AxiosResponse<PaymobTransactionStatusResponse> = await axios.get(
        `${this.config.baseUrl}/api/acceptance/transactions/${transactionId}`,
        { headers },
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
}

// ===========================
// PAYMENT PROCESSOR CLASS
// ===========================

/**
 * Handles Paymob payment processing operations
 */
class PaymobPaymentProcessor {
  constructor(
    private config: PaymobConfig,
    private auth: PaymobAuth,
  ) {}

  /**
   * Create payment intention with Paymob
   * @param amount Payment amount
   * @param billingData Customer billing information
   * @param items Order items
   * @param currency Payment currency (default: EGP)
   * @param extras Additional metadata
   * @returns Promise<PaymentIntentionResult> Payment URL and client secret
   */
  async createPaymentIntention(
    amount: number,
    billingData: PaymobBillingData,
    items: PaymobOrderItem[],
    currency: string = 'EGP',
    extras?: Record<string, any>,
  ): Promise<PaymentIntentionResult> {
    try {
      const intentionData = this.buildIntentionRequest(
        amount,
        billingData,
        items,
        currency,
        extras,
      );
      const headers = await this.auth.getAuthHeaders();

      const response: AxiosResponse<PaymobIntentionResponse> = await axios.post(
        `${this.config.baseUrl}/v1/intention/`,
        intentionData,
        { headers },
      );

      return this.buildPaymentResult(response.data.client_secret);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to create Paymob payment intention: ${axiosError.message}`);
    }
  }

  /**
   * Create payment URL with user data for contracts
   * @param amount Payment amount
   * @param userId User ID
   * @param contractId Contract ID
   * @param userData User data for billing
   * @param serviceType Type of service being paid for
   * @returns Promise<{paymentUrl: string}> Payment URL
   */
  async createPaymentUrlWithUserData(
    amount: number,
    userId: string,
    contractId: string,
    userData: UserPaymentData,
    serviceType: string,
  ): Promise<{ paymentUrl: string }> {
    const customData = this.buildCustomMetadata(contractId, userId, serviceType);
    const billingData = this.buildBillingDataFromUser(userData);
    const items = this.buildOrderItems(userId, contractId, serviceType, amount);

    try {
      const intentionData = this.buildIntentionRequest(
        amount,
        billingData,
        items,
        'EGP',
        customData,
      );
      const headers = await this.auth.getAuthHeaders();

      const response: AxiosResponse<PaymobIntentionResponse> = await axios.post(
        `${this.config.baseUrl}/v1/intention/`,
        intentionData,
        { headers },
      );

      const paymentUrl = this.buildPaymentUrl(response.data.client_secret);
      return { paymentUrl };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to create Paymob payment intention: ${axiosError.message}`);
    }
  }

  /**
   * Build payment intention request data
   * @private
   */
  private buildIntentionRequest(
    amount: number,
    billingData: PaymobBillingData,
    items: PaymobOrderItem[],
    currency: string,
    extras?: Record<string, any>,
  ): PaymobIntentionRequest {
    return {
      amount,
      currency,
      payment_methods: [this.config.integrationId, 'card'],
      items,
      billing_data: billingData,
      customer: {
        first_name: billingData.first_name,
        last_name: billingData.last_name,
        email: billingData.email,
        extras: extras || {},
      },
      extras: extras || {},
      merchant_order_id: JSON.stringify(extras),
    };
  }

  /**
   * Build custom metadata for contract payments
   * @private
   */
  private buildCustomMetadata(
    contractId: string,
    userId: string,
    serviceType: string,
  ): Record<string, any> {
    return {
      contractId,
      userId,
      service_type: serviceType,
      booking_id: 'BOOK_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Build billing data from user data
   * @private
   */
  private buildBillingDataFromUser(userData: UserPaymentData): PaymobBillingData {
    return {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone_number: userData.phone,
      apartment: '123',
      floor: '1',
      street: '123 Main St',
      building: '123',
      state: 'Cairo',
      country: 'EGY',
    };
  }

  /**
   * Build order items for contract payment
   * @private
   */
  private buildOrderItems(
    userId: string,
    contractId: string,
    serviceType: string,
    amount: number,
  ): PaymobOrderItem[] {
    return [
      {
        name: `${userId}-${contractId}`,
        description: serviceType,
        amount,
        quantity: 1,
      },
    ];
  }

  /**
   * Build payment URL from client secret
   * @private
   */
  private buildPaymentUrl(clientSecret: string): string {
    return `${this.config.baseUrl}/unifiedcheckout/?publicKey=${this.config.publicKey}&clientSecret=${clientSecret}`;
  }

  /**
   * Build payment result with URL and client secret
   * @private
   */
  private buildPaymentResult(clientSecret: string): PaymentIntentionResult {
    return {
      paymentUrl: this.buildPaymentUrl(clientSecret),
      clientSecret,
    };
  }
}


export class PaymobService {
  private readonly config: PaymobConfig;
  private readonly auth: PaymobAuth;
  private readonly webhookHandler: PaymobWebhookHandler;
  private readonly orderManager: PaymobOrderManager;
  private readonly paymentProcessor: PaymobPaymentProcessor;

  constructor() {
    this.config = new PaymobConfig();
    this.auth = new PaymobAuth(this.config);
    this.webhookHandler = new PaymobWebhookHandler(this.config);
    this.orderManager = new PaymobOrderManager(this.config, this.auth);
    this.paymentProcessor = new PaymobPaymentProcessor(this.config, this.auth);
  }

  async createPaymentIntention(
    amount: number,
    billingData: PaymobBillingData,
    items: PaymobOrderItem[],
    currency: string = 'EGP',
    extras?: Record<string, any>,
  ): Promise<PaymentIntentionResult> {
    return this.paymentProcessor.createPaymentIntention(
      amount,
      billingData,
      items,
      currency,
      extras,
    );
  }

  async createPaymentUrlWithUserData(
    amount: number,
    userId: string,
    contractId: string,
    userData: UserPaymentData,
    serviceType: string,
  ): Promise<{ paymentUrl: string }> {
    return this.paymentProcessor.createPaymentUrlWithUserData(
      amount,
      userId,
      contractId,
      userData,
      serviceType,
    );
  }

  async verifyPayment(hmac: string, data: Record<string, any>): Promise<boolean> {
    return this.webhookHandler.verifyPayment(hmac, data);
  }


  verifyWebhookHmac(queryParams: Record<string, string>): boolean {
    return this.webhookHandler.verifyWebhookHmac(queryParams);
  }

  async handleWebhook(webhookData: PaymobWebhookData): Promise<WebhookResult<TransactionData>> {
    return this.webhookHandler.handleWebhook(webhookData);
  }

  handleWebhookQuery(
    queryParams: Record<string, string>,
  ): WebhookResult<WebhookQueryTransactionData> {
    return this.webhookHandler.handleWebhookQuery(queryParams);
  }

  async handleWebhookQueryWithItems(
    queryParams: Record<string, string>,
  ): Promise<WebhookResult<WebhookQueryWithItemsTransactionData>> {
    try {
      const webhookResult = this.webhookHandler.handleWebhookQuery(queryParams);

      if (!webhookResult.isValid || !webhookResult.transactionData) {
        return { isValid: false, transactionData: null };
      }

      const orderDetails = await this.orderManager.getOrderDetails(
        webhookResult.transactionData.orderId,
      );

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

  async getTransactionStatus(transactionId: number): Promise<TransactionStatusResult> {
    return this.orderManager.getTransactionStatus(transactionId);
  }

  async getOrderDetails(orderId: number): Promise<OrderDetailsResult> {
    return this.orderManager.getOrderDetails(orderId);
  }

  async getAuthToken(): Promise<string> {
    return this.auth.getAuthToken();
  }
}
