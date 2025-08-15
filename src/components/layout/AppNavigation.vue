<template>
  <nav class="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
    <!-- Desktop Navigation -->
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/dashboard" class="flex items-center">
          <img :src="WiremitLogo" alt="Wiremit" class="h-8" />
        </router-link>

        <!-- Desktop Navigation Links -->
        <div class="hidden lg:flex items-center space-x-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              isActiveRoute(item.path)
                ? 'text-wise-700 bg-wise-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="w-8 h-8 bg-wise-500 rounded-full flex items-center justify-center">
              <User class="w-4 h-4 text-white" />
            </div>
            <span class="hidden sm:block text-sm font-medium text-gray-700">
              {{ authStore.user?.name }}
            </span>
            <ChevronDown
              class="w-4 h-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showUserMenu }"
            />
          </button>

          <!-- User Dropdown Menu -->
          <Transition name="dropdown">
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ authStore.user?.name }}</p>
                <p class="text-sm text-gray-600">{{ authStore.user?.email }}</p>
              </div>

              <router-link
                to="/dashboard"
                @click="showUserMenu = false"
                class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BarChart3 class="w-4 h-4" />
                <span>Dashboard</span>
              </router-link>

              <button
                @click="handleLogout"
                class="w-full flex items-center space-x-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut class="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div class="lg:hidden border-t border-gray-200">
      <div class="flex">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors"
          :class="
            isActiveRoute(item.path)
              ? 'text-wise-700 bg-wise-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          "
        >
          <component :is="item.icon" class="w-6 h-6 mb-1" />
          <span>{{ item.name }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Home, Send, History, Target, User, ChevronDown, BarChart3, LogOut } from 'lucide-vue-next'
import WiremitLogo from '@/assets/logo.svg'
import type { NavItem } from '@/types'

// Router and stores
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Reactive state
const showUserMenu = ref<boolean>(false)

// Navigation items with Lucide icons
const navigationItems = ref<NavItem[]>([
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    requiresAuth: true,
  },
  {
    name: 'Send Money',
    path: '/send',
    icon: Send,
    requiresAuth: true,
  },
  {
    name: 'History',
    path: '/history',
    icon: History,
    requiresAuth: true,
  },
  {
    name: 'Offers',
    path: '/offers',
    icon: Target,
    requiresAuth: true,
  },
])

// Methods
const isActiveRoute = (path: string): boolean => {
  return route.path === path || (path === '/dashboard' && route.path === '/')
}

const handleLogout = async (): Promise<void> => {
  showUserMenu.value = false
  authStore.logout()
  await router.push('/login')
}

const handleClickOutside = (event: Event): void => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.router-link-active {
  color: var(--color-wise-700);
  background-color: var(--color-wise-50);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
