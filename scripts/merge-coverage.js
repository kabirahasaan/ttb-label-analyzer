const fs = require('fs');
const path = require('path');

/**
 * Script to merge coverage reports from multiple test suites
 * Usage: node scripts/merge-coverage.js
 */

const coverageDir = path.join(__dirname, '..', 'coverage');
const unitCoverageDir = path.join(coverageDir, 'unit');
const integrationCoverageDir = path.join(coverageDir, 'integration');

console.log('📊 Test Coverage Summary\n');

// Helper to read coverage summary
function readCoverageSummary(dir) {
  const summaryPath = path.join(dir, 'coverage-summary.json');
  if (fs.existsSync(summaryPath)) {
    return JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  }
  return null;
}

// Helper to display coverage metrics
function displayCoverage(name, summary) {
  if (!summary || !summary.total) {
    console.log(`${name}: No coverage data found`);
    return;
  }

  const { lines, statements, functions, branches } = summary.total;
  
  console.log(`${name}:`);
  console.log(`  Lines      : ${lines.pct.toFixed(2)}% (${lines.covered}/${lines.total})`);
  console.log(`  Statements : ${statements.pct.toFixed(2)}% (${statements.covered}/${statements.total})`);
  console.log(`  Functions  : ${functions.pct.toFixed(2)}% (${functions.covered}/${functions.total})`);
  console.log(`  Branches   : ${branches.pct.toFixed(2)}% (${branches.covered}/${branches.total})`);
  console.log('');
}

// Display unit test coverage
const unitSummary = readCoverageSummary(unitCoverageDir);
if (unitSummary) {
  displayCoverage('Unit Tests', unitSummary);
}

// Display integration test coverage
const integrationSummary = readCoverageSummary(integrationCoverageDir);
if (integrationSummary) {
  displayCoverage('Integration Tests', integrationSummary);
}

// Display combined summary
console.log('Coverage reports generated in:');
if (fs.existsSync(unitCoverageDir)) {
  console.log(`  - Unit: ${unitCoverageDir}`);
}
if (fs.existsSync(integrationCoverageDir)) {
  console.log(`  - Integration: ${integrationCoverageDir}`);
}

console.log('\nℹ️  View detailed HTML reports:');
if (fs.existsSync(path.join(unitCoverageDir, 'lcov-report', 'index.html'))) {
  console.log(`  - Unit: ${path.join(unitCoverageDir, 'lcov-report', 'index.html')}`);
}
if (fs.existsSync(path.join(integrationCoverageDir, 'lcov-report', 'index.html'))) {
  console.log(`  - Integration: ${path.join(integrationCoverageDir, 'lcov-report', 'index.html')}`);
}

console.log('\n✅ Coverage report generation complete!');
