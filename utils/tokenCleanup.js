const jwt = require('jsonwebtoken');
const db = require('../models');
const Customer = db.customer;

/**
 * Clean up expired tokens for a specific user
 * @param {number} customerId - The customer ID
 * @returns {Promise<Object>} - Result of cleanup operation
 */
const cleanupUserExpiredTokens = async (customerId) => {
  try {
    const customer = await Customer.findByPk(customerId);
    if (!customer || !customer.invalidated_tokens) {
      return { cleaned: 0, total: 0 };
    }

    let invalidatedTokens = [];
    try {
      invalidatedTokens = JSON.parse(customer.invalidated_tokens);
    } catch (error) {
      return { cleaned: 0, total: 0 };
    }

    if (invalidatedTokens.length === 0) {
      return { cleaned: 0, total: 0 };
    }

    const validTokens = [];
    let cleanedCount = 0;

    for (const token of invalidatedTokens) {
      try {
        // Try to verify the token to see if it's expired
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // If verification passes, token is still valid (not expired)
        validTokens.push(token);
      } catch (error) {
        // Token is expired or invalid, skip it
        cleanedCount++;
      }
    }

    // Update customer with only valid tokens
    await customer.update({
      invalidated_tokens: JSON.stringify(validTokens),
      write_date: new Date()
    });

    return { 
      cleaned: cleanedCount, 
      total: invalidatedTokens.length,
      remaining: validTokens.length
    };
  } catch (error) {
    console.error('Error cleaning up expired tokens for customer:', customerId, error);
    throw error;
  }
};

/**
 * Clean up expired tokens for all users
 * @returns {Promise<Object>} - Result of cleanup operation
 */
const cleanupAllExpiredTokens = async () => {
  try {
    const customers = await Customer.findAll();
    let totalCleaned = 0;
    let usersProcessed = 0;
    let totalTokens = 0;

    for (const customer of customers) {
      try {
        const result = await cleanupUserExpiredTokens(customer.id);
        totalCleaned += result.cleaned;
        totalTokens += result.total;
        usersProcessed++;
      } catch (error) {
        console.error(`Error processing customer ${customer.id}:`, error);
      }
    }

    return {
      totalCleaned,
      usersProcessed,
      totalTokens,
      success: true
    };
  } catch (error) {
    console.error('Error in cleanupAllExpiredTokens:', error);
    throw error;
  }
};

/**
 * Schedule periodic token cleanup
 * @param {number} intervalMinutes - Interval in minutes for cleanup
 */
const scheduleTokenCleanup = (intervalMinutes = 60) => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const cleanupInterval = setInterval(async () => {
    try {
      console.log('Starting scheduled token cleanup...');
      const result = await cleanupAllExpiredTokens();
      console.log('Scheduled token cleanup completed:', result);
    } catch (error) {
      console.error('Scheduled token cleanup failed:', error);
    }
  }, intervalMs);

  return cleanupInterval;
};

/**
 * Stop scheduled token cleanup
 * @param {Object} cleanupInterval - The interval object returned by scheduleTokenCleanup
 */
const stopTokenCleanup = (cleanupInterval) => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('Token cleanup schedule stopped');
  }
};

module.exports = {
  cleanupUserExpiredTokens,
  cleanupAllExpiredTokens,
  scheduleTokenCleanup,
  stopTokenCleanup
}; 