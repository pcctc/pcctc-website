# pcctc.org

The website for the **Prostate Cancer Clinical Trials Consortium (PCCTC)**, a static site built
with [Astro](https://astro.build) and deployed to GitHub Pages. All content is plain Markdown and
YAML in this repo. Staff edit it in the browser through [Pages CMS](https://pagescms.org), a free,
open-source editor that commits straight to this repo; developers can edit the files directly.

## Quick start

```sh
npm install
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build to ./dist
npm run preview   # preview the production build
```

Requires Node 22+.

## Editing content

You rarely need to touch page templates. Content lives in plain text files, and there are two
ways to change it.

### In the browser, with Pages CMS

New to this? Start with the step-by-step [editing guide](docs/editing-guide.md), which has
screenshots and a troubleshooting table. The short version:

Go to **https://app.pagescms.org** and sign in with the email address you were invited with.
You'll get a one-time code by email; there is no password and no GitHub account to manage.
Open **pcctc-website** and pick a section in the left sidebar:

| Section | What it changes |
|---|---|
| News | posts on /news and the latest three on the homepage |
| Studies → Featured / Active | the study cards and the open-studies list on /studies |
| Services | /services and the service cards on the homepage |
| About page → Management team, Scientific Oversight Committee, Participating sites, Key numbers | the matching blocks on /about (key numbers also appear on the homepage) |
| Expertise page, Guiding principles page | the text on those two pages |
| Working groups | the groups and publication lists on /workinggroups |
| Media | images under `public/images/` |

A few things to know before you start:

- **Saving publishes.** Each save becomes a commit to this repo, and the site rebuilds and goes
  live about two minutes later. There is no draft state and no preview, so read your change
  over before you save, then check the live page.
- **A bad save can't take the site down.** If a change fails to build, the live site keeps
  showing the previous version and an issue is opened in this repo that notifies the
  maintainer. If your change hasn't appeared after five minutes, that's probably what happened.
- **Nothing is lost.** Each entry has a History panel in the CMS showing earlier versions, and
  the full record lives in this repo's commit history, so the maintainer can restore any
  previous state.
- **A new post's web address comes from its title.** "Just Published: ..." becomes
  `/news/just-published-...`. The address is fixed when you first save (renaming would break
  links and search rankings), so settle the title first.
- **Don't edit the "Anchor" fields on existing entries.** On services, expertise sections and
  working groups they're part of web addresses that other pages link to.
- **Only upload images PCCTC owns.** Headshots and our own graphics are fine; the old site's
  stock-photo licenses didn't transfer to us.

The forms themselves are defined in [`.pages.yml`](.pages.yml) at the root of this repo. That's
the place to add a field, change a label, or reword the help text.

### In git

| To change… | Edit… |
|---|---|
| A news post | a Markdown file in `src/content/news/` (copy an existing one) |
| The studies list | `src/data/studies-featured.yaml`, `src/data/studies-active.yaml` |
| Services | `src/data/services.yaml` |
| Leadership / committee | `src/data/leadership.yaml`, `src/data/committee.yaml` |
| Participating sites | `src/data/sites.yaml` |
| Homepage / about stats | `src/data/stats.yaml` |
| Expertise and guiding-principles text | `src/data/expertise.yaml`, `src/data/guiding-principles.yaml` |
| Working-group publications | `src/data/working-groups.yaml` |
| Colors, fonts, spacing | `src/styles/global.css` (design tokens under `:root`) |

Pushing to `main` deploys, the same as a CMS save.

#### Adding a news post

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
public/           static assets (logo, favicon, robots.txt)
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it
to GitHub Pages at https://www.pcctc.org (live since August 2026).

**How the domain is wired:** the Pages source is **GitHub Actions**, with `www.pcctc.org` entered
as the custom domain in the repo's *Settings → Pages* (Actions-based deploys ignore CNAME files
in the build output). DNS is hosted at GoDaddy: `www` is a CNAME to `pcctc.github.io`, and the
bare domain has A records pointing at GitHub Pages, which redirects it to `www`. HTTPS is
enforced in the Pages settings.

## SEO

Titles, meta descriptions, canonical URLs, Open Graph tags, and JSON-LD structured data are
generated per page by `src/components/Seo.astro`. A `sitemap-index.xml` is produced at build time
and referenced from `public/robots.txt`. Page routes match the previous site's URLs so existing
search rankings and inbound links are preserved.
