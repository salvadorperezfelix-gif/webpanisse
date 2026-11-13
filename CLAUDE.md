# Website Design Recreation

## Workflow

When the user provides a reference image (screenshot) and optionally some CSS classes or style notes:

1. **Generate** a single `index.html` file using Tailwind CSS (via CDN). Include all content inline — no external files unless requested.
2. **Screenshot** the rendered page using Puppeteer by running `node screenshot.js`. If the page has distinct sections, capture those individually too.
3. **Compare** your screenshot against the reference image. Check for mismatches in:
   - Spacing and padding (measure in px)
   - Font sizes, weights, and line heights
   - Colors (exact hex values)
   - Alignment and positioning
   - Border radii, shadows, and effects
   - Responsive behavior
   - Image/icon sizing and placement
4. **Fix** every mismatch found. Edit the HTML/Tailwind code.
5. **Re-screenshot** and compare again.
6. **Repeat** steps 3–5 until the result is within ~2–3px of the reference everywhere.

Do NOT stop after one pass. Always do at least 2 comparison rounds. Only stop when the user says so or when no visible differences remain.

## Technical Defaults

- Use Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`)
- Use placeholder images from `https://placehold.co/` when source images aren't provided
- Mobile-first responsive design
- Single `index.html` file unless the user requests otherwise

## Rules

- Do not add features, sections, or content not present in the reference image
- Match the reference exactly — do not "improve" the design
- If the user provides CSS classes or style tokens, use them verbatim
- Keep code clean but don't over-abstract — inline Tailwind classes are fine
- When comparing screenshots, be specific about what's wrong (e.g., "heading is 32px but reference shows ~24px", "gap between cards is 16px but should be 24px")

## Build y despliegue (panisse.es)

- GitHub Actions ejecuta `node tools/build.mjs` y publica solo `_site/`. Lo que no esté en su lista (HTML, `blog/`, `assets/`, `data/products.json`, robots, llms.txt, favicons) no se publica.
- El build genera: una ficha estática por producto (`gafas-<id>.html`, plantilla `producto.html`), las tarjetas prerenderizadas de catálogo y páginas de marca, `sitemap.xml` y `sitemap-images.xml` (desde los bloques curados de `sitemap-images.xml` + products.json) y el `?v=<hash>` de CSS/JS/products.json.
- No subir versiones `?v=` a mano ni editar un sitemap.xml (ya no existe en el repo). Una imagen reemplazada debe llevar nombre nuevo: Cloudflare cachea assets 1 año.
- Enlaces a productos: `gafas-<id>.html`. `producto.html?id=` solo redirige.
- Probar en local: `node tools/build.mjs` y servir `_site/` (p. ej. `python -m http.server --directory _site`). El build falla si hay referencias rotas.
