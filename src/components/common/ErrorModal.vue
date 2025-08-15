<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-show="true" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="!persistent && $emit('close')"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl card-shadow max-w-md w-full p-6 transform transition-all"
            @click.stop
          >
            <!-- Close Button -->
            <button
              v-if="!persistent"
              @click="$emit('close')"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X class="w-6 h-6" />
            </button>

            <!-- Content -->
            <div class="text-center">
              <!-- Error Icon -->
              <div class="mx-auto mb-4">
                <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle class="w-8 h-8 text-red-600" />
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-2xl font-semibold text-gray-900 mb-3">
                {{ title }}
              </h3>

              <!-- Message -->
              <div class="text-gray-600 mb-6 leading-relaxed">
                <p v-if="typeof message === 'string'">{{ message }}</p>
                <div v-else-if="Array.isArray(message)" class="space-y-2">
                  <p v-for="(msg, index) in message" :key="index">{{ msg }}</p>
                </div>
                <div v-else-if="message && typeof message === 'object'">
                  <div class="text-left bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 class="font-medium text-gray-900 mb-2">Error Details:</h4>
                    <ul class="text-sm space-y-1">
                      <li v-for="(value, key) in message" :key="key" class="flex">
                        <span class="font-medium text-gray-700 mr-2">{{ formatKey(key) }}:</span>
                        <span class="text-gray-600">{{ value }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Error Code (if provided) -->
              <div v-if="errorCode" class="mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Hash class="w-3 h-3 mr-1" />
                  Error Code: {{ errorCode }}
                </span>
              </div>

              <!-- Actions -->
              <div class="space-y-3">
                <!-- Retry Button -->
                <button
                  v-if="showRetry"
                  @click="handleRetry"
                  :disabled="isRetrying"
                  class="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <span v-if="!isRetrying" class="flex items-center space-x-2">
                    <RotateCcw class="w-5 h-5" />
                    <span>{{ retryText }}</span>
                  </span>
                  <div v-else class="flex items-center space-x-2">
                    <Loader2 class="w-5 h-5 animate-spin" />
                    <span>Retrying...</span>
                  </div>
                </button>

                <!-- Primary Action (Close/Dismiss) -->
                <button
                  @click="$emit('close')"
                  class="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <X class="w-5 h-5" />
                  <span>{{ closeText }}</span>
                </button>

                <!-- Additional Actions -->
                <div v-if="showContactSupport" class="pt-2">
                  <button
                    @click="contactSupport"
                    class="flex items-center justify-center space-x-1 mx-auto text-sm text-wise-600 hover:text-wise-700 transition-colors"
                  >
                    <HelpCircle class="w-4 h-4" />
                    <span>Contact Support</span>
                    <ExternalLink class="w-3 h-3" />
                  </button>
                </div>

                <!-- Report Bug -->
                <div v-if="showReportBug" class="pt-1">
                  <button
                    @click="reportBug"
                    class="flex items-center justify-center space-x-1 mx-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Bug class="w-4 h-4" />
                    <span>Report this issue</span>
                  </button>
                </div>
              </div>

              <!-- Technical Details (Collapsible) -->
              <div v-if="technicalDetails" class="mt-6 pt-4 border-t border-gray-200">
                <button
                  @click="showTechnicalDetails = !showTechnicalDetails"
                  class="flex items-center justify-center space-x-1 mx-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Code class="w-4 h-4" />
                  <span>{{ showTechnicalDetails ? 'Hide' : 'Show' }} technical details</span>
                  <ChevronDown
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': showTechnicalDetails }"
                  />
                </button>

                <Transition name="slide-down">
                  <div v-if="showTechnicalDetails" class="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                    <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">{{ technicalDetails }}</pre>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertCircle,
  X,
  RotateCcw,
  Loader2,
  HelpCircle,
  ExternalLink,
  Bug,
  Code,
  ChevronDown,
  Hash
} from 'lucide-vue-next'

// Props
interface Props {
  title?: string
  message?: string | string[] | Record<string, string>
  errorCode?: string
  showRetry?: boolean
  retryText?: string
  closeText?: string
  persistent?: boolean
  showContactSupport?: boolean
  showReportBug?: boolean
  technicalDetails?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  retryText: 'Try Again',
  closeText: 'Close',
  persistent: false,
  showRetry: false,
  showContactSupport: true,
  showReportBug: false
})

// Emits
const emit = defineEmits<{
  close: []
  retry: []
}>()

// Reactive state
const isRetrying = ref<boolean>(false)
const showTechnicalDetails = ref<boolean>(false)

// Methods
const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

const handleRetry = async (): Promise<void> => {
  if (isRetrying.value) return

  isRetrying.value = true

  try {
    // Emit retry event and wait a moment for visual feedback
    setTimeout(() => {
      isRetrying.value = false
      // The parent component should handle the actual retry logic
      // This component just provides the UI
    }, 1000)

    // Emit the retry event immediately
    emit('retry')
  } catch (error) {
    isRetrying.value = false
    console.error('Retry failed:', error)
  }
}

const contactSupport = (): void => {
  // Open support page or email client
  const supportEmail = 'support@wiremit.com'
  const subject = encodeURIComponent(`Error Report: ${props.title}`)
  const body = encodeURIComponent(`
Error Details:
- Title: ${props.title}
- Message: ${typeof props.message === 'string' ? props.message : JSON.stringify(props.message)}
- Error Code: ${props.errorCode || 'N/A'}
- Timestamp: ${new Date().toISOString()}
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}

Technical Details:
${props.technicalDetails || 'None provided'}

Please describe what you were doing when this error occurred:
[Please describe your actions here]
  `)

  window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`)
}

const reportBug = (): void => {
  // Open bug reporting system (e.g., GitHub issues, Jira, etc.)
  const bugReportUrl = 'https://github.com/wiremit/issues/new'
  const title = encodeURIComponent(`Bug Report: ${props.title}`)
  const body = encodeURIComponent(`
**Error Description:**
${typeof props.message === 'string' ? props.message : JSON.stringify(props.message)}

**Error Code:** ${props.errorCode || 'N/A'}

**Steps to Reproduce:**
1. [Please describe the steps]

**Expected Behavior:**
[Describe what should happen]

**Actual Behavior:**
[Describe what actually happened]

**Environment:**
- Browser: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

**Technical Details:**
\`\`\`
${props.technicalDetails || 'None provided'}
\`\`\`
  `)

  window.open(`${bugReportUrl}?title=${title}&body=${body}`, '_blank')
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}
</style>
