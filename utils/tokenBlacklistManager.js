const fs = require('fs');
const path = require('path');

const BLACKLIST_FILE_PATH = path.join(__dirname, '../assets/token_blacklist.json');
const MAX_BLACKLIST_SIZE = 100; // Maximum number of tokens in blacklist

class TokenBlacklistManager {
    constructor() {
        this.blacklist = new Set();
        this.tokenTimestamps = new Map(); // Track when tokens were added
        this.loadBlacklist();
    }

    // Load blacklist from JSON file
    loadBlacklist() {
        try {
            if (fs.existsSync(BLACKLIST_FILE_PATH)) {
                const data = fs.readFileSync(BLACKLIST_FILE_PATH, 'utf8');
                const blacklistData = JSON.parse(data);
                
                // Load tokens into Set and timestamps into Map
                this.blacklist.clear();
                this.tokenTimestamps.clear();
                
                blacklistData.blacklisted_tokens.forEach(tokenData => {
                    if (typeof tokenData === 'string') {
                        // Legacy format - just token string
                        this.blacklist.add(tokenData);
                        this.tokenTimestamps.set(tokenData, new Date().getTime());
                    } else if (tokenData.token && tokenData.timestamp) {
                        // New format - token with timestamp
                        this.blacklist.add(tokenData.token);
                        this.tokenTimestamps.set(tokenData.token, tokenData.timestamp);
                    }
                });
                
                console.log(`Loaded ${this.blacklist.size} blacklisted tokens from file`);
            } else {
                console.log('No blacklist file found, starting with empty blacklist');
            }
        } catch (error) {
            console.error('Error loading blacklist:', error);
            // Start with empty blacklist if file is corrupted
            this.blacklist.clear();
            this.tokenTimestamps.clear();
        }
    }

    // Save blacklist to JSON file
    saveBlacklist() {
        try {
            // Convert to array with timestamps
            const tokensWithTimestamps = Array.from(this.blacklist).map(token => ({
                token: token,
                timestamp: this.tokenTimestamps.get(token) || new Date().getTime()
            }));

            const blacklistData = {
                blacklisted_tokens: tokensWithTimestamps,
                last_updated: new Date().toISOString(),
                total_blacklisted: this.blacklist.size,
                max_size: MAX_BLACKLIST_SIZE
            };

            // Ensure assets directory exists
            const assetsDir = path.dirname(BLACKLIST_FILE_PATH);
            if (!fs.existsSync(assetsDir)) {
                fs.mkdirSync(assetsDir, { recursive: true });
            }

            fs.writeFileSync(BLACKLIST_FILE_PATH, JSON.stringify(blacklistData, null, 2));
            console.log(`Saved ${this.blacklist.size} blacklisted tokens to file`);
        } catch (error) {
            console.error('Error saving blacklist:', error);
        }
    }

    // Add token to blacklist
    addToken(token) {
        // Check if we need to remove oldest tokens
        if (this.blacklist.size >= MAX_BLACKLIST_SIZE) {
            this.removeOldestTokens();
        }
        
        // Add new token with current timestamp
        this.blacklist.add(token);
        this.tokenTimestamps.set(token, new Date().getTime());
        this.saveBlacklist();
    }

    // Check if token is blacklisted
    isBlacklisted(token) {
        return this.blacklist.has(token);
    }

    // Remove oldest tokens to maintain max size
    removeOldestTokens() {
        const tokensToRemove = this.blacklist.size - MAX_BLACKLIST_SIZE + 1; // +1 because we're about to add a new token
        
        if (tokensToRemove <= 0) return;
        
        // Sort tokens by timestamp (oldest first)
        const sortedTokens = Array.from(this.blacklist).sort((a, b) => {
            const timestampA = this.tokenTimestamps.get(a) || 0;
            const timestampB = this.tokenTimestamps.get(b) || 0;
            return timestampA - timestampB;
        });
        
        // Remove oldest tokens
        for (let i = 0; i < tokensToRemove; i++) {
            const oldestToken = sortedTokens[i];
            this.blacklist.delete(oldestToken);
            this.tokenTimestamps.delete(oldestToken);
        }
        
        console.log(`Removed ${tokensToRemove} oldest tokens to maintain max size of ${MAX_BLACKLIST_SIZE}`);
    }

    // Remove token from blacklist (for cleanup)
    removeToken(token) {
        const removed = this.blacklist.delete(token);
        if (removed) {
            this.tokenTimestamps.delete(token);
            this.saveBlacklist();
        }
        return removed;
    }

    // Get all blacklisted tokens
    getAllTokens() {
        return Array.from(this.blacklist);
    }

    // Clean up expired tokens
    cleanupExpiredTokens() {
        const jwt = require('jsonwebtoken');
        const currentTime = Math.floor(Date.now() / 1000);
        let removedCount = 0;

        for (const token of this.blacklist) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                if (decoded.exp < currentTime) {
                    this.blacklist.delete(token);
                    this.tokenTimestamps.delete(token);
                    removedCount++;
                }
            } catch (error) {
                // If token is invalid, remove it from blacklist
                this.blacklist.delete(token);
                this.tokenTimestamps.delete(token);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            this.saveBlacklist();
        }

        return removedCount;
    }

    // Get blacklist statistics
    getStats() {
        return {
            total_blacklisted: this.blacklist.size,
            max_size: MAX_BLACKLIST_SIZE,
            available_slots: MAX_BLACKLIST_SIZE - this.blacklist.size,
            last_updated: new Date().toISOString()
        };
    }

    // Clear entire blacklist (for testing or maintenance)
    clearBlacklist() {
        this.blacklist.clear();
        this.tokenTimestamps.clear();
        this.saveBlacklist();
    }
}

// Create singleton instance
const tokenBlacklistManager = new TokenBlacklistManager();

module.exports = tokenBlacklistManager; 