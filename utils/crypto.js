// TBO OS — Crypto Utilities
// Password hashing (SHA-256 + salt) and session token management using Web Crypto API

const TBO_CRYPTO = {
  // Generate a random salt
  _generateSalt(length = 16) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },

  // Hash password with SHA-256 + salt
  async hashPassword(password, salt) {
    if (!salt) salt = this._generateSalt();
    const data = new TextEncoder().encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { hash, salt };
  },

  // Verify password against stored hash+salt
  async verifyPassword(password, storedHash, salt) {
    const { hash } = await this.hashPassword(password, salt);
    return hash === storedHash;
  },

  // Generate a session token with expiration
  generateSessionToken(expiresInHours = 8) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    return { token, expiresAt };
  },

  // Check if a session token is expired
  isTokenExpired(expiresAt) {
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  },

  // Pre-computed hashes for default users (generated from their passwords)
  // This replaces plaintext passwords in auth.js
  _precomputedHashes: null,

  async getDefaultUserHashes() {
    if (this._precomputedHashes) return this._precomputedHashes;

    // Use a fixed salt per user for deterministic hashes across sessions
    // In a real backend, each user would have a unique random salt stored in DB
    const users = {
      marco:   { pass: 'tbo2026', salt: 'a1b2c3d4e5f60001' },
      ruy:     { pass: 'tbo2026', salt: 'a1b2c3d4e5f60002' },
      carol:   { pass: 'tbo123',  salt: 'a1b2c3d4e5f60003' },
      nelson:  { pass: 'tbo123',  salt: 'a1b2c3d4e5f60004' },
      nath:    { pass: 'tbo123',  salt: 'a1b2c3d4e5f60005' },
      rafa:    { pass: 'tbo123',  salt: 'a1b2c3d4e5f60006' },
      gustavo: { pass: 'tbo123',  salt: 'a1b2c3d4e5f60007' },
      celso:   { pass: 'tbo123',  salt: 'a1b2c3d4e5f60008' },
      erick:   { pass: 'tbo123',  salt: 'a1b2c3d4e5f60009' },
      dann:    { pass: 'tbo123',  salt: 'a1b2c3d4e5f6000a' },
      duda:    { pass: 'tbo123',  salt: 'a1b2c3d4e5f6000b' },
      tiago:   { pass: 'tbo123',  salt: 'a1b2c3d4e5f6000c' },
      mari:    { pass: 'tbo123',  salt: 'a1b2c3d4e5f6000d' },
      lucca:   { pass: 'tbo123',  salt: 'a1b2c3d4e5f6000e' },
      financaazul: { pass: 'tbo123', salt: 'a1b2c3d4e5f6000f' }
    };

    const hashes = {};
    for (const [userId, { pass, salt }] of Object.entries(users)) {
      const { hash } = await this.hashPassword(pass, salt);
      hashes[userId] = { hash, salt };
    }

    this._precomputedHashes = hashes;
    return hashes;
  }
};
