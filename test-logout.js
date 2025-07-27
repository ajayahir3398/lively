/**
 * Test file to demonstrate logout functionality
 * This file shows how to use the logout endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

// Example usage of logout functionality
async function testLogoutFunctionality() {
  try {
    console.log('=== Testing Logout Functionality ===\n');

    // Step 1: Send OTP
    console.log('1. Sending OTP...');
    const otpResponse = await axios.post(`${BASE_URL}/send-otp`, {
      phone_number: '+1234567890'
    });
    console.log('OTP Response:', otpResponse.data);

    // Step 2: Verify OTP and get token
    console.log('\n2. Verifying OTP...');
    const verifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      phone_number: '+1234567890',
      otp: otpResponse.data.otp,
      customer_name: 'Test User',
      email: 'test@example.com'
    });
    console.log('Login Response:', verifyResponse.data);

    const token = verifyResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Step 3: Test protected route (should work)
    console.log('\n3. Testing protected route before logout...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/profile`, { headers });
      console.log('Profile Response:', profileResponse.data);
    } catch (error) {
      console.log('Profile Error:', error.response?.data);
    }

    // Step 4: Logout (invalidate current token)
    console.log('\n4. Logging out...');
    const logoutResponse = await axios.post(`${BASE_URL}/logout`, {}, { headers });
    console.log('Logout Response:', logoutResponse.data);

    // Step 5: Test protected route after logout (should fail)
    console.log('\n5. Testing protected route after logout...');
    try {
      const profileResponse2 = await axios.get(`${BASE_URL}/profile`, { headers });
      console.log('Profile Response (should fail):', profileResponse2.data);
    } catch (error) {
      console.log('Profile Error (expected):', error.response?.data);
    }

    // Step 6: Login again to get new token
    console.log('\n6. Logging in again...');
    const otpResponse2 = await axios.post(`${BASE_URL}/send-otp`, {
      phone_number: '+1234567890'
    });
    
    const verifyResponse2 = await axios.post(`${BASE_URL}/verify-otp`, {
      phone_number: '+1234567890',
      otp: otpResponse2.data.otp
    });
    
    const newToken = verifyResponse2.data.token;
    const newHeaders = {
      'Authorization': `Bearer ${newToken}`
    };

    // Step 7: Test logout all devices
    console.log('\n7. Testing logout all devices...');
    const logoutAllResponse = await axios.post(`${BASE_URL}/logout-all`, {}, { headers: newHeaders });
    console.log('Logout All Response:', logoutAllResponse.data);

    // Step 8: Test protected route after logout all (should fail)
    console.log('\n8. Testing protected route after logout all...');
    try {
      const profileResponse3 = await axios.get(`${BASE_URL}/profile`, { headers: newHeaders });
      console.log('Profile Response (should fail):', profileResponse3.data);
    } catch (error) {
      console.log('Profile Error (expected):', error.response?.data);
    }

    console.log('\n=== Test completed successfully ===');

  } catch (error) {
    console.error('Test Error:', error.response?.data || error.message);
  }
}

// Example of manual token cleanup
async function testTokenCleanup() {
  try {
    console.log('\n=== Testing Token Cleanup ===\n');

    // Login to get a token
    const otpResponse = await axios.post(`${BASE_URL}/send-otp`, {
      phone_number: '+1234567890'
    });
    
    const verifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      phone_number: '+1234567890',
      otp: otpResponse.data.otp
    });
    
    const token = verifyResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Test manual token cleanup
    console.log('Testing manual token cleanup...');
    const cleanupResponse = await axios.post(`${BASE_URL}/cleanup-tokens`, {}, { headers });
    console.log('Cleanup Response:', cleanupResponse.data);

  } catch (error) {
    console.error('Cleanup Test Error:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testLogoutFunctionality()
    .then(() => testTokenCleanup())
    .catch(console.error);
}

module.exports = {
  testLogoutFunctionality,
  testTokenCleanup
}; 