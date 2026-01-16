<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Configuration</h1>
    
    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Selected Items</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <strong>Lawyers:</strong> {{ dataStore.selectedLawyers.length }}
        </div>
        <div>
          <strong>Deals:</strong> {{ dataStore.selectedDeals.length }}
        </div>
        <div>
          <strong>Awards:</strong> {{ dataStore.selectedAwards.length }}
        </div>
      </div>
    </div>

    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Template Selection</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Select Template *</label>
          <select v-model.number="selectedTemplateId" class="input" required>
            <option :value="null">-- Select a template --</option>
            <option v-for="template in capStore.templates" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
          <p class="text-sm text-gray-500 mt-1">
            Templates contain placeholders ({{lawyers}}, {{deals}}, {{awards}}) that will be populated with your selections.
          </p>
        </div>
      </div>
    </div>

    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Statement Settings</h2>
      <div class="space-y-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            id="includeDeals"
            v-model="localSettings.includeDeals"
            class="mr-2"
          />
          <label for="includeDeals">Include Deals</label>
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            id="includeAwards"
            v-model="localSettings.includeAwards"
            class="mr-2"
          />
          <label for="includeAwards">Include Awards</label>
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            id="includeLawyers"
            v-model="localSettings.includeLawyers"
            class="mr-2"
          />
          <label for="includeLawyers">Include Lawyers</label>
        </div>
      </div>
    </div>

    <div class="flex gap-4">
      <router-link to="/aggregation" class="btn btn-secondary">
        Back to Selection
      </router-link>
      <button @click="generateAndPreview" class="btn btn-primary" :disabled="capStore.loading">
        {{ capStore.loading ? 'Generating...' : 'Generate & Preview' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

import { onMounted } from 'vue'

onMounted(async () => {
  await capStore.fetchTemplates()
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
