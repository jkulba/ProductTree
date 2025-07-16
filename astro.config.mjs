import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.hallcrest.engineering',
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
    mermaid()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  build: {
    format: 'directory'
  },
  output: 'static'
});