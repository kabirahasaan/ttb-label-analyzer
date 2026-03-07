#!/usr/bin/env node

import { generateTestDataCLI, parseCliArgs } from '../test-data.cli';

const options = parseCliArgs();

generateTestDataCLI(options).catch((error) => {
  console.error('Error generating test data:', error);
  process.exit(1);
});
