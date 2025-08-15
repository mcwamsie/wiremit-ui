import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  User, 
  UserCredentials, 
  UserRegistration, 
  AuthResult,
  AuthState 
} from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref<boolean>(false)
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(false)

  // Actions
  const login = async (credentials: UserCredentials): Promise<AuthResult> => {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - in real app, validate against backend
      const savedUsers = JSON.parse(localStorage.getItem('wiremit_users') || '[]') as User[]
      const foundUser = savedUsers.find(u => 
        u.email === credentials.email && 
        (u as any).password === credentials.password // password would not exist in User type in real app
      )
      
      if (foundUser) {
        // Create user data without password
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          createdAt: foundUser.createdAt
        }
        
        isAuthenticated.value = true
        user.value = userData
        
        // Store auth token (in real app, use secure httpOnly cookies)
        localStorage.setItem('wiremit_auth', JSON.stringify(userData))
        
        return { success: true }
      } else {
        return { success: false, error: 'Invalid email or password' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: UserRegistration): Promise<AuthResult> => {
    isLoading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      const savedUsers = JSON.parse(localStorage.getItem('wiremit_users') || '[]') as any[]
      const userExists = savedUsers.find(u => u.email === userData.email)
      
      if (userExists) {
        return { success: false, error: 'User with this email already exists' }
      }
      
      // Create new user
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // In real app, hash the password
        createdAt: new Date().toISOString()
      }
      
      // Save to mock database
      savedUsers.push(newUser)
      localStorage.setItem('wiremit_users', JSON.stringify(savedUsers))
      
      // Auto login after registration
      const loginResult = await login({
        email: userData.email,
        password: userData.password
      })
      
      return loginResult
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = (): void => {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('wiremit_auth')
  }

  const checkAuth = (): void => {
    const savedAuth = localStorage.getItem('wiremit_auth')
    if (savedAuth) {
      try {
        const userData = JSON.parse(savedAuth) as User
        isAuthenticated.value = true
        user.value = userData
      } catch (error) {
        console.error('Failed to parse saved auth data:', error)
        logout()
      }
    }
  }

  // Getters
  const getUser = (): User | null => user.value
  const isLoggedIn = (): boolean => isAuthenticated.value

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    
    // Getters
    getUser,
    isLoggedIn
  }
})