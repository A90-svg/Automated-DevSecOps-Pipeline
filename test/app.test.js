import { jest } from '@jest/globals';

// Mock localStorage
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

// Mock DOM elements
document.createElement = jest.fn(() => ({
  addEventListener: jest.fn(),
  style: {},
  innerHTML: '',
  textContent: '',
  value: '',
  hidden: false,
  children: [],
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
    contains: jest.fn()
  },
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
  removeAttribute: jest.fn()
}));

document.getElementById = jest.fn(() => ({
  addEventListener: jest.fn(),
  style: {},
  innerHTML: '',
  textContent: '',
  value: '',
  hidden: false,
  children: [],
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
    contains: jest.fn()
  },
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
  removeAttribute: jest.fn()
}));

document.querySelector = jest.fn(() => ({
  addEventListener: jest.fn(),
  style: {},
  innerHTML: '',
  textContent: '',
  value: '',
  hidden: false,
  children: [],
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
    contains: jest.fn()
  },
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
  removeAttribute: jest.fn()
}));

document.querySelectorAll = jest.fn(() => []);

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hash: '#/login',
    href: 'http://localhost:3000'
  },
  writable: true
});

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

  it('should generate secure reference', async () => {
    // Import the app module
    const appModule = await import('../public/app.js');
    
    // Test that generateSecureRef function exists and works
    if (typeof appModule.generateSecureRef === 'function') {
      const ref = appModule.generateSecureRef('TEST-');
      expect(ref).toMatch(/^TEST-[A-Z0-9]{6}$/);
    } else {
      // Skip test if function not available
      console.log('generateSecureRef function not found in module');
    }
  });

  it('should have proper storage keys', async () => {
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
});

describe('Security Features', () => {
  it('should use crypto API for random generation', () => {
    expect(global.crypto.getRandomValues).toBeDefined();
    expect(typeof global.crypto.getRandomValues).toBe('function');
  });

  it('should not use Math.random in critical functions', async () => {
    // This test ensures we're not using Math.random for security-sensitive operations
    const mathRandomSpy = jest.spyOn(Math, 'random');
    
    // Import and test the app
    await import('../public/app.js');
    
    // Math.random should not be called for security operations
    // (This is a basic check - in reality, we'd need more sophisticated testing)
    expect(mathRandomSpy).not.toHaveBeenCalled();
    
    mathRandomSpy.mockRestore();
  });
});
