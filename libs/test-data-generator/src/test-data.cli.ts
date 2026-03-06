import fs from 'fs';
import path from 'path';
import { TestDataGenerator } from './test-data.generator';

/**
 * CLI for generating test data
 */
export async function generateTestDataCLI(): Promise<void> {
  const outputDir = path.join(process.cwd(), 'test-data');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating test data...');

  // Generate labels
  const labels = TestDataGenerator.generateBatch(10);
  fs.writeFileSync(path.join(outputDir, 'labels.json'), JSON.stringify(labels, null, 2));
  console.log(`✓ Generated ${labels.length} test labels`);

  // Generate applications
  const applications = TestDataGenerator.generateApplicationBatch(10);
  fs.writeFileSync(
    path.join(outputDir, 'applications.json'),
    JSON.stringify(applications, null, 2)
  );
  console.log(`✓ Generated ${applications.length} test applications`);

  // Generate matching pairs
  const matchingPairs = Array.from({ length: 5 }, () => TestDataGenerator.generateMatchingPair());
  fs.writeFileSync(
    path.join(outputDir, 'matching-pairs.json'),
    JSON.stringify(matchingPairs, null, 2)
  );
  console.log(`✓ Generated ${matchingPairs.length} matching label-application pairs`);

  // Generate mismatched pairs
  const mismatchedPairs = Array.from({ length: 5 }, () =>
    TestDataGenerator.generateMismatchedPair()
  );
  fs.writeFileSync(
    path.join(outputDir, 'mismatched-pairs.json'),
    JSON.stringify(mismatchedPairs, null, 2)
  );
  console.log(`✓ Generated ${mismatchedPairs.length} mismatched label-application pairs`);

  console.log(`\n✓ All test data generated in: ${outputDir}`);
}
