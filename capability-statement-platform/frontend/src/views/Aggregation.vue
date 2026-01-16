<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Data Aggregation & Selection</h1>
    
    <div v-if="dataStore.error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {{ dataStore.error }}
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Filters</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Practice Group</label>
          <select v-model="localFilters.practice_group" @change="applyFilters" class="input">
            <option value="">All</option>
            <option value="Corporate Law">Corporate Law</option>
            <option value="Intellectual Property">Intellectual Property</option>
            <option value="Litigation">Litigation</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Industry</label>
          <select v-model="localFilters.industry" @change="applyFilters" class="input">
            <option value="">All</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Year</label>
          <input 
            type="number" 
            v-model="localFilters.year" 
            @change="applyFilters"
            placeholder="Year"
            class="input"
          />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Items Summary -->
    <div v-if="dataStore.selectedCount > 0" class="card mb-6 bg-primary-50">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold mb-2">Selected Items</h2>
          <p class="text-sm text-gray-600">
            {{ dataStore.selectedLawyers.length }} lawyers, 
            {{ dataStore.selectedDeals.length }} deals, 
            {{ dataStore.selectedAwards.length }} awards
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="dataStore.clearSelections" class="btn btn-secondary">
            Clear All
          </button>
          <router-link to="/configuration" class="btn btn-primary">
            Continue to Configuration
          </router-link>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-4">
      <div class="border-b">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Lawyers Tab -->
    <div v-if="activeTab === 'lawyers'" class="card">
      <div v-if="dataStore.loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th class="w-12"></th>
              <th>Name</th>
              <th>Practice Group</th>
              <th>Title</th>
              <th>Experience</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="lawyer in dataStore.lawyers"
              :key="lawyer.id"
              @click="dataStore.toggleLawyerSelection(lawyer)"
              class="cursor-pointer"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="dataStore.isLawyerSelected(lawyer)"
                  @change.stop="dataStore.toggleLawyerSelection(lawyer)"
                />
              </td>
              <td>{{ lawyer.first_name }} {{ lawyer.last_name }}</td>
              <td>{{ lawyer.practice_group }}</td>
              <td>{{ lawyer.title }}</td>
              <td>{{ lawyer.years_experience }} years</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Deals Tab -->
    <div v-if="activeTab === 'deals'" class="card">
      <div v-if="dataStore.loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th class="w-12"></th>
              <th>Deal Name</th>
              <th>Client</th>
              <th>Value</th>
              <th>Year</th>
              <th>Industry</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="deal in dataStore.deals"
              :key="deal.id"
              @click="dataStore.toggleDealSelection(deal)"
              class="cursor-pointer"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="dataStore.isDealSelected(deal)"
                  @change.stop="dataStore.toggleDealSelection(deal)"
                />
              </td>
              <td>{{ deal.deal_name }}</td>
              <td>{{ deal.client_name }}</td>
              <td>
                {{ formatCurrency(deal.deal_value, deal.deal_currency) }}
              </td>
              <td>{{ deal.deal_year }}</td>
              <td>{{ deal.industry }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Awards Tab -->
    <div v-if="activeTab === 'awards'" class="card">
      <div v-if="dataStore.loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th class="w-12"></th>
              <th>Award Name</th>
              <th>Organization</th>
              <th>Year</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="award in dataStore.awards"
              :key="award.id"
              @click="dataStore.toggleAwardSelection(award)"
              class="cursor-pointer"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="dataStore.isAwardSelected(award)"
                  @change.stop="dataStore.toggleAwardSelection(award)"
                />
              </td>
              <td>{{ award.award_name }}</td>
              <td>{{ award.awarding_organization }}</td>
              <td>{{ award.award_year }}</td>
              <td>{{ award.category }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../stores/dataStore'

const dataStore = useDataStore()
const activeTab = ref('lawyers')
const localFilters = ref({
  practice_group: '',
  industry: '',
  year: null
})

const tabs = [
  { id: 'lawyers', label: 'Lawyers' },
  { id: 'deals', label: 'Deals' },
  { id: 'awards', label: 'Awards' }
]

function applyFilters() {
  dataStore.updateFilters({
    practice_group: localFilters.value.practice_group || null,
    industry: localFilters.value.industry || null,
    deal_year: localFilters.value.year || null,
    award_year: localFilters.value.year || null
  })
  
  if (activeTab.value === 'lawyers') {
    dataStore.fetchLawyers()
  } else if (activeTab.value === 'deals') {
    dataStore.fetchDeals()
  } else if (activeTab.value === 'awards') {
    dataStore.fetchAwards()
  }
}

function clearFilters() {
  localFilters.value = {
    practice_group: '',
    industry: '',
    year: null
  }
  dataStore.updateFilters({
    practice_group: null,
    industry: null,
    deal_year: null,
    award_year: null
  })
  applyFilters()
}

function formatCurrency(value, currency = 'USD') {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(value)
}

onMounted(async () => {
  await Promise.all([
    dataStore.fetchLawyers(),
    dataStore.fetchDeals(),
    dataStore.fetchAwards()
  ])
})
</script>
