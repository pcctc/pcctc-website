# PCCTC website (pcctc.org)

Static marketing/informational site for the Prostate Cancer Clinical Trials Consortium,
built with Astro and deployed to GitHub Pages. It replaces a consultant-built Squarespace
site; the priority is that PCCTC staff can maintain it by editing text files in git.

## Where content lives (edit these, not the page templates)

- **News posts** — one Markdown file per post in `src/content/news/`. Frontmatter: `title`,
  `date` (YYYY-MM-DD), `author`, `description`, optional `external` (URL) for link-style posts
  that point to a press release/article/video. Filenames become the URL slug — keep them stable
  to preserve SEO. To add a post, copy an existing file and edit.
- **Studies** — `src/data/studies-featured.yaml` and `studies-active.yaml`. Each entry:
  `title`, `phase`, `nct`, `url`, optional `note`.
- **Services** — `src/data/services.yaml` (title, summary, bullet `points`).
- **Leadership / committee / sites / stats / working-group publications** — the other
  `src/data/*.yaml` files. `working-groups.yaml` holds the publication lists.

Page templates in `src/pages/` and components in `src/components/` render this data; the
narrative pages (expertise, guiding principles) keep their prose inline in the `.astro` file.

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
  GitHub Pages IPs). Live on the custom domain since 2026-08-11.

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
