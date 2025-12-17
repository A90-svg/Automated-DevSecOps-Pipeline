export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transform: {},
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
