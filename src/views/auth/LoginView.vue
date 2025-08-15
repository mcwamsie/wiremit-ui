<template>
  <div class="flex items-center justify-center route-content">
    <div class="bg-white rounded-xl card-shadow p-8 w-full max-w-md mx-auto">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <img :src="WiremitLogo" alt="Wiremit" class="h-12" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p class="text-gray-600">Sign in to your Wiremit account</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            :class="['input-field', errors.email ? 'input-error' : '']"
            placeholder="Enter your email address"
            required
            autocomplete="email"
            :disabled="authStore.isLoading"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              :class="['input-field pr-12', errors.password ? 'input-error' : '']"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
              :disabled="authStore.isLoading"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              :disabled="authStore.isLoading"
            >
              <Eye v-if="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">
            {{ errors.password }}
          </p>
        </div>

        <!-- General Error -->
        <div v-if="errors.general" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <AlertCircle class="h-5 w-5 text-red-500" />
            <p class="text-red-600 text-sm">{{ errors.general }}</p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.isLoading || !isFormValid"
          class="btn-primary w-full flex items-center justify-center"
        >
          <Loader2 v-if="authStore.isLoading" class="w-5 h-5 animate-spin mr-2" />
          {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Demo Credentials -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div class="flex items-start space-x-3">
          <Info class="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 class="font-medium text-blue-800 mb-2">Demo Account</h4>
            <p class="text-sm text-blue-700 mb-2">Use these credentials to test the application:</p>
            <div class="text-sm text-blue-600 space-y-1">
              <p><strong>Email:</strong> demo@wiremit.com</p>
              <p><strong>Password:</strong> demo123</p>
            </div>
            <button
              type="button"
              @click="fillDemoCredentials"
              class="mt-2 flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
              :disabled="authStore.isLoading"
            >
              <UserCheck class="w-4 h-4" />
              <span>Fill demo credentials</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Switch to Register -->
      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Don't have an account?
          <router-link
            to="/register"
            class="text-wise-600 hover:text-wise-700 font-medium"
            :disabled="authStore.isLoading"
          >
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword } from '@/utils/validation'
import { Loader2, AlertCircle, Info, UserCheck, Eye, EyeOff } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import WiremitLogo from '@/assets/logo.svg'

const router = useRouter()
// Emits
defineEmits(['switch-to-register'])

// Store
const authStore = useAuthStore()

// Reactive state
const form = ref({
  email: '',
  password: '',
})

const errors = ref<Record<string, string>>({})
const showPassword = ref<boolean>(false)

// Computed
const isFormValid = computed(() => {
  return form.value.email && form.value.password && !errors.value.email && !errors.value.password
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}

  // Email validation
  const emailError = validateEmail(form.value.email)
  if (emailError) {
    errors.value.email = emailError
  }

  // Password validation
  const passwordError = validatePassword(form.value.password)
  if (passwordError) {
    errors.value.password = passwordError
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return

  const result = await authStore.login({
    email: form.value.email.trim().toLowerCase(),
    password: form.value.password,
  })

  if (!result.success) {
    errors.value.general = result.error || 'Login failed'
  } else {
    router.push('/dashboard')
  }
}

const fillDemoCredentials = (): void => {
  form.value.email = 'demo@wiremit.com'
  form.value.password = 'demo123'
  errors.value = {}
}

// Create demo user if it doesn't exist
onMounted(() => {
  const savedUsers = JSON.parse(localStorage.getItem('wiremit_users') || '[]')
  const demoUserExists = savedUsers.find((u: { email: string }) => u.email === 'demo@wiremit.com')

  if (!demoUserExists) {
    const demoUser = {
      id: 1,
      password: 'demo123',
      name: 'Demo User',
      email: 'demo@wiremit.com',
      createdAt: new Date().toISOString(),
    }

    savedUsers.push(demoUser)
    localStorage.setItem('wiremit_users', JSON.stringify(savedUsers))
  }
})
</script>
