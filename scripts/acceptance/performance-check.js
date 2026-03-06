const BASE_URL = process.env.API_URL || 'http://localhost:3001';

const MAX_SINGLE_LABEL_MS = 5000;
const BATCH_SIZE = 300;

function createLabel(index) {
  return {
    id: `label-${index}`,
    brandName: `STONE'S THROW ${index}`,
    alcoholByVolume: 45,
    netContents: '750 mL',
    governmentWarning:
      'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
    classType: 'distilled spirit',
    producerName: 'Old Tom Distillery',
  };
}

function createApplication(index) {
  return {
    id: `app-${index}`,
    brandName: `Stones Throw ${index}`,
    alcoholByVolume: 45,
    netContents: '750 ml',
    producerName: 'Old Tom Distillery',
    colaNumber: `COLA-${String(index).padStart(6, '0')}`,
    approvalDate: new Date(),
  };
}

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function createLabelAndApplication(index) {
  const labelResponse = await fetch(`${BASE_URL}/labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createLabel(index)),
  });

  if (!labelResponse.ok) {
    throw new Error(`Failed to create label ${index}: ${labelResponse.status}`);
  }

  const label = await labelResponse.json();

  const applicationResponse = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createApplication(index)),
  });

  if (!applicationResponse.ok) {
    throw new Error(`Failed to create application ${index}: ${applicationResponse.status}`);
  }

  const application = await applicationResponse.json();
  return { label, application };
}

async function run() {
  const durations = [];

  for (let index = 0; index < 50; index++) {
    const { label, application } = await createLabelAndApplication(index);

    const started = performance.now();
    const validateResponse = await fetch(`${BASE_URL}/validate/label`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelId: label.id }),
    });
    const crossCheckResponse = await fetch(`${BASE_URL}/validate/cross-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelId: label.id, applicationId: application.id }),
    });
    const ended = performance.now();

    if (!validateResponse.ok || !crossCheckResponse.ok) {
      throw new Error('Validation endpoints failed during performance check');
    }

    durations.push(ended - started);
  }

  const batchStarted = performance.now();
  const labelIds = [];
  for (let index = 0; index < BATCH_SIZE; index++) {
    const { label } = await createLabelAndApplication(index + 5000);
    labelIds.push(label.id);
  }
  const batchResponse = await fetch(`${BASE_URL}/batch/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labelIds, maxConcurrency: 25 }),
  });
  const batchEnded = performance.now();

  if (!batchResponse.ok) {
    throw new Error('Batch endpoint failed during performance check');
  }

  const p95 = percentile(durations, 95);
  const max = Math.max(...durations);
  const average = durations.reduce((sum, current) => sum + current, 0) / durations.length;
  const batchTotalMs = batchEnded - batchStarted;
  const batchPerLabelMs = batchTotalMs / BATCH_SIZE;

  const singlePass = p95 <= MAX_SINGLE_LABEL_MS;
  const batchPass = batchPerLabelMs <= MAX_SINGLE_LABEL_MS;
  const pass = singlePass && batchPass;

  console.log('=== Acceptance Performance Check ===');
  console.log(`Single label p95: ${p95.toFixed(2)} ms`);
  console.log(`Single label max: ${max.toFixed(2)} ms`);
  console.log(`Single label avg: ${average.toFixed(2)} ms`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Batch total: ${batchTotalMs.toFixed(2)} ms`);
  console.log(`Batch avg per label: ${batchPerLabelMs.toFixed(2)} ms`);
  console.log(`Threshold: <= ${MAX_SINGLE_LABEL_MS} ms per label`);

  if (!pass) {
    console.error('❌ Performance acceptance check FAILED');
    process.exit(1);
  }

  console.log('✅ Performance acceptance check PASSED');
}

run().catch((error) => {
  console.error('❌ Performance acceptance check error:', error);
  process.exit(1);
});
