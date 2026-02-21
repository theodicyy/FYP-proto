import fs from "fs"
import path from "path"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"

class DocGenerator {
  constructor() {
    this.templatePath = path.join(
      process.cwd(),
      "src",
      "template",
      "Cap Statement Template V1.docx"
    )
  }

  generate(data = {}) {
    const content = fs.readFileSync(this.templatePath, "binary")

    const zip = new PizZip(content)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    })

    const payload = {
      ...data,

      lead_partners: data.lead_partners || "Jane Tan, Mark Lim",

      partner1: data.partner1 || "Jane Tan",
      partner2: data.partner2 || "Mark Lim",

      lawyer1: data.lawyer1 || "Alicia Ng",
      lawyer2: data.lawyer2 || "Daniel Koh",

      lawyer_desc1: data.lawyer_desc1 || "Partner – Corporate",
      lawyer_desc2: data.lawyer_desc2 || "Partner – Disputes",
      lawyer_desc3: data.lawyer_desc3 || "Associate – Corporate",
      lawyer_desc4: data.lawyer_desc4 || "Associate – Regulatory",

      awards_list: data.awards_list || "Awards Placeholder",
      most_rel_award: data.most_rel_award || "Most Relevant Award",

      previous_summary: data.previous_summary || "Previous work summary",
      previous_transactions: data.previous_transactions || "Transaction summary",

      profile_hyperl: "See Profiles",
      track_hyperl: "See Track Record",
      fee_hyperl: "See Fees",

      LAWYER_CONTACT_CARD: "[Lawyer cards]",
      OUR_PRACTICES: "[Practices]",
      AWARDS_ACCOLADES: "[Awards]",
      OUR_TRACK_RECORD: "[Track Record]",
      TEAM_MAP: "[Team]",
      PARTNER_PROFILE_MAP: "[Profiles]",
      client_matter_map: "[Client Matters]"
    }

    try {
      doc.render(payload)
    } catch (err) {
      console.error("DOC TEMPLATE ERROR:", err)
      throw err
    }

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE"
    })

    console.log("Generated DOCX size:", buffer.length)

    return buffer   // 🔑 RETURN BUFFER ONLY
  }
}

export default new DocGenerator()
