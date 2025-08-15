<template>
  <div class="bg-white rounded-2xl card-shadow">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Target class="w-8 h-8 text-wise-600" />
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">Special Offers</h2>
            <p class="text-gray-600 text-sm mt-1">
              Exclusive deals and promotions for Wiremit users
            </p>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="flex items-center space-x-3">
          <div class="relative">
            <select v-model="selectedFilter" class="input-field py-2 pr-8 text-sm">
              <option value="all">All Offers</option>
              <option value="active">Active</option>
              <option value="limited">Limited Time</option>
              <option value="referral">Referral</option>
              <option value="cashback">Cashback</option>
            </select>
          </div>

          <button
            @click="refreshOffers"
            :disabled="isLoading"
            class="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh offers"
          >
            <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="flex items-center space-x-3">
        <Loader2 class="w-6 h-6 animate-spin text-wise-600" />
        <span class="text-gray-600">Loading offers...</span>
      </div>
    </div>

    <!-- Offers Content -->
    <div v-else class="p-6">
      <!-- All Offers Grid -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">All Offers</h3>
          <span class="text-sm text-gray-500">{{ filteredOffers.length }} offers available</span>
        </div>

        <!-- Empty State -->
        <div v-if="filteredOffers.length === 0" class="text-center py-12">
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Target class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No offers available</h3>
          <p class="text-gray-600 mb-4">Check back later for new promotions and deals</p>
          <button @click="refreshOffers" class="btn-primary">
            <RefreshCw class="w-4 h-4 mr-2" />
            Refresh Offers
          </button>
        </div>

        <!-- Offers Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="offer in filteredOffers"
            :key="offer.id"
            class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
            @click="viewOfferDetails(offer)"
          >
            <!-- Offer Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getOfferIconBg(offer.type)"
                >
                  <component
                    :is="getOfferIcon(offer.type)"
                    class="w-5 h-5"
                    :class="getOfferIconColor(offer.type)"
                  />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ offer.title }}</h4>
                  <span
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    :class="getOfferTypeClass(offer.type)"
                  >
                    {{ getOfferTypeName(offer.type) }}
                  </span>
                </div>
              </div>

              <!-- Offer Value -->
              <div v-if="offer.value" class="text-right">
                <div class="text-lg font-bold text-wise-600">
                  {{ formatOfferValue(offer) }}
                </div>
                <div v-if="offer.type === 'cashback'" class="text-xs text-gray-500">cashback</div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ offer.description }}</p>

            <!-- Conditions -->
            <div v-if="offer.conditions && offer.conditions.length > 0" class="mb-4">
              <div class="flex items-center space-x-1 mb-2">
                <Info class="w-4 h-4 text-gray-400" />
                <span class="text-xs font-medium text-gray-600">Conditions:</span>
              </div>
              <ul class="text-xs text-gray-600 space-y-1">
                <li
                  v-for="(condition, index) in offer.conditions.slice(0, 2)"
                  :key="index"
                  class="flex items-start space-x-1"
                >
                  <span class="text-gray-400 mt-1">•</span>
                  <span>{{ condition }}</span>
                </li>
                <li v-if="offer.conditions.length > 2" class="text-gray-400">
                  +{{ offer.conditions.length - 2 }} more condition{{
                    offer.conditions.length > 3 ? 's' : ''
                  }}
                </li>
              </ul>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 text-xs text-gray-500">
                <div v-if="offer.validUntil" class="flex items-center space-x-1">
                  <Clock class="w-3 h-3" />
                  <span>Expires {{ formatDate(offer.validUntil) }}</span>
                </div>
                <div
                  v-if="offer.maxUsage && offer.usageCount !== undefined"
                  class="flex items-center space-x-1"
                >
                  <Users class="w-3 h-3" />
                  <span>{{ offer.maxUsage - offer.usageCount }} left</span>
                </div>
              </div>

              <button
                @click.stop="claimOffer(offer)"
                class="text-wise-600 hover:text-wise-700 font-medium text-sm transition-colors"
              >
                Claim →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Offer Details Modal -->
    <OfferDetailsModal
      v-if="selectedOffer"
      :offer="selectedOffer"
      @close="selectedOffer = null"
      @claim="claimOffer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import {
  Target,
  RefreshCw,
  Loader2,
  DollarSign,
  Clock,
  Info,
  Users,
  Gift,
  UserPlus,
  Percent,
} from 'lucide-vue-next'
import OfferDetailsModal from '@/components/common/OfferDetailsModal.vue'
import type { OfferData, NotificationType } from '@/types'

// Injected functions
const addToast =
  inject<
    (toast: { type: NotificationType; title: string; message: string; duration?: number }) => void
  >('addToast')

// Reactive state
const isLoading = ref<boolean>(false)
const selectedFilter = ref<string>('all')
const selectedOffer = ref<OfferData | null>(null)

// Mock offers data
const offers = ref<OfferData[]>([
  {
    id: '1',
    title: 'Get a Wise Debit Card',
    description:
      'Order your Wise debit card and spend abroad at the real exchange rate with no hidden fees. Perfect for your children studying overseas.',
    type: 'promotion',
    value: 9,
    currency: 'USD',
    conditions: [
      'Valid for new card orders only',
      'One-time fee waiver per customer',
      'Card must be activated within 30 days',
    ],
    validUntil: '2024-12-31',
    isActive: true,
    priority: 1,
    bgClass: 'bg-gradient-to-r from-blue-500 to-purple-600',
  },
  {
    id: '2',
    title: 'Refer Friends & Earn $50',
    description:
      'Invite your friends to Wiremit and earn $50 when they send their first transfer of $200 or more. Help others discover better money transfers.',
    type: 'referral',
    value: 50,
    currency: 'USD',
    conditions: [
      'Friend must be a new Wiremit user',
      'First transfer must be $200 or more',
      'Bonus credited within 5 business days',
      'Maximum 10 referrals per month',
    ],
    validUntil: '2024-12-31',
    isActive: true,
    priority: 2,
    bgClass: 'bg-gradient-to-r from-green-500 to-teal-600',
  },
  {
    id: '3',
    title: '5% Cashback on Large Transfers',
    description:
      'Get 5% cashback on transfers over $1,000. The more you send, the more you save on your international money transfers.',
    type: 'cashback',
    value: 5,
    conditions: [
      'Minimum transfer amount: $1,000',
      'Maximum cashback: $100 per month',
      'Valid for GBP and ZAR transfers only',
      'Cashback credited within 7 days',
    ],
    validUntil: '2024-11-30',
    isActive: true,
    priority: 3,
    bgClass: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    id: '4',
    title: 'Student Discount Program',
    description:
      'Special rates for students! Get reduced fees on all transfers when you verify your student status.',
    type: 'discount',
    value: 25,
    conditions: [
      'Valid student ID required',
      'Reduced fees on all transfers',
      'Annual verification required',
    ],
    validUntil: '2025-06-30',
    isActive: true,
    priority: 4,
    bgClass: 'bg-gradient-to-r from-indigo-500 to-blue-600',
  },
  {
    id: '5',
    title: 'Black Friday Special',
    description:
      'Limited time offer! Zero fees on all transfers during Black Friday weekend. Save big on your money transfers.',
    type: 'promotion',
    value: 100,
    conditions: [
      'Valid November 24-27, 2024',
      'All transfer fees waived',
      'No minimum amount required',
      'Limited time only',
    ],
    validUntil: '2024-11-27',
    isActive: true,
    priority: 5,
    bgClass: 'bg-gradient-to-r from-gray-800 to-gray-900',
  },
])

// Computed
const filteredOffers = computed(() => {
  let filtered = offers.value.filter((offer) => offer.isActive)

  if (selectedFilter.value !== 'all') {
    switch (selectedFilter.value) {
      case 'active':
        filtered = filtered.filter((offer) => offer.isActive)
        break
      case 'limited':
        const now = new Date()
        filtered = filtered.filter((offer) => offer.validUntil && new Date(offer.validUntil) > now)
        break
      case 'referral':
        filtered = filtered.filter((offer) => offer.type === 'referral')
        break
      case 'cashback':
        filtered = filtered.filter((offer) => offer.type === 'cashback')
        break
    }
  }

  return filtered.sort((a, b) => a.priority - b.priority)
})

// Methods
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

const getOfferIconBg = (type: string): string => {
  switch (type) {
    case 'cashback':
      return 'bg-green-100'
    case 'referral':
      return 'bg-blue-100'
    case 'discount':
      return 'bg-purple-100'
    case 'promotion':
    default:
      return 'bg-orange-100'
  }
}

const getOfferIconColor = (type: string): string => {
  switch (type) {
    case 'cashback':
      return 'text-green-600'
    case 'referral':
      return 'text-blue-600'
    case 'discount':
      return 'text-purple-600'
    case 'promotion':
    default:
      return 'text-orange-600'
  }
}

const getOfferTypeClass = (type: string): string => {
  switch (type) {
    case 'cashback':
      return 'bg-green-100 text-green-800'
    case 'referral':
      return 'bg-blue-100 text-blue-800'
    case 'discount':
      return 'bg-purple-100 text-purple-800'
    case 'promotion':
    default:
      return 'bg-orange-100 text-orange-800'
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

const formatOfferValue = (offer: OfferData): string => {
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
    year: 'numeric',
  })
}

const refreshOffers = async (): Promise<void> => {
  isLoading.value = true

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    addToast?.({
      type: 'success',
      title: 'Offers Updated',
      message: 'Latest offers have been loaded successfully.',
      duration: 3000,
    })
  } catch (error: unknown) {
    console.error('Error refreshing offers:', error)
    addToast?.({
      type: 'error',
      title: 'Update Failed',
      message: 'Unable to refresh offers. Please try again.',
      duration: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

const viewOfferDetails = (offer: OfferData): void => {
  selectedOffer.value = offer
}

const claimOffer = (offer: OfferData): void => {
  // Simulate claiming offer
  addToast?.({
    type: 'success',
    title: 'Offer Claimed!',
    message: `You've successfully claimed the "${offer.title}" offer.`,
    duration: 5000,
  })

  selectedOffer.value = null
}

// Component lifecycle
onMounted(() => {
  // Component initialization if needed
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -moz-line-clamp: 3;
  line-clamp: 3;
  -ms-line-clamp: 3;
  -ms-box-orient: vertical;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
