# E-commerce Panisse — Gafas de Sol

## Decisiones tomadas

- **Producto**: solo gafas de sol (sin graduación, sin receta)
- **Stack**: Next.js + Supabase (DB + auth + storage) + Stripe + Vercel
- **Diseño**: reutilizar el sistema de diseño existente (fuentes, colores, componentes de `../assets/css/style.css`)
- **Hosting**: Vercel (reemplaza GitHub Pages solo para esta app; el sitio estático puede coexistir)

## Cuentas que el usuario tiene que crear antes de empezar

- [ ] [Supabase](https://supabase.com) — proyecto nuevo, copiar `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- [ ] [Stripe](https://stripe.com/es) — cuenta de negocio verificada, copiar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`
- [ ] [Vercel](https://vercel.com) — conectar al repo de GitHub, configurar variables de entorno

## Variables de entorno necesarias (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=https://tienda.panisse.es
```

## Esquema de base de datos (Supabase)

```sql
-- Productos
products (id, slug, name, brand, description, price_eur, stock, active, created_at)
product_images (id, product_id, url, position)
product_variants (id, product_id, color_name, color_hex, stock)

-- Pedidos
orders (id, stripe_payment_intent, status, total_eur, customer_email, customer_name, shipping_address, created_at)
order_items (id, order_id, product_id, variant_id, quantity, unit_price_eur)
```

## Páginas a construir

| Ruta | Descripción |
|------|-------------|
| `/tienda` | Catálogo con filtro por marca |
| `/tienda/[slug]` | Página de producto + selector de color + añadir al carrito |
| `/carrito` | Resumen del carrito |
| `/checkout` | Datos de envío + pago con Stripe |
| `/pedido/[id]` | Confirmación de pedido |
| `/admin` | Panel protegido: añadir productos, ver pedidos, gestionar stock |

## Orden de construcción recomendado

1. Scaffold Next.js + conectar Supabase + seed de productos de prueba
2. Catálogo `/tienda` + página de producto `/tienda/[slug]`
3. Carrito (estado local con Zustand o Context)
4. Checkout + integración Stripe (modo test primero)
5. Webhooks de Stripe → actualizar estado del pedido en Supabase
6. Emails de confirmación (Resend o Supabase Edge Functions)
7. Panel `/admin`
8. IVA 21%, política de devoluciones, textos legales
9. Deploy en Vercel + dominio `tienda.panisse.es`

## Legal (España / UE)

- Política de devoluciones: 14 días sin coste por ley (Directiva 2011/83/UE)
- IVA: 21% en gafas de sol — incluirlo en precio y desglosarlo en factura
- RGPD: datos de pedido solo para gestión del pedido, no marketing sin consentimiento
- Cookies: Stripe y analytics añaden cookies de terceros — actualizar el banner

## Marcas disponibles para venta online

Confirmar stock y disponibilidad antes de publicar:
- Ray-Ban
- Swarovski
- Emporio Armani
- Mr. Boho
- Polaroid
- Panisse Boutique (línea propia — prioridad)
- Antica Occhialeria

## Notas de diseño

- Mantener tipografía: Cormorant Garamond (display) + Lato (body)
- Colores: `--color-black: #0d0d0d`, `--color-surface: #f5f5f3`, `--color-accent: #c7dbd6`
- El carrito puede ser un drawer lateral (no página separada en escritorio)
- Las imágenes de producto deben ser 1:1 o 4:3, fondo blanco o neutro
