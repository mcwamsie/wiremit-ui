import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-loaded views for better performance
const Dashboard = () => import('@/views/dashboard/DashboardView.vue')
const SendMoney = () => import('@/views/dashboard/SendMoneyView.vue')
const TransactionHistory = () => import('@/views/dashboard/TransactionHistoryView.vue')
const Offers = () => import('@/views/dashboard/OffersView.vue')
const Login = () => import('@/views/auth/LoginView.vue')
const Register = () => import('@/views/auth/RegisterView.vue')
// const Profile = () => import('@/components/dashboard/Profile.vue')
// const NotFound = () => import('@/views/NotFound.vue')

// Route definitions with proper typing
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresGuest: true,
      title: 'Sign In - Wiremit',
      description: 'Sign in to your Wiremit account to send money abroad',
      layout: 'auth',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresGuest: true,
      title: 'Create Account - Wiremit',
      description: 'Create your Wiremit account to start sending money abroad',
      layout: 'auth',
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: 'Dashboard - Wiremit',
      description: 'Your Wiremit dashboard - view transactions and send money',
      breadcrumb: 'Dashboard',
    },
  },
  {
    path: '/send',
    name: 'SendMoney',
    component: SendMoney,
    meta: {
      requiresAuth: true,
      title: 'Send Money - Wiremit',
      description: 'Send money to your children studying abroad',
      breadcrumb: 'Send Money',
    },
  },
  {
    path: '/history',
    name: 'TransactionHistory',
    component: TransactionHistory,
    meta: {
      requiresAuth: true,
      title: 'Transaction History - Wiremit',
      description: 'View your complete transaction history',
      breadcrumb: 'Transaction History',
    },
  },
  {
    path: '/offers',
    name: 'Offers',
    component: Offers,
    meta: {
      requiresAuth: true,
      title: 'Special Offers - Wiremit',
      description: 'Discover special offers and promotions',
      breadcrumb: 'Special Offers',
    },
  },
  // {
  //   path: '/profile',
  //   name: 'Profile',
  //   component: Profile,
  //   meta: {
  //     requiresAuth: true,
  //     title: 'Profile - Wiremit',
  //     description: 'Manage your account settings and profile',
  //     breadcrumb: 'Profile'
  //   }
  // },
  // {
  //   path: '/404',
  //   name: 'NotFound',
  //   component: NotFound,
  //   meta: {
  //     title: 'Page Not Found - Wiremit',
  //     description: 'The page you are looking for could not be found'
  //   }
  // },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

// Create router instance
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Handle scroll behavior for better UX
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      return { top: 0 }
    }
  },
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Get auth store (need to call it inside the guard)
  const authStore = useAuthStore()

  // Update document title
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }

  // Update meta description
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  // Check authentication requirements
  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    // Store the intended route for redirect after login
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Redirect authenticated users away from guest-only pages
  if (to.meta?.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

// After each navigation
router.afterEach((to) => {
  // Track page views (for analytics)
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: to.meta?.title,
      page_location: to.fullPath,
    })
  }

  // Remove loading states
  const loadingElement = document.querySelector('.route-loading')
  if (loadingElement) {
    loadingElement.remove()
  }
})

// Error handling
router.onError((error) => {
  console.error('Router error:', error)

  // Handle chunk load errors (when lazy-loaded components fail)
  if (error.message.includes('Loading chunk')) {
    // Reload the page to get the latest chunks
    window.location.reload()
  }
})

// Route helper functions
export const navigateToLogin = (redirectPath?: string) => {
  router.push({
    path: '/login',
    query: redirectPath ? { redirect: redirectPath } : undefined,
  })
}

export const navigateAfterLogin = () => {
  const redirectPath = router.currentRoute.value.query.redirect as string
  router.push(redirectPath || '/dashboard')
}

export const isCurrentRoute = (routeName: string): boolean => {
  return router.currentRoute.value.name === routeName
}

// Export router as default
export default router
