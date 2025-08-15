<template>
  <div
    :class="[
      'inline-block rounded-full border-solid animate-spin',
      sizeClasses,
      colorClasses
    ]"
    :aria-label="ariaLabel"
    role="status"
  >
    <span class="sr-only">{{ ariaLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LoadingSpinnerProps } from '@/types'

// Props
const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
  size: 'md',
  ariaLabel: 'Loading...'
})

// Computed
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  }
  return sizes[props.size as keyof typeof sizes]
})

const colorClasses = computed(() => {
  return 'border-gray-200 border-t-wise-500'
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
