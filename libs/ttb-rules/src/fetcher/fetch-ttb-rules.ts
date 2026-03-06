#!/usr/bin/env node

/**
 * TTB Rules Fetcher CLI
 * Fetches TTB labeling requirements from ttb.gov, parses them, and stores as JSON
 *
 * Usage:
 *   npm run fetch:ttb-rules                      # Fetch and parse all rules
 *   npm run fetch:ttb-rules -- --cached-only     # Use cached data only
 *   npm run fetch:ttb-rules -- --clear-cache     # Clear cache before fetching
 *   npm run fetch:ttb-rules -- --export-csv      # Export rules as CSV
 *   npm run fetch:ttb-rules -- --stats           # Show statistics
 */

import { TTBFetcher } from './ttb-fetcher';
import { TTBRulesParser } from './ttb-parser';
import { TTBRulesStorage } from './ttb-storage';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);

  console.log('\n🔍 TTB Rules Fetcher & Parser\n');
  console.log('----------------------------------------');

  try {
    // Initialize components
    const cacheDir = path.join(process.cwd(), '.ttb-cache');
    const rulesDir = path.join(__dirname, '..', 'data', 'rules');

    const fetcher = new TTBFetcher({ cacheDir, retries: 3 });
    const parser = new TTBRulesParser();
    const storage = new TTBRulesStorage(rulesDir);

    // Handle --clear-cache flag
    if (args.includes('--clear-cache')) {
      console.log('\n🗑️  Clearing TTB cache...');
      fetcher.clearCache();
    }

    // Handle --stats flag (show statistics only)
    if (args.includes('--stats')) {
      console.log('\n📊 Rule Statistics\n');
      const stats = storage.getStatistics();
      console.log(`Total Rules: ${stats.totalRules}`);
      console.log('\nBy Category:');
      for (const [category, count] of Object.entries(stats.byCategory)) {
        console.log(`  ${category}: ${count}`);
      }
      console.log('\nBy Beverage Type:');
      for (const [type, count] of Object.entries(stats.byBeverageType)) {
        console.log(`  ${type}: ${count}`);
      }
      console.log(`\nLast Updated: ${stats.lastUpdated}`);
      return;
    }

    // Handle --cached-only flag
    if (args.includes('--cached-only')) {
      console.log('\n✓ Using cached data only (no network requests)');
      const rules = storage.loadAllRules();
      if (rules.length === 0) {
        console.error('\n❌ No cached rules found. Run without --cached-only to fetch.');
        process.exit(1);
      }
      console.log(`✓ Loaded ${rules.length} rules from storage`);
      return;
    }

    // Fetch documents from TTB
    console.log('\n📥 Fetching TTB documents from ttb.gov...\n');
    const documents = await fetcher.fetchAllDocuments();
    console.log(`\n✓ Fetched ${documents.length} documents`);

    // Parse documents into structured rules
    console.log('\n🔍 Parsing documents into structured rules...\n');
    const rules = parser.parseDocuments(documents);
    console.log(`✓ Parsed ${rules.length} rules`);

    // Save rules to storage
    console.log('\n💾 Saving rules to JSON storage...\n');
    storage.saveRules(rules);

    // Show statistics
    console.log('\n📊 Rule Summary\n');
    const stats = storage.getStatistics();
    console.log(`Total Rules: ${stats.totalRules}`);
    console.log('\nBy Category:');
    for (const [category, count] of Object.entries(stats.byCategory)) {
      const icon =
        category === 'required'
          ? '📋'
          : category === 'conditional'
            ? '⚠️'
            : category === 'prohibited'
              ? '🚫'
              : '⚡';
      console.log(`  ${icon} ${category}: ${count}`);
    }
    console.log('\nBy Beverage Type:');
    for (const [type, count] of Object.entries(stats.byBeverageType)) {
      console.log(`  🍺 ${type}: ${count}`);
    }

    // Handle --export-csv flag
    if (args.includes('--export-csv')) {
      console.log('\n📄 Exporting rules to CSV...\n');
      const csv = storage.exportToCSV();
      const csvPath = path.join(rulesDir, 'rules.csv');
      fs.writeFileSync(csvPath, csv);
      console.log(`✓ Exported to ${csvPath}`);
    }

    // Summary
    console.log('\n✅ Success!\n');
    console.log('Rules are ready for use. The validation engine can now load');
    console.log('rules dynamically from the JSON storage.\n');
    console.log(`Rules stored in: ${rulesDir}`);
    console.log(`Cache stored in: ${cacheDir}`);
    console.log('\nNext steps:');
    console.log('1. Update validation engine to load rules from storage');
    console.log('2. Use rules in label validation pipeline');
    console.log('3. Periodically update rules with: npm run fetch:ttb-rules\n');
    console.log('----------------------------------------\n');
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('\nStacktrace:');
    console.error((error as Error).stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
