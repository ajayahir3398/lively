/**
 * Test script to verify Swagger documentation setup
 * This script tests the Swagger UI endpoint and validates the configuration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSwaggerSetup() {
  try {
    console.log('=== Testing Swagger Documentation Setup ===\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/test/health`);
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first.');
      console.log('Run: npm start');
      return;
    }

    // Test 2: Check Swagger UI endpoint
    console.log('\n2. Testing Swagger UI endpoint...');
    try {
      const swaggerResponse = await axios.get(`${BASE_URL}/api-docs`);
      if (swaggerResponse.status === 200) {
        console.log('✅ Swagger UI is accessible at:', `${BASE_URL}/api-docs`);
      } else {
        console.log('❌ Swagger UI returned status:', swaggerResponse.status);
      }
    } catch (error) {
      console.log('❌ Swagger UI is not accessible:', error.message);
    }

    // Test 3: Check Swagger JSON endpoint
    console.log('\n3. Testing Swagger JSON endpoint...');
    try {
      const swaggerJsonResponse = await axios.get(`${BASE_URL}/api-docs/swagger.json`);
      if (swaggerJsonResponse.status === 200) {
        console.log('✅ Swagger JSON is accessible');
        const swaggerSpec = swaggerJsonResponse.data;
        
        // Validate basic Swagger structure
        if (swaggerSpec.openapi && swaggerSpec.info && swaggerSpec.paths) {
          console.log('✅ Swagger specification is valid');
          
          // Count endpoints
          const endpointCount = Object.keys(swaggerSpec.paths).length;
          console.log(`📊 Total endpoints documented: ${endpointCount}`);
          
          // Count schemas
          const schemaCount = Object.keys(swaggerSpec.components?.schemas || {}).length;
          console.log(`📊 Total schemas defined: ${schemaCount}`);
          
          // List tags
          const tags = swaggerSpec.tags?.map(tag => tag.name) || [];
          console.log(`📊 API Tags: ${tags.join(', ')}`);
        } else {
          console.log('❌ Swagger specification is invalid');
        }
      } else {
        console.log('❌ Swagger JSON returned status:', swaggerJsonResponse.status);
      }
    } catch (error) {
      console.log('❌ Swagger JSON is not accessible:', error.message);
    }

    // Test 4: Test a simple API endpoint
    console.log('\n4. Testing API endpoint...');
    try {
      const apiResponse = await axios.get(`${BASE_URL}/api/test/health`);
      console.log('✅ API endpoint is working:', apiResponse.data);
    } catch (error) {
      console.log('❌ API endpoint test failed:', error.message);
    }

    console.log('\n=== Swagger Setup Test Complete ===');
    console.log('\n📖 To view the documentation:');
    console.log(`   Open your browser and go to: ${BASE_URL}/api-docs`);
    console.log('\n🔧 If you see any issues:');
    console.log('   1. Make sure the server is running (npm start)');
    console.log('   2. Check that all dependencies are installed (npm install)');
    console.log('   3. Verify the Swagger configuration in config/swagger.config.js');
    console.log('   4. Check the browser console for any JavaScript errors');

  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSwaggerSetup();
}

module.exports = {
  testSwaggerSetup
}; 