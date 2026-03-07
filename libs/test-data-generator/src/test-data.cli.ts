import fs from 'fs';
import path from 'path';
import { TestDataGenerator } from './test-data.generator';
import { TestImageGenerator } from './test-image.generator';

interface CliOptions {
  count?: number;
  withImages?: boolean;
  outputDir?: string;
  imageFormat?: 'svg' | 'png';
}

/**
 * Enhanced CLI for generating comprehensive test data
 */
export async function generateTestDataCLI(options: CliOptions = {}): Promise<void> {
  const {
    count = 10,
    withImages = false,
    outputDir = path.join(process.cwd(), 'test-data'),
    imageFormat = 'svg',
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Generating comprehensive test data...\n');

  // Generate realistic applications
  console.log(`📝 Generating ${count} realistic applications...`);
  const applications = TestDataGenerator.generateRealisticApplications(count);
  fs.writeFileSync(
    path.join(outputDir, 'applications.json'),
    JSON.stringify(applications, null, 2)
  );
  console.log(`✓ Generated ${applications.length} test applications`);

  // Generate labels
  console.log(`\n📝 Generating ${count} test labels...`);
  const labels = TestDataGenerator.generateBatch(count);
  fs.writeFileSync(path.join(outputDir, 'labels.json'), JSON.stringify(labels, null, 2));
  console.log(`✓ Generated ${labels.length} test labels`);

  // Generate matching pairs
  const pairCount = Math.ceil(count / 2);
  console.log(`\n📝 Generating ${pairCount} matching pairs...`);
  const matchingPairs = Array.from({ length: pairCount }, () =>
    TestDataGenerator.generateMatchingPair()
  );
  fs.writeFileSync(
    path.join(outputDir, 'matching-pairs.json'),
    JSON.stringify(matchingPairs, null, 2)
  );
  console.log(`✓ Generated ${matchingPairs.length} matching label-application pairs`);

  // Generate mismatched pairs
  console.log(`\n📝 Generating ${pairCount} mismatched pairs...`);
  const mismatchedPairs = Array.from({ length: pairCount }, () =>
    TestDataGenerator.generateMismatchedPair()
  );
  fs.writeFileSync(
    path.join(outputDir, 'mismatched-pairs.json'),
    JSON.stringify(mismatchedPairs, null, 2)
  );
  console.log(`✓ Generated ${mismatchedPairs.length} mismatched label-application pairs`);

  // Generate partial match pairs
  const partialCount = Math.ceil(count / 4);
  console.log(`\n📝 Generating ${partialCount} partial match pairs...`);
  const partialPairs = Array.from({ length: partialCount }, () =>
    TestDataGenerator.generatePartialMatchPair()
  );
  fs.writeFileSync(
    path.join(outputDir, 'partial-match-pairs.json'),
    JSON.stringify(partialPairs, null, 2)
  );
  console.log(`✓ Generated ${partialPairs.length} partial match pairs`);

  // Generate label images if requested
  if (withImages) {
    console.log(`\n🖼️  Generating label images (${imageFormat})...`);
    const imageDir = path.join(outputDir, 'images');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Generate images for all test labels
    const allLabels = [
      ...labels,
      ...matchingPairs.map((p) => p.label),
      ...mismatchedPairs.map((p) => p.label),
      ...partialPairs.map((p) => p.label),
    ];

    const imagePaths = await TestImageGenerator.generateBatch(allLabels, imageDir);
    console.log(`✓ Generated ${imagePaths.length} label images in ${imageDir}`);

    // Create a reference file linking labels to their images
    const imageReference = allLabels.map((label, index) => ({
      labelId: label.id,
      brandName: label.brandName,
      imagePath: imagePaths[index],
    }));
    fs.writeFileSync(
      path.join(outputDir, 'image-reference.json'),
      JSON.stringify(imageReference, null, 2)
    );
    console.log(`✓ Created image reference file`);
  }

  // Generate summary report
  const summary = {
    generatedAt: new Date().toISOString(),
    counts: {
      applications: applications.length,
      labels: labels.length,
      matchingPairs: matchingPairs.length,
      mismatchedPairs: mismatchedPairs.length,
      partialMatchPairs: partialPairs.length,
      totalLabels: labels.length + matchingPairs.length + mismatchedPairs.length + partialPairs.length,
    },
    options: {
      count,
      withImages,
      imageFormat,
    },
    outputDirectory: outputDir,
  };

  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log(`\n✅ Test data generation complete!`);
  console.log(`\n📊 Summary:`);
  console.log(`   Applications: ${summary.counts.applications}`);
  console.log(`   Labels: ${summary.counts.labels}`);
  console.log(`   Matching pairs: ${summary.counts.matchingPairs}`);
  console.log(`   Mismatched pairs: ${summary.counts.mismatchedPairs}`);
  console.log(`   Partial match pairs: ${summary.counts.partialMatchPairs}`);
  console.log(`   Total labels: ${summary.counts.totalLabels}`);
  if (withImages) {
    console.log(`   Images generated: Yes (${imageFormat})`);
  }
  console.log(`\n📁 Output directory: ${outputDir}`);
}

/**
 * Generate test data for the public test-images directory
 */
export async function generatePublicTestImages(webAppPath: string): Promise<void> {
  const imageDir = path.join(webAppPath, 'public', 'test-images');
  
  console.log('🖼️  Generating test images for public directory...\n');

  // Generate a diverse set of realistic labels
  const beerLabel = TestDataGenerator.generateTestLabel({
    brandName: 'Hoppy Trails IPA',
    alcoholByVolume: 6.5,
    netContents: '12 fl oz (355 mL)',
    classType: 'beer',
    producerName: 'Mountain View Brewery',
  });

  const wineLabel = TestDataGenerator.generateTestLabel({
    brandName: 'Reserve Cabernet Sauvignon',
    alcoholByVolume: 13.5,
    netContents: '750 mL',
    classType: 'wine',
    producerName: 'Valley Vineyards',
  });

  const spiritLabel = TestDataGenerator.generateTestLabel({
    brandName: 'Kentucky Oak Bourbon',
    alcoholByVolume: 42.0,
    netContents: '750 mL',
    classType: 'distilled spirit',
    producerName: 'Heritage Distillery Co.',
  });

  const labels = [beerLabel, wineLabel, spiritLabel];

  // Ensure directory exists
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Generate images
  const imagePaths = await TestImageGenerator.generateBatch(labels, imageDir);
  
  console.log(`✓ Generated ${imagePaths.length} test images in ${imageDir}`);
  console.log('\nGenerated images:');
  imagePaths.forEach((p) => console.log(`   - ${path.basename(p)}`));
}

/**
 * Parse CLI arguments
 */
export function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--count':
      case '-c':
        options.count = parseInt(args[++i], 10);
        break;
      case '--with-images':
      case '-i':
        options.withImages = true;
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--format':
      case '-f':
        options.imageFormat = args[++i] as 'svg' | 'png';
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: ttb-generate-test-data [options]

Options:
  -c, --count <number>      Number of items to generate (default: 10)
  -i, --with-images         Generate label images (default: false)
  -o, --output <dir>        Output directory (default: ./test-data)
  -f, --format <format>     Image format: svg|png (default: svg)
  -h, --help                Show this help message

Examples:
  ttb-generate-test-data --count 20
  ttb-generate-test-data --count 15 --with-images
  ttb-generate-test-data --count 25 --with-images --format svg --output ./my-test-data
        `);
        process.exit(0);
    }
  }

  return options;
}
