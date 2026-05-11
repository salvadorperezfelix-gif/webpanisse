/**
 * Panisse Óptica — Panel de Administración de Imágenes
 * Ejecutar: node scripts/admin.js
 * Acceder:  http://localhost:3001
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }

const app     = express();
const PORT    = 3001;
const ROOT    = path.join(__dirname, '..');
const DATA    = path.join(ROOT, 'data', 'products.json');
const IMG_DIR = path.join(ROOT, 'assets', 'img');

/* ── Multer: guarda en /tmp antes de procesar ─────────────── */
const upload = multer({ dest: path.join(ROOT, 'tmp_uploads') });

app.use('/assets', express.static(path.join(ROOT, 'assets')));
app.use(express.json());

/* ── Helpers ──────────────────────────────────────────────── */
function loadProducts() {
  return JSON.parse(fs.readFileSync(DATA, 'utf8'));
}

function saveProducts(products) {
  fs.writeFileSync(DATA, JSON.stringify(products, null, 2), 'utf8');
}

function expectedImagePath(product) {
  return path.join(IMG_DIR, 'products', product.brand_slug, product.id + '.webp');
}

function imageExists(p) {
  return fs.existsSync(p) ||
         fs.existsSync(p.replace('.webp', '.jpg')) ||
         fs.existsSync(p.replace('.webp', '.png'));
}

function getImageUrl(product) {
  const base = `/assets/img/products/${product.brand_slug}/${product.id}`;
  if (fs.existsSync(path.join(ROOT, base + '.webp'))) return base + '.webp';
  if (fs.existsSync(path.join(ROOT, base + '.jpg')))  return base + '.jpg';
  if (fs.existsSync(path.join(ROOT, base + '.png')))  return base + '.png';
  return null;
}

/* ── API: estado general ──────────────────────────────────── */
app.get('/api/status', (req, res) => {
  const products = loadProducts();
  const total    = products.length;
  const withImg  = products.filter(p => getImageUrl(p) !== null).length;
  res.json({ total, withImg, missing: total - withImg });
});

/* ── API: lista productos con estado de imagen ────────────── */
app.get('/api/products', (req, res) => {
  const products = loadProducts().map(p => ({
    ...p,
    realImage: getImageUrl(p),
    hasImage:  getImageUrl(p) !== null,
  }));
  res.json(products);
});

/* ── API: subir imagen de producto ───────────────────────── */
app.post('/api/upload/product/:id', upload.single('image'), async (req, res) => {
  const products = loadProducts();
  const product  = products.find(p => p.id === req.params.id);

  if (!product) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const destDir  = path.join(IMG_DIR, 'products', product.brand_slug);
  const destPath = path.join(destDir, product.id + '.webp');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  try {
    if (sharp) {
      await sharp(req.file.path)
        .resize(900, 720, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(destPath);
    } else {
      /* Sin sharp: copiar tal cual con extensión original */
      const ext     = path.extname(req.file.originalname).toLowerCase() || '.jpg';
      const rawDest = path.join(destDir, product.id + ext);
      fs.copyFileSync(req.file.path, rawDest);
    }
    fs.unlinkSync(req.file.path);
  } catch (err) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message });
  }

  /* Actualizar products.json */
  const idx = products.findIndex(p => p.id === req.params.id);
  products[idx].image = `assets/img/products/${product.brand_slug}/${product.id}.webp`;
  saveProducts(products);

  res.json({
    ok:       true,
    imageUrl: getImageUrl(product),
    message:  `Imagen guardada${sharp ? ' y optimizada a WebP' : ''}`
  });
});

/* ── API: subir imagen de blog ────────────────────────────── */
app.post('/api/upload/blog/:slug', upload.single('image'), async (req, res) => {
  const destDir  = path.join(IMG_DIR, 'blog');
  const destPath = path.join(destDir, req.params.slug + '.webp');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  try {
    if (sharp) {
      await sharp(req.file.path)
        .resize(1200, 600, { fit: 'cover' })
        .webp({ quality: 88 })
        .toFile(destPath);
    } else {
      fs.copyFileSync(req.file.path, path.join(destDir, req.params.slug + path.extname(req.file.originalname)));
    }
    fs.unlinkSync(req.file.path);
  } catch (err) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message });
  }
  res.json({ ok: true, imageUrl: `/assets/img/blog/${req.params.slug}.webp` });
});

/* ── API: subir imagen de nosotros ───────────────────────── */
app.post('/api/upload/nosotros/:name', upload.single('image'), async (req, res) => {
  const destDir  = path.join(IMG_DIR, 'nosotros');
  const destPath = path.join(destDir, req.params.name + '.webp');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  try {
    if (sharp) {
      await sharp(req.file.path)
        .resize(1200, 800, { fit: 'cover' })
        .webp({ quality: 88 })
        .toFile(destPath);
    } else {
      fs.copyFileSync(req.file.path, path.join(destDir, req.params.name + path.extname(req.file.originalname)));
    }
    fs.unlinkSync(req.file.path);
  } catch (err) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message });
  }
  res.json({ ok: true, imageUrl: `/assets/img/nosotros/${req.params.name}.webp` });
});

/* ── API: borrar imagen de producto ──────────────────────── */
app.delete('/api/product/:id/image', (req, res) => {
  const products = loadProducts();
  const product  = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'No encontrado' });

  ['webp','jpg','png'].forEach(ext => {
    const p = path.join(IMG_DIR, 'products', product.brand_slug, product.id + '.' + ext);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });

  const idx = products.findIndex(p => p.id === req.params.id);
  products[idx].image = `assets/img/products/${product.brand_slug}/${product.id}.jpg`;
  saveProducts(products);

  res.json({ ok: true });
});

/* ── Panel HTML ───────────────────────────────────────────── */
app.get('/', (req, res) => {
  res.send(/* html */`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Panisse · Panel de Imágenes</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Lato:wght@400;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:      #0d0d0d;
      --surface: #161616;
      --card:    #1e1e1e;
      --border:  #2a2a2a;
      --text:    #e8e4d8;
      --muted:   #6a6a64;
      --accent:  #c7dbd6;
      --accent2: #8aafa9;
      --ok:      #5aaa85;
      --warn:    #c9a84c;
      --danger:  #c05050;
    }
    html { font-size: 16px; }
    body { font-family: 'Lato', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

    /* ── Header ── */
    .admin-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 18px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .admin-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.375rem;
      font-weight: 300;
      color: var(--text);
    }
    .admin-logo em { font-style: italic; color: var(--accent2); }
    .admin-status {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 0.75rem;
      color: var(--muted);
    }
    .progress-bar {
      width: 160px;
      height: 3px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-bar__fill {
      height: 100%;
      background: var(--accent2);
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    /* ── Tabs ── */
    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--border);
      padding: 0 32px;
      background: var(--surface);
    }
    .tab-btn {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--muted);
      font-family: 'Lato', sans-serif;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 14px 20px;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      margin-bottom: -1px;
    }
    .tab-btn.is-active, .tab-btn:hover {
      color: var(--text);
      border-bottom-color: var(--accent2);
    }

    /* ── Main ── */
    .admin-main { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .tab-panel { display: none; }
    .tab-panel.is-active { display: block; }

    /* ── Section heading ── */
    .section-head {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 28px;
    }
    .section-head h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.75rem;
      font-weight: 300;
      color: var(--text);
    }
    .section-head .count {
      font-size: 0.6875rem;
      color: var(--muted);
      letter-spacing: 0.1em;
    }

    /* ── Product grid ── */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    /* ── Product card ── */
    .p-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
      transition: border-color 0.2s, transform 0.2s;
      position: relative;
    }
    .p-card:hover { border-color: var(--accent2); }
    .p-card.drag-over {
      border-color: var(--accent);
      transform: scale(1.02);
      box-shadow: 0 0 0 2px var(--accent2);
    }

    .p-card__image {
      aspect-ratio: 5 / 4;
      background: #111;
      position: relative;
      overflow: hidden;
    }
    .p-card__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .p-card__image img.loaded { opacity: 1; }
    .p-card__drop-hint {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.6875rem;
      color: var(--muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    .p-card__drop-hint svg { opacity: 0.4; }
    .p-card:hover .p-card__drop-hint,
    .p-card.drag-over .p-card__drop-hint { color: var(--accent); }
    .p-card.has-image .p-card__drop-hint { opacity: 0; }
    .p-card.has-image:hover .p-card__drop-hint { opacity: 1; background: rgba(0,0,0,0.6); }

    .p-card__info { padding: 12px 14px 14px; }
    .p-card__brand {
      font-size: 0.5625rem;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--accent2);
      margin-bottom: 3px;
    }
    .p-card__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      color: var(--text);
      margin-bottom: 6px;
    }
    .p-card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .p-card__type {
      font-size: 0.625rem;
      color: var(--muted);
      letter-spacing: 0.1em;
    }
    .p-card__badge {
      font-size: 0.5rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 2px;
    }
    .p-card__badge--ok   { background: rgba(90,170,133,0.15); color: var(--ok); }
    .p-card__badge--warn { background: rgba(201,168,76,0.15);  color: var(--warn); }

    .p-card__actions {
      display: flex;
      gap: 6px;
      padding: 0 14px 12px;
    }
    .p-card__btn {
      flex: 1;
      background: none;
      border: 1px solid var(--border);
      color: var(--muted);
      font-family: 'Lato', sans-serif;
      font-size: 0.5625rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 7px 10px;
      cursor: pointer;
      border-radius: 3px;
      transition: border-color 0.2s, color 0.2s;
    }
    .p-card__btn:hover { border-color: var(--accent2); color: var(--text); }
    .p-card__btn--danger:hover { border-color: var(--danger); color: var(--danger); }

    /* ── Nosotros / Blog panels ── */
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .asset-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .asset-card:hover, .asset-card.drag-over {
      border-color: var(--accent2);
    }
    .asset-card__image {
      aspect-ratio: 16 / 9;
      background: #111;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .asset-card__image img {
      width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 0.3s;
    }
    .asset-card__image img.loaded { opacity: 1; }
    .asset-card__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--muted);
      font-size: 0.6875rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      position: absolute;
      inset: 0;
      justify-content: center;
    }
    .asset-card__label { padding: 12px 16px; font-size: 0.875rem; color: var(--text); }
    .asset-card__sub   { padding: 0 16px 12px; font-size: 0.6875rem; color: var(--muted); }

    /* ── Toast ── */
    .toast {
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent2);
      color: var(--text);
      font-size: 0.8125rem;
      padding: 14px 20px;
      border-radius: 4px;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
      z-index: 999;
      max-width: 320px;
    }
    .toast.show { opacity: 1; transform: none; }
    .toast.error { border-left-color: var(--danger); }

    /* ── Hidden file input ── */
    #file-input { display: none; }

    /* ── Spinner ── */
    .uploading::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>

<header class="admin-header">
  <div class="admin-logo">Panisse <em>Óptica</em> · Imágenes</div>
  <div class="admin-status">
    <span id="status-text">Cargando...</span>
    <div class="progress-bar">
      <div class="progress-bar__fill" id="progress-fill" style="width:0%"></div>
    </div>
  </div>
</header>

<nav class="tabs">
  <button class="tab-btn is-active" data-tab="productos">Productos</button>
  <button class="tab-btn" data-tab="blog">Blog</button>
  <button class="tab-btn" data-tab="nosotros">Nosotros</button>
  <button class="tab-btn" data-tab="home">Home</button>
</nav>

<main class="admin-main">

  <!-- PRODUCTOS -->
  <div class="tab-panel is-active" id="tab-productos">
    <div class="section-head">
      <h2>Catálogo de Productos</h2>
      <span class="count" id="product-count"></span>
    </div>
    <div class="product-grid" id="product-grid">
      <p style="color:var(--muted);font-size:.875rem">Cargando productos...</p>
    </div>
  </div>

  <!-- BLOG -->
  <div class="tab-panel" id="tab-blog">
    <div class="section-head">
      <h2>Imágenes de Blog</h2>
      <span class="count">Arrastra imágenes para cada artículo</span>
    </div>
    <div class="asset-grid" id="blog-grid"></div>
  </div>

  <!-- NOSOTROS -->
  <div class="tab-panel" id="tab-nosotros">
    <div class="section-head">
      <h2>Fotos del Equipo y Tienda</h2>
      <span class="count">Arrastra imágenes para cada sección</span>
    </div>
    <div class="asset-grid" id="nosotros-grid"></div>
  </div>

  <!-- HOME -->
  <div class="tab-panel" id="tab-home">
    <div class="section-head">
      <h2>Imágenes de Portada</h2>
    </div>
    <div class="asset-grid" id="home-grid"></div>
  </div>

</main>

<div class="toast" id="toast"></div>
<input type="file" id="file-input" accept="image/*"/>

<script>
  /* ══════════════════════════════════════════════
     ESTADO GLOBAL
  ══════════════════════════════════════════════ */
  let pendingUpload = null; // { type, id, card }

  /* ══════════════════════════════════════════════
     TOAST
  ══════════════════════════════════════════════ */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg, isError = false) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ══════════════════════════════════════════════
     TABS
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('is-active');
    });
  });

  /* ══════════════════════════════════════════════
     ESTADO GENERAL (barra de progreso)
  ══════════════════════════════════════════════ */
  async function loadStatus() {
    const data = await fetch('/api/status').then(r => r.json());
    const pct  = Math.round((data.withImg / data.total) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('status-text').textContent =
      data.withImg + '/' + data.total + ' productos · ' + pct + '%';
  }

  /* ══════════════════════════════════════════════
     RENDER PRODUCTOS
  ══════════════════════════════════════════════ */
  async function loadProducts() {
    const products = await fetch('/api/products').then(r => r.json());
    const grid     = document.getElementById('product-grid');
    const count    = document.getElementById('product-count');

    const withImg = products.filter(p => p.hasImage).length;
    count.textContent = withImg + ' de ' + products.length + ' con imagen real';
    grid.innerHTML = '';

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'p-card' + (p.hasImage ? ' has-image' : '');
      card.dataset.id = p.id;
      card.innerHTML = \`
        <div class="p-card__image">
          \${p.realImage
            ? \`<img src="\${p.realImage}?t=\${Date.now()}" alt="\${p.name}" loading="lazy"/>\`
            : ''}
          <div class="p-card__drop-hint">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Soltar imagen</span>
          </div>
        </div>
        <div class="p-card__info">
          <div class="p-card__brand">\${p.brand}</div>
          <div class="p-card__name">\${p.name}</div>
          <div class="p-card__meta">
            <span class="p-card__type">\${p.type === 'sol' ? 'Sol' : 'Graduadas'} · \${p.price} €</span>
            <span class="p-card__badge \${p.hasImage ? 'p-card__badge--ok' : 'p-card__badge--warn'}">
              \${p.hasImage ? '✓ Real' : '⚠ Falta'}
            </span>
          </div>
        </div>
        <div class="p-card__actions">
          <button class="p-card__btn" onclick="triggerFileUpload('\${p.id}', this.closest('.p-card'))">
            Seleccionar archivo
          </button>
          \${p.hasImage ? \`<button class="p-card__btn p-card__btn--danger" onclick="deleteImage('\${p.id}', this.closest('.p-card'))">Borrar</button>\` : ''}
        </div>
      \`;

      /* Lazy load images */
      const img = card.querySelector('img');
      if (img) img.addEventListener('load', () => img.classList.add('loaded'));

      /* Drag & drop */
      card.addEventListener('dragover',  e => { e.preventDefault(); card.classList.add('drag-over'); });
      card.addEventListener('dragleave', ()  => card.classList.remove('drag-over'));
      card.addEventListener('drop',      e  => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) uploadProductImage(p.id, file, card);
      });

      grid.appendChild(card);
    });
  }

  /* ══════════════════════════════════════════════
     UPLOAD PRODUCTO
  ══════════════════════════════════════════════ */
  function triggerFileUpload(productId, card) {
    pendingUpload = { type: 'product', id: productId, card };
    document.getElementById('file-input').click();
  }

  document.getElementById('file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file || !pendingUpload) return;
    const { type, id, card } = pendingUpload;
    pendingUpload = null;
    e.target.value = '';
    if (type === 'product') uploadProductImage(id, file, card);
    else if (type === 'asset') uploadAssetImage(id.endpoint, id.slug, file, card);
  });

  async function uploadProductImage(productId, file, card) {
    const imgWrap = card.querySelector('.p-card__image');
    imgWrap.classList.add('uploading');

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res  = await fetch('/api/upload/product/' + productId, { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      /* Actualizar tarjeta */
      let img = imgWrap.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = productId;
        img.loading = 'lazy';
        img.addEventListener('load', () => img.classList.add('loaded'));
        imgWrap.insertBefore(img, imgWrap.firstChild);
      }
      img.src = data.imageUrl + '?t=' + Date.now();

      card.classList.add('has-image');
      card.querySelector('.p-card__badge').className = 'p-card__badge p-card__badge--ok';
      card.querySelector('.p-card__badge').textContent = '✓ Real';

      showToast(data.message);
      loadStatus();
    } catch (err) {
      showToast('Error: ' + err.message, true);
    } finally {
      imgWrap.classList.remove('uploading');
    }
  }

  async function deleteImage(productId, card) {
    if (!confirm('¿Borrar la imagen de este producto?')) return;

    const res = await fetch('/api/product/' + productId + '/image', { method: 'DELETE' });
    if (!res.ok) return showToast('Error al borrar', true);

    card.querySelector('img')?.remove();
    card.classList.remove('has-image');
    card.querySelector('.p-card__badge').className = 'p-card__badge p-card__badge--warn';
    card.querySelector('.p-card__badge').textContent = '⚠ Falta';
    showToast('Imagen eliminada');
    loadStatus();
  }

  /* ══════════════════════════════════════════════
     RENDER ASSETS (Blog, Nosotros, Home)
  ══════════════════════════════════════════════ */
  const ASSET_SECTIONS = {
    blog: [
      { slug: 'gafas-de-autor-vs-serie', label: 'El valor de las gafas de autor', sub: 'Artículo 01 · Hero image' },
    ],
    nosotros: [
      { slug: 'equipo',   label: 'El Equipo',          sub: 'Foto de grupo o retrato' },
      { slug: 'tienda',   label: 'Interior de tienda', sub: 'Escaparate / mostrador' },
      { slug: 'taller',   label: 'El Taller',          sub: 'Herramientas y precisión' },
      { slug: 'exterior', label: 'Fachada',            sub: 'Exterior / entrada' },
    ],
    home: [
      { slug: 'hero',        label: 'Hero principal',    sub: '1920×900px recomendado' },
      { slug: 'hero-mobile', label: 'Hero móvil',        sub: '750×900px recomendado' },
      { slug: 'lifestyle',   label: 'Lifestyle',         sub: 'Imagen ambiente boutique' },
    ],
  };

  function renderAssetGrid(section) {
    const grid  = document.getElementById(section + '-grid');
    const items = ASSET_SECTIONS[section];
    const endpoint = section === 'nosotros' ? 'nosotros' : section;
    grid.innerHTML = '';

    items.forEach(item => {
      const imgPath = '/assets/img/' + section + '/' + item.slug + '.webp';
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.dataset.slug = item.slug;
      card.innerHTML = \`
        <div class="asset-card__image">
          <img src="\${imgPath}?t=\${Date.now()}" alt="\${item.label}" loading="lazy"
               onerror="this.style.display='none'" />
          <div class="asset-card__placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Soltar imagen</span>
          </div>
        </div>
        <div class="asset-card__label">\${item.label}</div>
        <div class="asset-card__sub">\${item.sub}</div>
      \`;

      const img = card.querySelector('img');
      img.addEventListener('load', () => img.classList.add('loaded'));

      card.addEventListener('click', () => {
        pendingUpload = { type: 'asset', id: { endpoint, slug: item.slug }, card };
        document.getElementById('file-input').click();
      });
      card.addEventListener('dragover',  e => { e.preventDefault(); card.classList.add('drag-over'); });
      card.addEventListener('dragleave', ()  => card.classList.remove('drag-over'));
      card.addEventListener('drop',      e  => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) uploadAssetImage(endpoint, item.slug, file, card);
      });

      grid.appendChild(card);
    });
  }

  async function uploadAssetImage(endpoint, slug, file, card) {
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res  = await fetch('/api/upload/' + endpoint + '/' + slug, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const img = card.querySelector('img');
      img.style.display = '';
      img.src = data.imageUrl + '?t=' + Date.now();
      showToast('Imagen guardada ✓');
    } catch (err) {
      showToast('Error: ' + err.message, true);
    }
  }

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  loadStatus();
  loadProducts();
  renderAssetGrid('blog');
  renderAssetGrid('nosotros');
  renderAssetGrid('home');
</script>
</body>
</html>`);
});

/* ── Arrancar ─────────────────────────────────────────────── */
const tmpDir = path.join(ROOT, 'tmp_uploads');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║  Panisse · Panel de Imágenes         ║');
  console.log('  ║  http://localhost:' + PORT + '               ║');
  console.log('  ║  Ctrl + C para detener               ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  if (!sharp) console.log('  ⚠  sharp no disponible — las imágenes se copiarán sin convertir a WebP');
});
