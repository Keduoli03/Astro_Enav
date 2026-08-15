import { defineConfig, sharpImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

export default defineConfig({
  site: 'https://nav.blueke.top/',
  integrations: [
    sitemap(),
    icon({
      include: {
        ri: ['*']
      }
    }),
    react()
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    service: sharpImageService()
  },
  output: 'static',
  adapter: vercel()
});
