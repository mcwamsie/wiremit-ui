<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-show="true" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="!preventClose && handleCancel()"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl card-shadow max-w-md w-full p-6 transform transition-all"
            @click.stop
          >
            <!-- Close Button -->
            <button
              v-if="showCloseButton && !preventClose"
              @click="handleCancel"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X class="w-6 h-6" />
            </button>

            <!-- Content -->
            <div class="text-center">
              <!-- Icon -->
              <div class="mx-auto mb-4">
                <div
                  class="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  :class="getIconContainerClass()"
                >
                  <component
                    :is="getIcon()"
                    class="w-8 h-8"
                    :class="getIconClass()"
                  />
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-semibold text-gray-900 mb-3">
                {{ title }}
              </h3>

              <!-- Message -->
              <div class="text-gray-600 mb-6 leading-relaxed">
                <p v-if="typeof message === 'string'">{{ message }}</p>
                <div v-else-if="Array.isArray(message)" class="space-y-2">
                  <p v-for="(msg, index) in message" :key="index">{{ msg }}</p>
                </div>
                <div v-else-if="message && typeof message === 'object'">
                  <div class="text-left bg-gray-50 rounded-lg p-3">
                    <ul class="text-sm space-y-1">
                      <li v-for="(value, key) in message" :key="key" class="flex">
                        <span class="font-medium text-gray-700 mr-2">{{ formatKey(key) }}:</span>
                        <span class="text-gray-600">{{ value }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Warning/Info Box -->
              <div v-if="showWarning" class="mb-6 p-4 rounded-lg" :class="getWarningClass()">
                <div class="flex items-start space-x-3">
                  <component
                    :is="getWarningIcon()"
                    class="w-5 h-5 mt-0.5"
                    :class="getWarningIconClass()"
                  />
                  <div class="text-left">
                    <p class="font-medium text-sm" :class="getWarningTextClass()">
                      {{ warningTitle }}
                    </p>
                    <p v-if="warningMessage" class="text-sm mt-1" :class="getWarningTextClass()">
                      {{ warningMessage }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Additional Confirmation for Destructive Actions -->
              <div v-if="requiresTypeConfirmation" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Type "{{ confirmationText }}" to confirm:
                </label>
                <input
                  v-model="typeConfirmation"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': showTypeError }"
                  :placeholder="confirmationText"
                  @input="validateTypeConfirmation"
                >
                <p v-if="showTypeError" class="text-red-500 text-sm mt-1 text-left">
                  Please type "{{ confirmationText }}" exactly as shown
                </p>
              </div>

              <!-- Checkbox Confirmation -->
              <div v-if="requiresCheckbox" class="mb-6">
                <div class="flex items-start space-x-3 text-left">
                  <input
                    id="confirm-checkbox"
                    v-model="checkboxConfirmed"
                    type="checkbox"
                    class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  >
                  <label for="confirm-checkbox" class="text-sm text-gray-700">
                    {{ checkboxText }}
                  </label>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col-reverse sm:flex-row sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                <!-- Cancel Button -->
                <button
                  @click="handleCancel"
                  :disabled="isLoading"
                  class="w-full sm:w-auto btn-secondary flex items-center justify-center space-x-2"
                >
                  <X class="w-4 h-4" />
                  <span>{{ cancelText }}</span>
                </button>

                <!-- Confirm Button -->
                <button
                  @click="handleConfirm"
                  :disabled="isLoading || !canConfirm"
                  class="w-full sm:w-auto flex items-center justify-center space-x-2"
                  :class="getConfirmButtonClass()"
                >
                  <span v-if="!isLoading" class="flex items-center space-x-2">
                    <component :is="getConfirmIcon()" class="w-4 h-4" />
                    <span>{{ confirmText }}</span>
                  </span>
                  <div v-else class="flex items-center space-x-2">
                    <Loader2 class="w-4 h-4 animate-spin" />
                    <span>{{ loadingText }}</span>
                  </div>
                </button>
              </div>

              <!-- Footer Info -->
              <div v-if="footerInfo" class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-xs text-gray-500">{{ footerInfo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  Trash2,
  Check,
  Shield,
  Loader2,
  Ban,
} from 'lucide-vue-next'

// Props
interface Props {
  title?: string
  message?: string | string[] | Record<string, string>
  confirmText?: string
  cancelText?: string
  loadingText?: string
  isDestructive?: boolean
  type?: 'warning' | 'danger' | 'info' | 'question'
  showCloseButton?: boolean
  preventClose?: boolean
  requiresTypeConfirmation?: boolean
  confirmationText?: string
  requiresCheckbox?: boolean
  checkboxText?: string
  showWarning?: boolean
  warningTitle?: string
  warningMessage?: string
  footerInfo?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  isDestructive: false,
  type: 'question',
  showCloseButton: true,
  preventClose: false,
  requiresTypeConfirmation: false,
  confirmationText: 'DELETE',
  requiresCheckbox: false,
  checkboxText: 'I understand this action cannot be undone',
  showWarning: false,
  warningTitle: 'Warning',
  warningMessage: ''
})

// Emits
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// Reactive state
const isLoading = ref<boolean>(false)
const typeConfirmation = ref<string>('')
const checkboxConfirmed = ref<boolean>(false)
const showTypeError = ref<boolean>(false)

// Computed
const canConfirm = computed(() => {
  if (props.requiresTypeConfirmation && typeConfirmation.value !== props.confirmationText) {
    return false
  }

  if (props.requiresCheckbox && !checkboxConfirmed.value) {
    return false
  }

  return true
})

// Methods
const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

const validateTypeConfirmation = (): void => {
  showTypeError.value = false
}

const getIcon = () => {
  if (props.icon) {
    // Custom icon mapping could go here
    return AlertCircle
  }

  switch (props.type) {
    case 'warning':
      return AlertTriangle
    case 'danger':
      return props.isDestructive ? Trash2 : AlertCircle
    case 'info':
      return Info
    case 'question':
    default:
      return HelpCircle
  }
}

const getIconContainerClass = (): string => {
  if (props.isDestructive || props.type === 'danger') {
    return 'bg-red-100'
  }

  switch (props.type) {
    case 'warning':
      return 'bg-yellow-100'
    case 'info':
      return 'bg-blue-100'
    case 'question':
    default:
      return 'bg-gray-100'
  }
}

const getIconClass = (): string => {
  if (props.isDestructive || props.type === 'danger') {
    return 'text-red-600'
  }

  switch (props.type) {
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    case 'question':
    default:
      return 'text-gray-600'
  }
}

const getConfirmButtonClass = (): string => {
  if (props.isDestructive || props.type === 'danger') {
    return 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  }

  return 'btn-primary'
}

const getConfirmIcon = () => {
  if (props.isDestructive) {
    return Trash2
  }

  switch (props.type) {
    case 'danger':
      return Ban
    case 'warning':
      return AlertTriangle
    default:
      return Check
  }
}

const getWarningClass = (): string => {
  if (props.isDestructive || props.type === 'danger') {
    return 'bg-red-50 border border-red-200'
  }

  switch (props.type) {
    case 'warning':
      return 'bg-yellow-50 border border-yellow-200'
    case 'info':
      return 'bg-blue-50 border border-blue-200'
    default:
      return 'bg-gray-50 border border-gray-200'
  }
}

const getWarningIcon = () => {
  if (props.isDestructive || props.type === 'danger') {
    return AlertCircle
  }

  switch (props.type) {
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return Shield
  }
}

const getWarningIconClass = (): string => {
  if (props.isDestructive || props.type === 'danger') {
    return 'text-red-500'
  }

  switch (props.type) {
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

const getWarningTextClass = (): string => {
  if (props.isDestructive || props.type === 'danger') {
    return 'text-red-800'
  }

  switch (props.type) {
    case 'warning':
      return 'text-yellow-800'
    case 'info':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}

const handleConfirm = async (): Promise<void> => {
  if (!canConfirm.value) {
    if (props.requiresTypeConfirmation && typeConfirmation.value !== props.confirmationText) {
      showTypeError.value = true
    }
    return
  }

  isLoading.value = true

  try {
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))

    emit('confirm')
  } finally {
    isLoading.value = false
  }
}

const handleCancel = (): void => {
  if (isLoading.value) return
  emit('cancel')
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
