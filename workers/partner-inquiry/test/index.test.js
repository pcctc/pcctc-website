import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const env = {
  ALLOWED_ORIGINS: 'https://www.pcctc.org,https://pcctc.org',
  FROM: 'PCCTC website <inquiries@forms.pcctc.org>',
  RESEND_API_KEY: 're_test',
  TURNSTILE_SECRET_KEY: 'turnstile_test',
  INQUIRY_TO: 'first@example.org, second@example.org',
};

// Stands in for Turnstile and Resend; records every outgoing request.
function stubNetwork({ turnstile = true, resendStatus = 200 } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('turnstile')) return Response.json({ success: turnstile });
    const body = resendStatus === 200
      ? { id: 'email_123' }
      : { statusCode: resendStatus, name: 'validation_error', message: 'Invalid `to` field: first@example.org' };
    return Response.json(body, { status: resendStatus });
  };
  return calls;
}

function submission(overrides = {}, origin = 'https://www.pcctc.org') {
  const fields = {
    first_name: 'Ada',
    last_name: 'Lovelace',
    organization: 'Example Bio',
    email: 'ada@example.com',
    interest: 'CRO services',
    message: 'We are planning a phase 2 trial and would like to talk.',
    'cf-turnstile-response': 'token',
    ...overrides,
  };
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const item of [].concat(value)) if (item !== undefined) body.append(name, item);
  }
  return new Request('https://pcctc-partner-inquiry.example.workers.dev/', {
    method: 'POST',
    body,
    headers: { Origin: origin, Accept: 'application/json' },
  });
}

const resendCall = (calls) => calls.find((c) => c.url === 'https://api.resend.com/emails');

test('sends a valid inquiry to every recipient, replying to the visitor', async () => {
  const calls = stubNetwork();
  const res = await worker.fetch(
    submission({ service_lines: ['Regulatory Services', 'Project Management'] }),
    env,
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://www.pcctc.org');

  const sent = resendCall(calls);
  assert.equal(sent.init.headers.Authorization, 'Bearer re_test');
  const email = JSON.parse(sent.init.body);
  assert.equal(email.from, env.FROM);
  assert.deepEqual(email.to, ['first@example.org', 'second@example.org']);
  assert.equal(email.reply_to, 'ada@example.com');
  assert.equal(email.subject, 'Partnership inquiry (pcctc.org): Example Bio');
  assert.match(email.text, /Service lines: Regulatory Services, Project Management/);
  assert.match(email.text, /We are planning a phase 2 trial/);
});

test('rejects submissions from other sites without sending', async () => {
  const calls = stubNetwork();
  const res = await worker.fetch(submission({}, 'https://evil.example'), env);
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(calls.length, 0);
});

test('answers a ticked honeypot as if it worked, without sending', async () => {
  const calls = stubNetwork();
  const res = await worker.fetch(submission({ botcheck: 'on' }), env);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);
  assert.equal(calls.length, 0);
});

test('requires a passing Turnstile check', async () => {
  const calls = stubNetwork({ turnstile: false });
  const res = await worker.fetch(submission(), env);
  assert.equal(res.status, 400);
  assert.equal(resendCall(calls), undefined);
});

test('requires a Turnstile token at all', async () => {
  const calls = stubNetwork();
  const res = await worker.fetch(submission({ 'cf-turnstile-response': undefined }), env);
  assert.equal(res.status, 400);
  assert.equal(calls.length, 0);
});

test('requires the mandatory fields', async () => {
  const calls = stubNetwork();
  const res = await worker.fetch(submission({ message: '   ' }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).message, 'Message is required.');
  assert.equal(resendCall(calls), undefined);
});

test('rejects a malformed email address', async () => {
  stubNetwork();
  const res = await worker.fetch(submission({ email: 'not-an-address' }), env);
  assert.equal(res.status, 400);
});

test('rejects overlong fields', async () => {
  stubNetwork();
  const res = await worker.fetch(submission({ message: 'x'.repeat(5001) }), env);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).message, 'Message is too long.');
});

test('keeps line breaks out of the subject', async () => {
  const calls = stubNetwork();
  await worker.fetch(submission({ organization: 'Example Bio\r\nBcc: someone@example.net' }), env);
  const email = JSON.parse(resendCall(calls).init.body);
  assert.doesNotMatch(email.subject, /[\r\n]/);
});

test('tells the visitor to email instead when Resend refuses, and logs no addresses', async (t) => {
  stubNetwork({ resendStatus: 422 });
  const logged = [];
  t.mock.method(console, 'error', (...args) => logged.push(args.join(' ')));
  const res = await worker.fetch(submission(), env);
  assert.equal(res.status, 502);
  assert.match((await res.json()).message, /pcctc@mskcc\.org/);
  assert.equal(logged.length, 1);
  assert.doesNotMatch(logged[0], /@/);
});

test('answers the browser preflight for the site', async () => {
  stubNetwork();
  const res = await worker.fetch(
    new Request('https://pcctc-partner-inquiry.example.workers.dev/', {
      method: 'OPTIONS',
      headers: { Origin: 'https://www.pcctc.org' },
    }),
    env,
  );
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://www.pcctc.org');
});
