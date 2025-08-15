<template>
  <div class="flex items-center justify-center">
    <div class="max-w-2xl mx-auto p-4">
      <div class="bg-white rounded-2xl card-shadow p-6">
        <div class="flex items-center space-x-3 mb-6">
          <Send class="w-8 h-8 text-wise-600" />
          <h2 class="text-2xl font-semibold text-gray-800">Send Money</h2>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingRates" class="text-center py-8">
          <Loader2 class="w-8 h-8 animate-spin mx-auto text-wise-600 mb-4" />
          <p class="text-gray-600">Loading exchange rates...</p>
        </div>

        <!-- Send Money Form -->
        <form v-else @submit.prevent="handleSendMoney" class="space-y-6">
          <!-- Currency Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              <MapPin class="w-4 h-4 inline mr-1" />
              Send to which country?
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                v-for="currency in availableCurrencies"
                :key="currency.code"
                type="button"
                @click="selectedCurrency = currency.code"
                class="p-4 border-2 rounded-xl text-left transition-all outline-0 hover:border-wise-500 hover:shadow-md focus:outline-0 focus:ring-2 focus:ring-wise-500"
                :class="
                  selectedCurrency === currency.code
                    ? 'border-wise-500 bg-wise-50 ring-1 ring-wise-200'
                    : 'border-gray-200'
                "
              >
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">{{ currency.flag }}</span>
                  <div>
                    <div class="font-semibold text-gray-900">{{ currency.country }}</div>
                    <div class="text-sm text-gray-600">{{ currency.code }}</div>
                    <div class="flex items-center space-x-1 text-xs text-gray-500">
                      <Percent class="w-3 h-3" />
                      <span>Fee: {{ currency.fee }}%</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
              <DollarSign class="w-4 h-4" />
              <span>Amount to send (USD)</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign class="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                v-model="sendAmount"
                class="input-field pl-10"
                :class="{ 'input-error': errors.amount }"
                placeholder="0.00"
                min="1"
                max="10000"
                step="0.01"
                @input="validateAmount"
              />
            </div>
            <div class="flex justify-between items-center mt-1">
              <div class="flex items-center space-x-1">
                <p v-if="errors.amount" class="text-red-500 text-sm">{{ errors.amount }}</p>
                <p v-else class="text-sm text-gray-600">Min: $1, Max: $10,000</p>
              </div>
              <p v-if="sendAmount" class="text-sm text-gray-500 flex items-center space-x-1">
                <TrendingUp class="w-3 h-3" />
                <span
                  >≈
                  {{
                    formatCurrency(
                      parseFloat(sendAmount) * (fxRates[selectedCurrency] || 1),
                      selectedCurrency,
                    )
                  }}</span
                >
              </p>
            </div>
          </div>

          <!-- Recipient Input -->
          <div>
            <label class="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
              <User class="w-4 h-4" />
              <span>Recipient name <span class="text-gray-500">(optional)</span></span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                v-model="recipientName"
                class="input-field pl-10"
                placeholder="e.g., John Smith - University Name"
              />
            </div>
          </div>

          <!-- Transaction Summary -->
          <div
            v-if="sendAmount && selectedCurrency && !errors.amount"
            class="bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div class="flex items-center space-x-2 mb-3">
              <Calculator class="w-5 h-5 text-gray-600" />
              <h3 class="font-semibold text-gray-800">Transaction Summary</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Amount you send:</span>
                <span class="font-medium text-gray-900">${{ sendAmount }} USD</span>
              </div>
              <div class="flex justify-between">
                <div class="flex items-center space-x-1">
                  <ArrowRightLeft class="w-3 h-3 text-gray-400" />
                  <span class="text-gray-600">Exchange rate:</span>
                </div>
                <span class="font-medium text-gray-900">
                  1 USD = {{ fxRates[selectedCurrency] }} {{ selectedCurrency }}
                </span>
              </div>
              <div class="flex justify-between">
                <div class="flex items-center space-x-1">
                  <CreditCard class="w-3 h-3 text-gray-400" />
                  <span class="text-gray-600">Fee ({{ getFeePercentage() }}%):</span>
                </div>
                <span class="font-medium text-gray-900">${{ transactionFee.toFixed(2) }} USD</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Amount after fee:</span>
                <span class="font-medium text-gray-900"
                  >${{ (parseFloat(sendAmount) - transactionFee).toFixed(2) }} USD</span
                >
              </div>
              <hr class="my-2 border-gray-300" />
              <div class="flex justify-between text-lg font-semibold">
                <div class="flex items-center space-x-1">
                  <CheckCircle class="w-5 h-5 text-wise-600" />
                  <span class="text-gray-800">Recipient gets:</span>
                </div>
                <span class="text-wise-600">
                  {{ formatCurrency(recipientAmount, selectedCurrency) }}
                </span>
              </div>
            </div>

            <!-- Rate Update Time -->
            <div class="mt-3 pt-3 border-t border-gray-200">
              <div class="flex items-center space-x-1 text-xs text-gray-500">
                <Clock class="w-3 h-3" />
                <span>Exchange rates updated: {{ lastRateUpdate }}</span>
              </div>
            </div>
          </div>

          <!-- Send Button -->
          <button
            type="submit"
            :disabled="!canSendMoney || transactionStore.isLoading"
            class="w-full btn-primary"
          >
            <span
              v-if="!transactionStore.isLoading"
              class="flex items-center justify-center space-x-2"
            >
              <Send class="w-5 h-5" />
              <span>Send ${{ sendAmount || '0' }} USD</span>
            </span>
            <div v-else class="flex items-center justify-center space-x-2">
              <Loader2 class="w-5 h-5 animate-spin" />
              <span>Processing transaction...</span>
            </div>
          </button>

          <!-- Security Notice -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <Shield class="w-5 h-5 text-blue-500 mt-0.5" />
              <div class="text-sm">
                <p class="font-medium text-blue-800 mb-1">Secure Transfer</p>
                <p class="text-blue-700">
                  Your money is protected by bank-level security. Transfers typically arrive within
                  1-3 business days.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useTransactionStore } from '@/stores/transactions'
import { fetchFxRates } from '@/services/api'
import {
  Send,
  Loader2,
  MapPin,
  DollarSign,
  User,
  Calculator,
  ArrowRightLeft,
  CreditCard,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Percent,
} from 'lucide-vue-next'
import type { Currency, CurrencyInfo, FxRates } from '@/types'

// Stores
const transactionStore = useTransactionStore()

// Injected functions
const showSuccess = inject<(title: string, message: string) => void>('showSuccess')

// Reactive state
const sendAmount = ref<string>('')
const selectedCurrency = ref<Currency>('GBP')
const recipientName = ref<string>('')
const fxRates = ref<FxRates>({})
const isLoadingRates = ref<boolean>(true)
const lastRateUpdate = ref<string>('')
const errors = ref<Record<string, string>>({})

// Computed properties
const availableCurrencies = ref<CurrencyInfo[]>([
  {
    code: 'GBP',
    name: 'United Kingdom Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    fee: 10,
    symbol: '£',
    minAmount: 1,
    maxAmount: 10000,
    isActive: true,
    exchangeRate: 1,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    country: 'South Africa',
    flag: '🇿🇦',
    fee: 20,
    symbol: 'R',
    minAmount: 1,
    maxAmount: 10000,
    isActive: true,
    exchangeRate: 1,
  },
])

const transactionFee = computed(() => {
  if (!sendAmount.value) return 0
  const amount = parseFloat(sendAmount.value)
  const feePercent = getFeePercentage() / 100
  return amount * feePercent
})

const recipientAmount = computed(() => {
  if (!sendAmount.value || !fxRates.value[selectedCurrency.value]) return 0

  const amount = parseFloat(sendAmount.value)
  const amountAfterFee = amount - transactionFee.value
  const rate = fxRates.value[selectedCurrency.value]

  // Round UP as specified in requirements
  return Math.ceil(amountAfterFee * rate)
})

const canSendMoney = computed(() => {
  return (
    sendAmount.value &&
    !errors.value.amount &&
    parseFloat(sendAmount.value) >= 1 &&
    parseFloat(sendAmount.value) <= 10000 &&
    selectedCurrency.value &&
    Object.keys(fxRates.value).length > 0 &&
    !transactionStore.isLoading
  )
})

// Methods
const getFeePercentage = (): number => {
  const currency = availableCurrencies.value.find((c) => c.code === selectedCurrency.value)
  return currency?.fee || 10
}

const validateAmount = (): void => {
  errors.value = {}

  if (!sendAmount.value) return

  const amount = parseFloat(sendAmount.value)

  if (isNaN(amount)) {
    errors.value.amount = 'Please enter a valid amount'
  } else if (amount < 1) {
    errors.value.amount = 'Minimum amount is $1'
  } else if (amount > 10000) {
    errors.value.amount = 'Maximum amount is $10,000'
  }
}

const formatCurrency = (amount: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'ZAR' ? 'ZAR' : 'GBP',
    minimumFractionDigits: currency === 'ZAR' ? 0 : 2,
    maximumFractionDigits: currency === 'ZAR' ? 0 : 2,
  })

  return formatter.format(amount).replace(/^[A-Z]{3}/, currency)
}

const loadFxRates = async (): Promise<void> => {
  try {
    isLoadingRates.value = true
    const rates = await fetchFxRates()
    fxRates.value = rates
    lastRateUpdate.value = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Failed to load FX rates:', error)
    // Fallback rates
    fxRates.value = {
      USD: 1,
      GBP: 0.74,
      ZAR: 17.75,
    }
    lastRateUpdate.value = 'Using cached rates'
  } finally {
    isLoadingRates.value = false
  }
}

const handleSendMoney = async (): Promise<void> => {
  validateAmount()
  if (!canSendMoney.value) return

  const currencyInfo = availableCurrencies.value.find((c) => c.code === selectedCurrency.value)
  const recipient = recipientName.value || `Student in ${currencyInfo?.country}`

  const transactionData = {
    recipient,
    amount: parseFloat(sendAmount.value),
    currency: selectedCurrency.value,
    convertedAmount: recipientAmount.value,
    fee: transactionFee.value.toFixed(2),
    exchangeRate: fxRates.value[selectedCurrency.value],
  }

  const result = await transactionStore.addTransaction(transactionData)

  if (result.success) {
    // Reset form
    sendAmount.value = ''
    selectedCurrency.value = 'GBP'
    recipientName.value = ''
    errors.value = {}

    // Show success message
    showSuccess?.(
      'Money Sent Successfully! 🎉',
      `Your transfer of ${transactionData.amount} USD is being processed. The recipient will receive ${formatCurrency(transactionData.convertedAmount, transactionData.currency)}.`,
    )
  } else {
    // Handle error
    errors.value.general = result.error || 'Transaction failed'
  }
}

// Watchers
watch([sendAmount, selectedCurrency], () => {
  if (sendAmount.value) {
    validateAmount()
  }
})

// Lifecycle
onMounted(() => {
  loadFxRates()

  // Refresh rates every 5 minutes
  setInterval(loadFxRates, 5 * 60 * 1000)
})
</script>
