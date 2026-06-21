module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/components/SecureField.tsx',
    'src/features/notifications/labels.ts',
    'src/shared/format.ts',
  ],
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      lines: 75,
      functions: 75,
      statements: 75,
      branches: 65,
    },
  },
}
