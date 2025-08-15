/**
 * Complete TypeScript type definitions for Wiremit application
 */

import type { Component } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

// ================================
// Core Entity Types
// ================================

export interface User {
  id: number
  name: string
  email: string
  createdAt: string
  updatedAt?: string
  isVerified?: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  currency: Currency
  notifications: NotificationSettings
  language: string
  timezone: string
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  transactionUpdates: boolean
  promotions: boolean
}

export interface Transaction {
  id: number
  userId?: number
  recipient: string
  amount: number
  currency: Currency
  convertedAmount: number
  fee: string
  status: TransactionStatus
  date: string
  createdAt: string
  updatedAt?: string
  reference?: string
  exchangeRate?: number
  estimatedArrival?: string
  actualArrival?: string
  purpose?: TransactionPurpose
  notes?: string
}

export interface TransactionSummary {
  totalSent: number
  totalTransactions: number
  successRate: number
  averageAmount: number
  mostUsedCurrency: Currency
  lastTransactionDate?: string
}

// ================================
// Enum-like Types
// ================================

export type Currency = 'USD' | 'GBP' | 'ZAR' | 'EUR' | 'CAD' | 'AUD' | 'USDT'

export type TransactionStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded'

export type TransactionPurpose =
  | 'education'
  | 'living'
  | 'emergency'
  | 'medical'
  | 'travel'
  | 'family_support'
  | 'business'
  | 'other'

export type PaymentMethod =
  | 'bank_transfer'
  | 'debit_card'
  | 'credit_card'
  | 'digital_wallet'
  | 'crypto'

export type UserRole = 'user' | 'admin' | 'support'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

// ================================
// Authentication Types
// ================================

export interface UserCredentials {
  email: string
  password: string
}

export interface UserRegistration {
  name: string
  email: string
  password: string
  confirmPassword?: string
  agreeToTerms?: boolean
  country?: string
  phoneNumber?: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: User
  token?: string
  refreshToken?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  lastLoginAt?: string
}

export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  country?: string
  phoneNumber?: string
}

export interface ResetPasswordForm {
  email: string
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ================================
// Transaction Types
// ================================

export interface TransactionData {
  recipient: string
  amount: number
  currency: Currency
  convertedAmount: number
  fee: string
  exchangeRate: number
  purpose?: TransactionPurpose
  paymentMethod?: PaymentMethod
  notes?: string
}

export interface TransactionRequest {
  recipientName: string
  recipientEmail?: string
  amount: number
  fromCurrency: Currency
  toCurrency: Currency
  purpose: TransactionPurpose
  paymentMethod: PaymentMethod
  notes?: string
}

export interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  filters: TransactionFilters
  pagination: PaginationState
}

export interface TransactionFilters {
  status?: TransactionStatus
  currency?: Currency
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  search?: string
}

export interface SendMoneyForm {
  amount: string
  currency: Currency
  recipientName: string
  recipientEmail?: string
  purpose: TransactionPurpose
  notes?: string
}

// ================================
// Currency & Exchange Types
// ================================

export interface CurrencyInfo {
  code: Currency
  name: string
  symbol: string
  country: string
  flag: string
  fee: number
  minAmount: number
  maxAmount: number
  isActive: boolean
  exchangeRate?: number
}

export interface FxRates {
  [key: string]: number
  timestamp?: number
  source?: string
}

export interface ExchangeRateResponse {
  success: boolean
  rates: FxRates
  timestamp: number
  base: Currency
  lastUpdated: string
}

export interface CurrencyPair {
  from: Currency
  to: Currency
  rate: number
  inverse: number
  spread: number
  lastUpdated: string
}

export interface FeeStructure {
  currency: Currency
  percentage: number
  fixedFee: number
  minFee: number
  maxFee: number
  paymentMethod?: PaymentMethod
}

// ================================
// API Types
// ================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  timestamp?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
  timestamp?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiRequestConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

// ================================
// Validation Types
// ================================

export interface ValidationResult {
  isValid: boolean
  error?: string
  field?: string
}

export interface FormValidationErrors {
  [field: string]: string | undefined
}

export interface ValidationRule<T = unknown> {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: T) => ValidationResult | Promise<ValidationResult>
  message?: string
}

export interface ValidationRules {
  user: {
    name: { minLength: number; maxLength: number }
    email: { maxLength: number; pattern: RegExp }
    password: { minLength: number; maxLength: number }
    phoneNumber: { pattern: RegExp }
  }
  transaction: {
    amount: { min: number; max: number }
    recipient: { maxLength: number }
    notes: { maxLength: number }
  }
}

export interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}

// ================================
// Router & Navigation Types
// ================================

export interface RouteMetaData {
  requiresAuth?: boolean
  requiresGuest?: boolean
  requiresVerification?: boolean
  roles?: UserRole[]
  title?: string
  description?: string
  breadcrumb?: string
  layout?: 'default' | 'auth' | 'admin'
  keepAlive?: boolean
  transition?: string
}

export interface NavItem {
  name: string
  path: string
  icon: Component | string
  requiresAuth?: boolean
  roles?: UserRole[]
  children?: NavItem[]
  badge?: string | number
  isExternal?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

export interface RouteTransition {
  name: string
  mode?: 'in-out' | 'out-in'
  duration?: number
}

// ================================
// UI Component Types
// ================================

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  ariaLabel?: string
}

export interface ModalProps {
  title?: string
  message?: string
  isOpen?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
}

export interface SuccessModalProps extends ModalProps {
  showConfetti?: boolean
  autoClose?: boolean
  duration?: number
}

export interface ErrorModalProps extends ModalProps {
  retry?: () => void
  retryText?: string
}

export interface ConfirmationModalProps extends ModalProps {
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

export interface ToastNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  actions?: ToastAction[]
  timestamp: number
}

export interface ToastAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'destructive'
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => string | Component
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  sortBy?: keyof T
  sortOrder?: 'asc' | 'desc'
  pagination?: PaginationProps
  selectable?: boolean
  emptyText?: string
}

export interface PaginationProps {
  page: number
  limit: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  sizes?: number[]
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ================================
// Form Types
// ================================

export interface FormField<T = any> {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'
  value: T
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options?: SelectOption[]
  validation?: ValidationRule<T>
  help?: string
  prefix?: string
  suffix?: string
}

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
}

export interface FormState<T = Record<string, any>> {
  values: T
  errors: FormValidationErrors
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

// ================================
// Advertisement Types
// ================================

export interface Advertisement {
  id: string
  title: string
  description: string
  imageUrl?: string
  icon?: string
  bgClass?: string
  ctaText?: string
  ctaUrl?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  targetAudience?: string[]
  priority: number
}

export interface OfferData {
  id: string
  title: string
  description: string
  type: 'discount' | 'cashback' | 'referral' | 'promotion'
  value: number
  currency?: Currency
  conditions: string[]
  validUntil?: string
  isActive: boolean
  usageCount?: number
  maxUsage?: number
  priority: number
  bgClass: string
}

// ================================
// Analytics & Tracking Types
// ================================

export interface AnalyticsEvent {
  name: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId?: string
  timestamp: number
  properties?: Record<string, any>
}

export interface UserActivity {
  userId: number
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface TransactionMetrics {
  period: 'day' | 'week' | 'month' | 'year'
  totalVolume: number
  totalCount: number
  averageAmount: number
  successRate: number
  topCurrencies: Array<{
    currency: Currency
    volume: number
    count: number
  }>
}

// ================================
// Configuration Types
// ================================

export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  api: {
    baseURL: string
    timeout: number
    retries: number
  }
  features: {
    enableAnalytics: boolean
    enablePWA: boolean
    enableOfflineMode: boolean
    maxTransactionAmount: number
    supportedCurrencies: Currency[]
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    primaryColor: string
    compactMode: boolean
  }
}

export interface FeatureFlag {
  name: string
  enabled: boolean
  description?: string
  conditions?: Record<string, any>
  rolloutPercentage?: number
}

// ================================
// Error Types
// ================================

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

export interface NetworkError extends Error {
  status?: number
  statusText?: string
  url?: string
  isNetworkError: boolean
}

export interface ValidationError extends Error {
  field: string
  value: any
  rule: string
}

// ================================
// Utility Types
// ================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type Nullable<T> = T | null

export type Callback<T = void> = () => T

export type AsyncCallback<T = void> = () => Promise<T>

export type EventHandler<T = Event> = (event: T) => void

export type Subscription = {
  unsubscribe: () => void
}

// ================================
// Global State Types
// ================================

export interface GlobalState {
  auth: AuthState
  transactions: TransactionState
  ui: UIState
  config: AppConfig
}

export interface UIState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  loading: {
    global: boolean
    route: boolean
  }
  modals: {
    success: boolean
    error: boolean
    confirmation: boolean
  }
  notifications: ToastNotification[]
  online: boolean
}

// ================================
// API Endpoint Types
// ================================

export interface APIEndpoints {
  auth: {
    login: string
    register: string
    logout: string
    refresh: string
    resetPassword: string
    verifyEmail: string
  }
  transactions: {
    list: string
    create: string
    get: string
    cancel: string
  }
  exchange: {
    rates: string
    convert: string
  }
  user: {
    profile: string
    updateProfile: string
    changePassword: string
    preferences: string
  }
}

// ================================
// Test Types
// ================================

export interface TestUser {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
}

export interface MockApiResponse<T = any> {
  data: T
  delay?: number
  shouldFail?: boolean
  errorMessage?: string
}

// ================================
// Export commonly used type unions
// ================================

export type ID = string | number
export type Timestamp = string | number | Date
export type Money = number
export type Percentage = number
export type HTTPStatus = number
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export type JSONObject = { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

// ================================
// Generic Response Types
// ================================

export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

export type APIResponseType<T = any> = SuccessResponse<T> | ErrorResponse

// ================================
// Environment Variables Types
// ================================

export interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_EXCHANGE_API_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}
