# pcctc.org

The website for the **Prostate Cancer Clinical Trials Consortium (PCCTC)** — a static site built
with [Astro](https://astro.build) and deployed to GitHub Pages. Designed so the team can maintain
it by editing Markdown and YAML in this repo, with no CMS and no external vendor.

## Quick start

```sh
npm install
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build to ./dist
npm run preview   # preview the production build
```

Requires Node 22+.

## Editing content

You rarely need to touch page templates. Content lives in plain text files:

| To change… | Edit… |
|---|---|
| A news post | a Markdown file in `src/content/news/` (copy an existing one) |
| The studies list | `src/data/studies-featured.yaml`, `src/data/studies-active.yaml` |
| Services | `src/data/services.yaml` |
| Leadership / committee | `src/data/leadership.yaml`, `src/data/committee.yaml` |
| Participating sites | `src/data/sites.yaml` |
| Homepage / about stats | `src/data/stats.yaml` |
| Working-group publications | `src/data/working-groups.yaml` |
| Colors, fonts, spacing | `src/styles/global.css` (design tokens under `:root`) |

### Adding a news post

Create `src/content/news/my-post-slug.md`:

```markdown
---
title: "Your headline here"
date: 2026-07-15
author: "PCCTC"
description: "One-sentence summary used for SEO and the news card."
# external: "https://example.com/press-release"   # only for link-style posts
---

Body content in Markdown.
```

The filename is the URL (`/news/my-post-slug`). If you set `external`, the post page shows a
"Read the full article" button instead of expecting a long body.

## Project structure

```
src/
  pages/          route files (one .astro per page; news/[slug].astro renders posts)
  layouts/        Base.astro — shared <head>, header, footer
  components/     Seo, Header, Footer, PageHero, Icon
  content/news/   news posts (Markdown)
  data/           YAML content files
  lib/data.ts     loads and types the YAML
  styles/         global.css design tokens + base styles
public/           static assets (logo, favicon, robots.txt, CNAME)
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it
to GitHub Pages. The custom domain is pinned by `public/CNAME` (`www.pcctc.org`).

**One-time setup on GitHub:** in the repo's *Settings → Pages*, set the source to **GitHub Actions**.
Then point the `www.pcctc.org` DNS record at GitHub Pages to complete the cutover.

## SEO

Titles, meta descriptions, canonical URLs, Open Graph tags, and JSON-LD structured data are
generated per page by `src/components/Seo.astro`. A `sitemap-index.xml` is produced at build time
and referenced from `public/robots.txt`. Page routes match the previous site's URLs so existing
search rankings and inbound links are preserved.
