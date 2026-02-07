<template>
  <div class="animate-fade-in">
    <!-- ================= PAGE HEADER ================= -->
    <div class="page-header">
      <h1 class="page-title">Configure Capability Statement</h1>
      <p class="page-subtitle">
        Select a template and fill in proposal-specific details
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ================= TEMPLATE SELECTION (DUMMY UI) ================= -->
      <div class="lg:col-span-1 card">
        <div class="card-header">
          <h2 class="card-title">Select Template</h2>
          <p class="card-subtitle">Choose a capability statement template</p>
        </div>

        <div class="space-y-4">
          <div
            class="p-4 rounded-xl border-2 cursor-default border-primary-500 bg-primary-50/50"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium text-secondary-900">
                  Wong Partnership Standard Template
                </h3>
                <p class="text-sm text-secondary-500">
                  Official capability statement format
                </p>
              </div>

              <span class="badge badge-primary">
                Selected
              </span>
            </div>
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

          <input v-model="manualFields.client_name" class="input" placeholder="Client Name" />
          <input v-model="manualFields.client_shortname" class="input" placeholder="Client Short Name" />

          <input type="date" v-model="manualFields.date" class="input" />
          <input v-model="manualFields.tender_number" class="input" placeholder="Tender Number" />

          <select v-model="manualFields.doc_type" class="select">
            <option value="">Document Type</option>
            <option value="credential">Credential</option>
            <option value="proposal">Proposal</option>
          </select>

          <select v-model="manualFields.matter_type" class="select">
            <option value="">Matter Type</option>
            <option value="transaction">Transaction</option>
            <option value="project">Project</option>
          </select>

          <select v-model="manualFields.client_type" class="select">
            <option value="">Client Type</option>
            <option value="business">Business</option>
            <option value="organisation">Organisation</option>
          </select>

          <input
            v-model="manualFields.main_practice_area"
            class="input"
            placeholder="Main Practice Area"
          />

          <textarea
            v-model="manualFields.matter_desc"
            class="input md:col-span-2"
            rows="3"
            placeholder="Matter / Tender Description"
          ></textarea>

          <textarea
            v-model="manualFields.scope_of_work"
            class="input md:col-span-2"
            rows="3"
            placeholder="Scope of Work (Summary)"
          ></textarea>

          <textarea
            v-model="manualFields.scope_of_work_list"
            class="input md:col-span-2"
            rows="3"
            placeholder="Detailed Scope of Work"
          ></textarea>

          <input
            v-model="manualFields.discount_rate"
            class="input"
            placeholder="Discount Rate"
          />

          <textarea
            v-model="manualFields.fee_assumptions"
            class="input md:col-span-2"
            rows="3"
            placeholder="Fee Assumptions"
          ></textarea>

          
              <label class="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" v-model="manualFields.show_highlights" />
                Include Highlights Section
              </label>

              <label class="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" v-model="manualFields.show_track_record" />
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
        :disabled="capStore.loading"
      >
        <span v-if="capStore.loading">Generating...</span>
        <span v-else>Generate & Preview</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCapStatementStore } from '../stores/capStatementStore'

const router = useRouter()
const capStore = useCapStatementStore()

const manualFields = ref({
  client_name: '',
  client_shortname: '',
  date: '',
  tender_number: '',
  doc_type: '',
  matter_type: '',
  client_type: '',
  matter_desc: '',
  scope_of_work: '',
  scope_of_work_list: '',
  discount_rate: '',
  main_practice_area: '',
  fee_assumptions: '',



show_highlights: false,
show_track_record: false
})

async function generateAndPreview() {
  try {
    await capStore.generateStatement(manualFields.value)
    router.push('/preview')
  } catch (err) {
    alert('Error generating statement')
  }
}

</script>
