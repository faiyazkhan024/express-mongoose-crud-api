const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  // Start server on an ephemeral OS-assigned port
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

test('GET / returns 200 with API welcome payload and endpoints', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.message, 'Welcome to TaskPulse REST API');
  assert.ok(data.endpoints);
  assert.ok(data.endpoints.tasks);
  assert.ok(data.endpoints.analytics);
});

test('GET /health returns 200 and reports database status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.ok(data.database);
  assert.ok(typeof data.database.status === 'string');
});

test('GET /api/v1/nonexistent returns 404 with structured error', async () => {
  const res = await fetch(`${baseUrl}/api/v1/nonexistent`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.status, 'fail');
  assert.ok(data.message.includes('Endpoint not found'));
});

test('POST /api/v1/tasks validates required and constrained fields (400 Bad Request)', async () => {
  const invalidPayload = {
    title: 'ab', // min length 3
    status: 'invalid_status',
    priority: 'extreme', // not allowed
    category: 'unknown_cat',
    assignee: {
      email: 'not-an-email'
    },
    estimatedHours: -5
  };

  const res = await fetch(`${baseUrl}/api/v1/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidPayload)
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.status, 'fail');
  assert.ok(Array.isArray(data.errors));
  assert.ok(data.errors.length >= 4);

  const errorFields = data.errors.map((e) => e.field);
  assert.ok(errorFields.includes('title'));
  assert.ok(errorFields.includes('status'));
  assert.ok(errorFields.includes('priority'));
  assert.ok(errorFields.includes('category'));
});

test('GET /api/v1/tasks/:id rejects invalid ObjectId format with 400 Bad Request', async () => {
  const res = await fetch(`${baseUrl}/api/v1/tasks/123-not-an-objectid`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.status, 'fail');
  assert.ok(data.message.includes('24-character hexadecimal ObjectId'));
});

test('PATCH /api/v1/tasks/:id rejects empty or invalid update keys with 400 Bad Request', async () => {
  const validFakeId = '507f1f77bcf86cd799439011';
  const res = await fetch(`${baseUrl}/api/v1/tasks/${validFakeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalidField: 'foobar' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.status, 'fail');
  assert.ok(data.message.includes('At least one valid field'));
});

test('GET /api/v1/tasks validates query parameters (400 Bad Request)', async () => {
  const res = await fetch(`${baseUrl}/api/v1/tasks?limit=500&sortOrder=diagonal&status=nonexistent`);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.status, 'fail');
  assert.ok(Array.isArray(data.errors));
  assert.ok(data.errors.length >= 3);
});
