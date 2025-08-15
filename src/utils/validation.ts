/**
 * Validation utilities for Wiremit application with TypeScript
 * These functions provide client-side validation for forms and user inputs
 */

import type { ValidationResult, Currency, ValidationRules } from '@/types'

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+[1-9]\d{1,14}$/,
  name: /^[a-zA-Z\s'-]+$/,
  currency: /^\d+(\.\d{1,2})?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/
} as const

// Validation rules
export const VALIDATION_RULES: ValidationRules = {
  user: {
    name: { minLength: 2, maxLength: 100 },
    email: { maxLength: 254 },
    password: { minLength: 6, maxLength: 128 }
  },
  transaction: {
    amount: { min: 1, max: 10000 },
    recipient: { maxLength: 200 },
    notes: { maxLength: 200 },
    // currency: { pattern: VALIDATION_PATTERNS.currency }
  }
} as const

/**
 * Validate email address format
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export const validateEmail = (email: string | null | undefined): string => {
  if (!email || typeof email !== 'string') {
    return 'Email is required'
  }

  const trimmedEmail = email.trim()

  if (trimmedEmail.length < 3) {
    return 'Email is too short'
  }

  if (trimmedEmail.length > VALIDATION_RULES.user.email.maxLength) {
    return 'Email is too long'
  }

  if (!VALIDATION_PATTERNS.email.test(trimmedEmail)) {
    return 'Please enter a valid email address'
  }

  if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return 'Email format is invalid'
  }

  return ''
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Error message or empty string if valid
 */
export const validatePassword = (password: string | null | undefined): string => {
  if (!password || typeof password !== 'string') {
    return 'Password is required'
  }

  const { minLength, maxLength } = VALIDATION_RULES.user.password

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`
  }

  if (password.length > maxLength) {
    return `Password must be less than ${maxLength} characters`
  }

  return ''
}

/**
 * Get detailed password validation errors
 * @param password - Password to validate
 * @returns Array of validation error messages
 */
export const getPasswordErrors = (password: string | null | undefined): string[] => {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
    return errors
  }

  const { minLength, maxLength } = VALIDATION_RULES.user.password

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }

  if (password.length > maxLength) {
    errors.push(`Password must be less than ${maxLength} characters`)
  }

  return errors
}

/**
 * Calculate password strength (0-4)
 * @param password - Password to evaluate
 * @returns Password strength score
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0

  let strength = 0

  // Length checks
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return Math.min(strength, 4)
}

/**
 * Validate full name
 * @param name - Name to validate
 * @returns Error message or empty string if valid
 */
export const validateName = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') {
    return 'Name is required'
  }

  const trimmedName = name.trim()
  const { minLength, maxLength } = VALIDATION_RULES.user.name

  if (trimmedName.length < minLength) {
    return `Name must be at least ${minLength} characters long`
  }

  if (trimmedName.length > maxLength) {
    return `Name must be less than ${maxLength} characters`
  }

  if (!VALIDATION_PATTERNS.name.test(trimmedName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes'
  }

  if (/^\s|\s$/.test(trimmedName)) {
    return 'Name cannot start or end with spaces'
  }

  if (/\s{2,}/.test(trimmedName)) {
    return 'Name cannot contain consecutive spaces'
  }

  return ''
}

/**
 * Validate money amount with detailed result
 * @param amount - Amount to validate
 * @param min - Minimum allowed amount
 * @param max - Maximum allowed amount
 * @returns Validation result with isValid and error
 */
export const validateAmountDetailed = (
  amount: string | number | null | undefined,
  min: number = VALIDATION_RULES.transaction.amount.min,
  max: number = VALIDATION_RULES.transaction.amount.max
): ValidationResult => {
  const result: ValidationResult = { isValid: false }

  if (!amount && amount !== 0) {
    result.error = 'Amount is required'
    return result
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    result.error = 'Please enter a valid number'
    return result
  }

  if (numAmount < min) {
    result.error = `Minimum amount is $${min}`
    return result
  }

  if (numAmount > max) {
    result.error = `Maximum amount is $${max.toLocaleString()}`
    return result
  }

  if (numAmount <= 0) {
    result.error = 'Amount must be greater than zero'
    return result
  }

  // Check for too many decimal places (max 2 for currency)
  if (typeof amount === 'string') {
    const decimalPlaces = (amount.split('.')[1] || '').length
    if (decimalPlaces > 2) {
      result.error = 'Amount cannot have more than 2 decimal places'
      return result
    }
  }

  result.isValid = true
  return result
}

/**
 * Simple validate amount function that returns string error
 * @param amount - Amount to validate
 * @returns Error message or empty string if valid
 */
export const validateAmount = (amount: string | null | undefined): string => {
  if (!amount || amount.trim() === '') {
    return 'Amount is required'
  }

  const numAmount = parseFloat(amount)

  if (isNaN(numAmount)) {
    return 'Please enter a valid number'
  }

  if (numAmount <= 0) {
    return 'Amount must be greater than zero'
  }

  if (numAmount < VALIDATION_RULES.transaction.amount.min) {
    return `Minimum amount is $${VALIDATION_RULES.transaction.amount.min}`
  }

  if (numAmount > VALIDATION_RULES.transaction.amount.max) {
    return `Maximum amount is $${VALIDATION_RULES.transaction.amount.max.toLocaleString()}`
  }

  // Check for too many decimal places (max 2 for currency)
  const decimalPlaces = (amount.split('.')[1] || '').length
  if (decimalPlaces > 2) {
    return 'Amount cannot have more than 2 decimal places'
  }

  return ''
}

/**
 * Validate recipient name
 * @param name - Recipient name to validate
 * @returns Error message or empty string if valid
 */
export const validateRecipientName = (name: string | null | undefined): string => {
  if (!name || name.trim() === '') {
    return 'Recipient name is required'
  }

  const nameError = validateName(name)
  if (nameError) {
    return nameError
  }

  if (name.length > VALIDATION_RULES.transaction.recipient.maxLength) {
    return `Recipient name cannot exceed ${VALIDATION_RULES.transaction.recipient.maxLength} characters`
  }

  return ''
}

/**
 * Sanitize user input to prevent XSS
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

/**
 * Validate currency code
 * @param currency - Currency code to validate
 * @returns Whether currency is supported
 */
export const validateCurrency = (currency: string | null | undefined): currency is Currency => {
  const supportedCurrencies: Currency[] = ['USD', 'GBP', 'ZAR', 'USDT']
  return typeof currency === 'string' && supportedCurrencies.includes(currency as Currency)
}

/**
 * Format validation errors for display
 * @param errors - Object containing field errors
 * @returns Array of formatted error messages
 */
export const formatValidationErrors = (errors: Record<string, string | undefined>): string[] => {
  return Object.entries(errors)
    .filter(([_, error]) => error)
    .map(([field, error]) => `${field}: ${error}`)
}

/**
 * Validate phone number (international format)
 * @param phone - Phone number to validate
 * @returns Whether phone number is valid
 */
export const validatePhoneNumber = (phone: string | null | undefined): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '')

  return VALIDATION_PATTERNS.phone.test(cleaned)
}

/**
 * Check if input contains potentially malicious content
 * @param input - Input to check
 * @returns Whether input appears safe
 */
export const isSafeInput = (input: string | null | undefined): boolean => {
  if (!input || typeof input !== 'string') {
    return true
  }

  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ]

  return !maliciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate date format and range
 * @param dateString - Date string to validate
 * @param minDate - Minimum allowed date (optional)
 * @param maxDate - Maximum allowed date (optional)
 * @returns Validation result
 */
export const validateDate = (
  dateString: string | null | undefined,
  minDate: Date | null = null,
  maxDate: Date | null = null
): ValidationResult & { date?: Date } => {
  const result: ValidationResult & { date?: Date } = { isValid: false }

  if (!dateString) {
    result.error = 'Date is required'
    return result
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    result.error = 'Please enter a valid date'
    return result
  }

  if (minDate && date < minDate) {
    result.error = `Date must be after ${minDate.toLocaleDateString()}`
    return result
  }

  if (maxDate && date > maxDate) {
    result.error = `Date must be before ${maxDate.toLocaleDateString()}`
    return result
  }

  result.isValid = true
  result.date = date
  return result
}

/**
 * Validate form data with multiple fields
 * @param formData - Object containing form field values
 * @param rules - Validation rules for each field
 * @returns Object containing validation errors for each field
 */
export const validateForm = <T extends Record<string, any>>(
  formData: T,
  rules: Record<keyof T, (value: any) => ValidationResult>
): Record<keyof T, string | undefined> => {
  const errors: Record<keyof T, string | undefined> = {} as Record<keyof T, string | undefined>

  Object.keys(rules).forEach(field => {
    const fieldKey = field as keyof T
    const validationResult = rules[fieldKey](formData[fieldKey])
    if (!validationResult.isValid) {
      errors[fieldKey] = validationResult.error
    }
  })

  return errors
}

/**
 * Check if form has any validation errors
 * @param errors - Validation errors object
 * @returns Whether form is valid (no errors)
 */
export const isFormValid = (errors: Record<string, string | undefined>): boolean => {
  return Object.values(errors).every(error => !error)
}

/**
 * Debounce validation function for real-time validation
 * @param validationFn - Validation function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced validation function
 */
export const debounceValidation = <T extends any[]>(
  validationFn: (...args: T) => void,
  delay: number = 300
): ((...args: T) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => validationFn(...args), delay)
  }
}
