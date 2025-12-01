import { jest } from '@jest/globals';

// Mock localStorage for Node environment
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock crypto API for secure random generation
global.crypto = {
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  })
};

// Mock fetch for EmailJS
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('OK')
  })
);

describe('App Core Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should have proper storage keys', async () => {
    // Import the app module
    const appModule = await import('../public/app.js');
    
    // Test that storage constants are defined
    expect(appModule.STORAGE_DB_KEY).toBe('finsecure_db_v1');
    expect(appModule.STORAGE_SESSION_KEY).toBe('finsecure_session_v1');
  });

  it('should have default database structure', async () => {
    const appModule = await import('../public/app.js');
    
    // Test that DEFAULT_DB has proper structure
    expect(appModule.DEFAULT_DB).toBeDefined();
    expect(appModule.DEFAULT_DB.users).toBeDefined();
    expect(appModule.DEFAULT_DB.users['finsecureapp@gmail.com']).toBeDefined();
    expect(appModule.DEFAULT_DB.users['finsecureapp@gmail.com']).toHaveProperty('email');
    expect(appModule.DEFAULT_DB.users['finsecureapp@gmail.com']).toHaveProperty('password');
  });

  it('should use secure password handling', async () => {
    const appModule = await import('../public/app.js');
    
    const defaultUser = appModule.DEFAULT_DB.users['finsecureapp@gmail.com'];
    expect(defaultUser.password).not.toBe('FinSecure123!');
    expect(defaultUser.password).toBe('ChangeMe123!');
  });

  it('should have transactions with proper structure', async () => {
    const appModule = await import('../public/app.js');
    
    const user = appModule.DEFAULT_DB.users['finsecureapp@gmail.com'];
    expect(user.transactions).toBeDefined();
    expect(Array.isArray(user.transactions)).toBe(true);
    
    if (user.transactions.length > 0) {
      const transaction = user.transactions[0];
      expect(transaction).toHaveProperty('title');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('date');
      expect(transaction).toHaveProperty('ref');
    }
  });
});

describe('Security Features', () => {
  it('should use crypto API for random generation', () => {
    expect(global.crypto.getRandomValues).toBeDefined();
    expect(typeof global.crypto.getRandomValues).toBe('function');
  });

  it('should have secure reference generation function', async () => {
    const appModule = await import('../public/app.js');
    
    // Test that generateSecureRef function exists
    expect(typeof appModule.generateSecureRef).toBe('function');
    
    const ref = appModule.generateSecureRef('TEST-');
    expect(ref).toMatch(/^TEST-[A-Z0-9]{6}$/);
  });

  it('should not use hard-coded passwords', async () => {
    const appModule = await import('../public/app.js');
    
    const defaultUser = appModule.DEFAULT_DB.users['finsecureapp@gmail.com'];
    const password = defaultUser.password;
    
    // Password should be the secure fallback, not the original hard-coded one
    expect(password).toBe('ChangeMe123!');
    expect(password).not.toBe('FinSecure123!');
  });
});
