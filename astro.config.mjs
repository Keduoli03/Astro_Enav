import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import svelte from '@astrojs/svelte';

import icon from 'astro-icon';

export default defineConfig({
  site: 'https://nav.blueke.top/',
  integrations: [
    sitemap(),
    svelte(),
    icon({
      include: {
        ri: ['*']
      }
    })
  ],
  output: 'server',
  adapter: vercel()
});