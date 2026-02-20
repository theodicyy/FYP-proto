<template>
  <div class="animate-fade-in space-y-6">

    <!-- HEADER -->
    <div class="page-header">
      <h1 class="page-title">Configure Capability Statement</h1>
      <p class="page-subtitle">Fill proposal details and assign roles</p>
    </div>

    <!-- SUMMARY -->
    <div class="card">
      <div class="flex gap-6 text-sm text-secondary-700">
        <div><b>Lawyers:</b> {{ dataStore.selectedLawyers.length || 'Test Lawyer' }}</div>
        <div><b>Deals:</b> {{ dataStore.selectedDeals.length || 'Test Deal' }}</div>
        <div><b>Awards:</b> {{ dataStore.selectedAwards.length || 'Test Award' }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- MANUAL INPUTS -->
      <div class="card space-y-3">
        <h2 class="card-title">Proposal Details</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>

        <textarea v-model="capStore.manualFields.matter_desc" class="input" rows="3" placeholder="Matter Description" />
        <textarea v-model="capStore.manualFields.scope_of_work" class="input" rows="3" placeholder="Scope Summary" />
        <textarea v-model="capStore.manualFields.scope_of_work_list" class="input" rows="3" placeholder="Detailed Scope" />

        <input v-model="capStore.manualFields.discount_rate" class="input" placeholder="Discount Rate" />
        <textarea v-model="capStore.manualFields.fee_assumptions" class="input" rows="3" placeholder="Fee Assumptions" />

        <div class="flex flex-col gap-2 pt-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="capStore.manualFields.cross_border_bool" />
            Cross Border
          </label>

          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="capStore.manualFields.show_highlights" />
            Include Highlights
          </label>

          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="capStore.manualFields.show_track_record" />
            Include Track Record
          </label>
        </div>
      </div>

      <!-- STRUCTURED -->
      <div class="card space-y-6">

        <!-- PRACTICES -->
        <div>
          <h3 class="font-semibold mb-2">Practice Areas</h3>
          <div class="flex flex-wrap gap-3">
            <label
              v-for="p in practices"
              :key="p"
              class="px-3 py-1 border rounded-full text-sm flex items-center gap-2"
            >
              <input type="checkbox" :value="p" v-model="capStore.manualFields.practice_list" />
              {{ p }}
            </label>
          </div>
        </div>



        <!-- LAWYER ROLES -->
       <div v-for="l in lawyers" :key="l.id" class="flex items-center gap-4 mb-2">

  <span class="w-40">
    {{ l.first_name }} {{ l.last_name }}
  </span>

  <select class="select" v-model="capStore.manualFields.lawyer_roles[l.id]">
    <option value="Partner">Partner</option>
    <option value="Head">Head</option>
    <option value="Co-head">Co-head</option>
  </select>

  <!-- Lead checkbox (max 2) -->
  <label class="flex items-center gap-1 text-sm">
    <input
      type="checkbox"
      :value="l.id"
      v-model="capStore.manualFields.lead_partner_ids"
      :disabled="
        capStore.manualFields.lead_partner_ids.length >= 2 &&
        !capStore.manualFields.lead_partner_ids.includes(l.id)
      "
    />
    Lead
  </label>

</div>

        <!-- MOST RELEVANT AWARDS -->
        <div>
          <h3 class="font-semibold mb-2">Most Relevant Awards</h3>

          <div class="space-y-1">
            <label v-for="a in awards" :key="a.id" class="flex gap-2">
              <input type="checkbox" :value="a.id" v-model="capStore.manualFields.most_rel_award" />
              {{ a.award_name || 'Test Award' }}
            </label>
          </div>
        </div>

      </div>
    </div>

    <div class="flex justify-end pt-4">
      <button class="btn btn-primary btn-lg" @click="generate">
        Generate
      </button>
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

  dataStore.selectedDeals.forEach(d => {
    if (!d.deal_pg) return

    // deal_pg may be:
    // 1) JSON array
    // 2) comma separated string
    // handle both safely

    let pgs = []

    if (Array.isArray(d.deal_pg)) {
      pgs = d.deal_pg
    } else if (typeof d.deal_pg === 'string') {
      try {
        // try JSON first
        const parsed = JSON.parse(d.deal_pg)
        if (Array.isArray(parsed)) pgs = parsed
        else pgs = d.deal_pg.split(',')
      } catch {
        pgs = d.deal_pg.split(',')
      }
    }

    pgs.forEach(pg => {
      if (pg) set.add(pg.trim())
    })
  })

  return [...set]
})


async function generate() {
  await capStore.generateStatement({
    selectedIds: {
      lawyerIds: lawyers.value.map(x => x.id),
      dealIds: dataStore.selectedDeals.map(x => x.id),
      awardIds: awards.value.map(x => x.id)
    },
    manualFields: capStore.manualFields
  })

  router.push('/preview')
}
</script>
