# Partner inquiry form

How inquiries from the form on /partner reach PCCTC inboxes, why it's set up this way, and how
to run it. This file is the handoff record: update it whenever an account, key, DNS record or
recipient changes.

## Status

| Date | Change |
|---|---|
| 2026-10-09 | Form launched on Web3Forms. |
| 2026-10-10 | Form switched off (`formEnabled = false` in `src/pages/partner.astro`); /partner shows an email button for pcctc@mskcc.org instead. Replacement setup started. |
| 2026-10-11 | Cloudflare sign-up with an mskcc.org address is blocked: MSK has an enterprise Cloudflare account that claims the domain, so those sign-ups go to MSK IT. Looking for a pcctc.org address to own the accounts instead (pcctc.org email is Microsoft 365, managed through GoDaddy). |
| 2026-10-11 | Worker written and tested locally (`workers/partner-inquiry/`). Not deployed yet. |

## Why Web3Forms was dropped

Web3Forms is a free service that emails each submission to the address its access key was
registered with. On 2026-10-10 Rebecca Green reported that her test of the form never arrived.
Tests that day from the live page showed:

- Web3Forms accepted every submission.
- A submission sent to a Gmail address arrived.
- Identical submissions sent to an MSK address (Travis Gerke's) never arrived and never
  appeared in junk or quarantine, including one with a different sender name.

MSK's incoming mail passes through Proofpoint (the MX records for mskcc.org point to
pphosted.com), which can discard mail without telling the recipient. Public form services send
from shared servers that spammers also use, and asking MSK IT to allow one looked unlikely to
succeed, so the form needs a sender PCCTC controls.

## How the replacement works

1. A visitor fills in the form on /partner. A Cloudflare Turnstile check (free, usually
   invisible) confirms they aren't a bot.
2. The browser sends the form to a Cloudflare Worker, a small script hosted by Cloudflare and
   kept in `workers/partner-inquiry/`.
3. The Worker checks the Turnstile result and the fields, then sends the inquiry through Resend,
   an email-sending service, from an address on `forms.pcctc.org`. Reply-To is the visitor's
   address, so replying goes straight to them.
4. The recipient list is stored as a Worker secret, not in this public repo.

`forms.pcctc.org` is used only for this, so the records behind pcctc.org's own email stay
untouched.

## The Worker

Files in `workers/partner-inquiry/`:

| File | What it is |
|---|---|
| `src/index.js` | the Worker |
| `wrangler.toml` | its name, settings and non-secret configuration |
| `package.json`, `package-lock.json` | pin `wrangler`, Cloudflare's command-line tool, at 4.141.0 |
| `test/index.test.js` | tests that run on any computer with Node; no accounts needed |

What it does with each submission, in order:

1. Accepts only POST requests sent from https://www.pcctc.org or https://pcctc.org.
2. Treats a ticked `botcheck` box (hidden from people) as a bot: it answers "success" and sends
   nothing.
3. Asks Cloudflare whether the visitor passed the Turnstile check.
4. Checks the required fields, their lengths and the email format.
5. Sends one email through Resend to every address in `INQUIRY_TO`, with Reply-To set to the
   visitor's address.
6. Answers the page with JSON (`success` and `message`), and the page shows the message to the
   visitor.

Configuration:

| Name | Kind | Where it's set | What it holds |
|---|---|---|---|
| `FROM` | variable | `wrangler.toml` | sender name and address |
| `ALLOWED_ORIGINS` | variable | `wrangler.toml` | the sites allowed to submit |
| `RESEND_API_KEY` | secret | Cloudflare | Resend key with sending access to `forms.pcctc.org` |
| `TURNSTILE_SECRET_KEY` | secret | Cloudflare | secret key of the Turnstile widget |
| `INQUIRY_TO` | secret | Cloudflare | recipients, comma-separated; kept out of this public repo |

Secrets are set with `npx wrangler secret put NAME`, run from `workers/partner-inquiry/`. Once
set they can be replaced but not read back, so a successor sets new ones rather than looking
up the old ones.

Logging: Cloudflare keeps request logs (`[observability]` in `wrangler.toml`). When Resend
refuses an email the Worker logs only Resend's status code and error type, never a visitor's
name, address or message.

To run the tests: `cd workers/partner-inquiry && npm test`.

## DNS

pcctc.org's DNS is managed at GoDaddy (nameservers `ns57.domaincontrol.com` and
`ns58.domaincontrol.com`). These existing records belong to other services; leave them alone:

| Record | Value | Used by |
|---|---|---|
| `pcctc.org` MX | `pcctc-org.mail.protection.outlook.com` | pcctc.org email (Microsoft 365, set up through GoDaddy) |
| `pcctc.org` TXT | `v=spf1 include:secureserver.net -all` | the same email |
| `_dmarc.pcctc.org` TXT | `v=DMARC1; p=quarantine; ...` | the same email, and every subdomain |
| `www` CNAME and apex A | GitHub Pages | the website |

Because the `_dmarc` policy also covers `forms.pcctc.org`, mail sent from it has to carry a
valid DKIM signature for that subdomain. Resend's DNS records provide it.
