import axios from 'axios'

class LLMService {

  async generateVariables(knowledgePool, tasks) {

    const response = await axios.post(
      'http://localhost:8001/generate',
      {
        knowledge_pool: knowledgePool,
        tasks
      },
      { timeout: 1800000 }
    )

    const results = response.data.results

    const mapped = {}

    results.forEach(r => {
      mapped[r.template_variable] = r.response
    })

    return mapped
  }
}

export default new LLMService()