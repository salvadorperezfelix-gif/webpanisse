// Genera _site/ para GitHub Pages: copia solo lo público, crea una página por producto,
// prerenderiza catálogos, versiona assets por hash y genera los sitemaps.
// Uso: node tools/build.mjs   (falla con código 1 si encuentra referencias rotas)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const SITE = 'https://panisse.es';
const TODAY = new Date().toISOString().slice(0, 10);

const ROOT_FILE_RE = /^(.+\.html|favicon.*|apple-touch-icon\.png|robots\.txt|llms\.txt|panisse[0-9a-f]+\.txt|CNAME|site\.webmanifest)$/;
const COPY_DIRS = ['assets', 'blog'];
const SKIP_IN_DIRS = p => /(^|[\\/])_draft([\\/]|$)/.test(p) || p.endsWith('.md');
const NOT_INDEXABLE = new Set(['404.html', 'producto.html']);

const BRAND_GRIDS = {
  'ic-berlin-lugo.html': ['icberlin-catalog-grid', 'ic-berlin'],
  'einstoffen-lugo.html': ['einstoffen-catalog-grid', 'einstoffen'],
  'antica-occhialeria-lugo.html': ['antica-catalog-grid', 'antica-occhialeria'],
  'glare-lugo.html': ['glare-catalog-grid', 'glare'],
  'panisse-lugo.html': ['panisse-catalog-grid', 'panisse'],
};

const read = p => fs.readFileSync(p, 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s, 'utf8'); };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const productUrl = id => `gafas-${id}.html`;
const abs = p => /^https?:/.test(p) ? p : `${SITE}/${p.replace(/^\/+/, '')}`;
const typeLabel = p => (p.type === 'sol' ? 'Sol' : 'Graduadas');
const typeLong = p => (p.type === 'sol' ? 'Gafas de sol' : 'Gafas graduadas');
const priceText = p => (p.price ? `${p.price} €` : 'Consultar precio');

function must(html, re, replacement, what) {
  if (!re.test(html)) throw new Error(`Plantilla: no se encontró ${what}`);
  return html.replace(re, replacement);
}
function setInner(html, id, inner) {
  const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(</\\2>)`);
  return must(html, re, (_, open, _t, close) => open + inner + close, `#${id}`);
}
function setAttr(html, id, attr, value) {
  const re = new RegExp(`<[a-z0-9]+\\b[^>]*\\bid="${id}"[^>]*>`);
  return must(html, re, tag => {
    const a = new RegExp(`\\s${attr}="[^"]*"`);
    return a.test(tag) ? tag.replace(a, ` ${attr}="${esc(value)}"`) : tag.replace(/\s*\/?>$/, m => ` ${attr}="${esc(value)}"${m}`);
  }, `#${id}[${attr}]`);
}
function gitDate(rel) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: ROOT, encoding: 'utf8' }).trim() || TODAY;
  } catch { return TODAY; }
}
function copyDir(src, dst) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (SKIP_IN_DIRS(s)) continue;
    if (e.isDirectory()) copyDir(s, d);
    else { fs.mkdirSync(dst, { recursive: true }); fs.copyFileSync(s, d); }
  }
}
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
}

// ── Tarjeta de producto (debe coincidir con renderCard de main.js) ──
function renderCard(p, { listitem = false } = {}) {
  const waMsg = encodeURIComponent(`Hola, me gustaría reservar las gafas ${p.brand} ${p.name} para probarlas en vuestra tienda. ¿Cuándo puedo pasarme?`);
  return `
      <article class="product-card" data-type="${esc(p.type)}" data-brand="${esc(p.brand_slug)}" data-gender="${esc(p.specs?.genero || '')}" data-price="${p.price || 0}" data-name="${esc(p.brand + ' ' + p.name)}"${p.is_new ? ' data-new="true"' : ''}${listitem ? ' role="listitem"' : ''}>
        <a href="${productUrl(p.id)}" class="product-card__link" aria-label="Ver ${esc(p.brand + ' ' + p.name)}">
          <div class="product-card__image-wrap">
            <img src="${esc(p.image || p.placeholder)}" alt="${esc(`${p.brand} ${p.name} — ${p.variant}`)}" class="product-card__image is-loaded" loading="lazy" decoding="async" />
            ${p.is_new ? '<div class="product-card__badge">Nuevo</div>' : ''}
          </div>
          <div class="product-card__info">
            <span class="product-card__brand">${esc(p.brand)}</span>
            <h3 class="product-card__name">${esc(p.name)}</h3>
            <span class="product-card__variant">${typeLabel(p)} · ${esc(p.variant)}</span>
            <p class="product-card__price">${priceText(p)}</p>
          </div>
        </a>
        <a href="https://wa.me/34614296965?text=${waMsg}" class="product-card__reserve" target="_blank" rel="noopener noreferrer" aria-label="Reservar ${esc(p.brand + ' ' + p.name)} en tienda por WhatsApp">Reservar en tienda</a>
      </article>`;
}

function catalogOrder(products) {
  const own = p => (p.brand_slug === 'panisse' ? 1 : 0);
  return products.map((p, i) => [p, i]).sort(([a, i], [b, j]) =>
    own(a) - own(b) || (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0) || i - j).map(([p]) => p);
}

function relatedFor(p, products) {
  const score = x => (x.type === p.type ? 2 : 0) + (x.brand_slug === p.brand_slug ? 1 : 0);
  return products.filter(x => x.id !== p.id).map((x, i) => [x, i])
    .sort(([a, i], [b, j]) => score(b) - score(a) || i - j).slice(0, 3).map(([x]) => x);
}

function productDescription(p) {
  const base = p.description?.trim()
    || `${typeLong(p)} ${p.brand} ${p.name} en ${p.variant}. Pruébalas en Panisse Óptica, Rúa do Teatro, Lugo, con asesoramiento de óptico-optometrista.`;
  return base.length > 158 ? base.slice(0, 155).replace(/\s+\S*$/, '') + '…' : base;
}

function productJsonLd(p) {
  const url = `${SITE}/${productUrl(p.id)}`;
  const images = (p.gallery?.length ? p.gallery : [p.image]).filter(Boolean).map(abs);
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE}/catalogo.html` },
      { '@type': 'ListItem', position: 3, name: p.brand, item: `${SITE}/catalogo.html?marca=${p.brand_slug}` },
      { '@type': 'ListItem', position: 4, name: `${p.name} ${p.variant}`, item: url },
    ],
  };
  // Sin precio no hay Offer válido: se omite Product para no generar errores en Search Console.
  const product = p.price ? {
    '@context': 'https://schema.org', '@type': 'Product',
    name: `${p.brand} ${p.name}`,
    ...(p.description ? { description: p.description } : {}),
    image: images, sku: p.id, color: p.variant,
    brand: { '@type': 'Brand', name: p.brand },
    url,
    offers: {
      '@type': 'Offer', priceCurrency: 'EUR', price: p.price,
      availability: 'https://schema.org/InStoreOnly', url,
      seller: { '@id': `${SITE}/#business` },
    },
  } : null;
  return { product, crumbs };
}

function buildProductPage(template, p, products) {
  const url = `${SITE}/${productUrl(p.id)}`;
  const title = `${p.brand} ${p.name} ${p.variant} | Panisse Óptica Lugo`;
  const desc = productDescription(p);
  const img = abs(p.image || p.placeholder);
  const { product, crumbs } = productJsonLd(p);
  let h = template;

  h = must(h, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, '<title>');
  h = must(h, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" />`, 'meta description');
  h = must(h, /<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="index, follow" />', 'meta robots');
  h = must(h, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical');
  for (const [k, v] of [['og:title', title], ['og:description', desc], ['og:url', url], ['og:image', img], ['og:type', 'product']])
    h = must(h, new RegExp(`<meta property="${k}" content="[^"]*"\\s*/?>`), `<meta property="${k}" content="${esc(v)}" />`, k);
  for (const [k, v] of [['twitter:title', title], ['twitter:description', desc], ['twitter:image', img]])
    h = must(h, new RegExp(`<meta name="${k}" content="[^"]*"\\s*/?>`), `<meta name="${k}" content="${esc(v)}" />`, k);
  h = h.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*"\s*\/?>/g, '');

  h = must(h, /<script type="application\/ld\+json" id="product-schema"><\/script>/,
    product ? `<script type="application/ld+json" id="product-schema">${JSON.stringify(product)}</script>` : '', 'product-schema');
  // Sustituye la miga genérica del bloque estático por la del producto
  h = must(h, /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, o, json, c) => {
    const data = [].concat(JSON.parse(json)).filter(x => x['@type'] !== 'BreadcrumbList');
    return o + '\n' + JSON.stringify([...data, crumbs], null, 2) + '\n' + c;
  }, 'JSON-LD estático');

  h = must(h, /<body class="interior-page">/, `<body class="interior-page" data-product-id="${esc(p.id)}">`, '<body>');

  h = setInner(h, 'breadcrumb-type', p.type === 'sol' ? 'De Sol' : 'Graduadas');
  h = setAttr(h, 'breadcrumb-type', 'href', `catalogo.html?tipo=${p.type}`);
  h = setInner(h, 'breadcrumb-brand', esc(p.brand));
  h = setAttr(h, 'breadcrumb-brand', 'href', `catalogo.html?marca=${p.brand_slug}`);
  h = setInner(h, 'breadcrumb-product', esc(p.name));
  h = setInner(h, 'prod-brand', esc(p.brand));
  h = setAttr(h, 'prod-brand', 'href', `catalogo.html?marca=${p.brand_slug}`);
  h = setInner(h, 'prod-title', esc(p.name));
  h = setInner(h, 'prod-subtitle', `${typeLong(p)} · ${esc(p.variant)}`);
  h = setInner(h, 'prod-price', priceText(p));
  h = setInner(h, 'color-label', esc(p.variant));
  h = setInner(h, 'prod-desc', p.description ? `<p>${esc(p.description)}</p>` : '');
  h = setAttr(h, 'product-main-img', 'src', p.image || p.placeholder);
  h = setAttr(h, 'product-main-img', 'alt', `${p.brand} ${p.name} ${p.variant} — ${typeLong(p).toLowerCase()}`);

  const s = p.specs || {};
  const specs = [['Calibre', s.calibre], ['Puente', s.puente], ['Varillas', s.varilla], ['Material', s.material], ['Tipo', typeLabel(p)], ['Género', s.genero]]
    .filter(([, v]) => v).map(([k, v]) => `<li><span>${k}</span><span>${esc(v)}</span></li>`).join('');
  h = setInner(h, 'prod-specs', specs);

  const gallery = p.gallery?.length ? p.gallery : [p.image || p.placeholder];
  h = setInner(h, 'prod-thumbs', gallery.map((img, i) =>
    `<button class="product-gallery__thumb${i === 0 ? ' is-active' : ''}" data-img="${esc(img)}" aria-label="Ver imagen ${i + 1}"><img src="${esc(img)}" alt="${esc(`${p.brand} ${p.name} ${p.variant}, vista ${i + 1}`)}" class="is-loaded" /></button>`).join(''));

  h = setInner(h, 'related-grid', relatedFor(p, products).map(r => renderCard(r)).join(''));
  return h;
}

// ── 1. Limpia y copia lo público ──
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const f of fs.readdirSync(ROOT)) if (ROOT_FILE_RE.test(f) && fs.statSync(path.join(ROOT, f)).isFile()) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
for (const d of COPY_DIRS) copyDir(path.join(ROOT, d), path.join(OUT, d));
fs.mkdirSync(path.join(OUT, 'data'));
fs.copyFileSync(path.join(ROOT, 'data/products.json'), path.join(OUT, 'data/products.json'));

const products = JSON.parse(read(path.join(ROOT, 'data/products.json')));
const ids = new Set();
for (const p of products) {
  if (!p.id || ids.has(p.id)) throw new Error(`products.json: id vacío o duplicado: ${p.id}`);
  if (!/^[a-z0-9-]+$/.test(p.id)) throw new Error(`products.json: id con caracteres no válidos para URL: ${p.id}`);
  if (fs.existsSync(path.join(ROOT, productUrl(p.id)))) throw new Error(`La ficha ${productUrl(p.id)} chocaría con una página existente`);
  ids.add(p.id);
}
const productFiles = new Set(products.map(p => productUrl(p.id)));

// ── 2. Páginas de producto ──
const template = read(path.join(ROOT, 'producto.html'));
for (const p of products) write(path.join(OUT, productUrl(p.id)), buildProductPage(template, p, products));
{
  const f = path.join(OUT, 'producto.html');
  write(f, read(f).replace(/\s*<script type="application\/ld\+json" id="product-schema"><\/script>/, ''));
}

// ── 3. Prerender de catálogo y páginas de marca ──
{
  const f = path.join(OUT, 'catalogo.html');
  write(f, setInner(read(f), 'catalog-grid', catalogOrder(products).map(p => renderCard(p)).join('') + '\n        '));
}
for (const [file, [gridId, slug]] of Object.entries(BRAND_GRIDS)) {
  const f = path.join(OUT, file);
  const list = products.filter(p => p.brand_slug === slug);
  if (!list.length) throw new Error(`${file}: sin productos para ${slug}`);
  write(f, setInner(read(f), gridId, list.map(p => renderCard(p, { listitem: true })).join('') + '\n        '));
}

// ── 4. Versionado de assets por hash de contenido ──
const hashOf = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 10);
const jsonHash = hashOf(path.join(OUT, 'data/products.json'));
const files = walk(OUT);
const bumpJson = s => s.replace(/(data\/products\.json)(\?v=[\w.-]*)?/g, `$1?v=${jsonHash}`);
for (const f of files.filter(f => f.endsWith('.js'))) write(f, bumpJson(read(f)));
const assetHash = {};
for (const f of files.filter(f => /\.(css|js)$/.test(f))) assetHash[path.relative(OUT, f).split(path.sep).join('/')] = hashOf(f);
for (const f of files.filter(f => f.endsWith('.html'))) {
  const html = read(f).replace(/((?:src|href)=")((?:\.\.\/)?(assets\/[^"?#]+\.(?:css|js)))(\?[^"]*)?"/g,
    (m, pre, ref, rel) => (assetHash[rel] ? `${pre}${ref}?v=${assetHash[rel]}"` : m));
  write(f, bumpJson(html));
}

// ── 5. Verifica que toda referencia local existe ──
const htmlFiles = walk(OUT).filter(f => f.endsWith('.html'));
const missing = [];
for (const f of htmlFiles) {
  const html = read(f).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|javascript:|data:|\/\/|whatsapp:)/.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!clean) continue;
    let target = clean.startsWith('/') ? path.join(OUT, clean) : path.join(path.dirname(f), clean);
    if (clean.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) missing.push(`${path.relative(OUT, f)} → ${ref}`);
  }
}
if (missing.length) {
  console.error(`Referencias rotas (${missing.length}):\n  ` + [...new Set(missing)].join('\n  '));
  process.exit(1);
}

// ── 6. Sitemaps ──
const productsDate = [gitDate('data/products.json'), gitDate('producto.html')].sort().pop();
const pages = [];
for (const f of htmlFiles) {
  const rel = path.relative(OUT, f).split(path.sep).join('/');
  const html = read(f);
  if (NOT_INDEXABLE.has(rel)) continue;
  if (/<meta name="robots" content="[^"]*noindex/i.test(html) || /http-equiv="refresh"/i.test(html)) continue;
  const loc = rel === 'index.html' ? `${SITE}/` : `${SITE}/${rel}`;
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canon && canon !== loc) continue;
  const isProduct = productFiles.has(rel);
  pages.push({ rel, loc, isProduct, lastmod: isProduct ? productsDate : gitDate(rel) });
}
pages.sort((a, b) => (a.rel === 'index.html' ? -1 : b.rel === 'index.html' ? 1 : a.isProduct - b.isProduct || a.rel.localeCompare(b.rel)));
write(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`);

// Imágenes: bloques curados de sitemap-images.xml (sin fotos de producto, que van en su ficha) + fichas
const pageLocs = new Set(pages.map(p => p.loc));
const curated = read(path.join(ROOT, 'sitemap-images.xml'));
const pageBlocks = [...curated.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, b]) => {
  const loc = b.match(/<loc>([^<]+)<\/loc>/)[1].trim();
  if (!pageLocs.has(loc)) return null;
  const imgs = [...b.matchAll(/<image:image>([\s\S]*?)<\/image:image>/g)].map(([, i]) => i).filter(i => {
    const src = i.match(/<image:loc>([^<]+)<\/image:loc>/)[1].trim();
    return !src.includes('/assets/img/products/') && fs.existsSync(path.join(OUT, src.replace(SITE + '/', '')));
  });
  return imgs.length ? `  <url>\n    <loc>${loc}</loc>\n${imgs.map(i => `    <image:image>${i.replace(/\s+/g, ' ').trim().replace(/> </g, '><')}</image:image>`).join('\n')}\n  </url>` : null;
}).filter(Boolean);
const productBlocks = products.map(p => {
  const imgs = (p.gallery?.length ? p.gallery : [p.image]).filter(i => i && fs.existsSync(path.join(OUT, i)));
  return `  <url>\n    <loc>${SITE}/${productUrl(p.id)}</loc>\n${imgs.map((i, n) => `    <image:image><image:loc>${abs(i)}</image:loc><image:title>${esc(`${p.brand} ${p.name} ${p.variant}${n ? `, vista ${n + 1}` : ''}`)}</image:title></image:image>`).join('\n')}\n  </url>`;
});
write(path.join(OUT, 'sitemap-images.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...pageBlocks, ...productBlocks].join('\n')}
</urlset>
`);

console.log(`OK: ${htmlFiles.length} HTML (${products.length} fichas) · sitemap ${pages.length} URLs · imágenes ${pageBlocks.length + productBlocks.length} bloques · assets versionados ${Object.keys(assetHash).length}`);
