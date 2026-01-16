<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <h3 class="text-lg font-semibold mb-2">Lawyers</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.lawyers }}</p>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-2">Deals</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.deals }}</p>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-2">Awards</h3>
        <p class="text-3xl font-bold text-primary-600">{{ stats.awards }}</p>
      </div>
    </div>

    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-4">
        <router-link to="/aggregation" class="btn btn-primary">
          Create New Statement
        </router-link>
        <router-link to="/library" class="btn btn-secondary">
          View Library
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../stores/dataStore'

const dataStore = useDataStore()
const stats = ref({
  lawyers: 0,
  deals: 0,
  awards: 0
})

onMounted(async () => {
  await Promise.all([
    dataStore.fetchLawyers(),
    dataStore.fetchDeals(),
    dataStore.fetchAwards()
  ])
  
  stats.value = {
    lawyers: dataStore.lawyers.length,
    deals: dataStore.deals.length,
    awards: dataStore.awards.length
  }
})
</script>
