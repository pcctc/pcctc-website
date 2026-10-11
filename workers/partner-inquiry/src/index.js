// Receives the inquiry form on www.pcctc.org/partner and emails it through Resend.
// Deployment, secrets and handoff notes: docs/partner-form.md.

// [form field, label in the email and error messages, max length, required]
const FIELDS = [
  ['first_name', 'First name', 100, true],
  ['last_name', 'Last name', 100, true],
  ['organization', 'Organization', 200, true],
  ['email', 'Work email', 254, true],
  ['interest', 'Interested in', 100, true],
  ['service_lines', 'Service lines', 1000, false],
  ['message', 'Message', 5000, true],
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const cors = allowed.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
      : { Vary: 'Origin' };
    const reply = (status, success, message) =>
      Response.json({ success, message }, { status, headers: cors });

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    if (request.method !== 'POST') return reply(405, false, 'Method not allowed.');
    if (!allowed.includes(origin)) {
      return reply(403, false, 'This form only accepts submissions from pcctc.org.');
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return reply(400, false, 'The form could not be read.');
    }

    // The botcheck box is hidden from people, so only bots tick it. Answer as if it worked.
    if (form.get('botcheck')) return reply(200, true, 'Thank you.');

    const ip = request.headers.get('CF-Connecting-IP');
    if (!(await passedTurnstile(form.get('cf-turnstile-response'), ip, env))) {
      return reply(400, false, 'The verification check did not pass. Please reload the page and try again.');
    }

    const values = {};
    for (const [name, label, max, required] of FIELDS) {
      const value = form
        .getAll(name)
        .map((v) => String(v).trim())
        .filter(Boolean)
        .join(', ');
      if (required && !value) return reply(400, false, `${label} is required.`);
      if (value.length > max) return reply(400, false, `${label} is too long.`);
      values[name] = value;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return reply(400, false, 'Please enter a valid email address.');
    }

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM,
        to: env.INQUIRY_TO.split(',').map((a) => a.trim()).filter(Boolean),
        reply_to: values.email,
        subject: `Partnership inquiry (pcctc.org): ${values.organization}`.replace(/[\r\n]+/g, ' '),
        text: emailBody(values),
      }),
    });
    if (!sent.ok) {
      // Resend's error message can echo addresses, so log only its status and error type.
      const error = await sent.json().catch(() => ({}));
      console.error('Resend did not accept the email', sent.status, error.name ?? 'unknown');
      return reply(502, false, 'Sorry, your inquiry could not be sent. Please email pcctc@mskcc.org instead.');
    }
    return reply(200, true, 'Thank you. Your inquiry has been sent and our team will follow up.');
  },
};

async function passedTurnstile(token, ip, env) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  if (!res.ok) return false;
  const outcome = await res.json();
  return outcome.success === true;
}

function emailBody(v) {
  const lines = [
    `Name: ${v.first_name} ${v.last_name}`,
    `Organization: ${v.organization}`,
    `Email: ${v.email}`,
    `Interested in: ${v.interest}`,
  ];
  if (v.service_lines) lines.push(`Service lines: ${v.service_lines}`);
  lines.push(
    '',
    v.message,
    '',
    '-- ',
    'Sent from the inquiry form at https://www.pcctc.org/partner/. Reply to answer the sender directly.',
  );
  return lines.join('\n');
}
