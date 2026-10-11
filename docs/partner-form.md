# Partner inquiry form

How inquiries from the form on /partner reach PCCTC inboxes, why it's set up this way, and how
to run it. This file is the handoff record: update it whenever an account, key, DNS record or
recipient changes.

## Status

| Date | Change |
|---|---|
| 2026-10-09 | Form launched on Web3Forms. |
| 2026-10-10 | Form switched off (`formEnabled = false` in `src/pages/partner.astro`); /partner shows an email button for pcctc@mskcc.org instead. Replacement setup started. |

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
