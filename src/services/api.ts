// API Service for Wiremit application with TypeScript

import type { FxRates, TransactionData, ApiResponse, Currency } from '@/types'

// API Configuration from environment variables
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://68976304250b078c2041c7fc.mockapi.io/api/wiremit',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000, // 10 seconds
  RETRY_ATTEMPTS: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000 // 1 second
} as const

/**
 * Fetch exchange rates from the API
 * @returns Promise<FxRates> Exchange rates object
 */
export const fetchFxRates = async (): Promise<FxRates> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    const response = await fetch(`${API_CONFIG.BASE_URL}/InterviewAPIS`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform the array of objects into a single object
    // The API returns: [{ "USD": 1 }, { "GBP": 0.74 }, { "ZAR": 17.75 }, { "USDT": 1 }]
    const rates: FxRates = {}

    if (Array.isArray(data)) {
      data.forEach((item: Record<string, number>) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(currency => {
            const rate = item[currency] //parseFloat()
            if (!isNaN(rate)) {
              rates[currency] = rate
            }
          })
        }
      })
    }

    // Validate that we have the required currencies
    if (!rates.GBP || !rates.ZAR || !rates.USD) {
      console.warn('Missing required currency rates, using fallback')
      return getFallbackRates()
    }

    return rates
  } catch (error) {
    console.error('Error fetching FX rates:', error)
    return getFallbackRates()
  }
}

/**
 * Get fallback exchange rates when API fails
 * @returns FxRates Fallback rates
 */
const getFallbackRates = (): FxRates => {
  return {
    USD: 1,
    GBP: 0.74,
    ZAR: 17.75,
    USDT: 1
  }
}

/**
 * Simulate API call for sending money
 * @param transactionData Transaction details
 * @returns Promise<ApiResponse<any>> Transaction result
 */
interface SendMoneyResponse {
  transactionId: string
  estimatedArrival: string
  [key: string]: unknown
}

export const sendMoney = async (transactionData: TransactionData): Promise<ApiResponse<SendMoneyResponse>> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Transaction failed due to network error')
    }

    // Mock successful response
    const result = {
      success: true,
      data: {
        transactionId: generateTransactionId(),
        estimatedArrival: getEstimatedArrival(transactionData.currency),
        ...transactionData
      }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed'
    }
  }
}

/**
 * Generate a unique transaction ID
 * @returns string Transaction ID
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `WMT${timestamp}${random}`.toUpperCase()
}

/**
 * Get estimated arrival time based on destination currency
 * @param currency Destination currency
 * @returns string Estimated arrival description
 */
const getEstimatedArrival = (currency: Currency): string => {
  const now = new Date()
  let arrivalDate: Date

  if (currency === 'GBP') {
    // UK transfers: 1-2 business days
    arrivalDate = addBusinessDays(now, Math.random() < 0.7 ? 1 : 2)
  } else if (currency === 'ZAR') {
    // South Africa transfers: 2-3 business days
    arrivalDate = addBusinessDays(now, Math.random() < 0.5 ? 2 : 3)
  } else {
    // Default: 1-3 business days
    arrivalDate = addBusinessDays(now, Math.floor(Math.random() * 3) + 1)
  }

  return arrivalDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Add business days to a date (excluding weekends)
 * @param date Starting date
 * @param days Number of business days to add
 * @returns Date New date
 */
const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  let addedDays = 0

  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }

  return result
}

/**
 * Validate API response data
 * @param data Data to validate
 * @returns boolean Whether data is valid
 */
export const validateApiResponse = (data: unknown): data is Record<string, unknown> => {
  return data !== null && typeof data === 'object' && !Array.isArray(data)
}

/**
 * Handle API errors consistently
 * @param error Error object
 * @returns string User-friendly error message
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Network connection failed. Please check your internet connection.'
    }

    if (error.message.includes('404')) {
      return 'Service temporarily unavailable. Please try again later.'
    }

    if (error.message.includes('500')) {
      return 'Server error. Our team has been notified.'
    }

    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return 'Request timed out. Please try again.'
    }

    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Check if API is available
 * @returns Promise<boolean> Whether API is reachable
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_CONFIG.BASE_URL}/InterviewAPIS`, {
      method: 'HEAD',
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('API health check failed:', error)
    return false
  }
}

/**
 * Retry API call with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retry attempts
 * @param delay Initial delay in milliseconds
 * @returns Promise<T> Result of the function
 */
export const retryApiCall = async <T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryApiCall(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

/**
 * Format currency amount with proper locale
 * @param amount Amount to format
 * @param currency Currency code
 * @returns string Formatted currency string
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const locale = currency === 'ZAR' ? 'en-ZA' : 'en-GB'

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'ZAR' ? 'ZAR' : currency === 'GBP' ? 'GBP' : 'USD',
    minimumFractionDigits: currency === 'ZAR' ? 0 : 2,
    maximumFractionDigits: currency === 'ZAR' ? 0 : 2
  })

  return formatter.format(amount)
}

/**
 * Validate currency code
 * @param currency Currency to validate
 * @returns boolean Whether currency is supported
 */
export const isSupportedCurrency = (currency: string): currency is Currency => {
  const supportedCurrencies: Currency[] = ['USD', 'GBP', 'ZAR', 'USDT']
  return supportedCurrencies.includes(currency as Currency)
}

/**
 * Get exchange rate for a specific currency pair
 * @param rates FX rates object
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @returns number Exchange rate
 */
export const getExchangeRate = (
  rates: FxRates,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  if (fromCurrency === toCurrency) return 1

  const fromRate = rates[fromCurrency] || 1
  const toRate = rates[toCurrency] || 1

  return toRate / fromRate
}

/**
 * Calculate transaction fee based on currency and amount
 * @param amount Transaction amount
 * @param currency Target currency
 * @returns number Fee amount
 */
export const calculateFee = (amount: number, currency: Currency): number => {
  const feePercentage = currency === 'GBP' ? 0.1 : 0.2 // 10% for GBP, 20% for ZAR
  return amount * feePercentage
}

/**
 * Convert amount between currencies
 * @param amount Amount to convert
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @param rates Exchange rates
 * @param includeFee Whether to include transaction fee
 * @returns object Conversion result
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: FxRates,
  includeFee: boolean = true
): {
  convertedAmount: number
  fee: number
  exchangeRate: number
  totalCost: number
} => {
  const exchangeRate = getExchangeRate(rates, fromCurrency, toCurrency)
  const fee = includeFee ? calculateFee(amount, toCurrency) : 0
  const amountAfterFee = amount - fee
  const convertedAmount = Math.ceil(amountAfterFee * exchangeRate) // Round UP as per requirements

  return {
    convertedAmount,
    fee,
    exchangeRate,
    totalCost: amount
  }
}

// Type guards for API responses
export const isApiError = <T>(response: ApiResponse<T>): response is ApiResponse<never> => {
  return !response.success && !!response.error
}

export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success && !!response.data
}
