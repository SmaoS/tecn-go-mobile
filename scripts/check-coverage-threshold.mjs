import { readFile } from 'node:fs/promises'

const supportedStages = new Set([35, 50, 65])
const threshold = Number(process.env.MOBILE_COVERAGE_THRESHOLD ?? 35)

if (!supportedStages.has(threshold)) {
  throw new Error(
    `MOBILE_COVERAGE_THRESHOLD must be one of 35, 50 or 65. Received: ${threshold}`,
  )
}

const summary = JSON.parse(
  await readFile(new URL('../coverage/coverage-summary.json', import.meta.url), 'utf8'),
)
const lineCoverage = Number(summary.total?.lines?.pct ?? 0)

console.log(`Global mobile line coverage: ${lineCoverage}% (required: ${threshold}%)`)

if (lineCoverage < threshold) {
  process.exitCode = 1
}
