import {
  PaymobBillingData,
  PaymobOrderItem,
  UserPaymentData,
  ValidationResult,
  PaymentValidationRules,
} from '../types/paymob.types';

// ===========================
// VALIDATION CONSTANTS
// ===========================

const DEFAULT_VALIDATION_RULES: PaymentValidationRules = {
  minAmount: 1,
  maxAmount: 1000000,
  allowedCurrencies: ['EGP', 'USD', 'EUR'],
  requiredBillingFields: ['first_name', 'last_name', 'email', 'phone_number'],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// ===========================
// VALIDATION FUNCTIONS
// ===========================

/**
 * Validates payment amount
 * @param amount Payment amount to validate
 * @param rules Validation rules
 * @returns ValidationResult
 */
export function validateAmount(
  amount: number,
  rules: PaymentValidationRules = DEFAULT_VALIDATION_RULES,
): ValidationResult {
  const errors: string[] = [];

  if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push('Amount must be a valid number');
  }

  if (amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (rules.minAmount && amount < rules.minAmount) {
    errors.push(`Amount must be at least ${rules.minAmount}`);
  }

  if (rules.maxAmount && amount > rules.maxAmount) {
    errors.push(`Amount must not exceed ${rules.maxAmount}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates currency code
 * @param currency Currency code to validate
 * @param rules Validation rules
 * @returns ValidationResult
 */
export function validateCurrency(
  currency: string,
  rules: PaymentValidationRules = DEFAULT_VALIDATION_RULES,
): ValidationResult {
  const errors: string[] = [];

  if (!currency || typeof currency !== 'string') {
    errors.push('Currency is required and must be a string');
  }

  if (currency.length !== 3) {
    errors.push('Currency must be a 3-character code (e.g., EGP, USD)');
  }

  if (rules.allowedCurrencies && !rules.allowedCurrencies.includes(currency)) {
    errors.push(`Currency must be one of: ${rules.allowedCurrencies.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates billing data
 * @param billingData Billing data to validate
 * @param rules Validation rules
 * @returns ValidationResult
 */
export function validateBillingData(
  billingData: PaymobBillingData,
  rules: PaymentValidationRules = DEFAULT_VALIDATION_RULES,
): ValidationResult {
  const errors: string[] = [];

  if (!billingData || typeof billingData !== 'object') {
    errors.push('Billing data is required');
    return { isValid: false, errors };
  }

  // Check required fields
  if (rules.requiredBillingFields) {
    for (const field of rules.requiredBillingFields) {
      if (!billingData[field as keyof PaymobBillingData]) {
        errors.push(`${field} is required in billing data`);
      }
    }
  }

  // Validate email format
  if (billingData.email && !EMAIL_REGEX.test(billingData.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone format
  if (billingData.phone_number && !PHONE_REGEX.test(billingData.phone_number)) {
    errors.push('Invalid phone number format');
  }

  // Validate name fields
  if (billingData.first_name && billingData.first_name.length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (billingData.last_name && billingData.last_name.length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates order items
 * @param items Order items to validate
 * @returns ValidationResult
 */
export function validateOrderItems(items: PaymobOrderItem[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one order item is required');
    return { isValid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`Item ${index + 1}: Name is required and must be a string`);
    }

    if (!item.description || typeof item.description !== 'string') {
      errors.push(`Item ${index + 1}: Description is required and must be a string`);
    }

    if (typeof item.amount !== 'number' || item.amount <= 0) {
      errors.push(`Item ${index + 1}: Amount must be a positive number`);
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be a positive number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates user payment data
 * @param userData User data to validate
 * @returns ValidationResult
 */
export function validateUserPaymentData(userData: UserPaymentData): ValidationResult {
  const errors: string[] = [];

  if (!userData || typeof userData !== 'object') {
    errors.push('User data is required');
    return { isValid: false, errors };
  }

  if (!userData.firstName || userData.firstName.length < 2) {
    errors.push('First name is required and must be at least 2 characters');
  }

  if (!userData.lastName || userData.lastName.length < 2) {
    errors.push('Last name is required and must be at least 2 characters');
  }

  if (!userData.email || !EMAIL_REGEX.test(userData.email)) {
    errors.push('Valid email is required');
  }

  if (!userData.phone || !PHONE_REGEX.test(userData.phone)) {
    errors.push('Valid phone number is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates webhook query parameters
 * @param queryParams Query parameters to validate
 * @returns ValidationResult
 */
export function validateWebhookQuery(queryParams: Record<string, string>): ValidationResult {
  const errors: string[] = [];

  const requiredFields = ['id', 'amount_cents', 'success', 'currency', 'hmac'];

  for (const field of requiredFields) {
    if (!queryParams[field]) {
      errors.push(`Missing required webhook field: ${field}`);
    }
  }

  // Validate ID is a number
  if (queryParams.id && isNaN(parseInt(queryParams.id))) {
    errors.push('Transaction ID must be a valid number');
  }

  // Validate amount is a number
  if (queryParams.amount_cents && isNaN(parseInt(queryParams.amount_cents))) {
    errors.push('Amount cents must be a valid number');
  }

  // Validate success is boolean
  if (queryParams.success && !['true', 'false'].includes(queryParams.success)) {
    errors.push('Success field must be true or false');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates environment variables for Paymob configuration
 * @param envVars Environment variables to validate
 * @returns ValidationResult
 */
export function validateEnvironmentVariables(
  envVars: Record<string, string | undefined>,
): ValidationResult {
  const errors: string[] = [];

  const requiredVars = [
    'PAYMOB_API_KEY',
    'PAYMOB_SECRET_KEY',
    'PAYMOB_PUBLIC_KEY',
    'PAYMOB_INTEGRATION_ID',
    'PAYMOB_HMAC_SECRET',
  ];

  for (const varName of requiredVars) {
    if (!envVars[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate integration ID is a number
  if (envVars.PAYMOB_INTEGRATION_ID && isNaN(parseInt(envVars.PAYMOB_INTEGRATION_ID))) {
    errors.push('PAYMOB_INTEGRATION_ID must be a valid number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Comprehensive payment request validation
 * @param amount Payment amount
 * @param billingData Billing information
 * @param items Order items
 * @param currency Payment currency
 * @param rules Validation rules
 * @returns ValidationResult
 */
export function validatePaymentRequest(
  amount: number,
  billingData: PaymobBillingData,
  items: PaymobOrderItem[],
  currency: string = 'EGP',
  rules: PaymentValidationRules = DEFAULT_VALIDATION_RULES,
): ValidationResult {
  const allErrors: string[] = [];

  // Validate each component
  const amountValidation = validateAmount(amount, rules);
  const currencyValidation = validateCurrency(currency, rules);
  const billingValidation = validateBillingData(billingData, rules);
  const itemsValidation = validateOrderItems(items);

  // Collect all errors
  allErrors.push(...amountValidation.errors);
  allErrors.push(...currencyValidation.errors);
  allErrors.push(...billingValidation.errors);
  allErrors.push(...itemsValidation.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
