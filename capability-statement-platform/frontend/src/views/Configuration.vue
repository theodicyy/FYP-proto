<template>
  <div class="animate-fade-in">
    <!-- ================= PAGE HEADER ================= -->
    <div class="page-header">
      <h1 class="page-title">Configure Capability Statement</h1>
      <p class="page-subtitle">
        Select a template and fill in proposal-specific details
      </p>
    </div>

    <!-- ================= SELECTED SUMMARY ================= -->
    <div class="card mb-6">
      <div class="card-header">
        <h2 class="card-title">Selected Records</h2>
        <p class="card-subtitle">You selected these on the aggregation page</p>
      </div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="text-sm text-secondary-700">
          <span class="font-medium">Lawyers:</span> {{ dataStore.selectedLawyers.length }} ·
          <span class="font-medium">Deals:</span> {{ dataStore.selectedDeals.length }} ·
          <span class="font-medium">Awards:</span> {{ dataStore.selectedAwards.length }}
        </div>

        <button class="btn btn-secondary" @click="router.push('/aggregation')">
          Change selection
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ================= TEMPLATE SELECTION ================= -->
      <div class="lg:col-span-1 card">
        <div class="card-header">
          <h2 class="card-title">Select Template</h2>
          <p class="card-subtitle">Choose a capability statement template</p>
        </div>

        <div class="space-y-3">
          <div
            v-for="t in templates"
            :key="t.id"
            class="p-4 rounded-xl border-2 cursor-pointer"
            :class="flow.selectedTemplateId === t.id
              ? 'border-primary-500 bg-primary-50/50'
              : 'border-secondary-200 hover:border-secondary-300'"
            @click="flow.setTemplateId(t.id)"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium text-secondary-900">
                  {{ t.name || t.title || 'Template' }}
                </h3>
                <p class="text-sm text-secondary-500">
                  {{ t.description || ' ' }}
                </p>
              </div>

              <span v-if="flow.selectedTemplateId === t.id" class="badge badge-primary">
                Selected
              </span>
            </div>
          </div>

          <div v-if="loadingTemplates" class="text-sm text-secondary-500">
            Loading templates...
          </div>

          <div v-else-if="templates.length === 0" class="text-sm text-secondary-500">
            No templates found.
          </div>
        </div>
      </div>

      <!-- ================= MANUAL INPUTS ================= -->
      <div class="lg:col-span-2 card">
        <div class="card-header">
          <h2 class="card-title">Manual Inputs</h2>
          <p class="card-subtitle">
            These fields will populate the document
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="capStore.manualFields.client_name" class="input" placeholder="Client Name" />
          <input v-model="capStore.manualFields.client_shortname" class="input" placeholder="Client Short Name" />

          <input type="date" v-model="capStore.manualFields.date" class="input" />
          <input v-model="capStore.manualFields.tender_number" class="input" placeholder="Tender Number" />

          <select v-model="capStore.manualFields.doc_type" class="select">
            <option value="">Document Type</option>
            <option value="credential">Credential</option>
            <option value="proposal">Proposal</option>
          </select>

          <select v-model="capStore.manualFields.matter_type" class="select">
            <option value="">Matter Type</option>
            <option value="transaction">Transaction</option>
            <option value="project">Project</option>
          </select>

          <select v-model="capStore.manualFields.client_type" class="select">
            <option value="">Client Type</option>
            <option value="business">Business</option>
            <option value="organisation">Organisation</option>
          </select>

          <input
            v-model="capStore.manualFields.main_practice_area"
            class="input"
            placeholder="Main Practice Area"
          />

          <textarea
            v-model="capStore.manualFields.matter_desc"
            class="input md:col-span-2"
            rows="3"
            placeholder="Matter / Tender Description"
          ></textarea>

          <textarea
            v-model="capStore.manualFields.scope_of_work"
            class="input md:col-span-2"
            rows="3"
            placeholder="Scope of Work (Summary)"
          ></textarea>

          <textarea
            v-model="capStore.manualFields.scope_of_work_list"
            class="input md:col-span-2"
            rows="3"
            placeholder="Detailed Scope of Work"
          ></textarea>

          <input
            v-model="capStore.manualFields.discount_rate"
            class="input"
            placeholder="Discount Rate"
          />

          <textarea
            v-model="capStore.manualFields.fee_assumptions"
            class="input md:col-span-2"
            rows="3"
            placeholder="Fee Assumptions"
          ></textarea>

          <label class="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" v-model="capStore.manualFields.show_highlights" />
            Include Highlights Section
          </label>

          <label class="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" v-model="capStore.manualFields.show_track_record" />
            Include Track Record Section
          </label>
        </div>
      </div>
    </div>

    <!-- ================= ACTION BUTTON ================= -->
    <div class="mt-8 flex justify-end border-t pt-6">
      <button
        @click="generateAndPreview"
        class="btn btn-primary btn-lg"
        :disabled="capStore.loading || !flow.selectedTemplateId"
      >
        <span v-if="capStore.loading">Generating...</span>
        <span v-else>Generate & Preview</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '../stores/createFlowStore'
import { useDataStore } from '../stores/dataStore'
import { useCapStatementStore } from '../stores/capStatementStore'
import dataService from '../services/dataService'

const router = useRouter()
const flow = useCreateFlowStore()
const dataStore = useDataStore()
const capStore = useCapStatementStore()

const templates = ref([])
const loadingTemplates = ref(false)
const hasSelections = computed(() => dataStore.selectedCount > 0)

onMounted(async () => {
  // Require aggregation selections
  if (!hasSelections.value) {
    router.push('/aggregation')
    return
  }

  loadingTemplates.value = true
  try {
    const res = await dataService.getTemplates()
    templates.value = res.data?.data || res.data || []
  } finally {
    loadingTemplates.value = false
  }

  // default template if none selected
  if (!flow.selectedTemplateId && templates.value.length > 0) {
    flow.setTemplateId(templates.value[0].id)
  }
})

async function generateAndPreview() {
  try {
    if (!hasSelections.value) {
      router.push('/aggregation')
      return
    }

    await capStore.generateStatement({
      templateId: flow.selectedTemplateId,
      include: flow.include,
      selectedIds: {
        lawyerIds: dataStore.selectedLawyers.map(x => x.id),
        dealIds: dataStore.selectedDeals.map(x => x.id),
        awardIds: dataStore.selectedAwards.map(x => x.id)
      },
      // If backend receives { value: ... }, change to capStore.manualFields.value
      manualFields: capStore.manualFields
    })

    router.push('/preview')
  } catch (err) {
    alert('Error generating statement')
  }
}

</script>
