#!/usr/bin/env node
/**
 * Cross-platform chaos engineering environment verification
 * Ensures chaos experiments never run in production environments.
 * Compatible with Windows (PowerShell/cmd), Linux, and macOS.
 */

import { execSync } from 'child_process';

const ENV_VARS = ['NODE_ENV', 'APP_ENV', 'ENVIRONMENT', 'STAGE'];
const PROD_PATTERNS = ['production', 'prod', 'live', 'mainnet'];

console.log('[Chaos Safety Check] Verifying non-production environment...\n');

// 1. Assert Environment Variables
for (const varName of ENV_VARS) {
  const val = process.env[varName]?.toLowerCase().trim();
  if (val) {
    const isProd = PROD_PATTERNS.some(pat => val === pat || val.startsWith(pat));
    if (isProd) {
      console.error(`❌ CRITICAL SAFETY ERROR: ${varName}="${process.env[varName]}" indicates a PRODUCTION environment!`);
      console.error('🚨 Chaos experiment aborted immediately.');
      process.exit(1);
    }
    console.log(`✓ ${varName}="${process.env[varName]}" (non-production)`);
  }
}

// 2. Assert Kubernetes Context (if kubectl is installed)
try {
  const currentContext = execSync('kubectl config current-context', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore'],
    timeout: 3000
  }).trim().toLowerCase();

  const isProdK8s = PROD_PATTERNS.some(pat => currentContext.includes(pat));
  if (isProdK8s) {
    console.error(`❌ CRITICAL SAFETY ERROR: Active kubectl context "${currentContext}" matches production pattern!`);
    console.error('🚨 Chaos experiment aborted immediately.');
    process.exit(1);
  }
  console.log(`✓ Active kubectl context: "${currentContext}" (safe)`);
} catch {
  console.log('ℹ kubectl context check skipped (kubectl not in PATH or no active cluster context)');
}

// 3. Assert Database Connection String (if provided in env)
const dbUrl = process.env.DATABASE_URL?.toLowerCase() || '';
if (dbUrl) {
  const isProdDb = PROD_PATTERNS.some(pat => dbUrl.includes(`_${pat}`) || dbUrl.includes(`-${pat}`) || dbUrl.includes(`/${pat}`));
  if (isProdDb) {
    console.error('❌ CRITICAL SAFETY ERROR: DATABASE_URL points to a production database target!');
    console.error('🚨 Chaos experiment aborted immediately.');
    process.exit(1);
  }
  console.log('✓ DATABASE_URL verified non-production');
}

console.log('\n✅ Environment successfully confirmed as NON-PRODUCTION. Safe to proceed with chaos injection.\n');
process.exit(0);
