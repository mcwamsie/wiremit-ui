<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Content -->
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-3 mb-2">
          <Home class="w-8 h-8 text-gray-700" />
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {{ firstName }}!
          </h1>
        </div>
        <p class="text-gray-600 text-lg">
          Send money safely to your children studying abroad
        </p>
      </div>
      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Sent -->
        <div class="bg-white rounded-xl card-shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <DollarSign class="w-8 h-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Sent</p>
              <p class="text-2xl font-bold text-gray-900">
                ${{ totalSent.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Transactions -->
        <div class="bg-white rounded-xl card-shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <BarChart3 class="w-8 h-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Transactions</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ transactionStore.transactions.length }}
              </p>
            </div>
          </div>
        </div>

        <!-- Success Rate -->
        <div class="bg-white rounded-xl card-shadow p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <CheckCircle class="w-8 h-8 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Success Rate</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ successRate }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Send Money Card -->
        <div class="bg-white rounded-xl card-shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Quick Send</h2>
            <Send class="w-6 h-6 text-wise-600" />
          </div>
          <p class="text-gray-600 mb-6">
            Send money to your children in the UK or South Africa with competitive rates.
          </p>
          <div class="space-y-4">
            <router-link
              to="/send"
              class="flex items-center justify-center space-x-2 w-full btn-primary"
            >
              <Send class="w-5 h-5" />
              <span>Send Money Now</span>
            </router-link>
            <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div class="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <MapPin class="w-4 h-4 text-gray-500" />
                <span>🇬🇧 UK: 10% fee</span>
              </div>
              <div class="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <MapPin class="w-4 h-4 text-gray-500" />
                <span>🇿🇦 SA: 20% fee</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl card-shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Activity class="w-6 h-6 text-wise-600" />
          </div>

          <div v-if="recentTransactions.length === 0" class="text-center py-8">
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <TrendingUp class="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <p class="text-gray-500 mb-4">No transactions yet</p>
            <router-link
              to="/send"
              class="inline-flex items-center space-x-1 text-wise-600 hover:text-wise-700 font-medium transition-colors"
            >
              <ArrowRight class="w-4 h-4" />
              <span>Send your first transfer</span>
            </router-link>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              @click="viewTransaction(transaction)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-wise-100 rounded-full flex items-center justify-center">
                  <span class="text-wise-600 text-sm">{{ getCurrencyFlag(transaction.currency) }}</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900">
                      ${{ transaction.amount }}
                    </p>
                    <ArrowRight class="w-3 h-3 text-gray-400" />
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatCurrency(transaction.convertedAmount, transaction.currency) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-1 text-xs text-gray-600">
                    <Calendar class="w-3 h-3" />
                    <span>{{ transaction.date }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  class="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full"
                  :class="transaction.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'"
                >
                  <component :is="transaction.status === 'Completed' ? CheckCircle : Clock" class="w-3 h-3" />
                  <span>{{ transaction.status }}</span>
                </span>
                <ExternalLink class="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <router-link
              to="/history"
              class="flex items-center justify-center space-x-1 text-wise-600 hover:text-wise-700 font-medium text-sm pt-2 transition-colors"
            >
              <History class="w-4 h-4" />
              <span>View all transactions</span>
              <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>

      <!-- Special Offers Carousel -->
      <div class="bg-white rounded-xl card-shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <Target class="w-6 h-6 text-wise-600" />
            <h2 class="text-xl font-semibold text-gray-900">Special Offers</h2>
          </div>
          <router-link
            to="/offers"
            class="flex items-center space-x-1 text-wise-600 hover:text-wise-700 font-medium text-sm transition-colors"
          >
            <span>View all</span>
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>

        <!-- Featured Carousel -->
        <div v-if="featuredOffers.length > 0" class="relative">
          <!-- Carousel Container -->
          <div class="overflow-hidden rounded-xl">
            <div
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <div v-for="offer in featuredOffers" :key="offer.id" class="w-full flex-shrink-0">
                <div
                  class="relative h-48 md:h-56 rounded-xl overflow-hidden text-white p-6 flex items-end"
                  :class="offer.bgClass"
                >
                  <!-- Background Pattern -->
                  <div class="absolute inset-0 opacity-10">
                    <div class="w-full h-full bg-gradient-to-br from-white to-transparent"></div>
                  </div>

                  <!-- Content -->
                  <div class="relative z-10 w-full">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                          <component :is="getOfferIcon(offer.type)" class="w-6 h-6" />
                          <span class="text-sm font-medium opacity-90">{{
                            getOfferTypeName(offer.type)
                          }}</span>
                        </div>
                        <h4 class="text-xl md:text-2xl font-bold mb-2">{{ offer.title }}</h4>
                        <p class="text-sm md:text-base opacity-90 mb-4">{{ offer.description }}</p>

                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-4">
                            <div v-if="offer.value" class="flex items-center space-x-1">
                              <DollarSign class="w-4 h-4" />
                              <span class="font-semibold">{{ formatOfferValue(offer) }}</span>
                            </div>
                            <div v-if="offer.validUntil" class="flex items-center space-x-1">
                              <Clock class="w-4 h-4" />
                              <span class="text-sm">Until {{ formatDate(offer.validUntil) }}</span>
                            </div>
                          </div>

                          <button
                            @click="claimOffer(offer)"
                            class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm"
                          >
                            Claim Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel Controls -->
          <div v-if="featuredOffers.length > 1" class="flex items-center justify-between mt-4">
            <!-- Dots Indicator -->
            <div class="flex space-x-2">
              <button
                v-for="(_, index) in featuredOffers"
                :key="index"
                @click="currentSlide = index"
                class="w-3 h-3 rounded-full transition-colors"
                :class="currentSlide === index ? 'bg-wise-600' : 'bg-gray-300'"
              ></button>
            </div>

            <!-- Navigation Arrows -->
            <div class="flex space-x-2">
              <button
                @click="previousSlide"
                class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft class="w-4 h-4 text-gray-600" />
              </button>
              <button
                @click="nextSlide"
                class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight class="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transactions'
import type { Transaction } from '@/types'
import {
  Home,
  DollarSign,
  BarChart3,
  CheckCircle,
  Send,
  MapPin,
  Activity,
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  History,
  Target,
  ChevronLeft,
  ChevronRight,
  Gift,
  UserPlus,
  Percent
} from 'lucide-vue-next'

// Custom Earn icon component
// const Earn = {
//   template: `
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//       <circle cx="12" cy="12" r="10"/>
//       <path d="M12 6v6l4 2"/>
//     </svg>
//   `
// }

// Stores
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

// Carousel state
const currentSlide = ref<number>(0)

// Mock offers data
const offers = ref([
  {
    id: '1',
    title: 'Get a Wise Debit Card',
    description: 'Order your Wise debit card and spend abroad at the real exchange rate with no hidden fees. Perfect for your children studying overseas.',
    type: 'promotion',
    value: 9,
    currency: 'USD',
    conditions: ['Valid for new card orders only', 'One-time fee waiver per customer', 'Card must be activated within 30 days'],
    validUntil: '2024-12-31',
    isActive: true,
    priority: 1,
    bgClass: 'bg-gradient-to-r from-blue-500 to-purple-600'
  },
  {
    id: '2',
    title: 'Refer Friends & Earn $50',
    description: 'Invite your friends to Wiremit and earn $50 when they send their first transfer of $200 or more. Help others discover better money transfers.',
    type: 'referral',
    value: 50,
    currency: 'USD',
    conditions: ['Friend must be a new Wiremit user', 'First transfer must be $200 or more', 'Bonus credited within 5 business days'],
    validUntil: '2024-12-31',
    isActive: true,
    priority: 2,
    bgClass: 'bg-gradient-to-r from-green-500 to-teal-600'
  },
  {
    id: '3',
    title: '5% Cashback on Large Transfers',
    description: 'Get 5% cashback on transfers over $1,000. The more you send, the more you save on your international money transfers.',
    type: 'cashback',
    value: 5,
    conditions: ['Minimum transfer amount: $1,000', 'Maximum cashback: $100 per month', 'Valid for GBP and ZAR transfers only'],
    validUntil: '2024-11-30',
    isActive: true,
    priority: 3,
    bgClass: 'bg-gradient-to-r from-orange-500 to-red-500'
  }
])

// Computed properties
const firstName = computed(() => {
  return authStore.user?.name?.split(' ')[0] || 'User'
})

const totalSent = computed(() => {
  return transactionStore.totalAmount
})

const successRate = computed(() => {
  const total = transactionStore.transactions.length
  if (total === 0) return 100

  const completed = transactionStore.completedTransactions.length
  return Math.round((completed / total) * 100)
})

const recentTransactions = computed(() => {
  return transactionStore.transactions.slice(0, 3)
})

const featuredOffers = computed(() => {
  return offers.value
    .filter((offer) => offer.isActive && offer.priority <= 3)
    .sort((a, b) => a.priority - b.priority)
})

// Methods
const getCurrencyFlag = (currency: string): string => {
  const flags: Record<string, string> = {
    'GBP': '🇬🇧',
    'ZAR': '🇿🇦',
    'USD': '🇺🇸',
    'EUR': '🇪🇺',
    'CAD': '🇨🇦',
    'AUD': '🇦🇺'
  }
  return flags[currency] || '💰'
}

const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    'GBP': '£',
    'ZAR': 'R',
    'USD': '$',
    'EUR': '€',
    'CAD': 'C$',
    'AUD': 'A$'
  }
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toLocaleString()}`
}

const viewTransaction = (transaction: Transaction): void => {
  // Navigate to transaction details or show modal
  console.log('Viewing transaction:', transaction.id)
}

// Carousel methods
const previousSlide = (): void => {
  currentSlide.value =
    currentSlide.value === 0 ? featuredOffers.value.length - 1 : currentSlide.value - 1
}

const nextSlide = (): void => {
  currentSlide.value =
    currentSlide.value === featuredOffers.value.length - 1 ? 0 : currentSlide.value + 1
}

// Offer helper methods
const getOfferIcon = (type: string) => {
  switch (type) {
    case 'cashback':
      return DollarSign
    case 'referral':
      return UserPlus
    case 'discount':
      return Percent
    case 'promotion':
    default:
      return Gift
  }
}

const getOfferTypeName = (type: string): string => {
  switch (type) {
    case 'cashback':
      return 'Cashback'
    case 'referral':
      return 'Referral'
    case 'discount':
      return 'Discount'
    case 'promotion':
    default:
      return 'Promotion'
  }
}

const formatOfferValue = (offer: { type: string; value: number; currency?: string }): string => {
  if (offer.type === 'cashback' || offer.type === 'discount') {
    return `${offer.value}%`
  } else if (offer.currency) {
    return `$${offer.value} ${offer.currency}`
  } else {
    return `$${offer.value}`
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const claimOffer = (offer: {
  id: string;
  title: string;
  description: string;
  type: string;
  value?: number;
  currency?: string;
  conditions?: string[];
  validUntil?: string;
  isActive: boolean;
  priority: number;
  bgClass: string;
}): void => {
  console.log('Claiming offer:', offer.id)
  // Add toast notification or redirect logic here
}

// Lifecycle
onMounted(() => {
  // Load initial data if needed

  // Auto-rotate carousel
  setInterval(() => {
    if (featuredOffers.value.length > 1) {
      nextSlide()
    }
  }, 5000)
})
</script>

<style scoped>
.wise-gradient {
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
}

.card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}


.text-wise-600 {
  color: #00d4aa;
}

.text-wise-700 {
  color: #00b894;
}

.bg-wise-100 {
  background-color: #e6faf7;
}

.hover\:text-wise-700:hover {
  color: #00b894;
}
</style>

