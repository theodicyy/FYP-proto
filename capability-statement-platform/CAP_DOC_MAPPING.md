# CAP Document Variable Mapping Reference

This document maps all template variables to their database sources and form fields.

## 📋 Mapping Table

### Footer Notes (All Pages)

| Template Variable | Source | Database Table/Field | Transformation | Notes |
|------------------|--------|---------------------|----------------|-------|
| `{footer_proposal_text}` | Form submission | `manualFields.client_name` + `manualFields.tender_number` | Conditional: "Proposal for [Client Name]" + " – [Tender Number]" if exists | Only shows tender number if provided |

**Example Output:**
- With tender: `"Proposal for Acme Corporation – T-2024-001"`
- Without tender: `"Proposal for Acme Corporation"`
- No client: `""` (empty)

---

### Page 5 & 6 — Project Heads Section

| Template Variable | Source | Database Table/Field | Transformation | Notes |
|------------------|--------|---------------------|----------------|-------|
| `{lawyer1_title}` | Database | `lawyers.title` (first selected lawyer) | Direct mapping | First bullet point |
| `{lawyer2_title}` | Database | `lawyers.title` (second selected lawyer) | Direct mapping | First bullet point |
| `{lawyer1_designation}` | Database | `lawyers.designation` (first selected lawyer) | Direct mapping | Second bullet point |
| `{lawyer2_designation}` | Database | `lawyers.designation` (second selected lawyer) | Direct mapping | Second bullet point |
| `{lawyer1_qualifications}` | Database | `lawyers.qualifications` (first selected lawyer) | Direct mapping | Second bullet point |
| `{lawyer2_qualifications}` | Database | `lawyers.qualifications` (second selected lawyer) | Direct mapping | Second bullet point |
| `{lawyer1_admissions}` | Database | `lawyers.admissions` (first selected lawyer) | Direct mapping | Second bullet point |
| `{lawyer2_admissions}` | Database | `lawyers.admissions` (second selected lawyer) | Direct mapping | Second bullet point |
| `{lawyer1_qualifications_admissions}` | Database | `lawyers.qualifications` + `lawyers.admissions` | Combined with comma separator | Pre-formatted for template |
| `{lawyer2_qualifications_admissions}` | Database | `lawyers.qualifications` + `lawyers.admissions` | Combined with comma separator | Pre-formatted for template |

**Template Usage Example:**
```
• {lawyer1_title}
• {lawyer1_designation}
• {lawyer1_qualifications_admissions}
```

---

### Page 14 — Awards & Accolades

| Template Variable | Source | Database Table/Field | Transformation | Notes |
|------------------|--------|---------------------|----------------|-------|
| `{awards_list}` | Database | `awards` table (selected IDs) | Format: `"Award Name – Organization (Year)"` per line | Simple list format, newline-separated |
| `{awards_narrative}` | Database | `awards` table (selected IDs) | Narrative text: `"Award Name by Organization (Year) - Category. Description."` | Human-readable prose format |

**Example Output:**
- `awards_list`: 
  ```
  Best Corporate Law Firm – Legal500 (2024)
  Dispute Resolution Excellence – Chambers (2023)
  ```
- `awards_narrative`: 
  ```
  Best Corporate Law Firm by Legal500 (2024) - Corporate. Top ranked corporate team. Dispute Resolution Excellence by Chambers (2023) - Litigation. Outstanding litigation practice.
  ```

---

### Pages 21 & 22 — Lawyer Details

| Template Variable | Source | Database Table/Field | Transformation | Notes |
|------------------|--------|---------------------|----------------|-------|
| `{lawyer1_full_name}` | Database | `lawyers.first_name` + `lawyers.last_name` | `"First Last"` | Full name for single lawyer section |
| `{lawyer2_full_name}` | Database | `lawyers.first_name` + `lawyers.last_name` | `"First Last"` | Full name for single lawyer section |
| `{lawyer1_bio}` | Database | `lawyers.bio` | Direct mapping | Biography text |
| `{lawyer2_bio}` | Database | `lawyers.bio` | Direct mapping | Biography text |
| `{lawyer1_practice_group}` | Database | `lawyers.practice_group` | Direct mapping | Practice area |
| `{lawyer2_practice_group}` | Database | `lawyers.practice_group` | Direct mapping | Practice area |
| `{lawyer1_years_experience}` | Database | `lawyers.years_experience` | Direct mapping (number) | Years of experience |
| `{lawyer2_years_experience}` | Database | `lawyers.years_experience` | Direct mapping (number) | Years of experience |
| `{lawyer1}` | Database | `lawyers.first_name` + `lawyers.last_name` | `"First Last"` | Alias for `lawyer1_full_name` |
| `{lawyer2}` | Database | `lawyers.first_name` + `lawyers.last_name` | `"First Last"` | Alias for `lawyer2_full_name` |
| `{lawyer_desc1}` | Database | `lawyers.title` + `lawyers.practice_group` | `"Title – Practice Group"` | Combined description |
| `{lawyer_desc2}` | Database | `lawyers.title` + `lawyers.practice_group` | `"Title – Practice Group"` | Combined description |

**Note:** All lawyer variables use the first two selected lawyers from `selectedIds.lawyerIds`.

---

### Page 23 — Client Short Name

| Template Variable | Source | Database Table/Field | Transformation | Notes |
|------------------|--------|---------------------|----------------|-------|
| `{client_shortname}` | Form submission | `manualFields.client_shortname` | Direct mapping | Short name for client |

**Example:** `"Acme"` instead of `"Acme Corporation"`

---

### General Variables

| Template Variable | Source | Database Table/Field | Transformation | Notes |
|------------------|--------|---------------------|----------------|-------|
| `{client_name}` | Form submission | `manualFields.client_name` | Direct mapping | Full client name |
| `{tender_number}` | Form submission | `manualFields.tender_number` | Direct mapping | Optional tender reference |
| `{date}` | Form submission | `manualFields.date` | Direct mapping | Document date |
| `{lead_partners}` | Database | `lawyers` (first 2 selected) | `"Name1, Name2"` | Comma-separated lead partners |
| `{partner1}` | Database | `lawyers[0]` | `"First Last"` | First partner name |
| `{partner2}` | Database | `lawyers[1]` | `"First Last"` | Second partner name |
| `{previous_summary}` | Database | `deals.deal_summary` (selected) | Newline-separated summaries | Previous work summary |
| `{previous_transactions}` | Database | `deals.deal_summary` (selected) | Newline-separated summaries | Transaction summary |
| `{previous_client1}` | Database | `deals[0].client_name` | Direct mapping | First deal client |
| `{previous_client2}` | Database | `deals[1].client_name` | Direct mapping | Second deal client |

---

## 🔧 Implementation Details

### Data Flow

1. **Form Submission** → `manualFields` object
2. **Selection** → `selectedIds` object (`lawyerIds`, `dealIds`, `awardIds`)
3. **Database Query** → Fetch records by IDs
4. **Mapping** → `capStatementService.buildTemplatePayload()` transforms data
5. **Template Rendering** → `docGenerator.generate()` injects into Word template

### Null Safety

All mappings include null-safe fallbacks:
- Empty strings (`''`) for text fields
- Default values for critical fields (e.g., `'Jane Tan, Mark Lim'` for lead partners)
- Empty arrays handled gracefully
- Optional chaining (`?.`) used for nested properties

### Conditional Logic

- **Footer text**: Only includes tender number if provided
- **Awards narrative**: Only generated if awards exist
- **Lawyer fields**: Uses first two selected lawyers, falls back to defaults if none selected

---

## ✅ Fixed Issues

### ✅ i) Footer Notes — All Pages
- ✅ Mapped `client_name` from form submission
- ✅ Mapped `tender_number` with conditional display
- ✅ Created `footer_proposal_text` with proper formatting

### ✅ ii) Page 5 & 6 — Project Heads Section
- ✅ Mapped `title` from `lawyers.title`
- ✅ Mapped `designation` from `lawyers.designation`
- ✅ Mapped `qualifications` from `lawyers.qualifications`
- ✅ Mapped `admissions` from `lawyers.admissions`
- ✅ Created combined `qualifications_admissions` fields

### ✅ iii) Page 14 — Awards & Accolades
- ✅ Improved `awards_list` formatting (handles arrays properly)
- ✅ Added `awards_narrative` for human-readable prose
- ✅ Proper handling of multiple awards
- ✅ No raw JSON output

### ✅ iv) Page 21 — Missing Lawyer Params
- ✅ Mapped all lawyer fields (`bio`, `practice_group`, `years_experience`)
- ✅ Added `lawyer1_full_name` and `lawyer2_full_name`
- ✅ Ensured all placeholders have valid mappings

### ✅ v) Page 22 — Single Lawyer Section
- ✅ Same mappings as Page 21
- ✅ Null safety ensured
- ✅ Formatting matches Page 21 logic

### ✅ vi) Page 23 — Client Short Name
- ✅ Added `client_shortname` mapping from form submission
- ✅ Available in template payload

### ✅ vii) Refactor & Bug Fix
- ✅ Added null-safe fallbacks throughout
- ✅ Consolidated mapping logic in `capStatementService`
- ✅ Removed hardcoded values from `docGenerator` (kept minimal safe defaults)
- ✅ Added defensive formatting logic
- ✅ Fixed potential null reference crashes

---

## 📝 Template Placeholder Usage

In your Word template (`.docx`), use these placeholders:

```
{footer_proposal_text}
{client_name}
{client_shortname}
{tender_number}
{date}

{lead_partners}
{partner1}
{partner2}

{lawyer1_title}
{lawyer1_designation}
{lawyer1_qualifications}
{lawyer1_admissions}
{lawyer1_qualifications_admissions}

{lawyer1_full_name}
{lawyer1_bio}
{lawyer1_practice_group}
{lawyer1_years_experience}
{lawyer_desc1}

{awards_list}
{awards_narrative}

{previous_summary}
{previous_transactions}
{previous_client1}
{previous_client2}
```

---

## ⚠️ Assumptions & Notes

1. **Lawyer Selection**: Uses first two selected lawyers from `selectedIds.lawyerIds`
2. **Deal Selection**: Uses first two selected deals from `selectedIds.dealIds`
3. **Award Selection**: Uses all selected awards from `selectedIds.awardIds`
4. **Fallback Values**: Minimal fallbacks kept for critical template variables to prevent rendering errors
5. **Date Format**: Date is passed as-is from form (no transformation applied)
6. **Empty Values**: Empty strings are used instead of null/undefined to prevent template errors

---

## 🚀 Next Steps

If you need additional mappings:
1. Add field to `manualFields` in frontend form
2. Add mapping logic in `capStatementService.buildTemplatePayload()`
3. Update this documentation
4. Test with actual Word template
