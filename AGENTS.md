# PCCTC website (pcctc.org)

Static marketing/informational site for the Prostate Cancer Clinical Trials Consortium,
built with Astro and deployed to GitHub Pages. It replaces a consultant-built Squarespace
site; the priority is that PCCTC staff can maintain it without a developer. Staff edit through
Pages CMS (see Key decisions); everything it edits is a plain text file in this repo.

## Where content lives (edit these, not the page templates)

- **News posts** — one Markdown file per post in `src/content/news/`. Frontmatter: `title`,
  `date` (YYYY-MM-DD), `author`, `description`, optional `external` (URL) for link-style posts
  that point to a press release/article/video. Filenames become the URL slug — keep them stable
  to preserve SEO. To add a post, copy an existing file and edit.
- **Studies** — `src/data/studies-featured.yaml` and `studies-active.yaml`. Each entry:
  `title`, `phase`, `nct`, `url`, optional `note`; active entries also carry `status` (the
  accrual status, shown as a chip). For active studies `url` is optional and defaults to the
  ClinicalTrials.gov page for `nct`; for featured studies it's required (it's the card link,
  and may be a site path such as `/talent`). `studies-consortium.yaml` (same fields, no
  `status`) holds other trials open at consortium sites; its titles are written by Kris
  Prepelica (medical communications) and kept as he writes them. Both lists hold
  interventional studies only; registries and their substudies live in `registries.yaml`.
  In `studies-active.yaml`, titles lead with the short
  name from the Project Matrix ("DORA: A Phase III Trial of ..."), the rest is the
  ClinicalTrials.gov official title, and `phase` uses Arabic numerals ("Phase 2",
  "Phase 1b/2a") even when the official title doesn't.
- **Services** — `src/data/services.yaml` (title, summary, bullet `points`). Order is display
  order on /services and the homepage cards. `src/data/engagement-models.yaml` holds the
  "How we engage" cards at the top of /services.
- **Registries** — `src/data/registries.yaml` (`name`, `condition`, `status` Active/In
  development, optional `nct`/`url`, `description`, optional `substudies` list of `title` +
  accrual `status`), rendered on /registries. Substudies from every registry appear in one
  "Active substudies" list under the platform text; remove one when its project closes.
- **Leadership / committee / sites / stats / working-group publications** — the other
  `src/data/*.yaml` files. `working-groups.yaml` holds the publication lists (a group with no
  `publications` renders without that block). Leadership entries take an optional `bio`; when
  present the /about card becomes click-to-expand.
- **Expertise and guiding-principles text** — `src/data/expertise.yaml` (`id`, `title`, `body`;
  `id` is the in-page anchor) and `src/data/guiding-principles.yaml` (`title`, `body`). Long
  `body` fields render one paragraph per line break (`paragraphs()` in `src/lib/data.ts`).
- **CMS forms** — `.pages.yml` at the repo root defines what Pages CMS shows for each of the
  above. Adding a field to a data file or the news schema means adding it there too.

Page templates in `src/pages/` and components in `src/components/` render this data. Prose that
is still inline in `.astro` files (not CMS-editable): the homepage, the About page mission and
history, /talent, /privacy, and every page's hero eyebrow/title/lede and SEO description.

Content note: Travis Gerke's title is "Head of Applied Intelligence". The old Squarespace site
said "Head of Applied Science", which was wrong; don't copy it back.

Content note: the EDC the site names is Medrio (changed 2026-09-17 on staff review). The old
site and earlier copy said "Medidata Rave"; don't copy that back either.

## Key decisions

- **Slugs are kept identical to the old Squarespace site** (`/workinggroups`, `/guidingprinciples`,
  news slugs, etc.) so existing inbound links and search rankings survive. Don't rename routes.
- **Design tokens** live in `src/styles/global.css` (`:root` custom properties). Palette derived
  from the PCCTC logo. Change colors there, not in component styles.
- **Data files are inlined at build time** via `import.meta.glob('../data/*.yaml', {query:'?raw'})`
  in `src/lib/data.ts` — no runtime filesystem access (required for static output).
- **Fonts self-hosted** via `@fontsource-variable` (Source Serif 4 display + Inter body). No
  Google Fonts network requests. Fraunces was swapped out in July 2026 — its calligraphic
  "f" glyphs were hard to read at display sizes.
- **SEO**: `src/components/Seo.astro` emits per-page title/description/canonical/OG + JSON-LD
  (MedicalOrganization sitewide, NewsArticle on posts, MedicalStudy on /studies). Sitemap via
  `@astrojs/sitemap`. Keep one `<h1>` per page.
- **Only the logo carries over from the old site's decorative/stock photography.** Those licenses
  likely belonged to the consultant. Staff headshots are an exception — they're org-owned photos
  of PCCTC people, not stock imagery — and were carried over for the About page management team
  section (`public/images/team/`, referenced via `photo` in `leadership.yaml`). New org-owned
  images can be added under `public/images/`.
- **Positioning language (2026-08-19, from business development)**: "full-service integrated
  CRO and clinical consortium built on two decades of leadership in genitourinary oncology",
  extending across oncology. Replaced the earlier "integrated research organization (IRO)"
  wording and the interim "oncology CRO backed by a global academic consortium". Keep the
  homepage hero, `Seo.astro` org description, and About/Services descriptions in step.
- **The repositioned site went live 2026-10-09.** Staff reviewed it on a private preview build
  over several rounds and approved it as a whole rather than line by line; that approval is the
  sign-off for copy Claude drafted during those rounds. The last commit on `main` before the
  launch is b129cc8.
- **Studies and registries are sibling tabs.** Registries is a footer link only, not primary
  nav. On /studies the featured cards sit above `PortfolioTabs.astro` because they span the
  whole portfolio (phase 1 industry, PCCTC-sponsored randomized, investigator-initiated
  phase 2, registry); the list under the tabs is "Active interventional studies".
  On /registries the tabs sit directly under the hero so the page stays about registries.
  Changed 2026-09-18 on staff review: a registry card on the interventional tab read as out of
  place, and registries and IRONMAN substudies had been mixed into the open-studies list.
- **Featured studies are open to accrual.** The same four cards appear on /studies and the
  homepage. On 2026-09-30 TIDAL replaced DASL-HiCaP, which had closed to accrual, after the
  CEO flagged it. No open phase 3 existed to take its place, so the set shows no phase 3 or
  international trial for now; bring one back when one opens.
- **/studies lists two groups (2026-10-09).** "Managed by the PCCTC" is the Project Matrix
  list described next (`studies-active.yaml`). "Open at consortium sites"
  (`studies-consortium.yaml`) comes from Kris Prepelica's October 2026 list of trials at
  consortium sites, minus registries, observational studies, and anything already in the
  managed group, most recently registered first. The lists answer different questions (what
  the PCCTC runs, and what is enrolling across the network), and only 4 of the 62 records in
  Kris's list named the PCCTC as sponsor or collaborator, so one merged list would blur that
  line.
- **The active study list follows the Airtable Project Matrix** (Operations > Project Matrix;
  settled 2026-09-25 on staff review). Definition: LLC or FSP projects whose PCCTC Project
  Status is "Active" and that have a ClinicalTrials.gov record, each showing the Matrix's
  Accrual Status. The page lists studies open to accrual first, then in development, closed to
  accrual, and pending closure (`accrualOrder` in `studies.astro`); within each status the file
  order holds, which is newest first by Matrix project number. Staff also asked (2026-09-30)
  for LLC studies ahead of FSP ones; that needs each entry's Matrix project type, which the
  site doesn't store yet. Unregistered in-development studies stay off the site because a
  sponsor's unregistered study may still be confidential, and non-study projects (e.g. ACS
  IMPACT) are left out. Registries and their substudies follow the same rule in
  `registries.yaml`. Nothing syncs the list: staff copy changes from the Matrix into the CMS
  (a nightly Airtable sync was offered and declined on 2026-09-25). ClinicalTrials.gov can't
  derive the list on its own; most sponsor-run studies don't name the PCCTC as a collaborator.
- **News index shows a rolling three-year window** (computed at build time). Older posts stay
  published at their URLs and are listed under a collapsed "Earlier news" block.
- **Partner inquiry form: switched off 2026-10-10, replacement in progress.** The form launched
  on Web3Forms (free tier), which emails each submission to the address its access key was
  registered with; the key in `src/pages/partner.astro` belongs to Rebecca Green's Web3Forms
  account, so a test with it emails her. MSK's mail filter silently drops Web3Forms email:
  tests on 2026-10-10 reached Gmail but never arrived at MSK addresses or showed up in
  quarantine, and asking IT to allow a public form service looked unlikely to work. So
  `formEnabled = false` shows an email button for pcctc@mskcc.org instead, and a Cloudflare
  Worker sending through Resend from `forms.pcctc.org` is being set up to replace Web3Forms.
  `docs/partner-form.md` records how it works and how to run it. The form asks people not to
  include patient information; nothing on this site should collect PHI.
- **`[STAFF CONFIRM: ...]` markers** mark text that still needs a real value (names, registry
  details, drafted copy awaiting review). They render visibly on purpose; `grep -rn "STAFF
  CONFIRM" src/` must return nothing on `main`.
- **Deploy**: pushing to `main` triggers `.github/workflows/deploy.yml` (build + GitHub Pages).
  The `www.pcctc.org` custom domain is set in the repo's Settings → Pages; Actions-based deploys
  ignore CNAME files. DNS lives at GoDaddy (www CNAME to pcctc.github.io, apex A records to the
  GitHub Pages IPs). Live on the custom domain since 2026-08-11. A failed deploy opens an issue
  that @mentions the maintainer, because CMS commits come from the Pages CMS app and GitHub
  emails nobody about them.
- **Content editing UI: Pages CMS** (pagescms.org, hosted at app.pagescms.org; free, MIT, set up
  2026-08-19). Chosen in July 2026 over Keystatic/Sveltia (need an OAuth proxy) and headless
  CMSs (move content out of git). Config is `.pages.yml`; the Pages CMS GitHub App is installed
  on the `pcctc` org scoped to this repo only. The technical writer is an email-invited
  collaborator (no GitHub account); his saves commit to `main` via the app with his name as
  committer (`settings.commit.identity: user`) and deploy immediately. There is no review gate
  by design: the build is the safety net, and the CMS validates URLs/required fields before
  save. News posts can't be renamed from the CMS (slugs are SEO-stable). CMS saves reformat
  YAML cosmetically (quoting, line folding, `chair: false` written out) and strip YAML
  comments, so don't put information in comments inside `src/data/*.yaml`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
