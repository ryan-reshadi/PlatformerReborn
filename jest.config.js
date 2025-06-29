module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.ts'], // or adjust to your test files location,
  setupFiles: ['jest-canvas-mock'],
  verbose: true
};