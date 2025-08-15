<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-show="true" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 transition-opacity" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl card-shadow max-w-2xl w-full p-6 transform transition-all"
            @click.stop
          >
            <!-- Close Button -->
            <button
              @click="$emit('close')"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X class="w-6 h-6" />
            </button>

            <!-- Header -->
            <div class="mb-6">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-12 h-12 bg-wise-100 rounded-full flex items-center justify-center">
                  <Receipt class="w-6 h-6 text-wise-600" />
                </div>
                <div>
                  <h3 class="text-2xl font-semibold text-gray-900">Transaction Details</h3>
                  <p class="text-gray-600">Reference: {{ transaction.reference || 'N/A' }}</p>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-full"
                  :class="getStatusClass(transaction.status)"
                >
                  <component :is="getStatusIcon(transaction.status)" class="w-4 h-4" />
                  <span>{{ transaction.status }}</span>
                </span>
                <span class="text-sm text-gray-600">
                  {{ transaction.date }}
                </span>
              </div>
            </div>

            <!-- Transaction Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Recipient Information -->
              <div class="space-y-4">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User class="w-5 h-5 text-wise-600" />
                  <span>Recipient</span>
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Name:</span>
                      <span class="font-medium text-gray-900">{{ transaction.recipient }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Amount Information -->
              <div class="space-y-4">
                <h4 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <DollarSign class="w-5 h-5 text-wise-600" />
                  <span>Amount</span>
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-gray-600">You sent:</span>
                      <span class="font-medium text-gray-900">${{ transaction.amount }} USD</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">They received:</span>
                      <span class="font-medium text-gray-900">{{
                        formatCurrency(transaction.convertedAmount, transaction.currency)
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Exchange rate:</span>
                      <span class="font-medium text-gray-900">{{
                        transaction.exchangeRate || 'N/A'
                      }}</span>
                    </div>
                    <div class="flex justify-between border-gray-200 border-t pt-2">
                      <span class="text-gray-600">Fee:</span>
                      <span class="font-medium text-gray-900">${{ transaction.fee }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                <Clock class="w-5 h-5 text-wise-600" />
                <span>Timeline</span>
              </h4>
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-wise-600 rounded-full"></div>
                  <div class="flex-1">
                    <div class="flex justify-between items-center">
                      <span class="font-medium text-gray-900">Transaction initiated</span>
                      <span class="text-sm text-gray-600">{{
                        formatDateTime(transaction.createdAt)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="transaction.status === 'Completed'" class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="flex justify-between items-center">
                      <span class="font-medium text-gray-900">Transaction completed</span>
                      <span class="text-sm text-gray-600">{{
                        transaction.actualArrival || transaction.estimatedArrival || 'N/A'
                      }}</span>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="transaction.status === 'Pending'"
                  class="flex items-center space-x-3"
                >
                  <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div class="flex-1">
                    <div class="flex justify-between items-center">
                      <span class="font-medium text-gray-900">Processing</span>
                      <span class="text-sm text-gray-600"
                        >Est. {{ transaction.estimatedArrival || 'Soon' }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div v-if="transaction.purpose || transaction.notes" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                <FileText class="w-5 h-5 text-wise-600" />
                <span>Additional Information</span>
              </h4>
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div v-if="transaction.purpose" class="flex justify-between">
                  <span class="text-gray-600">Purpose:</span>
                  <span class="font-medium text-gray-900 capitalize">{{
                    transaction.purpose.replace('_', ' ')
                  }}</span>
                </div>
                <div v-if="transaction.notes" class="">
                  <span class="text-gray-600 block mb-1">Notes:</span>
                  <p class="text-gray-900 bg-white rounded p-2 border">{{ transaction.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="$emit('close')"
                class="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>Back to History</span>
              </button>

              <button
                v-if="transaction.status === 'Pending'"
                @click="handleCancelTransaction"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle class="w-4 h-4" />
                <span>Cancel Transaction</span>
              </button>

              <button
                @click="handleDownloadReceipt"
                class="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Download class="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  X,
  Receipt,
  User,
  DollarSign,
  Clock,
  FileText,
  ArrowLeft,
  XCircle,
  Download,
  CheckCircle,
  AlertCircle,
} from 'lucide-vue-next'
import type { Transaction, Currency } from '@/types'

// Props
defineProps<{
  transaction: Transaction
}>()

// Emits
defineEmits<{
  close: []
}>()

// Methods
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Processing':
      return 'bg-blue-100 text-blue-800'
    case 'Failed':
      return 'bg-red-100 text-red-800'
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return CheckCircle
    case 'Pending':
    case 'Processing':
      return Clock
    case 'Failed':
    case 'Cancelled':
      return AlertCircle
    default:
      return Clock
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

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleCancelTransaction = (): void => {
  // TODO: Implement transaction cancellation logic
  console.log('Cancel transaction requested')
}

const handleDownloadReceipt = (): void => {
  // TODO: Implement receipt download logic
  console.log('Download receipt requested')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(-20px);
}
</style>
