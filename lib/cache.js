/**
 * Simple in-memory TTL cache for vacation data.
 * Default TTL: 5 minutes.
 */
class Cache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.store = new Map();
    this.ttlMs = ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  async getOrFetch(key, fetchFn) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const value = await fetchFn();
    if (value !== null) {
      this.set(key, value);
    }
    return value;
  }
}

export const cache = new Cache();
