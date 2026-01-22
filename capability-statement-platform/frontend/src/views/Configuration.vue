<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-3 mb-2">
        <router-link to="/aggregation" class="btn btn-ghost btn-sm -ml-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </router-link>
      </div>
      <h1 class="page-title">Configure Statement</h1>
      <p class="page-subtitle">Choose a template and customize your capability statement settings</p>
    </div>
    
    <!-- Selected Items Summary -->
    <div class="card mb-6 bg-gradient-to-r from-secondary-50 to-white">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h2 class="font-semibold text-secondary-900">Selected Data</h2>
          <div class="flex flex-wrap gap-4 mt-1">
            <span class="flex items-center gap-1.5 text-sm text-secondary-600">
              <span class="w-2 h-2 rounded-full bg-primary-500"></span>
              {{ dataStore.selectedLawyers.length }} Lawyers
            </span>
            <span class="flex items-center gap-1.5 text-sm text-secondary-600">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ dataStore.selectedDeals.length }} Deals
            </span>
            <span class="flex items-center gap-1.5 text-sm text-secondary-600">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              {{ dataStore.selectedAwards.length }} Awards
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Template Selection -->
      <div class="lg:col-span-2 card">
        <div class="card-header">
          <h2 class="card-title">Select Template</h2>
          <p class="card-subtitle">Choose a template for your capability statement</p>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="template in capStore.templates" 
            :key="template.id"
            @click="selectedTemplateId = template.id"
            class="p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
            :class="selectedTemplateId === template.id 
              ? 'border-primary-500 bg-primary-50/50' 
              : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50/50'"
          >
            <div class="flex items-start gap-4">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                :class="selectedTemplateId === template.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-secondary-100 text-secondary-500'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium text-secondary-900">{{ template.name }}</h3>
                  <span v-if="selectedTemplateId === template.id" class="badge badge-primary">Selected</span>
                </div>
                <p class="text-sm text-secondary-500 mt-1">{{ template.description || 'Standard capability statement template' }}</p>
              </div>
              <div class="flex-shrink-0">
                <div 
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="selectedTemplateId === template.id 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-secondary-300'"
                >
                  <svg v-if="selectedTemplateId === template.id" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="capStore.templates.length === 0" class="empty-state">
            <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <h3 class="empty-state-title">No templates available</h3>
            <p class="empty-state-description">Please contact an administrator to create templates.</p>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Include Options</h2>
          <p class="card-subtitle">Customize what to include</p>
        </div>
        
        <div class="space-y-4">
          <label class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              v-model="localSettings.includeLawyers"
              class="checkbox"
            />
            <div class="flex-1">
              <span class="font-medium text-secondary-900">Lawyers</span>
              <p class="text-xs text-secondary-500">Include lawyer profiles and expertise</p>
            </div>
            <span class="badge badge-primary">{{ dataStore.selectedLawyers.length }}</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              v-model="localSettings.includeDeals"
              class="checkbox"
            />
            <div class="flex-1">
              <span class="font-medium text-secondary-900">Deals</span>
              <p class="text-xs text-secondary-500">Include deal history and transactions</p>
            </div>
            <span class="badge badge-success">{{ dataStore.selectedDeals.length }}</span>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-lg border border-secondary-200 cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              v-model="localSettings.includeAwards"
              class="checkbox"
            />
            <div class="flex-1">
              <span class="font-medium text-secondary-900">Awards</span>
              <p class="text-xs text-secondary-500">Include awards and recognition</p>
            </div>
            <span class="badge badge-warning">{{ dataStore.selectedAwards.length }}</span>
          </label>
        </div>

        <div class="divider"></div>

        <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-900">Template Placeholders</p>
              <p class="text-xs text-blue-700 mt-1">
                Templates use placeholders like <code class="px-1 py-0.5 bg-blue-100 rounded">{{lawyers}}</code>, 
                <code class="px-1 py-0.5 bg-blue-100 rounded">{{deals}}</code>, and 
                <code class="px-1 py-0.5 bg-blue-100 rounded">{{awards}}</code> which will be populated with your selections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-secondary-200">
      <router-link to="/aggregation" class="btn btn-secondary order-2 sm:order-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Selection
      </router-link>
      <button 
        @click="generateAndPreview" 
        class="btn btn-primary btn-lg order-1 sm:order-2 w-full sm:w-auto" 
        :disabled="!selectedTemplateId || capStore.loading"
      >
        <span v-if="capStore.loading" class="flex items-center gap-2">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </span>
        <span v-else class="flex items-center gap-2">
          Generate & Preview
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/dataStore'
import { useCapStatementStore } from '../stores/capStatementStore'

const router = useRouter()
const dataStore = useDataStore()
const capStore = useCapStatementStore()

const selectedTemplateId = ref(null)
const localSettings = ref({
  includeDeals: true,
  includeAwards: true,
  includeLawyers: true,
  format: 'standard'
})

onMounted(async () => {
  await capStore.fetchTemplates()
  // Auto-select first template if available
  if (capStore.templates.length > 0 && !selectedTemplateId.value) {
    selectedTemplateId.value = capStore.templates[0].id
  }
})

async function generateAndPreview() {
  if (!selectedTemplateId.value) {
    alert('Please select a template')
    return
  }

  capStore.updateSettings(localSettings.value)
  
  const dealIds = dataStore.selectedDeals.map(d => d.id)
  const awardIds = dataStore.selectedAwards.map(a => a.id)
  const lawyerIds = dataStore.selectedLawyers.map(l => l.id)

  try {
    await capStore.generateStatement(dealIds, awardIds, lawyerIds, selectedTemplateId.value)
    router.push('/preview')
  } catch (error) {
    alert('Error generating statement: ' + error.message)
  }
}
</script>
