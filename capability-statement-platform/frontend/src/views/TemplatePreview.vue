<template>
  <div class="template-preview-container">
    <div class="preview-controls">
      <h1 class="text-2xl font-bold mb-4">26-Page Document Template Preview</h1>
      <div class="flex gap-4 mb-4">
        <label class="flex items-center gap-2">
          <span>Show pages:</span>
          <input 
            type="text" 
            v-model="pagesInput" 
            placeholder="1,2,3 or leave empty for all"
            class="input w-48"
          />
        </label>
        <button @click="exportPDF" class="btn btn-primary">Export as PDF</button>
      </div>
    </div>
    <div class="preview-wrapper">
      <MultiPageTemplate :pages-to-show="pagesToShowArray" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MultiPageTemplate from '../components/MultiPageTemplate.vue'

const pagesInput = ref('')

const pagesToShowArray = computed(() => {
  if (!pagesInput.value.trim()) {
    return [] // Empty means show all available pages
  }
  
  // Parse comma-separated page numbers
  return pagesInput.value
    .split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n > 0)
})

function exportPDF() {
  // PDF export functionality will be added when needed
  alert('PDF export will be implemented after all pages are complete')
}
</script>

<style scoped>
.template-preview-container {
  padding: 2rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.preview-controls {
  margin-bottom: 2rem;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  background-color: #e5e5e5;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
