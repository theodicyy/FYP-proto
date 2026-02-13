<template>
  <div class="animate-fade-in">

    <!-- HEADER -->
    <div class="page-header">
      <h1 class="page-title">Configure Capability Statement</h1>
      <p class="page-subtitle">Fill proposal details and assign roles</p>
    </div>

    <!-- SUMMARY -->
    <div class="card mb-6">
      <div class="text-sm">
        Lawyers: {{ dataStore.selectedLawyers.length || 'Test Lawyer' }} ·
        Deals: {{ dataStore.selectedDeals.length || 'Test Deal' }} ·
        Awards: {{ dataStore.selectedAwards.length || 'Test Award' }}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- MANUAL FIELDS -->
      <div class="card">
        <h2 class="card-title mb-4">Manual Inputs</h2>

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

        <input v-model="capStore.manualFields.main_practice_area" class="input" placeholder="Main Practice Area" />

        <textarea v-model="capStore.manualFields.matter_desc" class="input" rows="3" placeholder="Matter Description" />
        <textarea v-model="capStore.manualFields.scope_of_work" class="input" rows="3" placeholder="Scope Summary" />
        <textarea v-model="capStore.manualFields.scope_of_work_list" class="input" rows="3" placeholder="Detailed Scope" />

        <input v-model="capStore.manualFields.discount_rate" class="input" placeholder="Discount Rate" />

        <textarea v-model="capStore.manualFields.fee_assumptions" class="input" rows="3" placeholder="Fee Assumptions" />

        <!-- CROSS BORDER -->
        <label class="flex gap-2 mt-3">
          <input type="checkbox" v-model="capStore.manualFields.cross_border_bool" />
          Cross Border
        </label>

        <!-- HIGHLIGHTS -->
        <label class="flex gap-2">
          <input type="checkbox" v-model="capStore.manualFields.show_highlights" />
          Include Highlights
        </label>

        <label class="flex gap-2">
          <input type="checkbox" v-model="capStore.manualFields.show_track_record" />
          Include Track Record
        </label>
      </div>

      <!-- STRUCTURED SELECTION -->
      <div class="card">

        <!-- PRACTICES -->
        <h3 class="font-medium mb-2">Practices</h3>

        <div class="flex flex-wrap gap-2 mb-4">
          <label v-for="p in practices" :key="p" class="flex gap-1">
            <input type="checkbox" :value="p" v-model="capStore.manualFields.practice_list" />
            {{ p }}
          </label>
        </div>

        <!-- LEAD PARTNERS -->
        <h3 class="font-medium mb-2">Lead Partners</h3>

        <select multiple class="select h-28 mb-4" v-model="capStore.manualFields.lead_partners">
          <option
            v-for="l in lawyers"
            :key="l.id"
            :value="l.id"
          >
            {{ l.first_name || 'Test' }} {{ l.last_name || 'Lawyer' }}
          </option>
        </select>

        <!-- LAWYER ROLES -->
        <h3 class="font-medium mb-2">Lawyer Roles</h3>

        <div v-for="l in lawyers" :key="l.id" class="flex gap-3 mb-2">
          <span class="w-40">
            {{ l.first_name || 'Test' }} {{ l.last_name || 'Lawyer' }}
          </span>

          <select class="select" v-model="capStore.manualFields.lawyer_roles[l.id]">
            <option value="">None</option>
            <option value="Head">Head</option>
            <option value="Co-head">Co-head</option>
            <option value="Partner">Partner</option>
            <option value="Associate">Associate</option>
          </select>
        </div>

        <!-- MOST RELEVANT AWARDS -->
        <h3 class="font-medium mt-4 mb-2">Most Relevant Awards</h3>

        <label
          v-for="a in awards"
          :key="a.id"
          class="flex gap-2"
        >
          <input type="checkbox" :value="a.id" v-model="capStore.manualFields.most_rel_award" />
          {{ a.award_name || 'Test Award' }}
        </label>

      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <div v-if="capStore.error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
        {{ capStore.error.friendlyMessage || capStore.error.message || 'Generate failed' }}
      </div>
      <div class="flex justify-end">
        <button class="btn btn-primary" @click="generate" :disabled="capStore.loading">
          {{ capStore.loading ? 'Generating…' : 'Generate' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/dataStore'
import { useCapStatementStore } from '../stores/capStatementStore'
import { useCreateFlowStore } from '../stores/createFlowStore'

const router = useRouter()
const dataStore = useDataStore()
const capStore = useCapStatementStore()
const flow = useCreateFlowStore()

const lawyers = computed(() => dataStore.selectedLawyers.length ? dataStore.selectedLawyers : [{ id: 1 }])
const awards = computed(() => dataStore.selectedAwards.length ? dataStore.selectedAwards : [{ id: 1 }])

const practices = computed(() => {
  const set = new Set()
  lawyers.value.forEach(l => l.practice_group && set.add(l.practice_group))
  return [...set]
})

async function generate() {
  capStore.error = null
  try {
    await capStore.generateStatement({
      selectedIds: {
        lawyerIds: lawyers.value.map(x => x.id),
        dealIds: dataStore.selectedDeals.map(x => x.id),
        awardIds: awards.value.map(x => x.id)
      },
      manualFields: capStore.manualFields
    })
    router.push('/preview')
  } catch (_) {
    // Error shown via capStore.error in template
  }
}
</script>
