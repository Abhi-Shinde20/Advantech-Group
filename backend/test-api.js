#!/usr/bin/env node

/**
 * Simple API testing script for Advantech Backend
 * Run this to test if your backend is working correctly
 */

const http = require('http');

// Configuration
const config = {
  host: 'localhost',
  port: 3001,
  timeout: 5000
};

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Advantech-Backend-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : {}
          };
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(config.timeout);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing Health Check...');
  try {
    const response = await makeRequest('/api/health');
    if (response.statusCode === 200) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Status: ${response.body.status}`);
      console.log(`   Timestamp: ${response.body.timestamp}`);
      return true;
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`   Status Code: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Health Check: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testQuoteSubmission() {
  console.log('\\n📝 Testing Quote Submission...');
  
  const testQuote = {
    name: 'Test User',
    mobile: '+91 9876543210',
    email: 'test@example.com',
    company: 'Test Company Ltd',
    requirements: 'Testing quote submission functionality for automotive components.'
  };

  try {
    const response = await makeRequest('/api/quotes', 'POST', testQuote);
    if (response.statusCode === 201) {
      console.log('✅ Quote Submission: PASSED');
      console.log(`   Quote ID: ${response.body.quoteId}`);
      console.log(`   Message: ${response.body.message}`);
      return response.body.quoteId;
    } else {
      console.log('❌ Quote Submission: FAILED');
      console.log(`   Status Code: ${response.statusCode}`);
      console.log(`   Error: ${response.body.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Quote Submission: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testContactSubmission() {
  console.log('\\n📞 Testing Contact Submission...');
  
  const testContact = {
    name: 'Test Contact User',
    email: 'contact@test.com',
    subject: 'API Test Contact',
    message: 'This is a test contact message to verify the API functionality.'
  };

  try {
    const response = await makeRequest('/api/contact', 'POST', testContact);
    if (response.statusCode === 201) {
      console.log('✅ Contact Submission: PASSED');
      console.log(`   Contact ID: ${response.body.contactId}`);
      console.log(`   Message: ${response.body.message}`);
      return response.body.contactId;
    } else {
      console.log('❌ Contact Submission: FAILED');
      console.log(`   Status Code: ${response.statusCode}`);
      console.log(`   Error: ${response.body.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Contact Submission: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testDataRetrieval() {
  console.log('\\n📊 Testing Data Retrieval...');
  
  try {
    // Test quotes retrieval
    const quotesResponse = await makeRequest('/api/quotes');
    if (quotesResponse.statusCode === 200) {
      console.log('✅ Quotes Retrieval: PASSED');
      console.log(`   Total Quotes: ${quotesResponse.body.count}`);
    } else {
      console.log('❌ Quotes Retrieval: FAILED');
    }

    // Test contacts retrieval
    const contactsResponse = await makeRequest('/api/contact');
    if (contactsResponse.statusCode === 200) {
      console.log('✅ Contacts Retrieval: PASSED');
      console.log(`   Total Contacts: ${contactsResponse.body.count}`);
    } else {
      console.log('❌ Contacts Retrieval: FAILED');
    }

    return true;
  } catch (error) {
    console.log('❌ Data Retrieval: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testInvalidData() {
  console.log('\\n🚫 Testing Invalid Data Handling...');
  
  const invalidQuote = {
    name: '', // Empty name - should fail validation
    mobile: 'invalid',
    email: 'not-an-email',
    company: 'Test',
    requirements: 'Short'
  };

  try {
    const response = await makeRequest('/api/quotes', 'POST', invalidQuote);
    if (response.statusCode === 400) {
      console.log('✅ Invalid Data Handling: PASSED');
      console.log(`   Validation Error: ${response.body.details ? 'Received validation errors' : 'Proper error response'}`);
      return true;
    } else {
      console.log('❌ Invalid Data Handling: FAILED');
      console.log(`   Expected 400, got ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid Data Handling: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Advantech Backend API Test Suite');
  console.log('===================================\\n');

  const results = {
    healthCheck: await testHealthCheck(),
    quoteSubmission: await testQuoteSubmission(),
    contactSubmission: await testContactSubmission(),
    dataRetrieval: await testDataRetrieval(),
    invalidData: await testInvalidData()
  };

  console.log('\\n📋 Test Results Summary');
  console.log('========================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\\n🎉 All tests passed! Your backend is working correctly.');
    process.exit(0);
  } else {
    console.log('\\n⚠️  Some tests failed. Please check your backend configuration.');
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
console.log('Starting backend tests...');
console.log(`Target: http://${config.host}:${config.port}\\n`);

runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});