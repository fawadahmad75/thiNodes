// Simple in-memory cache for frequently accessed data
// In production, replace with Redis for better scalability

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttlMap.set(key, Date.now() + ttl);
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expireTime = this.ttlMap.get(key);
    if (Date.now() > expireTime) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttlMap.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expireTime] of this.ttlMap.entries()) {
      if (now > expireTime) {
        this.delete(key);
      }
    }
  }

  // Helper methods for common use cases
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    let value = this.get(key);
    if (value === null) {
      value = await fetchFunction();
      if (value !== null && value !== undefined) {
        this.set(key, value, ttl);
      }
    }
    return value;
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}

// Create singleton instance
const cache = new SimpleCache();

export default cache;
