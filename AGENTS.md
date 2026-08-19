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
  `title`, `phase`, `nct`, `url`, optional `note`. For active studies `url` is optional and
  defaults to the ClinicalTrials.gov page for `nct`; for featured studies it's required (it's
  the card link, and may be a site path such as `/talent`).
- **Services** — `src/data/services.yaml` (title, summary, bullet `points`).
- **Leadership / committee / sites / stats / working-group publications** — the other
  `src/data/*.yaml` files. `working-groups.yaml` holds the publication lists.
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
