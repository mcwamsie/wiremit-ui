<template>
  <Teleport to="body">
    <!-- Toast Container -->
    <div
      class="fixed z-50 pointer-events-none"
      :class="getContainerPositionClass()"
    >
      <div class="flex flex-col space-y-3 p-4">
        <TransitionGroup
          :name="getTransitionName()"
          tag="div"
          class="flex flex-col space-y-3"
        >
          <div
            v-for="toast in visibleToasts"
            :key="toast.id"
            class="pointer-events-auto transform transition-all duration-300 ease-in-out"
            :class="getToastClass(toast)"
            @mouseenter="pauseTimer(toast.id)"
            @mouseleave="resumeTimer(toast.id)"
          >
            <!-- Toast Content -->
            <div class="flex items-start space-x-3 p-4 rounded-lg shadow-lg backdrop-blur-sm">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="getIconContainerClass(toast.type)"
                >
                  <component
                    :is="getIcon(toast.type)"
                    class="w-5 h-5"
                    :class="getIconClass(toast.type)"
                  />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <!-- Title -->
                <h4
                  class="text-sm font-semibold"
                  :class="getTitleClass(toast.type)"
                >
                  {{ toast.title }}
                </h4>

                <!-- Message -->
                <p
                  v-if="toast.message"
                  class="text-sm mt-1"
                  :class="getMessageClass(toast.type)"
                >
                  {{ toast.message }}
                </p>

                <!-- Actions -->
                <div v-if="toast.actions && toast.actions.length > 0" class="mt-3 flex space-x-2">
                  <button
                    v-for="(action, index) in toast.actions"
                    :key="index"
                    @click="handleAction(toast.id, action)"
                    class="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                    :class="getActionClass(toast.type, action.style)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>

              <!-- Close Button -->
              <div class="flex-shrink-0">
                <button
                  @click="removeToast(toast.id)"
                  class="p-1 rounded-full transition-colors"
                  :class="getCloseButtonClass(toast.type)"
                  aria-label="Close notification"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div
              v-if="showProgressBar && toast.duration && toast.duration > 0"
              class="h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden"
            >
              <div
                class="h-full transition-all duration-100 ease-linear"
                :class="getProgressBarClass(toast.type)"
                :style="{ width: getProgressWidth(toast) + '%' }"
              ></div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next'
import type { ToastNotification, ToastAction } from '@/types'

// Props
interface Props {
  toasts: ToastNotification[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
  showProgressBar?: boolean
  defaultDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5,
  showProgressBar: true,
  defaultDuration: 5000
})

// Emits
const emit = defineEmits<{
  remove: [id: string]
}>()

// Reactive state
const timers = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())
const pausedToasts = ref<Set<string>>(new Set())
const progressTimers = ref<Map<string, ReturnType<typeof setInterval>>>(new Map())
const progressValues = ref<Map<string, number>>(new Map())

// Computed
const visibleToasts = computed(() => {
  return props.toasts.slice(0, props.maxToasts)
})

// Methods
const getContainerPositionClass = (): string => {
  switch (props.position) {
    case 'top-left':
      return 'top-0 left-0'
    case 'top-right':
      return 'top-0 right-0'
    case 'top-center':
      return 'top-0 left-1/2 transform -translate-x-1/2'
    case 'bottom-left':
      return 'bottom-0 left-0'
    case 'bottom-right':
      return 'bottom-0 right-0'
    case 'bottom-center':
      return 'bottom-0 left-1/2 transform -translate-x-1/2'
    default:
      return 'top-0 right-0'
  }
}

const getTransitionName = (): string => {
  if (props.position.includes('right')) {
    return 'toast-right'
  } else if (props.position.includes('left')) {
    return 'toast-left'
  } else {
    return 'toast-center'
  }
}

const getToastClass = (toast: ToastNotification): string => {
  const baseClass = 'max-w-sm w-full'

  switch (toast.type) {
    case 'success':
      return `${baseClass} bg-white border-l-4 border-green-500`
    case 'error':
      return `${baseClass} bg-white border-l-4 border-red-500`
    case 'warning':
      return `${baseClass} bg-white border-l-4 border-yellow-500`
    case 'info':
      return `${baseClass} bg-white border-l-4 border-blue-500`
    default:
      return `${baseClass} bg-white border-l-4 border-gray-500`
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return Info
  }
}

const getIconContainerClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'bg-green-100'
    case 'error':
      return 'bg-red-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'info':
      return 'bg-blue-100'
    default:
      return 'bg-gray-100'
  }
}

const getIconClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const getTitleClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'text-green-900'
    case 'error':
      return 'text-red-900'
    case 'warning':
      return 'text-yellow-900'
    case 'info':
      return 'text-blue-900'
    default:
      return 'text-gray-900'
  }
}

const getMessageClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'text-green-700'
    case 'error':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'info':
      return 'text-blue-700'
    default:
      return 'text-gray-700'
  }
}

const getCloseButtonClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'text-green-400 hover:text-green-600 hover:bg-green-50'
    case 'error':
      return 'text-red-400 hover:text-red-600 hover:bg-red-50'
    case 'warning':
      return 'text-yellow-400 hover:text-yellow-600 hover:bg-yellow-50'
    case 'info':
      return 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'
    default:
      return 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
  }
}

const getActionClass = (type: string, style?: string): string => {
  const baseClass = 'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  if (style === 'primary') {
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`
      case 'error':
        return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
      case 'warning':
        return `${baseClass} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`
      case 'info':
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
      default:
        return `${baseClass} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`
    }
  } else if (style === 'destructive') {
    return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
  } else {
    // Secondary style
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500`
      case 'error':
        return `${baseClass} bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500`
      case 'warning':
        return `${baseClass} bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:ring-yellow-500`
      case 'info':
        return `${baseClass} bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500`
      default:
        return `${baseClass} bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-gray-500`
    }
  }
}

const getProgressBarClass = (type: string): string => {
  switch (type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'info':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

const getProgressWidth = (toast: ToastNotification): number => {
  return progressValues.value.get(toast.id) || 100
}

const startTimer = (toast: ToastNotification): void => {
  const duration = toast.duration || props.defaultDuration

  if (duration <= 0) return

  const timer = setTimeout(() => {
    removeToast(toast.id)
  }, duration)

  timers.value.set(toast.id, timer)

  // Start progress bar animation
  if (props.showProgressBar) {
    startProgressBar(toast.id, duration)
  }
}

const startProgressBar = (toastId: string, duration: number): void => {
  progressValues.value.set(toastId, 100)

  const interval = 50 // Update every 50ms
  const decrement = (100 / duration) * interval

  const progressTimer = setInterval(() => {
    const currentValue = progressValues.value.get(toastId) || 0
    const newValue = Math.max(0, currentValue - decrement)

    progressValues.value.set(toastId, newValue)

    if (newValue <= 0) {
      clearInterval(progressTimer)
      progressTimers.value.delete(toastId)
    }
  }, interval)

  progressTimers.value.set(toastId, progressTimer)
}

const clearTimer = (id: string): void => {
  const timer = timers.value.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.value.delete(id)
  }

  const progressTimer = progressTimers.value.get(id)
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimers.value.delete(id)
  }

  progressValues.value.delete(id)
}

const pauseTimer = (id: string): void => {
  pausedToasts.value.add(id)

  const progressTimer = progressTimers.value.get(id)
  if (progressTimer) {
    clearInterval(progressTimer)
  }
}

const resumeTimer = (id: string): void => {
  pausedToasts.value.delete(id)

  const toast = props.toasts.find(t => t.id === id)
  if (toast && props.showProgressBar) {
    const currentProgress = progressValues.value.get(id) || 0
    const remainingDuration = ((currentProgress / 100) * (toast.duration || props.defaultDuration))

    if (remainingDuration > 0) {
      startProgressBar(id, remainingDuration)
    }
  }
}

const removeToast = (id: string): void => {
  clearTimer(id)
  emit('remove', id)
}

const handleAction = (toastId: string, action: ToastAction): void => {
  action.action()

  // Optionally remove toast after action
  if (action.style !== 'secondary') {
    removeToast(toastId)
  }
}

// Watch for new toasts
const setupToastTimers = (): void => {
  props.toasts.forEach(toast => {
    if (!timers.value.has(toast.id) && !pausedToasts.value.has(toast.id)) {
      startTimer(toast)
    }
  })
}

// Lifecycle
onMounted(() => {
  setupToastTimers()
})

onUnmounted(() => {
  // Clear all timers
  timers.value.forEach(timer => clearTimeout(timer))
  progressTimers.value.forEach(timer => clearInterval(timer))
})

// Watch for changes in toasts
const unwatchToasts = watch(
  () => props.toasts,
  () => {
    setupToastTimers()
  },
  { deep: true }
)

onUnmounted(() => {
  unwatchToasts()
})
</script>

<style scoped>
/* Toast transitions - Right side */
.toast-right-enter-active,
.toast-right-leave-active {
  transition: all 0.3s ease;
}

.toast-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-right-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-right-move {
  transition: transform 0.3s ease;
}

/* Toast transitions - Left side */
.toast-left-enter-active,
.toast-left-leave-active {
  transition: all 0.3s ease;
}

.toast-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-left-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.95);
}

.toast-left-move {
  transition: transform 0.3s ease;
}

/* Toast transitions - Center */
.toast-center-enter-active,
.toast-center-leave-active {
  transition: all 0.3s ease;
}

.toast-center-enter-from {
  opacity: 0;
  transform: translateY(-50%) scale(0.95);
}

.toast-center-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.95);
}

.toast-center-move {
  transition: transform 0.3s ease;
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(10px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
}
</style>
