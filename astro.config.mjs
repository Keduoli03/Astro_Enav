import { defineConfig, sharpImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

export default defineConfig({
  site: 'https://nav.blueke.top/',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap(),
    react(),
    svelte(),
    icon({
      include: {
        ri: ['*']
      }
    })
  ],
  image: {
    service: sharpImageService()
  },
  output: 'static',
  adapter: vercel()
});
