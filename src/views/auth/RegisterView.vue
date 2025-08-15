<template>
    <div class="flex items-center justify-center route-content">
 <div class="bg-white rounded-xl card-shadow p-8 w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <div class="flex justify-center mb-6">
        <img :src="WiremitLogo" alt="Wiremit" class="h-12" />
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
      <p class="text-gray-600">Join Wiremit to send money globally</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2"> Full Name </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          :class="['input-field', errors.name ? 'input-error' : '']"
          placeholder="Enter your full name"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          :class="['input-field', errors.email ? 'input-error' : '']"
          placeholder="Enter your email"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            :class="['input-field pr-12', errors.password ? 'input-error' : '']"
            placeholder="Create a password"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Eye v-if="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
            <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            :class="['input-field pr-12', errors.confirmPassword ? 'input-error' : '']"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Eye v-if="showConfirmPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
            <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div>
        <label class="flex items-start">
          <input
            v-model="form.agreeToTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-wise-600 focus:ring-wise-500 border-gray-300 rounded mt-1"
          />
          <span class="ml-2 text-sm text-gray-600">
            I agree to the
            <a href="#" class="text-wise-600 hover:text-wise-700">Terms of Service</a>
            and
            <a href="#" class="text-wise-600 hover:text-wise-700">Privacy Policy</a>
          </span>
        </label>
        <p v-if="errors.agreeToTerms" class="mt-1 text-sm text-red-600">
          {{ errors.agreeToTerms }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading || !form.agreeToTerms"
        class="btn-primary w-full flex items-center justify-center"
      >
        <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
        {{ isLoading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Already have an account?
        <RouterLink to="/login" class="text-wise-600 hover:text-wise-700 font-medium">
          Sign in
        </RouterLink>
      </p>
    </div>
  </div>

    </div>

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePassword, validateName } from '@/utils/validation'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import type { RegisterForm } from '@/types'
import { useRouter } from 'vue-router'
import WiremitLogo from '@/assets/logo.svg'
const router = useRouter()
// Emits
defineEmits<{
  'switch-to-login': []
}>()

// Store
const authStore = useAuthStore()

// Reactive state
const isLoading = ref<boolean>(false)
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)
const form = reactive<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
})
const errors = reactive<Record<string, string>>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: '',

})

// Methods
const validateForm = (): boolean => {
  errors.name = validateName(form.name)
  errors.email = validateEmail(form.email)
  errors.password = validatePassword(form.password)

  // Validate password confirmation
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  } else {
    errors.confirmPassword = ''
  }

  // Validate terms agreement
  if (!form.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions'
  } else {
    errors.agreeToTerms = ''
  }

  return (
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.agreeToTerms
  )
}

const handleRegister = async (): Promise<void> => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      agreeToTerms: form.agreeToTerms,
    })
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
