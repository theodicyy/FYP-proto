/**
 * Placeholder Parser Utility
 * 
 * Handles parsing, validation, and replacement of dynamic placeholders:
 * {{lawyers}}, {{deals}}, {{awards}}, {{date}}
 */

const PLACEHOLDERS = {
  LAWYERS: '{{lawyers}}',
  DEALS: '{{deals}}',
  AWARDS: '{{awards}}',
  DATE: '{{date}}'
}

/**
 * Extract all placeholders from text content
 * @param {string} content - HTML or text content
 * @returns {Array<string>} Array of placeholder strings found
 */
export function extractPlaceholders(content) {
  if (!content) return []
  
  const placeholderRegex = /\{\{(lawyers|deals|awards|date)\}\}/g
  const matches = content.matchAll(placeholderRegex)
  const placeholders = []
  
  for (const match of matches) {
    if (!placeholders.includes(match[0])) {
      placeholders.push(match[0])
    }
  }
  
  return placeholders
}

/**
 * Validate that a placeholder is supported
 * @param {string} placeholder - Placeholder string (e.g., "{{lawyers}}")
 * @returns {boolean} True if placeholder is supported
 */
export function isValidPlaceholder(placeholder) {
  return Object.values(PLACEHOLDERS).includes(placeholder)
}

/**
 * Replace placeholders in HTML content with formatted data
 * Note: This preserves HTML structure, replacing only text nodes containing placeholders
 * @param {string} htmlContent - HTML content with placeholders
 * @param {Object} data - Data object with lawyers, deals, awards arrays
 * @param {Function} formatPlaceholder - Function to format a placeholder with data
 * @returns {string} HTML content with placeholders replaced
 */
export function replacePlaceholdersInHTML(htmlContent, data, formatPlaceholder) {
  if (!htmlContent) return ''
  
  let replaced = htmlContent
  
  // Replace each placeholder globally
  Object.values(PLACEHOLDERS).forEach(placeholder => {
    const formatted = formatPlaceholder(placeholder, data)
    // Escape HTML special characters in the formatted content
    const escapedFormatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Replace all occurrences of the placeholder
    const regex = new RegExp(escapeRegExp(placeholder), 'g')
    replaced = replaced.replace(regex, escapedFormatted)
  })
  
  return replaced
}

/**
 * Replace placeholders in plain text content
 * @param {string} textContent - Plain text with placeholders
 * @param {Object} data - Data object with lawyers, deals, awards arrays
 * @param {Function} formatPlaceholder - Function to format a placeholder with data
 * @returns {string} Text with placeholders replaced
 */
export function replacePlaceholdersInText(textContent, data, formatPlaceholder) {
  if (!textContent) return ''
  
  let replaced = textContent
  
  Object.values(PLACEHOLDERS).forEach(placeholder => {
    const formatted = formatPlaceholder(placeholder, data)
    const regex = new RegExp(escapeRegExp(placeholder), 'g')
    replaced = replaced.replace(regex, formatted)
  })
  
  return replaced
}

/**
 * Check if content contains any placeholders
 * @param {string} content - HTML or text content
 * @returns {boolean} True if placeholders are found
 */
export function hasPlaceholders(content) {
  if (!content) return false
  return /\{\{(lawyers|deals|awards|date)\}\}/.test(content)
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default {
  PLACEHOLDERS,
  extractPlaceholders,
  isValidPlaceholder,
  replacePlaceholdersInHTML,
  replacePlaceholdersInText,
  hasPlaceholders
}
