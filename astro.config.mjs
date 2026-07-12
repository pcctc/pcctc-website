// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pcctc.org',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // /privacy is noindex; don't send crawlers contradictory signals
      filter: (page) => !page.endsWith('/privacy/'),
    }),
  ],
  build: {
    format: 'directory',
  },
});
