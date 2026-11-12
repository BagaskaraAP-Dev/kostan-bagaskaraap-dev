import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.TEST_PORT || 5055;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let serverProcess = null;

before(async () => {
  // Check if a server is already running on BASE_URL
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) return; // Server already running
  } catch (e) {
    // Need to start standalone test server
  }

  return new Promise((resolve, reject) => {
    const serverPath = path.resolve(__dirname, '../src/server.js');
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        PORT: String(PORT),
        DATA_DIR: path.resolve(__dirname, '../data_test'),
        NODE_ENV: 'test'
      },
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('listening on port') || data.toString().includes('running')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (err) => {
      console.error('Test server error:', err.toString());
    });

    serverProcess.on('error', reject);

    // Timeout fallback
    setTimeout(resolve, 3000);
  });
});

after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('Health check endpoint returns ok status', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.version, '2.0.0');
});

test('Rooms endpoint returns room array and correct structure', async () => {
  const res = await fetch(`${BASE_URL}/rooms`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length > 0);

  const first = json.data[0];
  assert.ok('id' in first);
  assert.ok('room_number' in first);
  assert.ok('price' in first);
  assert.ok('status' in first);
});

test('Dashboard stats endpoint returns numerical metrics', async () => {
  const res = await fetch(`${BASE_URL}/dashboard/stats`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(typeof json.data.totalRooms, 'number');
  assert.equal(typeof json.data.occupiedRooms, 'number');
  assert.equal(typeof json.data.availableRooms, 'number');
  assert.equal(typeof json.data.totalRevenue, 'number');
});

test('Booking validation prevents submission without required fields', async () => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_name: 'Test Tenant'
    })
  });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
});
