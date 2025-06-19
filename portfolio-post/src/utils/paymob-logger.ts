// ===========================
// PAYMOB LOGGING UTILITY
// ===========================

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  error?: Error;
}

/**
 * Paymob Logger for structured logging
 */
export class PaymobLogger {
  private static instance: PaymobLogger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PaymobLogger {
    if (!PaymobLogger.instance) {
      PaymobLogger.instance = new PaymobLogger();
    }
    return PaymobLogger.instance;
  }

  /**
   * Get log level from environment variables
   */
  private getLogLevelFromEnv(): LogLevel {
    const envLogLevel = process.env.PAYMOB_LOG_LEVEL?.toLowerCase();
    return Object.values(LogLevel).includes(envLogLevel as LogLevel)
      ? (envLogLevel as LogLevel)
      : LogLevel.INFO;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    };
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ''} ${entry.message}`;

    if (entry.data) {
      return `${base} | Data: ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      return `${base} | Error: ${entry.error.message}\n${entry.error.stack}`;
    }

    return base;
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  /**
   * Log error message
   */
  error(message: string, context?: string, error?: Error, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data, error);
    this.output(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    this.output(entry);
  }

  /**
   * Log info message
   */
  info(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    this.output(entry);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
    this.output(entry);
  }

  /**
   * Log payment request
   */
  logPaymentRequest(amount: number, currency: string, userId?: string, contractId?: string): void {
    this.info('Payment request initiated', 'PaymentProcessor', {
      amount,
      currency,
      userId,
      contractId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log payment success
   */
  logPaymentSuccess(transactionId: number, amount: number, currency: string): void {
    this.info('Payment completed successfully', 'PaymentProcessor', {
      transactionId,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log payment failure
   */
  logPaymentFailure(reason: string, amount: number, currency: string, error?: Error): void {
    this.error('Payment failed', 'PaymentProcessor', error, {
      reason,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log webhook received
   */
  logWebhookReceived(webhookType: string, transactionId?: number): void {
    this.info('Webhook received', 'WebhookHandler', {
      webhookType,
      transactionId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log webhook verification
   */
  logWebhookVerification(isValid: boolean, transactionId?: number): void {
    const message = isValid ? 'Webhook verification successful' : 'Webhook verification failed';
    const level = isValid ? LogLevel.INFO : LogLevel.WARN;

    if (level === LogLevel.INFO) {
      this.info(message, 'WebhookHandler', { transactionId });
    } else {
      this.warn(message, 'WebhookHandler', { transactionId });
    }
  }

  /**
   * Log authentication attempt
   */
  logAuthAttempt(success: boolean, error?: Error): void {
    if (success) {
      this.info('Authentication successful', 'PaymobAuth');
    } else {
      this.error('Authentication failed', 'PaymobAuth', error);
    }
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, url: string, data?: any): void {
    this.debug('API request', 'ApiClient', {
      method,
      url,
      hasData: !!data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log API response
   */
  logApiResponse(method: string, url: string, status: number, success: boolean): void {
    const message = `API response: ${method} ${url}`;
    const level = success ? LogLevel.DEBUG : LogLevel.WARN;

    if (level === LogLevel.DEBUG) {
      this.debug(message, 'ApiClient', { status, success });
    } else {
      this.warn(message, 'ApiClient', { status, success });
    }
  }

  /**
   * Log validation error
   */
  logValidationError(field: string, errors: string[]): void {
    this.warn('Validation failed', 'Validator', {
      field,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log configuration loading
   */
  logConfigurationLoaded(config: Record<string, any>): void {
    // Remove sensitive data for logging
    const safeConfig = {
      integrationId: config.integrationId,
      baseUrl: config.baseUrl,
      publicKey: config.publicKey ? config.publicKey.substring(0, 10) + '...' : undefined,
    };

    this.info('Paymob configuration loaded', 'PaymobConfig', safeConfig);
  }

  /**
   * Log order details retrieval
   */
  logOrderDetailsRetrieved(orderId: number, amount: number, itemCount: number): void {
    this.debug('Order details retrieved', 'OrderManager', {
      orderId,
      amount,
      itemCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log transaction status check
   */
  logTransactionStatusCheck(transactionId: number, status: string, success: boolean): void {
    this.debug('Transaction status checked', 'OrderManager', {
      transactionId,
      status,
      success,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const logger = PaymobLogger.getInstance();
