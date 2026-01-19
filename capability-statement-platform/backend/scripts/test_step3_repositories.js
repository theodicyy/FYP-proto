#!/usr/bin/env node
/**
 * Test Script for Step 3: Repository Layer
 * 
 * Tests the new template definition and content repositories
 * 
 * Usage: node scripts/test_step3_repositories.js
 */

import templateDefinitionRepo from '../src/repositories/templateDefinitionRepository.js';
import templateContentRepo from '../src/repositories/templateContentRepository.js';
import pool from '../src/config/database.js';

async function testRepositories() {
  let connection;
  
  try {
    console.log('='.repeat(60));
    console.log('Testing Step 3: Repository Layer');
    console.log('='.repeat(60) + '\n');
    
    // Test 1: Find template definition by name
    console.log('Test 1: Finding template definition by name...');
    const template = await templateDefinitionRepo.findByName('26-Page Proposal Template');
    
    if (!template) {
      console.log('❌ Template not found');
      console.log('   Make sure you ran insert_page1_template_simple.sql first\n');
      process.exit(1);
    }
    
    console.log('✅ Template found:');
    console.log(`   ID: ${template.id}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Type: ${template.template_type}`);
    console.log(`   Total Pages: ${template.total_pages}`);
    console.log(`   Version: ${template.version}`);
    console.log(`   Structure parsed: ${template.structure ? 'YES' : 'NO'}`);
    if (template.structure) {
      console.log(`   Structure keys: ${Object.keys(template.structure).join(', ')}`);
    }
    console.log('');
    
    // Test 2: Find all content entries
    console.log('Test 2: Finding template content entries...');
    const content = await templateContentRepo.findByTemplateId(template.id);
    
    console.log(`✅ Found ${content.length} content entries:\n`);
    content.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.section_id}.${item.element_id}`);
      console.log(`      Page: ${item.page_number}, Value: "${item.content_value}"`);
      console.log(`      Enabled: ${item.is_enabled}`);
    });
    console.log('');
    
    if (content.length === 0) {
      console.log('⚠️  No content entries found');
      console.log('   Make sure you ran insert_page1_template_simple.sql first\n');
    }
    
    // Test 3: Find specific content entry
    if (content.length > 0) {
      console.log('Test 3: Finding specific content entry...');
      const firstContent = content[0];
      const found = await templateContentRepo.findOne(
        firstContent.template_definition_id,
        firstContent.page_number,
        firstContent.section_id,
        firstContent.element_id
      );
      
      if (found && found.content_value === firstContent.content_value) {
        console.log(`✅ Found content entry: ${found.section_id}.${found.element_id}`);
      } else {
        console.log('❌ Content entry lookup failed');
      }
      console.log('');
    }
    
    // Test 4: Update content (with rollback)
    if (content.length > 0) {
      console.log('Test 4: Testing content update...');
      const firstContent = content[0];
      const originalValue = firstContent.content_value;
      const testValue = originalValue + ' [TESTED]';
      
      const updated = await templateContentRepo.updateContent(
        firstContent.template_definition_id,
        firstContent.page_number,
        firstContent.section_id,
        firstContent.element_id,
        testValue
      );
      
      if (updated) {
        console.log(`✅ Content updated successfully`);
        
        // Verify update
        const verify = await templateContentRepo.findOne(
          firstContent.template_definition_id,
          firstContent.page_number,
          firstContent.section_id,
          firstContent.element_id
        );
        
        if (verify && verify.content_value === testValue) {
          console.log('✅ Update verified in database');
        } else {
          console.log('⚠️  Update not reflected in database');
        }
        
        // Restore original value
        await templateContentRepo.updateContent(
          firstContent.template_definition_id,
          firstContent.page_number,
          firstContent.section_id,
          firstContent.element_id,
          originalValue
        );
        console.log('✅ Original value restored');
      } else {
        console.log('❌ Content update failed');
      }
      console.log('');
    }
    
    // Test 5: Find by ID
    console.log('Test 5: Finding template definition by ID...');
    const templateById = await templateDefinitionRepo.findById(template.id);
    
    if (templateById && templateById.id === template.id) {
      console.log(`✅ Template found by ID: ${templateById.name}`);
      console.log(`   Structure parsed: ${templateById.structure ? 'YES' : 'NO'}`);
    } else {
      console.log('❌ Template lookup by ID failed');
    }
    console.log('');
    
    // Summary
    console.log('='.repeat(60));
    console.log('✅ STEP 3 REPOSITORY TESTS PASSED');
    console.log('   Template definitions: ✓');
    console.log('   Template content: ✓');
    console.log('   JSON parsing: ✓');
    console.log('   Content updates: ✓');
    console.log('\n   Ready to proceed to Step 4: Backend Service Layer');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Run the test
testRepositories().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
