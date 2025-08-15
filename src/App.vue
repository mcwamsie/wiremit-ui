<template>
  <div id="app-scroll-container" class="min-h-screen bg-gray-50">
    <!-- Global Loading Overlay -->
    <Transition name="fade">
      <div
        v-if="isGlobalLoading"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 flex items-center space-x-4 card-shadow">
          <Loader2 class="w-8 h-8 animate-spin text-wise-600" />
          <span class="text-gray-700 font-medium">{{ loadingMessage }}</span>
        </div>
      </div>
    </Transition>

    <!-- Navigation (only show when authenticated and not on auth pages) -->
    <AppNavigation v-if="shouldShowNavigation" />

    <!-- Main Content Area -->
    <main class="min-h-screen" :class="mainContentClass">
      <!-- Route Loading Indicator -->
      <Transition name="fade">
        <div v-if="isRouteLoading" class="fixed top-0 left-0 right-0 z-40">
          <div class="h-1 bg-wise-600 animate-pulse"></div>
        </div>
      </Transition>

      <!-- Router View with Page Transitions -->
      <router-view v-slot="{ Component, route }">
        <Transition
          :name="getTransitionName(route)"
          mode="out-in"
          @before-enter="onBeforeEnter"
          @after-enter="onAfterEnter"
        >
          <Suspense>
            <template #default>
              <component :is="Component" :key="route.path" class="route-content" />
            </template>
            <template #fallback>
              <div class="flex items-center justify-center min-h-screen">
                <div class="flex items-center space-x-3">
                  <Loader2 class="w-6 h-6 animate-spin text-wise-600" />
                  <span class="text-gray-600">Loading page...</span>
                </div>
              </div>
            </template>
          </Suspense>
        </Transition>
      </router-view>
    </main>

    <!-- Global Modals -->
    <Teleport to="body">
      <!-- Success Modal -->
      <SuccessModal
        v-if="showSuccessModal"
        :title="successModalData.title"
        :message="successModalData.message"
        @close="closeSuccessModal"
      >
        <template #actions>
          <slot name="success-actions"></slot>
        </template>
      </SuccessModal>

      <!-- Error Modal -->
      <ErrorModal
        v-if="showErrorModal"
        :title="errorModalData.title"
        :message="errorModalData.message"
        @close="closeErrorModal"
        @retry="onErrorRetry"
      />

      <!-- Confirmation Modal -->
      <ConfirmationModal
        v-if="showConfirmationModal"
        :title="confirmationModalData.title"
        :message="confirmationModalData.message"
        :confirmText="confirmationModalData.confirmText"
        :cancelText="confirmationModalData.cancelText"
        :isDestructive="confirmationModalData.isDestructive"
        @confirm="onConfirmationConfirm"
        @cancel="closeConfirmationModal"
      />
    </Teleport>

    <!-- Offline Banner -->
    <Transition name="slide-down">
      <div
        v-if="!isOnline"
        class="fixed top-0 left-0 right-0 bg-red-600 text-white p-3 text-center z-50"
      >
        <div class="flex items-center justify-center space-x-2">
          <WifiOff class="w-5 h-5" />
          <span class="font-medium">You are currently offline</span>
        </div>
      </div>
    </Transition>

    <!-- Toast Notifications -->
    <ToastContainer :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transactions'
import { Loader2, WifiOff } from 'lucide-vue-next'
import type { ToastNotification } from '@/types'

// Components
import AppNavigation from '@/components/layout/AppNavigation.vue'
import SuccessModal from '@/components/common/SuccessModal.vue'
import ErrorModal from '@/components/common/ErrorModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

// Router and stores
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

// Global loading state
const isGlobalLoading = ref<boolean>(false)
const loadingMessage = ref<string>('Loading...')
const isRouteLoading = ref<boolean>(false)

// Online/offline state
const isOnline = ref<boolean>(navigator.onLine)

// Modal states
const showSuccessModal = ref<boolean>(false)
const showErrorModal = ref<boolean>(false)
const showConfirmationModal = ref<boolean>(false)

// Modal data
const successModalData = ref<{
  title: string
  message: string
}>({
  title: '',
  message: '',
})

const errorModalData = ref<{
  title: string
  message: string
  retry?: () => void
}>({
  title: '',
  message: '',
})

const confirmationModalData = ref<{
  title: string
  message: string
  confirmText: string
  cancelText: string
  isDestructive: boolean
  onConfirm?: () => void
  resolve?: (value: boolean) => void
}>({
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isDestructive: false,
})

// Toast notifications
const toasts = ref<ToastNotification[]>([])

// Computed properties
const shouldShowNavigation = computed(() => {
  return (
    authStore.isAuthenticated && 
    !(route.meta?.layout && typeof route.meta.layout === 'string' && route.meta.layout.includes('auth')) && 
    route.name !== 'NotFound'
  )
})

const mainContentClass = computed(() => {
  const classes = []

  if (shouldShowNavigation.value) {
    classes.push('pt-[134px] lg:pt-16') // Account for fixed navigation
  }

  if (!isOnline.value) {
    classes.push('pt-12') // Account for offline banner
  }

  return classes.join(' ')
})

// Methods
const showGlobalLoading = (loading: boolean, message: string = 'Loading...'): void => {
  isGlobalLoading.value = loading
  loadingMessage.value = message
}

const showSuccess = (title: string, message: string): void => {
  successModalData.value = { title, message }
  showSuccessModal.value = true
}

const showError = (title: string, message: string, retry?: () => void): void => {
  errorModalData.value = { title, message, retry }
  showErrorModal.value = true
}

const showConfirmation = (options: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  onConfirm?: () => void
}): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmationModalData.value = {
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      isDestructive: options.isDestructive || false,
      onConfirm: options.onConfirm,
    }

    showConfirmationModal.value = true

    // Store the resolve function to call later
    confirmationModalData.value.resolve = resolve
  })
}

const addToast = (toast: {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}): void => {
  const id = Date.now().toString()
  const timestamp = Date.now()
  toasts.value.push({
    id,
    ...toast,
    duration: toast.duration || 5000,
    timestamp,
  })

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id)
  }, toast.duration || 5000)
}

const removeToast = (id: string): void => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const closeSuccessModal = (): void => {
  showSuccessModal.value = false
}

const closeErrorModal = (): void => {
  showErrorModal.value = false
}

const closeConfirmationModal = (): void => {
  showConfirmationModal.value = false
  if (confirmationModalData.value.resolve) {
    confirmationModalData.value.resolve(false)
  }
}

const onErrorRetry = (): void => {
  if (errorModalData.value.retry) {
    errorModalData.value.retry()
  }
  closeErrorModal()
}

const onConfirmationConfirm = (): void => {
  if (confirmationModalData.value.onConfirm) {
    confirmationModalData.value.onConfirm()
  }

  if (confirmationModalData.value.resolve) {
    confirmationModalData.value.resolve(true)
  }

  showConfirmationModal.value = false
}

// Page transition logic
const getTransitionName = (route: RouteLocationNormalized): string => {
  // Different transitions based on route
  if (route.meta?.layout && typeof route.meta.layout === 'string' && route.meta.layout.includes('auth')) {
    return 'auth-transition'
  }

  return 'page-transition'
}

const onBeforeEnter = (): void => {
  isRouteLoading.value = true
}

const onAfterEnter = (): void => {
  isRouteLoading.value = false
}

// Online/offline detection
const handleOnline = (): void => {
  isOnline.value = true
  addToast({
    type: 'success',
    title: 'Connection Restored',
    message: 'You are back online',
  })
}

const handleOffline = (): void => {
  isOnline.value = false
}

// Provide global functions to child components
provide('showGlobalLoading', showGlobalLoading)
provide('showSuccess', showSuccess)
provide('showError', showError)
provide('showConfirmation', showConfirmation)
provide('addToast', addToast)

// Authentication state watcher
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated, wasAuthenticated) => {
    if (isAuthenticated && !wasAuthenticated) {
      // User just logged in
      transactionStore.loadTransactions()

      // Check for redirect query parameter
      const redirectPath = route.query.redirect as string
      if (redirectPath) {
        router.push(redirectPath)
      }
    } else if (!isAuthenticated && wasAuthenticated) {
      // User just logged out
      router.push('/login')
    }
  },
)

// Lifecycle hooks
onMounted(() => {
  // Check authentication on app load
  authStore.checkAuth()

  // Setup online/offline listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Handle initial route based on auth state
  const currentRoute = router.currentRoute.value
  if (
    authStore.isAuthenticated &&
    (currentRoute.path === '/login' || currentRoute.path === '/register')
  ) {
    router.push('/dashboard')
  } else if (!authStore.isAuthenticated && currentRoute.meta?.requiresAuth) {
    router.push('/login')
  }

  // Global error handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    showError('Unexpected Error', 'An unexpected error occurred. Please try again.')
  })
})

onUnmounted(() => {
  // Cleanup event listeners
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
/* Page transition animations */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Auth page transitions */
.auth-transition-enter-active,
.auth-transition-leave-active {
  transition: all 0.4s ease;
}

.auth-transition-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.auth-transition-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide down transition for offline banner */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

/* Route content styling */
.route-content {
  min-height: calc(100vh - 4rem);
}
</style>
