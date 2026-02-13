/**
 * Script to extract placeholder names from Word template
 * This helps identify what placeholder names are actually used in the template
 */

import fs from 'fs'
import path from 'path'
import PizZip from 'pizzip'

const templatePath = path.join(
  process.cwd(),
  'src',
  'template',
  'Cap Statement Template V1.docx'
)

function extractPlaceholders() {
  if (!fs.existsSync(templatePath)) {
    console.error('Template file not found:', templatePath)
    return
  }

  const content = fs.readFileSync(templatePath, 'binary')
  const zip = new PizZip(content)

  const placeholders = new Set()

  // Check document.xml (main body)
  if (zip.files['word/document.xml']) {
    const docXml = zip.files['word/document.xml'].asText()
    const matches = docXml.match(/\{[^}]+\}/g) || []
    matches.forEach(m => placeholders.add(m))
  }

  // Check all footer files
  const footerFiles = Object.keys(zip.files).filter(f => f.startsWith('word/footer'))
  footerFiles.forEach(fileName => {
    const footerXml = zip.files[fileName].asText()
    const matches = footerXml.match(/\{[^}]+\}/g) || []
    matches.forEach(m => placeholders.add(m))
    console.log(`\nFound in ${fileName}:`, matches)
  })

  // Check all header files
  const headerFiles = Object.keys(zip.files).filter(f => f.startsWith('word/header'))
  headerFiles.forEach(fileName => {
    const headerXml = zip.files[fileName].asText()
    const matches = headerXml.match(/\{[^}]+\}/g) || []
    matches.forEach(m => placeholders.add(m))
    console.log(`\nFound in ${fileName}:`, matches)
  })

  console.log('\n=== ALL PLACEHOLDERS FOUND ===')
  const sorted = Array.from(placeholders).sort()
  sorted.forEach(p => console.log(p))

  console.log('\n=== FOOTER-RELATED PLACEHOLDERS ===')
  const footerRelated = sorted.filter(p => 
    p.toLowerCase().includes('footer') || 
    p.toLowerCase().includes('proposal') ||
    p.toLowerCase().includes('client') ||
    p.toLowerCase().includes('tender')
  )
  footerRelated.forEach(p => console.log(p))

  return Array.from(placeholders)
}

extractPlaceholders()
