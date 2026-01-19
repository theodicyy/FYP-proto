/**
 * Test Script for Step 2: JSON Schema Extraction
 * 
 * Verifies that:
 * 1. Template definition was inserted into template_definitions
 * 2. Content values were inserted into template_content
 * 3. All expected data is present
 * 
 * Usage: node scripts/test_step2.js
 */

import pool from '../src/config/database.js';

async function testStep2() {
  let connection;
  
  try {
    // Get connection from pool
    connection = await pool.getConnection();

    console.log('✅ Connected to database\n');

    // Test 1: Check if template definition exists
    console.log('Test 1: Checking template definition...');
    const [templates] = await connection.execute(
      `SELECT id, name, template_type, total_pages, version, is_active, 
       LENGTH(structure_json) as json_length, created_at
       FROM template_definitions
       WHERE name = '26-Page Proposal Template'`
    );

    if (templates.length === 0) {
      console.log('❌ FAIL: Template definition not found');
      console.log('   Run insert_page1_template_simple.sql first\n');
      process.exit(1);
    }

    const template = templates[0];
    console.log('✅ Template definition found:');
    console.log(`   ID: ${template.id}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Type: ${template.template_type}`);
    console.log(`   Total Pages: ${template.total_pages}`);
    console.log(`   Version: ${template.version}`);
    console.log(`   Active: ${template.is_active}`);
    console.log(`   JSON Length: ${template.json_length} bytes`);
    console.log(`   Created: ${template.created_at}\n`);

    // Test 2: Check content values
    console.log('Test 2: Checking content values...');
    const [content] = await connection.execute(
      `SELECT page_number, section_id, element_id, content_type, 
       content_value, is_enabled
       FROM template_content
       WHERE template_definition_id = ?
       ORDER BY page_number, section_id, element_id`,
      [template.id]
    );

    console.log(`✅ Found ${content.length} content entries:\n`);

    const expectedContent = {
      'footer.footer-left-text': 'ASEAN | CHINA | MIDDLE EAST',
      'footer.footer-subtext': 'a regional law network',
      'title-section.date-text': 'INSERT DATE [DDMonthYYYY]',
      'title-section.title-text': 'PROPOSAL FOR [INSERT CLIENT NAME]',
    };

    // Check each content item (order-independent matching)
    let allFound = true;
    const foundKeys = new Set();
    
    content.forEach((item) => {
      const key = `${item.section_id}.${item.element_id}`;
      const expectedValue = expectedContent[key];
      
      if (expectedValue && item.content_value === expectedValue) {
        console.log(`   ✅ ${key}: "${item.content_value}"`);
        foundKeys.add(key);
      } else if (expectedValue) {
        console.log(`   ❌ ${key}: Expected "${expectedValue}", got "${item.content_value}"`);
        allFound = false;
      } else {
        console.log(`   ⚠️  Unexpected entry: ${key}: "${item.content_value}"`);
        allFound = false;
      }
    });

    // Check if all expected keys were found
    Object.keys(expectedContent).forEach((key) => {
      if (!foundKeys.has(key)) {
        console.log(`   ❌ Missing expected entry: ${key}: "${expectedContent[key]}"`);
        allFound = false;
      }
    });

    if (content.length !== Object.keys(expectedContent).length) {
      console.log(`\n   ⚠️  Expected ${Object.keys(expectedContent).length} entries, found ${content.length}`);
      allFound = false;
    }

    // Test 3: Verify all content is enabled
    console.log('\nTest 3: Verifying content status...');
    const disabledCount = content.filter(c => !c.is_enabled).length;
    if (disabledCount === 0) {
      console.log('✅ All content fields are enabled');
    } else {
      console.log(`⚠️  ${disabledCount} content fields are disabled`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (allFound && disabledCount === 0) {
      console.log('✅ STEP 2 TEST PASSED');
      console.log('   Template definition: ✓');
      console.log('   Content values: ✓');
      console.log('   All enabled: ✓');
      console.log('\n   Ready to proceed to Step 3: Backend Repository Layer');
    } else {
      console.log('❌ STEP 2 TEST FAILED');
      console.log('   Please check the errors above and fix them');
    }
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error.message);
    if (error.code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
      console.error('\n💡 Tip: Check your MySQL connection settings in .env file');
      console.error('   Common issues: wrong port, password, or host');
    }
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the test
testStep2().catch(console.error);
