import {writeFile} from 'node:fs/promises';
import process from 'node:process';
const base=String(process.env.VITE_APP_URL||'').replace(/\/$/,'');
if(!/^https:\/\//.test(base))throw new Error('VITE_APP_URL must be an absolute HTTPS production URL.');
const routes=['','about','how-it-works','success-stories','membership','safety','contact','privacy','terms','refunds'];
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route=>`  <url><loc>${base}/${route}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('../public/sitemap.xml',import.meta.url),xml);
console.log(`Generated sitemap for ${base}`);
