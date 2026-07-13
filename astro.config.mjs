import { defineConfig, sharpImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

import icon from 'astro-icon';

export default defineConfig({
  site: 'https://nav.blueke.top/',
  integrations: [
    sitemap(),
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
