const base = require('./jest.config')

module.exports = {
  ...base,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/**/*.native.{ts,tsx}',
    '!src/**/*.web.{ts,tsx}',
    '!src/types.ts',
  ],
  coverageThreshold: undefined,
}
