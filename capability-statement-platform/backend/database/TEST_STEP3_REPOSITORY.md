# Step 3 Testing Guide: Backend Repository Layer

## What Was Created

1. **TemplateDefinitionRepository** (`backend/src/repositories/templateDefinitionRepository.js`)
   - CRUD operations for `template_definitions` table
   - Handles JSON parsing/stringifying for structure_json and styles_json
   - Version management (increments version on structure changes)
   - Creates version history entries in `template_versions`

2. **TemplateContentRepository** (`backend/src/repositories/templateContentRepository.js`)
   - CRUD operations for `template_content` table
   - Supports batch updates
   - Upsert operations (create or update)
   - Filter by page, section, enabled status

## How to Test

### Option 1: Create a Simple Test Script

Create a test file to verify repository methods work:

```javascript
// backend/scripts/test_step3_repositories.js
import templateDefinitionRepo from '../src/repositories/templateDefinitionRepository.js';
import templateContentRepo from '../src/repositories/templateContentRepository.js';

async function testRepositories() {
  try {
    console.log('Testing Template Definition Repository...\n');
    
    // Test 1: Find by name
    const template = await templateDefinitionRepo.findByName('26-Page Proposal Template');
    console.log('✅ Found template:', template?.name);
    console.log('   ID:', template?.id);
    console.log('   Structure keys:', template?.structure ? Object.keys(template.structure) : 'null');
    
    // Test 2: Find content
    if (template) {
      const content = await templateContentRepo.findByTemplateId(template.id);
      console.log(`\n✅ Found ${content.length} content entries`);
      
      // Test 3: Update content
      if (content.length > 0) {
        const firstContent = content[0];
        const originalValue = firstContent.content_value;
        const newValue = originalValue + ' [TESTED]';
        
        const updated = await templateContentRepo.updateContent(
          firstContent.template_definition_id,
          firstContent.page_number,
          firstContent.section_id,
          firstContent.element_id,
          newValue
        );
        
        console.log(`✅ Updated content: ${updated ? 'SUCCESS' : 'FAILED'}`);
        
        // Restore original value
        await templateContentRepo.updateContent(
          firstContent.template_definition_id,
          firstContent.page_number,
          firstContent.section_id,
          firstContent.element_id,
          originalValue
        );
        console.log('✅ Restored original value');
      }
    }
    
    console.log('\n✅ Repository tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testRepositories();
```

Run it:
```bash
cd backend
node scripts/test_step3_repositories.js
```

### Option 2: Manual API Testing (After Step 4-5)

Once controllers and routes are implemented, test via API endpoints.

## Success Criteria

✅ Repository methods can read template definitions  
✅ JSON structure is parsed correctly  
✅ Content entries can be fetched  
✅ Content can be updated  
✅ No SQL errors or connection issues  

## Key Methods to Test

### TemplateDefinitionRepository:
- `findByName('26-Page Proposal Template')` - Should return template with parsed structure
- `findById(1)` - Should return template by ID
- `findAll()` - Should return list of templates

### TemplateContentRepository:
- `findByTemplateId(1)` - Should return all 4 content entries
- `updateContent(templateId, page, section, element, value)` - Should update successfully
- `findOne(templateId, page, section, element)` - Should find specific content

## Next Steps

Once repositories are tested and working:
- ✅ Can read template definitions
- ✅ Can read/update template content
- ✅ JSON parsing works correctly

Then proceed to **Step 4: Backend Service Layer** and **Step 5: Backend Controller & Routes**
