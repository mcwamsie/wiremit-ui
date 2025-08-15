<template>
  <div class="bg-white rounded-2xl card-shadow">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center space-x-3">
          <History class="w-8 h-8 text-wise-600" />
          <h2 class="text-2xl font-semibold text-gray-800">Transaction History</h2>
        </div>

        <!-- Search and Filter -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search transactions..."
              class="input-field pl-10 pr-4 py-2 w-full sm:w-64"
            />
          </div>

          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter class="w-4 h-4 text-gray-500" />
            </div>
            <select v-model="statusFilter" class="input-field pl-10 py-2 pr-8">
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="flex items-center space-x-3">
        <Loader2 class="w-8 h-8 animate-spin text-wise-600" />
        <span class="text-gray-600">Loading transactions...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <BarChart3 class="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">
        {{ searchQuery || statusFilter ? 'No matching transactions' : 'No transactions yet' }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{
          searchQuery || statusFilter
            ? 'Try adjusting your search or filter criteria'
            : 'Start by sending money to see your transaction history here'
        }}
      </p>
      <button
        v-if="!searchQuery && !statusFilter"
        @click="$emit('switch-tab', 'send')"
        class="btn-primary inline-flex items-center space-x-2"
      >
        <Send class="w-4 h-4" />
        <span>Send Money Now</span>
      </button>
    </div>

    <!-- Transactions List -->
    <div v-else>
      <!-- Mobile View -->
      <div class="block lg:hidden">
        <div
          v-for="transaction in paginatedTransactions"
          :key="transaction.id"
          class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-wise-100 rounded-full flex items-center justify-center">
                <ArrowUpRight class="w-4 h-4 text-wise-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 mb-1">
                  {{ transaction.recipient }}
                </div>
                <div class="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar class="w-3 h-3" />
                  <span>{{ transaction.date }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-900">${{ transaction.amount }} USD</div>
              <div class="text-sm text-gray-600">
                {{ formatCurrency(transaction.convertedAmount, transaction.currency) }}
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span
              class="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusClass(transaction.status)"
            >
              <component :is="getStatusIcon(transaction.status)" class="w-3 h-3" />
              <span>{{ transaction.status }}</span>
            </span>
            <button
              @click="showTransactionDetails(transaction)"
              class="flex items-center space-x-1 text-wise-600 hover:text-wise-700 text-sm font-medium transition-colors"
            >
              <Eye class="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center space-x-1">
                  <Calendar class="w-4 h-4" />
                  <span>Date</span>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center space-x-1">
                  <User class="w-4 h-4" />
                  <span>Recipient</span>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center space-x-1">
                  <DollarSign class="w-4 h-4" />
                  <span>Amount Sent</span>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center space-x-1">
                  <TrendingUp class="w-4 h-4" />
                  <span>Amount Received</span>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center space-x-1">
                  <CreditCard class="w-4 h-4" />
                  <span>Fee</span>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div class="flex items-center space-x-1">
                  <CheckCircle class="w-4 h-4" />
                  <span>Status</span>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transaction.date }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                <div class="truncate" :title="transaction.recipient">
                  {{ transaction.recipient }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                ${{ transaction.amount }} USD
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatCurrency(transaction.convertedAmount, transaction.currency) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${{ transaction.fee }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(transaction.status)"
                >
                  <component :is="getStatusIcon(transaction.status)" class="w-3 h-3" />
                  <span>{{ transaction.status }}</span>
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="showTransactionDetails(transaction)"
                  class="flex items-center space-x-1 text-wise-600 hover:text-wise-700 font-medium transition-colors"
                >
                  <Eye class="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-2 text-sm text-gray-700">
            <FileText class="w-4 h-4" />
            <span
              >Showing {{ startIndex + 1 }} to {{ endIndex }} of
              {{ filteredTransactions.length }} transactions</span
            >
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                class="px-3 py-1 text-sm rounded transition-colors"
                :class="
                  page === currentPage
                    ? 'bg-wise-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                "
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Details Modal -->
    <TransactionDetailsModal
      v-if="selectedTransaction"
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactions'
import {
  History,
  Search,
  Filter,
  Loader2,
  BarChart3,
  Send,
  ArrowUpRight,
  Calendar,
  Eye,
  User,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import TransactionDetailsModal from '@/components/common/TransactionDetailsModal.vue'
import type { Transaction, Currency } from '@/types'

// Emits
defineEmits(['switch-tab'])

// Store
const transactionStore = useTransactionStore()

// Reactive state
const isLoading = ref<boolean>(true)
const searchQuery = ref<string>('')
const statusFilter = ref<string>('')
const currentPage = ref<number>(1)
const itemsPerPage = 10
const selectedTransaction = ref<Transaction | null>(null)

// Computed
const filteredTransactions = computed(() => {
  let transactions = [...transactionStore.transactions]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    transactions = transactions.filter(
      (t) =>
        t.recipient.toLowerCase().includes(query) ||
        t.amount.toString().includes(query) ||
        t.currency.toLowerCase().includes(query) ||
        t.reference?.toLowerCase().includes(query),
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    transactions = transactions.filter((t) => t.status === statusFilter.value)
  }

  return transactions
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage, filteredTransactions.value.length)
})

const paginatedTransactions = computed(() => {
  return filteredTransactions.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const getStatusClass = (status: string): string => {
  return status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
}

const getStatusIcon = (status: string) => {
  return status === 'Completed' ? CheckCircle : Clock
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

const showTransactionDetails = (transaction: Transaction): void => {
  selectedTransaction.value = transaction
}

const previousPage = (): void => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = (): void => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Lifecycle
onMounted(async () => {
  await transactionStore.loadTransactions()
  isLoading.value = false
})
</script>
