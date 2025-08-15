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
              <div class="flex items-center space-x-3 mb-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="getOfferIconBg(offer.type)"
                >
                  <component
                    :is="getOfferIcon(offer.type)"
                    class="w-6 h-6"
                    :class="getOfferIconColor(offer.type)"
                  />
                </div>
                <div>
                  <h3 class="text-2xl font-semibold text-gray-900">{{ offer.title }}</h3>
                  <span
                    class="text-sm px-3 py-1 rounded-full font-medium"
                    :class="getOfferTypeClass(offer.type)"
                  >
                    {{ getOfferTypeName(offer.type) }}
                  </span>
                </div>
              </div>

              <!-- Offer Value -->
              <div v-if="offer.value" class="flex items-center justify-between mb-4">
                <div class="text-3xl font-bold text-wise-600">
                  {{ formatOfferValue(offer) }}
                </div>
                <div v-if="offer.validUntil" class="flex items-center space-x-1 text-gray-500">
                  <Clock class="w-4 h-4" />
                  <span class="text-sm">Expires {{ formatDate(offer.validUntil) }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3">About this offer</h4>
              <p class="text-gray-600 leading-relaxed">{{ offer.description }}</p>
            </div>

            <!-- Conditions -->
            <div v-if="offer.conditions && offer.conditions.length > 0" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Info class="w-5 h-5 text-gray-400" />
                <span>Terms & Conditions</span>
              </h4>
              <ul class="space-y-2">
                <li
                  v-for="(condition, index) in offer.conditions"
                  :key="index"
                  class="flex items-start space-x-2 text-gray-600"
                >
                  <CheckCircle class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span class="text-sm">{{ condition }}</span>
                </li>
              </ul>
            </div>

            <!-- Usage Information -->
            <div v-if="offer.maxUsage && offer.usageCount !== undefined" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Users class="w-5 h-5 text-gray-400" />
                <span>Availability</span>
              </h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">Remaining claims</span>
                  <span class="font-semibold text-gray-900">{{ offer.maxUsage - offer.usageCount }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-wise-600 h-2 rounded-full transition-all"
                    :style="{ width: `${((offer.maxUsage - offer.usageCount) / offer.maxUsage) * 100}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ offer.usageCount }} of {{ offer.maxUsage }} claimed
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3">
              <button
                @click="handleClaimOffer"
                :disabled="!offer.isActive || (offer.maxUsage && offer.usageCount && offer.usageCount >= offer.maxUsage)"
                class="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Gift class="w-5 h-5" />
                <span>{{ getClaimButtonText() }}</span>
              </button>
              <button
                @click="$emit('close')"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import {
  X,
  Clock,
  Info,
  CheckCircle,
  Users,
  Gift,
  DollarSign,
  UserPlus,
  Percent
} from 'lucide-vue-next'
import type { OfferData, NotificationType } from '@/types'

// Props
const props = defineProps<{
  offer: OfferData
}>()

// Emits
const emit = defineEmits<{
  close: []
  claim: [offer: OfferData]
}>()

// Injected functions
const addToast = inject<(toast: {
  type: NotificationType
  title: string
  message: string
  duration?: number
}) => void>('addToast')

// Helper functions
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
    year: 'numeric'
  })
}

const getClaimButtonText = (): string => {
  if (!props.offer.isActive) {
    return 'Offer Expired'
  }
  if (props.offer.maxUsage && props.offer.usageCount && props.offer.usageCount >= props.offer.maxUsage) {
    return 'Fully Claimed'
  }
  return 'Claim Offer'
}

const handleClaimOffer = (): void => {
  if (!props.offer.isActive || (props.offer.maxUsage && props.offer.usageCount && props.offer.usageCount >= props.offer.maxUsage)) {
    return
  }

  emit('claim', props.offer)
  emit('close')

  if (addToast) {
    addToast({
      type: 'success',
      title: 'Offer Claimed!',
      message: `You have successfully claimed the "${props.offer.title}" offer.`,
      duration: 5000
    })
  }
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
