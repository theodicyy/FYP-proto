import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class DocGenerator {
  constructor() {
    // Use __dirname to resolve path relative to this file's location
    // This ensures the path works regardless of where the server is started from
    // __dirname points to backend/src/services/, so we go up one level to backend/src/
    // then into template/
    this.templatePath = path.join(
      __dirname,
      "..",
      "template",
      "Cap Statement Template V1.docx"
    )
    
    // Log the resolved path for debugging
    console.log('📄 Template path resolved to:', this.templatePath)
    console.log('📄 Template exists:', fs.existsSync(this.templatePath))
  }

  /**
   * Ensures footer placeholders are present in all footer sections
   * This fixes the issue where footer only appears on first page
   * Forces all footer files to have the same content as footer3 (which contains the placeholders)
   */
  ensureFooterPlaceholdersInAllSections(zip) {
    try {
      console.log('🔍 Checking footer sections...')
      
      // Get all footer files
      const footerFiles = Object.keys(zip.files).filter(f => 
        f.startsWith('word/footer') && f.endsWith('.xml')
      )

      console.log(`📋 Found ${footerFiles.length} footer files:`, footerFiles)

      if (footerFiles.length === 0) {
        console.warn('⚠️ No footer files found in template.')
        return zip
      }

      // Find the footer file that has placeholders (prefer footer3, but check others too)
      let sourceFooterFile = null
      let sourceFooterName = null
      let sourceFooterBinary = null

      // First, try footer3
      const footer3File = zip.files['word/footer3.xml']
      if (footer3File) {
        try {
          const footer3Content = footer3File.asText()
          const hasPlaceholders = footer3Content && (
            footer3Content.includes('{client_name}') || 
            footer3Content.includes('{tender_number}') ||
            footer3Content.includes('{footer_proposal_text}') ||
            footer3Content.includes('{footer_text}') ||
            footer3Content.includes('{client_name}') ||
            footer3Content.includes('{tender_number}')
          )
          
          if (hasPlaceholders) {
            sourceFooterFile = footer3File
            sourceFooterName = 'word/footer3.xml'
            sourceFooterBinary = footer3File.asBinary()
            console.log('✅ Found placeholders in footer3.xml')
          }
        } catch (e) {
          console.warn('⚠️ Could not read footer3:', e.message)
        }
      }

      // If footer3 doesn't have placeholders, check other footer files
      if (!sourceFooterFile) {
        for (const footerFileName of footerFiles) {
          const footerFile = zip.files[footerFileName]
          if (!footerFile) continue
          
          try {
            const footerContent = footerFile.asText()
            const hasPlaceholders = footerContent && (
              footerContent.includes('{client_name}') || 
              footerContent.includes('{tender_number}') ||
              footerContent.includes('{footer_proposal_text}') ||
              footerContent.includes('{footer_text}')
            )
            
            if (hasPlaceholders) {
              sourceFooterFile = footerFile
              sourceFooterName = footerFileName
              sourceFooterBinary = footerFile.asBinary()
              console.log(`✅ Found placeholders in ${footerFileName}`)
              break
            }
          } catch (e) {
            console.warn(`⚠️ Could not read ${footerFileName}:`, e.message)
          }
        }
      }

      // If no footer has placeholders, we can't propagate
      if (!sourceFooterFile || !sourceFooterBinary) {
        console.warn('⚠️ No footer file found with placeholders. Cannot propagate footer.')
        return zip
      }

      console.log(`📝 Using ${sourceFooterName} as source footer for propagation`)

      // Remove highlighting from source footer before propagating
      let cleanedFooterContent = sourceFooterFile.asText()
      
      // Remove yellow highlighting tags and attributes
      // Remove <w:highlight> tags with yellow value
      cleanedFooterContent = cleanedFooterContent.replace(/<w:highlight[^>]*w:val="yellow"[^>]*\/>/gi, '')
      cleanedFooterContent = cleanedFooterContent.replace(/<w:highlight[^>]*w:val="yellow"[^>]*>.*?<\/w:highlight>/gi, '')
      cleanedFooterContent = cleanedFooterContent.replace(/<w:highlight[^>]*\/>/gi, '') // Remove any highlight tags
      
      // Remove yellow shading: <w:shd w:fill="FFFF00"/> or <w:shd w:fill="yellow"/>
      cleanedFooterContent = cleanedFooterContent.replace(/<w:shd[^>]*w:fill="FFFF00"[^>]*\/>/gi, '')
      cleanedFooterContent = cleanedFooterContent.replace(/<w:shd[^>]*w:fill="yellow"[^>]*\/>/gi, '')
      cleanedFooterContent = cleanedFooterContent.replace(/<w:shd[^>]*w:fill="FFFF00"[^>]*>.*?<\/w:shd>/gi, '')
      cleanedFooterContent = cleanedFooterContent.replace(/<w:shd[^>]*w:fill="yellow"[^>]*>.*?<\/w:shd>/gi, '')
      
      // Remove highlight from run properties: <w:rPr><w:highlight w:val="yellow"/></w:rPr>
      cleanedFooterContent = cleanedFooterContent.replace(/<w:highlight[^>]*\/>/gi, '')
      
      // Remove empty rPr tags that only contained highlight
      cleanedFooterContent = cleanedFooterContent.replace(/<w:rPr>\s*<\/w:rPr>/gi, '')
      
      console.log('🎨 Removed yellow highlighting from footer')
      
      // Convert cleaned XML back to binary format for PizZip
      const cleanedFooterBinary = Buffer.from(cleanedFooterContent, 'utf8')

      let updatedCount = 0
      // Copy cleaned source footer to ALL other footer files to ensure consistency
      footerFiles.forEach(footerFileName => {
        if (footerFileName === sourceFooterName) {
          // Update source footer itself to remove highlighting
          console.log(`📝 Removing highlighting from source footer: ${footerFileName}`)
          try {
            zip.remove(footerFileName)
            zip.file(footerFileName, cleanedFooterBinary)
            updatedCount++
          } catch (e) {
            console.warn(`⚠️ Could not update source footer: ${e.message}`)
          }
          return
        }

        try {
          const footerFile = zip.files[footerFileName]
          if (!footerFile) {
            console.log(`📝 Creating new footer file: ${footerFileName}`)
            zip.file(footerFileName, cleanedFooterBinary)
            updatedCount++
            return
          }

          // Check if this footer already has the same placeholders
          const footerContent = footerFile.asText() || ''
          const hasPlaceholdersInThisFooter = footerContent && (
            footerContent.includes('{client_name}') || 
            footerContent.includes('{tender_number}') ||
            footerContent.includes('{footer_proposal_text}') ||
            footerContent.includes('{footer_text}')
          )
          
          // Always update to ensure consistency (even if it already has placeholders)
          // This ensures all footers are identical and without highlighting
          console.log(`📝 Updating footer: ${footerFileName}${hasPlaceholdersInThisFooter ? ' (already has placeholders, but updating for consistency)' : ''}`)
          
          try {
            // Remove and re-add with cleaned content (no highlighting)
            zip.remove(footerFileName)
            zip.file(footerFileName, cleanedFooterBinary)
            updatedCount++
          } catch (updateError) {
            console.warn(`⚠️ Could not update ${footerFileName} with remove/add:`, updateError.message)
            // Try direct update
            try {
              zip.file(footerFileName, cleanedFooterBinary)
              updatedCount++
              console.log(`✅ Updated ${footerFileName} using direct method`)
            } catch (altError) {
              console.error(`❌ Failed to update ${footerFileName}:`, altError.message)
            }
          }
        } catch (e) {
          console.error(`❌ Error processing ${footerFileName}:`, e.message)
          // Continue with other files
        }
      })

      console.log(`✅ Footer propagation complete: ${updatedCount} footer sections updated out of ${footerFiles.length} total footer files`)
      return zip
    } catch (error) {
      console.error('❌ Error ensuring footer placeholders:', error.message)
      console.error('Stack:', error.stack)
      // Don't throw - allow document generation to continue even if footer propagation fails
      return zip
    }
  }

  generate(data = {}) {
    try {
      console.log('📄 Starting document generation...')
      console.log('📄 Template path:', this.templatePath)
      
      if (!fs.existsSync(this.templatePath)) {
        const err = new Error(
          `Template file not found. Please add "Cap Statement Template V1.docx" to backend/src/template/ (expected path: ${this.templatePath})`
        )
        err.code = 'TEMPLATE_NOT_FOUND'
        console.error('❌ Template not found:', this.templatePath)
        throw err
      }
      
      console.log('✅ Template file exists')
      const content = fs.readFileSync(this.templatePath, "binary")
      console.log('✅ Template file read, size:', content.length, 'bytes')

      const zip = new PizZip(content)
      console.log('✅ PizZip initialized')

      // Ensure footer placeholders are in ALL footer files (not just footer3)
      // This ensures the footer appears on all pages, not just the first page
      // Wrap in try-catch to prevent footer propagation errors from breaking document generation
      try {
        this.ensureFooterPlaceholdersInAllSections(zip)
      } catch (footerError) {
        console.error('⚠️ Footer propagation failed, continuing with document generation:', footerError.message)
        // Continue with document generation even if footer propagation fails
      }

      console.log('📝 Initializing Docxtemplater...')
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      })
      console.log('✅ Docxtemplater initialized')

    // Build payload with data from capStatementService, preserving all mapped fields
    // Only add minimal fallbacks for critical template placeholders that might not be mapped
    const payload = {
      ...data,

      // Ensure all fields have safe defaults (null-safe)
      lead_partners: data.lead_partners || "Jane Tan, Mark Lim",
      partner1: data.partner1 || "Jane Tan",
      partner2: data.partner2 || "Mark Lim",
      partner3: data.partner3 || "",
      partner4: data.partner4 || "",

      lawyer1: data.lawyer1 || data.lawyer1_full_name || data.lawyer1_name || "Alicia Ng",
      lawyer2: data.lawyer2 || data.lawyer2_full_name || data.lawyer2_name || "Daniel Koh",
      lawyer1_name: data.lawyer1_name || data.lawyer1 || data.lawyer1_full_name || "Alicia Ng",
      lawyer2_name: data.lawyer2_name || data.lawyer2 || data.lawyer2_full_name || "Daniel Koh",

      lawyer_desc1: data.lawyer_desc1 || "Partner – Corporate",
      lawyer_desc2: data.lawyer_desc2 || "Partner – Disputes",
      lawyer_desc3: data.lawyer_desc3 || "",
      lawyer_desc4: data.lawyer_desc4 || "",

      // Page 5 & 6 - Project Heads
      lawyer1_title: data.lawyer1_title || "",
      lawyer2_title: data.lawyer2_title || "",
      lawyer1_designation: data.lawyer1_designation || "",
      lawyer2_designation: data.lawyer2_designation || "",
      lawyer1_qualifications: data.lawyer1_qualifications || "",
      lawyer2_qualifications: data.lawyer2_qualifications || "",
      lawyer1_admissions: data.lawyer1_admissions || "",
      lawyer2_admissions: data.lawyer2_admissions || "",
      lawyer1_qualifications_admissions: data.lawyer1_qualifications_admissions || "",
      lawyer2_qualifications_admissions: data.lawyer2_qualifications_admissions || "",
      qualification1: data.qualification1 || "",
      admission1: data.admission1 || "",
      // Pages 5 & 6 - Formatted bullet point fields
      lawyer1_pg5_qual_adm: data.lawyer1_pg5_qual_adm || data.lawyer1_qualifications_admissions || "",
      lawyer2_pg5_qual_adm: data.lawyer2_pg5_qual_adm || data.lawyer2_qualifications_admissions || "",
      lawyer1_pg5_bio: data.lawyer1_pg5_bio || data.lawyer1_bio || "",
      lawyer2_pg5_bio: data.lawyer2_pg5_bio || data.lawyer2_bio || "",

      // Practice Groups
      lawyer1_practice_group: data.lawyer1_practice_group || "",
      lawyer2_practice_group: data.lawyer2_practice_group || "",
      lawyer3_practice_group: data.lawyer3_practice_group || "",
      lawyer4_practice_group: data.lawyer4_practice_group || "",
      lawyer_pg1: data.lawyer_pg1 || data.lawyer1_practice_group || "",
      lawyer_pg2: data.lawyer_pg2 || data.lawyer2_practice_group || "",
      lawyer_pg3: data.lawyer_pg3 || data.lawyer3_practice_group || "",
      lawyer_pg4: data.lawyer_pg4 || data.lawyer4_practice_group || "",

      // Pages 21 & 22 - Full Lawyer Details
      lawyer1_full_name: data.lawyer1_full_name || data.lawyer1 || "Alicia Ng",
      lawyer2_full_name: data.lawyer2_full_name || data.lawyer2 || "Daniel Koh",
      lawyer3_full_name: data.lawyer3_full_name || "",
      lawyer4_full_name: data.lawyer4_full_name || "",
      lawyer1_bio: data.lawyer1_bio || "",
      lawyer2_bio: data.lawyer2_bio || "",
      lawyer3_bio: data.lawyer3_bio || "",
      lawyer4_bio: data.lawyer4_bio || "",
      lawyer1_years_experience: data.lawyer1_years_experience || 0,
      lawyer2_years_experience: data.lawyer2_years_experience || 0,
      lawyer3_years_experience: data.lawyer3_years_experience || 0,
      lawyer4_years_experience: data.lawyer4_years_experience || 0,

      // Lawyer Deal Descriptions
      lawyer_deal_desc1: data.lawyer_deal_desc1 || data.lawyer1_bio || data.lawyer_desc1 || "",
      lawyer_deal_desc2: data.lawyer_deal_desc2 || data.lawyer2_bio || data.lawyer_desc2 || "",
      lawyer_deal_desc3: data.lawyer_deal_desc3 || data.lawyer3_bio || data.lawyer_desc3 || "",

      // Footer (All Pages) - Multiple variations for template compatibility
      // Try all possible placeholder name variations
      footer_proposal_text: data.footer_proposal_text || data.footer_text || data.proposal_footer || data.footer || data.proposal_text || data.client_footer || "",
      footer_text: data.footer_text || data.footer_proposal_text || data.proposal_footer || data.footer || data.proposal_text || data.client_footer || "",
      proposal_footer: data.proposal_footer || data.footer_proposal_text || data.footer_text || data.footer || data.proposal_text || data.client_footer || "",
      footer: data.footer || data.footer_proposal_text || data.footer_text || data.proposal_footer || data.proposal_text || data.client_footer || "",
      proposal_text: data.proposal_text || data.footer_proposal_text || data.footer_text || data.proposal_footer || data.footer || data.client_footer || "",
      client_footer: data.client_footer || data.footer_proposal_text || data.footer_text || data.proposal_footer || data.footer || data.proposal_text || "",
      
      // Separate footer fields (in case template uses them individually)
      footer_client_name: data.footer_client_name || data.client_name || "",
      footer_tender_number: data.footer_tender_number || data.tender_number || "",
      
      // Explicit client_name and tender_number for footer placeholders {client_name} and {tender_number}
      client_name: data.client_name || "",
      tender_number: data.tender_number || "",

      // Client info
      client_name: data.client_name || "",
      client_shortname: data.client_shortname || "",
      tender_number: data.tender_number || "",

      // Awards (Page 14)
      awards_list: data.awards_list || "Test Award 2025",
      awards_narrative: data.awards_narrative || data.awards_list || "",
      award_pg1: data.award_pg1 || data.awards_narrative || "",
      award_pg2: data.award_pg2 || "",
      award_pg3: data.award_pg3 || "",
      most_rel_award: data.most_rel_award || data.awards_list || "Test Award 2025",

      // Deals
      previous_summary: data.previous_summary || "Previous work summary",
      previous_transactions: data.previous_transactions || "Transaction summary",
      previous_client1: data.previous_client1 || "Test Client A",
      previous_client2: data.previous_client2 || "Test Client B",

      // Hyperlinks (static)
      profile_hyperl: "See Profiles",
      track_hyperl: "See Track Record",
      fee_hyperl: "See Fees",

      // Section placeholders (static)
      LAWYER_CONTACT_CARD: "[Lawyer cards]",
      OUR_PRACTICES: "[Practices]",
      AWARDS_ACCOLADES: "[Awards]",
      OUR_TRACK_RECORD: "[Track Record]",
      TEAM_MAP: "[Team]",
      PARTNER_PROFILE_MAP: "[Profiles]",
      client_matter_map: "[Client Matters]"
    }

    // Debug: Log footer-related payload fields
    console.log("=== FOOTER DEBUG INFO ===")
    console.log("Footer payload fields:", {
      footer_proposal_text: payload.footer_proposal_text || '(empty)',
      footer_text: payload.footer_text || '(empty)',
      proposal_footer: payload.proposal_footer || '(empty)',
      footer: payload.footer || '(empty)',
      proposal_text: payload.proposal_text || '(empty)',
      client_footer: payload.client_footer || '(empty)',
      footer_client_name: payload.footer_client_name || '(empty)',
      footer_tender_number: payload.footer_tender_number || '(empty)',
      client_name: payload.client_name || '(empty)',
      tender_number: payload.tender_number || '(empty)'
    })
    
    // Also log all keys that contain 'footer', 'proposal', 'client', or 'tender' to help identify template placeholders
    const footerRelatedKeys = Object.keys(payload).filter(key => 
      key.toLowerCase().includes('footer') || 
      key.toLowerCase().includes('proposal') || 
      (key.toLowerCase().includes('client') && key.toLowerCase().includes('name')) ||
      key.toLowerCase().includes('tender')
    )
    console.log("All footer-related keys in payload:", footerRelatedKeys)
    
    // Verify critical footer placeholders are present
    if (!payload.client_name && !payload.tender_number) {
      console.warn("⚠️ WARNING: Both client_name and tender_number are empty/missing!")
    } else {
      console.log("✅ Footer placeholders found:", {
        client_name: payload.client_name ? `"${payload.client_name}"` : '(missing)',
        tender_number: payload.tender_number ? `"${payload.tender_number}"` : '(missing)'
      })
    }

    try {
      console.log('📝 Rendering document with payload...')
      doc.render(payload)
      console.log('✅ Document rendered successfully')
    } catch (err) {
      console.error("❌ DOC TEMPLATE ERROR:", err)
      console.error("Error name:", err.name)
      console.error("Error message:", err.message)
      if (err.properties) {
        console.error("Error properties:", JSON.stringify(err.properties, null, 2))
      }
      // Re-throw with more context
      const renderError = new Error(`Document rendering failed: ${err.message}`)
      renderError.code = 'RENDER_ERROR'
      renderError.originalError = err
      throw renderError
    }

    try {
      console.log('📦 Generating DOCX buffer...')
      
      // After rendering, ensure footer consistency across all sections
      // Get the rendered zip and verify footers are consistent
      const renderedZip = doc.getZip()
      
      // Verify footer consistency after rendering
      try {
        const footerFiles = Object.keys(renderedZip.files).filter(f => 
          f.startsWith('word/footer') && f.endsWith('.xml')
        )
        console.log(`🔍 Verifying ${footerFiles.length} footer files after rendering...`)
        
        // Check if all footers have been rendered (placeholders replaced)
        let renderedFooterCount = 0
        footerFiles.forEach(footerFileName => {
          try {
            const footerContent = renderedZip.files[footerFileName]?.asText() || ''
            // Check if placeholders have been replaced (no {client_name} or {tender_number} placeholders remaining)
            const hasUnrenderedPlaceholders = footerContent.includes('{client_name}') || 
                                             footerContent.includes('{tender_number}') ||
                                             footerContent.includes('{footer_proposal_text}') ||
                                             footerContent.includes('{footer_text}')
            
            if (!hasUnrenderedPlaceholders && footerContent.length > 0) {
              renderedFooterCount++
            }
          } catch (e) {
            // Ignore errors in verification
          }
        })
        
        console.log(`✅ Footer verification: ${renderedFooterCount}/${footerFiles.length} footers have rendered content`)
      } catch (verifyError) {
        console.warn('⚠️ Footer verification failed (non-critical):', verifyError.message)
      }
      
      const buffer = renderedZip.generate({
        type: "nodebuffer",
        compression: "DEFLATE"
      })
      console.log("✅ Generated DOCX size:", buffer.length, "bytes")
      return buffer
    } catch (err) {
      console.error("❌ DOCX GENERATION ERROR:", err)
      const genError = new Error(`DOCX buffer generation failed: ${err.message}`)
      genError.code = 'BUFFER_GENERATION_ERROR'
      genError.originalError = err
      throw genError
    }
    } catch (error) {
      console.error("❌ DOCUMENT GENERATION FAILED:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      // Re-throw to let controller handle it
      throw error
    }
  }
}

export default new DocGenerator()
