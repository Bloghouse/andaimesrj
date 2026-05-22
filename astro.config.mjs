import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://andaimesrj.com.br',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [tailwind(), sitemap(), react()],
  vite: {
    optimizeDeps: {
      include: ['marked'],
    },
  },
});