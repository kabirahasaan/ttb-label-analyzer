#!/usr/bin/env node

import { generateTestDataCLI } from '../test-data.cli';

generateTestDataCLI().catch((error) => {
  console.error('Error generating test data:', error);
  process.exit(1);
});
