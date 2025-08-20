#!/usr/bin/env node

/**
 * Test runner script with additional utilities
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  coverage: {
    threshold: 80,
    formats: ['text', 'html', 'lcov', 'json']
  },
  reporters: ['default', 'json'],
  environments: ['node', 'workers']
};

/**
 * Main test runner
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  console.log('🧪 Xget Test Runner');
  console.log('==================');

  try {
    switch (command) {
      case 'run':
        await runTests(args.slice(1));
        break;
      case 'watch':
        await watchTests(args.slice(1));
        break;
      case 'coverage':
        await runCoverage(args.slice(1));
        break;
      case 'bench':
        await runBenchmarks(args.slice(1));
        break;
      case 'lint':
        await runLinting();
        break;
      case 'format':
        await runFormatting();
        break;
      case 'ci':
        await runCITests();
        break;
      case 'setup':
        await setupTestEnvironment();
        break;
      case 'clean':
        await cleanTestArtifacts();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run tests
 */
async function runTests(args = []) {
  console.log('🏃 Running tests...');

  const vitestArgs = ['run', '--config', 'vitest.config.js', ...args];

  await runCommand('npx', ['vitest', ...vitestArgs]);
}

/**
 * Watch tests
 */
async function watchTests(args = []) {
  console.log('👀 Watching tests...');

  const vitestArgs = ['--config', 'vitest.config.js', '--watch', ...args];

  await runCommand('npx', ['vitest', ...vitestArgs]);
}

/**
 * Run coverage
 */
async function runCoverage(args = []) {
  console.log('📊 Generating coverage report...');

  const vitestArgs = ['run', '--config', 'vitest.config.js', '--coverage', ...args];

  await runCommand('npx', ['vitest', ...vitestArgs]);

  console.log('📈 Coverage report generated in ./coverage/');

  // Generate coverage summary
  await generateCoverageSummary();
}

/**
 * Run benchmarks
 */
async function runBenchmarks(args = []) {
  console.log('⚡ Running performance benchmarks...');

  const vitestArgs = ['bench', '--config', 'vitest.config.js', ...args];

  await runCommand('npx', ['vitest', ...vitestArgs]);
}

/**
 * Run linting
 */
async function runLinting() {
  console.log('🔍 Running ESLint...');

  await runCommand('npx', ['eslint', 'src/', 'test/', '--ext', '.js']);

  console.log('✅ Linting completed');
}

/**
 * Run formatting
 */
async function runFormatting() {
  console.log('💅 Running Prettier...');

  await runCommand('npx', ['prettier', '--write', 'src/', 'test/', '*.js', '*.json', '*.md']);

  console.log('✅ Formatting completed');
}

/**
 * Run CI tests
 */
async function runCITests() {
  console.log('🤖 Running CI test suite...');

  // Run linting
  await runLinting();

  // Check formatting
  console.log('📝 Checking code formatting...');
  await runCommand('npx', ['prettier', '--check', 'src/', 'test/', '*.js', '*.json', '*.md']);

  // Run tests with coverage
  await runCoverage(['--reporter=json', '--reporter=text']);

  // Run benchmarks
  await runBenchmarks(['--reporter=json']);

  console.log('✅ CI test suite completed');
}

/**
 * Setup test environment
 */
async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');

  // Create necessary directories
  const dirs = ['coverage', 'test/tmp', 'test/logs'];
  dirs.forEach(dir => {
    const fullPath = join(rootDir, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Create test configuration file
  const testConfig = {
    ...TEST_CONFIG,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  };

  writeFileSync(join(rootDir, 'test/config.json'), JSON.stringify(testConfig, null, 2));

  console.log('✅ Test environment setup completed');
}

/**
 * Clean test artifacts
 */
async function cleanTestArtifacts() {
  console.log('🧹 Cleaning test artifacts...');

  const { rmSync } = await import('fs');
  const artifactDirs = ['coverage', 'test/tmp', 'test/logs'];

  artifactDirs.forEach(dir => {
    const fullPath = join(rootDir, dir);
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️  Removed: ${dir}`);
    }
  });

  console.log('✅ Cleanup completed');
}

/**
 * Generate coverage summary
 */
async function generateCoverageSummary() {
  const coverageFile = join(rootDir, 'coverage/coverage-summary.json');

  if (existsSync(coverageFile)) {
    const { readFileSync } = await import('fs');
    const coverage = JSON.parse(readFileSync(coverageFile, 'utf8'));

    console.log('\n📊 Coverage Summary:');
    console.log('===================');

    const total = coverage.total;
    console.log(`Lines:      ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);
    console.log(
      `Functions:  ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`
    );
    console.log(
      `Branches:   ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`
    );
    console.log(
      `Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`
    );

    // Check if coverage meets threshold
    const threshold = TEST_CONFIG.coverage.threshold;
    const meetsThreshold = [
      total.lines.pct >= threshold,
      total.functions.pct >= threshold,
      total.branches.pct >= threshold,
      total.statements.pct >= threshold
    ].every(Boolean);

    if (meetsThreshold) {
      console.log(`\n✅ Coverage meets threshold (${threshold}%)`);
    } else {
      console.log(`\n⚠️  Coverage below threshold (${threshold}%)`);
    }
  }
}

/**
 * Run command with proper error handling
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: rootDir,
      ...options
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Usage: node scripts/test.js <command> [options]

Commands:
  run [args]     Run tests once (default)
  watch [args]   Run tests in watch mode
  coverage       Generate coverage report
  bench          Run performance benchmarks
  lint           Run ESLint
  format         Run Prettier
  ci             Run full CI test suite
  setup          Setup test environment
  clean          Clean test artifacts
  help           Show this help

Examples:
  node scripts/test.js run
  node scripts/test.js watch --grep "GitHub"
  node scripts/test.js coverage
  node scripts/test.js ci

Environment Variables:
  VERBOSE_TESTS=true    Enable verbose test output
  TEST_TIMEOUT=30000    Set test timeout (ms)
  NODE_ENV=test         Set environment to test
`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, runBenchmarks, runCoverage, runTests };
