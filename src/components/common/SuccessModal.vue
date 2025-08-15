<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-show="true" class="fixed inset-0 z-90 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 transition-opacity" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl card-shadow max-w-md w-full p-6 transform transition-all"
            @click.stop
          >
            <!-- Close Button -->
            <button
              @click="$emit('close')"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X class="w-6 h-6" />
            </button>

            <!-- Content -->
            <div class="text-center">
              <!-- Success Icon -->
              <div class="mx-auto mb-4">
                <div
                  class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle class="w-8 h-8 text-green-600" />
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-2xl font-semibold text-gray-900 mb-3">
                {{ title }}
              </h3>

              <!-- Message -->
              <p class="text-gray-600 mb-6 leading-relaxed">
                {{ message }}
              </p>

              <!-- Actions -->
              <div class="space-y-3">
                <button
                  @click="$emit('close')"
                  class="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <CheckCircle class="w-5 h-5" />
                  <span>Continue</span>
                </button>

                <!-- Additional Action Slot -->
                <slot name="actions"></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, X } from 'lucide-vue-next'

// Props
defineProps({
  title: {
    type: String,
    default: 'Success!',
  },
  message: {
    type: String,
    default: 'Operation completed successfully.',
  },
})

// Emits
defineEmits(['close'])
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
