<template>
  <div class="multi-page-template">
    <!-- Page 1: Cover Page -->
    <Page1Cover v-if="showPage(1)" />
    
    <!-- Pages 2-26 will be added here incrementally -->
    <!-- Each page component will be added as approved -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Page1Cover from './pages/Page1Cover.vue'

const props = defineProps({
  pagesToShow: {
    type: Array,
    default: () => []
  }
})

// Determine which pages to show
// If pagesToShow is empty array, show all available pages
// Otherwise, only show specified pages
const availablePages = computed(() => {
  if (props.pagesToShow && props.pagesToShow.length > 0) {
    return props.pagesToShow
  }
  // Show all available pages (currently only Page 1 exists)
  return [1]
})

function showPage(pageNumber) {
  return availablePages.value.includes(pageNumber)
}
</script>

<style scoped>
.multi-page-template {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
}

/* Each page will handle its own A4 dimensions and styling */
</style>
