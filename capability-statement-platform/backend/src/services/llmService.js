import axios from 'axios'

class LLMService {

  async generateVariables(knowledgePool, tasks) {

    console.log("\n================= LLM ENGINE START =================")

    // ✅ DO NOT PRINT FULL KNOWLEDGE POOL (too big)
    console.log("\n[LLM] KNOWLEDGE POOL SUMMARY:")
    console.log({
      lawyers: knowledgePool.lawyers?.length,
      deals: knowledgePool.deals?.length,
      awards: knowledgePool.awards?.length,
      manual_fields_keys: Object.keys(knowledgePool.manual_fields || {})
    })

    // =====================================================
    // 🔥 LOG EACH TASK BEFORE SENDING
    // =====================================================
    tasks.forEach((task, index) => {

      console.log("\n--------------------------------------------------")
      console.log(`[LLM TASK ${index + 1}] ${task.template_variable}`)
      console.log("--------------------------------------------------")

      // ✅ INPUT DATA (FULL VISIBILITY)
      console.log("\n[INPUT DATA]:")
      console.dir(task.input_data, { depth: null })

      // ✅ PROMPT (TRUNCATED)
      console.log("\n[PROMPT PREVIEW]:")
      console.log(task.prompt.substring(0, 800) + "\n...[TRUNCATED]")

      // ✅ VERY IMPORTANT COUNTS
      if (task.input_data?.relevant_deals) {
        console.log(`[INFO] relevant_deals count: ${task.input_data.relevant_deals.length}`)
      }

      if (task.input_data?.previous_deals) {
        console.log(`[INFO] previous_deals count: ${task.input_data.previous_deals.length}`)
      }

      if (task.input_data?.relevant_awards) {
        console.log(`[INFO] relevant_awards count: ${task.input_data.relevant_awards.length}`)
      }
    })

    // =====================================================
    // 🚀 CALL PYTHON (FASTAPI)
    // =====================================================
    console.log("\n[LLM] Sending request to Python...")

    const start = Date.now()

    const response = await axios.post(
      'http://localhost:8001/generate',
      {
        knowledge_pool: knowledgePool,
        tasks
      },
      { timeout: 1800000 }
    )

    const duration = Date.now() - start

    console.log(`[LLM] Python response received in ${duration}ms`)

    const results = response.data.results

    // =====================================================
    // 🔥 LOG RESPONSES
    // =====================================================
    console.log("\n[LLM RESULTS RAW]:")
    console.dir(results, { depth: null })

    const mapped = {}

    results.forEach(r => {

      console.log("\n-----------------------------------")
      console.log(`[LLM OUTPUT] ${r.template_variable}`)
      console.log("-----------------------------------")

      console.log(r.response)

      mapped[r.template_variable] = r.response
    })

    console.log("\n================= LLM ENGINE END =================\n")

    return mapped
  }
}

export default new LLMService()