/* ════════════════════════════════════════════════════════════
   PANISSE ÓPTICA — main.js
════════════════════════════════════════════════════════════ */

/* ── Año dinámico en el footer ───────────────────────────── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Header: scroll detection ───────────────────────────── */
const siteHeader = document.getElementById('site-header');

if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
}

/* ── Header: dropdowns (hover + focus) ───────────────────── */
const navItems = document.querySelectorAll('.nav-item.has-dropdown');

navItems.forEach(item => {
  const btn      = item.querySelector('.nav-link');
  const dropdown = item.querySelector('.dropdown');
  if (!btn || !dropdown) return;

  let closeTimer;

  const open = () => {
    clearTimeout(closeTimer);
    // Cierra otros abiertos
    navItems.forEach(other => {
      if (other !== item) {
        other.querySelector('.dropdown')?.classList.remove('is-open');
        other.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        other.classList.remove('is-open');
      }
    });
    dropdown.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    item.classList.add('is-open');
  };

  const close = (delay = 120) => {
    closeTimer = setTimeout(() => {
      dropdown.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');
    }, delay);
  };

  // Hover
  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', () => close());

  // Clic (toggle)
  btn.addEventListener('click', () => {
    dropdown.classList.contains('is-open') ? close(0) : open();
  });

  // Focus dentro del dropdown → mantener abierto
  dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  dropdown.addEventListener('mouseleave', () => close());
});

// Cierra dropdowns al hacer clic fuera
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-item')) {
    navItems.forEach(item => {
      item.querySelector('.dropdown')?.classList.remove('is-open');
      item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');
    });
  }
});

/* ── Header: menú móvil ──────────────────────────────────── */
const hamburgerBtn   = document.getElementById('hamburger-btn');
const mobileMenu     = document.getElementById('mobile-menu');
const mobileOverlay  = document.getElementById('mobile-overlay');
const mobileCloseBtn = document.getElementById('mobile-close-btn');

const openMobileMenu = () => {
  mobileMenu?.classList.add('is-open');
  mobileOverlay?.classList.add('is-visible');
  hamburgerBtn?.classList.add('is-active');
  hamburgerBtn?.setAttribute('aria-expanded', 'true');
  mobileMenu?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeMobileMenu = () => {
  mobileMenu?.classList.remove('is-open');
  mobileOverlay?.classList.remove('is-visible');
  hamburgerBtn?.classList.remove('is-active');
  hamburgerBtn?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

hamburgerBtn?.addEventListener('click', () => {
  mobileMenu?.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
});
mobileCloseBtn?.addEventListener('click', closeMobileMenu);
mobileOverlay?.addEventListener('click', closeMobileMenu);

/* ── Menú móvil: acordeones ──────────────────────────────── */
const mobileItems = document.querySelectorAll('.mobile-item.has-submenu');

mobileItems.forEach(item => {
  const btn     = item.querySelector('.mobile-link');
  const submenu = item.querySelector('.mobile-submenu');
  if (!btn || !submenu) return;

  btn.addEventListener('click', () => {
    const isExpanded = item.classList.contains('is-expanded');
    // Cierra los demás
    mobileItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('is-expanded');
        other.querySelector('.mobile-submenu')?.setAttribute('aria-hidden', 'true');
      }
    });
    item.classList.toggle('is-expanded', !isExpanded);
    submenu.setAttribute('aria-hidden', String(isExpanded));
  });
});

/* ── Tecla Escape: cierra todo ───────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  // Cierra dropdowns
  navItems.forEach(item => {
    item.querySelector('.dropdown')?.classList.remove('is-open');
    item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open');
  });
  // Cierra menú móvil
  if (mobileMenu?.classList.contains('is-open')) closeMobileMenu();
});

/* ── Newsletter: feedback visual ────────────────────────── */
const newsletterForm = document.getElementById('newsletter-form');
const newsletterMsg  = document.getElementById('newsletter-msg');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!re.test(email)) {
      newsletterMsg.textContent = 'Por favor, introduce un email válido.';
      newsletterMsg.className = 'footer__form-msg footer__form-msg--err';
      return;
    }

    newsletterMsg.textContent = '¡Suscripción confirmada! Gracias.';
    newsletterMsg.className = 'footer__form-msg footer__form-msg--ok';
    newsletterForm.reset();
  });
}

/* ════════════════════════════════════════════════════════════
   CONTACTO: formulario de cita previa
════════════════════════════════════════════════════════════ */
(function () {
  const form = document.getElementById('cita-form');
  if (!form) return;

  // Establece la fecha mínima al día de hoy
  const fechaInput = document.getElementById('cita-fecha');
  if (fechaInput) {
    const today = new Date().toISOString().split('T')[0];
    fechaInput.min = today;
    fechaInput.value = today;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validación básica
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        field.focus();
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    const emailField = document.getElementById('cita-email');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField && !emailRe.test(emailField.value.trim())) {
      emailField.style.borderColor = '#c0392b';
      valid = false;
    }

    if (!valid) return;

    // Simula envío
    const submitBtn = form.querySelector('[type="submit"]');
    const original = submitBtn.textContent;
    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      const success = document.getElementById('cita-success');
      if (success) {
        success.style.display = 'block';
      }
    }, 900);
  });

  // Limpia error de campo al escribir
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
})();

/* ════════════════════════════════════════════════════════════
   CATÁLOGO: carga dinámica desde data/products.json
════════════════════════════════════════════════════════════ */
(function () {
  const grid          = document.getElementById('catalog-grid');
  if (!grid) return;

  const countEl       = document.getElementById('visible-count');
  const emptyEl       = document.getElementById('catalog-empty');
  const loadMoreWrap  = document.getElementById('load-more-wrap');
  const loadMoreBtn   = document.getElementById('load-more-btn');
  const clearBtn      = document.getElementById('sidebar-clear-btn');
  const clearBtnEmpty = document.getElementById('clear-filters-btn');
  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  const sidebarInner  = document.getElementById('sidebar-inner');
  const activeCount   = document.getElementById('active-filter-count');
  const PAGE_SIZE     = 12;

  const WISHLIST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
      a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
      1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`;

  let state = {
    type:   'todos',
    gender: 'todos',
    brands: [],
    sort:   'new',
    page:   PAGE_SIZE,
  };

  /* ── Lee URL params al cargar ─────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  if (params.get('tipo'))   state.type   = params.get('tipo');
  if (params.get('marca'))  state.brands = [params.get('marca')];
  if (params.get('genero')) {
    const g = params.get('genero');
    state.gender = g.charAt(0).toUpperCase() + g.slice(1);
  }

  /* ── Renderiza un skeleton mientras carga ─────────────── */
  function showSkeletons(n) {
    grid.innerHTML = Array.from({ length: n }, () => `
      <article class="product-card product-card--skeleton" aria-hidden="true">
        <div class="product-card__image-wrap skeleton-box"></div>
        <div class="product-card__info">
          <div class="skeleton-line" style="width:40%;height:9px;margin-bottom:7px"></div>
          <div class="skeleton-line" style="width:68%;height:13px;margin-bottom:8px"></div>
          <div class="skeleton-line" style="width:50%;height:9px;margin-bottom:10px"></div>
          <div class="skeleton-line" style="width:28%;height:16px"></div>
        </div>
      </article>`).join('');
  }

  /* ── Genera el HTML de una tarjeta ───────────────────── */
  function renderCard(p) {
    const imgSrc    = p.image || p.placeholder;
    const typeLabel = p.type === 'sol' ? 'Sol' : 'Graduadas';
    const badge     = p.is_new ? `<div class="product-card__badge">Nuevo</div>` : '';
    const dataNew   = p.is_new ? ' data-new="true"' : '';

    return `
      <article class="product-card"
               data-type="${p.type}"
               data-brand="${p.brand_slug}"
               data-gender="${p.specs?.genero || ''}"
               data-price="${p.price}"
               data-name="${p.brand} ${p.name}"${dataNew}>
        <a href="producto.html?id=${p.id}" class="product-card__link" aria-label="Ver ${p.brand} ${p.name}">
          <div class="product-card__image-wrap">
            <img src="${imgSrc}"
                 alt="${p.brand} ${p.name} — ${p.variant}"
                 class="product-card__image is-loaded"
                 loading="eager"
                 onerror="this.src='${p.placeholder}'; this.onerror=null;" />
            ${badge}
            <!-- Favoritos desactivado -->
          </div>
          <div class="product-card__info">
            <span class="product-card__brand">${p.brand}</span>
            <h2 class="product-card__name">${p.name}</h2>
            <span class="product-card__variant">${typeLabel} · ${p.variant}</span>
            <p class="product-card__price">${p.price} €</p>
          </div>
        </a>
      </article>`;
  }

  /* ── Sincroniza controles con estado ──────────────────── */
  function syncUI() {
    document.querySelectorAll('input[name="tipo"]').forEach(r => {
      r.checked = r.value === state.type;
    });
    document.querySelectorAll('#brand-filter-list input[type="checkbox"]').forEach(cb => {
      cb.checked = state.brands.includes(cb.value);
    });
    document.querySelectorAll('input[name="genero"]').forEach(r => {
      r.checked = r.value === state.gender;
    });
    const hasFilters = state.type !== 'todos' || state.gender !== 'todos' || state.brands.length > 0;
    if (clearBtn) clearBtn.hidden = !hasFilters;
    const filterCount = (state.type !== 'todos' ? 1 : 0) + state.brands.length;
    if (activeCount) {
      activeCount.hidden      = filterCount === 0;
      activeCount.textContent = filterCount;
    }
  }

  /* ── Aplica filtros + orden + paginación ──────────────── */
  function applyFilters() {
    const all      = [...grid.querySelectorAll('.product-card:not(.product-card--skeleton)')];
    const filtered = all.filter(c => {
      const matchType   = state.type === 'todos' || c.dataset.type === state.type;
      const matchGender = state.gender === 'todos' || !c.dataset.gender || c.dataset.gender === state.gender;
      const matchBrand  = state.brands.length === 0 || state.brands.includes(c.dataset.brand);
      return matchType && matchGender && matchBrand;
    });

    filtered.sort((a, b) => {
      switch (state.sort) {
        case 'price-asc':  return Number(a.dataset.price) - Number(b.dataset.price);
        case 'price-desc': return Number(b.dataset.price) - Number(a.dataset.price);
        case 'name-az':    return a.dataset.name.localeCompare(b.dataset.name, 'es');
        default:           return (b.dataset.new === 'true') - (a.dataset.new === 'true');
      }
    });

    filtered.forEach(c => grid.appendChild(c));
    all.forEach(c => c.classList.add('is-hidden'));
    filtered.slice(0, state.page).forEach(c => {
      c.classList.remove('is-hidden');
      c.classList.remove('is-visible');
      void c.offsetWidth;
      c.classList.add('is-visible');
    });

    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (countEl) countEl.textContent = Math.min(state.page, filtered.length);
    if (loadMoreWrap) loadMoreWrap.hidden = filtered.length <= state.page;
  }

  /* ── Carga JSON y renderiza tarjetas ──────────────────── */
  async function loadProducts() {
    showSkeletons(8);
    try {
      const res      = await fetch('data/products.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const products = await res.json();

      grid.innerHTML = '';
      products.forEach(p => grid.insertAdjacentHTML('beforeend', renderCard(p)));

      syncUI();
      applyFilters();
    } catch (err) {
      console.warn('Catálogo: no se pudo cargar data/products.json.', err);
      grid.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.querySelector('p')?.setAttribute('data-fallback', 'true');
      }
    }
  }

  /* ── Eventos ──────────────────────────────────────────── */
  document.querySelectorAll('input[name="tipo"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      state.type = r.value;
      state.page = PAGE_SIZE;
      syncUI();
      applyFilters();
    });
  });

  document.querySelectorAll('input[name="genero"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      state.gender = r.value;
      state.page = PAGE_SIZE;
      syncUI();
      applyFilters();
    });
  });

  document.querySelectorAll('#brand-filter-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!state.brands.includes(cb.value)) state.brands.push(cb.value);
      } else {
        state.brands = state.brands.filter(b => b !== cb.value);
      }
      state.page = PAGE_SIZE;
      syncUI();
      applyFilters();
    });
  });

  document.querySelectorAll('input[name="orden"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      state.sort = r.value;
      applyFilters();
    });
  });

  const doClear = () => {
    state = { type: 'todos', gender: 'todos', brands: [], sort: 'new', page: PAGE_SIZE };
    syncUI();
    applyFilters();
  };

  clearBtn?.addEventListener('click', doClear);
  clearBtnEmpty?.addEventListener('click', doClear);

  loadMoreBtn?.addEventListener('click', () => {
    state.page += PAGE_SIZE;
    applyFilters();
  });

  sidebarToggle?.addEventListener('click', () => {
    const isOpen = sidebarInner?.classList.toggle('is-open');
    sidebarToggle.setAttribute('aria-expanded', String(!!isOpen));
  });

  /* ── Wishlist (delegado, funciona tras render dinámico) ── */
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.product-card__wishlist');
    if (!btn) return;
    e.preventDefault();
    btn.classList.toggle('is-active');
    btn.setAttribute('aria-label',
      btn.classList.contains('is-active') ? 'Quitar de favoritos' : 'Añadir a favoritos'
    );
  });

  /* ── Init ─────────────────────────────────────────────── */
  loadProducts();
})();

/* ════════════════════════════════════════════════════════════
   FICHA DE PRODUCTO — eventos estáticos (acordeón, etc.)
   Los eventos de galería y zoom se registran en initProductPage()
   después de que el fetch crea los elementos dinámicamente.
════════════════════════════════════════════════════════════ */
(function () {
  /* ── Acordeón de detalles ── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.product-accordion__trigger');
    if (!btn) return;
    const item = btn.closest('.product-accordion__item');
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.product-accordion__item').forEach(i => {
      i.classList.remove('is-open');
      i.querySelector('.product-accordion__trigger')?.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
})();

/* ── Carrusel de Reseñas ─────────────────────────────────── */
(function () {
  const track      = document.getElementById('resenas-grid');
  const viewport   = document.querySelector('.resenas-carousel__viewport');
  const prevBtn    = document.getElementById('resenas-prev');
  const nextBtn    = document.getElementById('resenas-next');
  const dotsWrap   = document.getElementById('resenas-dots');
  const carouselEl = document.getElementById('resenas-carousel-wrap');
  if (!track || !prevBtn || !nextBtn) return;

  let currentPage = 0;
  let autoTimer   = null;
  const GAP       = 20; // matches CSS gap

  function getPerView() {
    const w = window.innerWidth;
    return w <= 600 ? 1 : w <= 900 ? 2 : 3;
  }

  function getRealCards() {
    return [...track.querySelectorAll('.resena-card:not(.resena-card--skeleton)')];
  }

  function getTotalPages() {
    const cards = getRealCards();
    const pv = getPerView();
    return cards.length > 0 ? Math.ceil(cards.length / pv) : 0;
  }

  function goToPage(page) {
    const cards = getRealCards();
    if (cards.length === 0) return;

    const pv    = getPerView();
    const total = Math.ceil(cards.length / pv);
    currentPage = Math.max(0, Math.min(page, total - 1));

    const vw        = viewport ? viewport.offsetWidth : track.offsetWidth;
    const cardWidth = (vw - GAP * (pv - 1)) / pv;
    const offset    = currentPage * pv * (cardWidth + GAP);
    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= total - 1;

    document.querySelectorAll('.resenas-carousel__dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === currentPage);
      d.setAttribute('aria-selected', String(i === currentPage));
    });
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const total = getTotalPages();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'resenas-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Página ${i + 1} de reseñas`);
      dot.setAttribute('aria-selected', String(i === 0));
      dot.addEventListener('click', () => { goToPage(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    }
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const total = getTotalPages();
      goToPage(currentPage >= total - 1 ? 0 : currentPage + 1);
    }, 5500);
  }

  prevBtn.addEventListener('click', () => { goToPage(currentPage - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goToPage(currentPage + 1); resetAuto(); });

  carouselEl?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carouselEl?.addEventListener('mouseleave',  resetAuto);
  carouselEl?.addEventListener('focusin',  () => clearInterval(autoTimer));
  carouselEl?.addEventListener('focusout', resetAuto);

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 48) { goToPage(dx > 0 ? currentPage + 1 : currentPage - 1); resetAuto(); }
  }, { passive: true });

  window.addEventListener('resize', () => {
    buildDots();
    goToPage(0);
  }, { passive: true });

  // Expuesto para que los renders de JS lo llamen
  window.initResenaCarousel = function () {
    currentPage = 0;
    buildDots();
    goToPage(0);
    resetAuto();
  };
})();

/* ── Lazy images: fade-in tras carga ────────────────────── */
(function () {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load',  () => img.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    }
  });
})();

/* ── Scroll Reveal ───────────────────────────────────────── */
(function () {
  if (!('IntersectionObserver' in window)) {
    // Fallback: muestra todo inmediatamente en navegadores sin soporte
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // solo anima una vez
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

})();

/* ════════════════════════════════════════════════════════════
   PRODUCTO: Carga dinámica de ficha
════════════════════════════════════════════════════════════ */
async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  const titleEl = document.getElementById('prod-title');
  if (!productId || !titleEl) return;


  try {
    const res = await fetch('./data/products.json');
    if (!res.ok) throw new Error('Error HTTP ' + res.status);
    const products = await res.json();
    const p = products.find(item => item.id === productId);

    if (!p) {
      console.warn('Producto no encontrado en JSON:', productId);
      titleEl.textContent = 'Producto no encontrado';
      return;
    }



    // Actualiza textos básicos
    document.title = `${p.brand} ${p.name} | Panisse Óptica`;
    
    const breadType = document.getElementById('breadcrumb-type');
    if (breadType) {
      breadType.textContent = p.type === 'sol' ? 'De Sol' : 'Graduadas';
      breadType.href = `catalogo.html?tipo=${p.type}`;
    }
    const breadBrand = document.getElementById('breadcrumb-brand');
    if (breadBrand) {
      breadBrand.textContent = p.brand;
      breadBrand.href = `catalogo.html?marca=${p.brand_slug}`;
    }
    const breadProduct = document.getElementById('breadcrumb-product');
    if (breadProduct) breadProduct.textContent = p.name;
    
    const brandEl = document.getElementById('prod-brand');
    if (brandEl) {
        brandEl.textContent = p.brand;
        brandEl.href = `catalogo.html?marca=${p.brand_slug}`;
    }
    
    titleEl.textContent = p.name;
    
    const subtitleEl = document.getElementById('prod-subtitle');
    if (subtitleEl) subtitleEl.textContent = `${p.type === 'sol' ? 'Gafas de sol' : 'Gafas graduadas'} · ${p.variant}`;
    
    const priceEl = document.getElementById('prod-price');
    if (priceEl) priceEl.textContent = `${p.price} €`;
    
    const descEl = document.getElementById('prod-desc');
    if (descEl) descEl.innerHTML = `<p>${p.description}</p>`;

    // Imagen principal
    const mainImg = document.getElementById('product-main-img');
    if (mainImg) {
      mainImg.src = p.image || p.placeholder;
      mainImg.alt = `${p.brand} ${p.name}`;
      mainImg.style.opacity = '1';
      // Añadir fallback si la imagen real no carga
      const fallback = p.placeholder || `https://placehold.co/900x720/0d0d0d/c7dbd6?text=${encodeURIComponent(p.brand)}`;
      mainImg.onerror = function() { this.src = fallback; this.onerror = null; };
    }

    // Badge "Nuevo" (dinámico)
    const galleryMain = document.querySelector('.product-gallery__main');
    if (galleryMain) {
      const existingBadge = galleryMain.querySelector('.product-gallery__badge');
      if (existingBadge) existingBadge.remove();
      if (p.is_new) {
        const badge = document.createElement('div');
        badge.className = 'product-gallery__badge';
        badge.textContent = 'Nuevo';
        galleryMain.insertBefore(badge, galleryMain.querySelector('.product-gallery__zoom'));
      }
    }

    // Especificaciones técnicas
    const specsGrid = document.getElementById('prod-specs');
    if (specsGrid && p.specs) {
      let specsHtml = '';
      if (p.specs.calibre) specsHtml += `<li><span>Calibre</span><span>${p.specs.calibre}</span></li>`;
      if (p.specs.puente)  specsHtml += `<li><span>Puente</span><span>${p.specs.puente}</span></li>`;
      if (p.specs.varilla) specsHtml += `<li><span>Varillas</span><span>${p.specs.varilla}</span></li>`;
      if (p.specs.material) specsHtml += `<li><span>Material</span><span>${p.specs.material}</span></li>`;
      specsHtml += `<li><span>Tipo</span><span>${p.type === 'sol' ? 'Sol' : 'Graduadas'}</span></li>`;
      if (p.specs.genero)  specsHtml += `<li><span>Género</span><span>${p.specs.genero}</span></li>`;
      specsGrid.innerHTML = specsHtml;
    }

    // Galería de imágenes (Thumbnails)
    const thumbsContainer = document.getElementById('prod-thumbs');
    if (thumbsContainer) {
      // Si no hay galería, usamos al menos la imagen principal como miniatura
      const galleryImages = (p.gallery && p.gallery.length > 0) ? p.gallery : [p.image || p.placeholder];
      

      const fallbackSrc = p.placeholder || `https://placehold.co/600x480/0d0d0d/c7dbd6?text=${encodeURIComponent(p.brand)}`;
      thumbsContainer.innerHTML = galleryImages.map((img, idx) => `
        <button class="product-gallery__thumb ${idx === 0 ? 'is-active' : ''}" 
                data-img="${img}"
                data-fallback="${fallbackSrc}"
                aria-label="Ver imagen ${idx + 1}">
          <img src="${img}" alt="${p.brand} ${p.name} vista ${idx + 1}"
               onload="this.classList.add('is-loaded')"
               onerror="this.src=this.closest('button').dataset.fallback; this.classList.add('is-loaded')" />
        </button>
      `).join('');

      const thumbs = thumbsContainer.querySelectorAll('.product-gallery__thumb');
      thumbs.forEach(btn => {
        btn.addEventListener('click', () => {
          const newSrc = btn.dataset.img;

          thumbs.forEach(t => t.classList.remove('is-active'));
          btn.classList.add('is-active');
          if (mainImg) {
            mainImg.style.transition = 'opacity 0.2s ease';
            mainImg.style.opacity = '0';
            setTimeout(() => {
              mainImg.src = newSrc;
              mainImg.style.opacity = '1';
            }, 200);
          }
        });
      });

      // Swipe en la imagen principal (móvil)
      const galleryMainEl = document.querySelector('.product-gallery__main');
      if (galleryMainEl && thumbs.length > 1) {
        let tx = 0, ty = 0;
        galleryMainEl.addEventListener('touchstart', e => {
          tx = e.touches[0].clientX;
          ty = e.touches[0].clientY;
        }, { passive: true });
        galleryMainEl.addEventListener('touchend', e => {
          const dx = e.changedTouches[0].clientX - tx;
          const dy = e.changedTouches[0].clientY - ty;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
          const cur = [...thumbs].findIndex(t => t.classList.contains('is-active'));
          const next = dx < 0 ? Math.min(cur + 1, thumbs.length - 1) : Math.max(cur - 1, 0);
          if (next !== cur) thumbs[next].click();
        }, { passive: true });
      }
    }

    // Botón Zoom / Lightbox
    const zoomBtn = document.querySelector('.product-gallery__zoom');
    const lightbox = document.getElementById('product-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.product-lightbox__close');

    if (zoomBtn && lightbox && lightboxImg) {

      zoomBtn.addEventListener('click', (e) => {
        e.preventDefault();

        lightboxImg.src = mainImg.src;
        lightbox.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      });

      const closeLightbox = () => {
        lightbox.classList.remove('is-active');
        document.body.style.overflow = '';
      };

      if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('product-lightbox__content')) {
          closeLightbox();
        }
      });
      
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
          closeLightbox();
        }
      });
    }

    // Etiqueta de color único
    const colorLabel = document.getElementById('color-label');
    if (colorLabel) colorLabel.textContent = p.variant;

    // Productos relacionados (dinámicos)
    const relatedGrid = document.getElementById('related-grid');
    if (relatedGrid) {
      const related = products
        .filter(item => item.id !== productId)
        .sort((a, b) => {
          const score = x => (x.type === p.type ? 2 : 0) + (x.brand_slug === p.brand_slug ? 1 : 0);
          return score(b) - score(a);
        })
        .slice(0, 3);

      relatedGrid.innerHTML = related.map(r => {
        const imgSrc = r.image || r.placeholder;
        const fallback = r.placeholder || `https://placehold.co/600x480/f0ece6/aaaaaa?text=${encodeURIComponent(r.brand)}`;
        const typeLabel = r.type === 'sol' ? 'Sol' : 'Graduadas';
        return `
          <article class="product-card">
            <a href="producto.html?id=${r.id}" class="product-card__link">
              <div class="product-card__image-wrap">
                <img src="${imgSrc}" alt="${r.brand} ${r.name}" class="product-card__image is-loaded"
                     loading="eager"
                     onerror="this.src='${fallback}';this.onerror=null"/>
                ${r.is_new ? '<div class="product-card__badge">Nuevo</div>' : ''}
              </div>
              <div class="product-card__info">
                <span class="product-card__brand">${r.brand}</span>
                <h3 class="product-card__name">${r.name}</h3>
                <span class="product-card__variant">${typeLabel} · ${r.variant}</span>
                <p class="product-card__price">${r.price} €</p>
              </div>
            </a>
          </article>`;
      }).join('');
    }

  } catch (err) {
    console.error('Error crítico en initProductPage:', err);
  }
}

// Inicialización segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductPage);
} else {
  initProductPage();
}

