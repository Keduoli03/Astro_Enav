import type { APIRoute } from 'astro';
import allSites from '../data/sites/all.js';

export const prerender = true;

const searchIndex = allSites.map((site) => ({
  title: site.title || '',
  url: site.url || '',
  description: site.description || '',
  subId: site.subId || '',
}));

export const GET: APIRoute = () => new Response(JSON.stringify(searchIndex), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  },
});
