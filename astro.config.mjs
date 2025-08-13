import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';
import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://nav.blueke.top/',
  integrations: [sitemap(), svelte()],
  output: 'server',
  adapter: vercel()
});
