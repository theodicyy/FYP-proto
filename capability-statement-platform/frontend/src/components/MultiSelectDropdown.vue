<template>
  <div class="multi-select-wrapper" ref="wrapperRef">
    <!-- Trigger -->
    <button
      type="button"
      class="multi-select-trigger"
      @click="toggleOpen"
      :aria-expanded="isOpen"
    >
      <span class="multi-select-trigger-text">
        <span v-if="modelValue.length === 0" class="placeholder">{{ placeholder }}</span>
        <span v-else-if="modelValue.length === 1" class="selected-label">{{ modelValue[0] }}</span>
        <span v-else class="selected-label">{{ modelValue.length }} selected</span>
      </span>
      <svg
        class="multi-select-chevron"
        :class="{ 'rotated': isOpen }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Dropdown panel -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="multi-select-panel">
        <!-- Select all -->
        <label class="multi-select-option" @click.prevent="toggleAll">
          <input
            type="checkbox"
            class="multi-select-checkbox"
            :checked="allSelected"
            :indeterminate.prop="someSelected && !allSelected"
            @change.prevent
            tabindex="-1"
          />
          <span class="multi-select-option-label select-all-label">Select all</span>
        </label>
        <div class="multi-select-divider"></div>
        <!-- Individual options -->
        <label
          v-for="option in options"
          :key="option"
          class="multi-select-option"
          @click.prevent="toggleOption(option)"
        >
          <input
            type="checkbox"
            class="multi-select-checkbox"
            :checked="modelValue.includes(option)"
            @change.prevent
            tabindex="-1"
          />
          <span class="multi-select-option-label">{{ option }}</span>
        </label>
        <div v-if="options.length === 0" class="multi-select-empty">No options available</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select...'
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const wrapperRef = ref(null)

const allSelected = computed(() => props.options.length > 0 && props.options.every(o => props.modelValue.includes(o)))
const someSelected = computed(() => props.modelValue.length > 0)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function toggleOption(option) {
  const current = [...props.modelValue]
  const idx = current.indexOf(option)
  if (idx === -1) {
    current.push(option)
  } else {
    current.splice(idx, 1)
  }
  emit('update:modelValue', current)
}

function toggleAll() {
  if (allSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', [...props.options])
  }
}

function handleClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<style scoped>
.multi-select-wrapper {
  position: relative;
  width: 100%;
}

/* Trigger button */
.multi-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 2.375rem;
}
.multi-select-trigger:hover {
  border-color: #93c5fd;
}
.multi-select-trigger:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.multi-select-trigger-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.placeholder {
  color: #9ca3af;
}
.selected-label {
  color: #111827;
}

.multi-select-chevron {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: #3b82f6;
  transition: transform 0.2s ease;
}
.multi-select-chevron.rotated {
  transform: rotate(180deg);
}

/* Panel */
.multi-select-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  max-height: 14rem;
  overflow-y: auto;
  padding: 0.25rem 0;
}

/* Options */
.multi-select-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.875rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.875rem;
  color: #374151;
  transition: background 0.1s;
}
.multi-select-option:hover {
  background: #f3f4f6;
}

.multi-select-checkbox {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  accent-color: #3b82f6;
  cursor: pointer;
}

.multi-select-option-label {
  line-height: 1.4;
}
.select-all-label {
  font-weight: 500;
  color: #111827;
}

.multi-select-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.25rem 0;
}

.multi-select-empty {
  padding: 0.75rem 0.875rem;
  font-size: 0.8rem;
  color: #9ca3af;
  text-align: center;
}

/* Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
