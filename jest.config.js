const phaseOneCoverageTargets = [
  'src/api/client.ts',
  'src/components/SecureField.tsx',
  'src/context/SessionProvider.tsx',
  'src/features/app-version/AppVersionGate.tsx',
  'src/features/notifications/labels.ts',
  'src/navigation/notificationNavigation.ts',
  'src/services/sessionStorage.ts',
  'src/shared/format.ts',
]

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: phaseOneCoverageTargets,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/test/',
    '\\.native\\.[jt]sx?$',
    '\\.web\\.[jt]sx?$',
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
