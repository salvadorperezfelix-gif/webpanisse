const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newFooter = `<footer class="footer" aria-label="Pie de página">
    <div class="footer__inner container">

      <!-- Col 1: Logo + Misión -->
      <div class="footer__col footer__col--brand">
        <a href="index.html" class="footer__logo" aria-label="Panisse Óptica — inicio">
          Panisse<br><em>Óptica</em>
        </a>
        <p class="footer__mission">
          Óptica boutique en Lugo. Cuidamos tu salud visual con la mejor tecnología y te ofrecemos una selección artesanal de gafas de diseño de autor.
        </p>
        <div class="footer__social">
          <a href="https://www.instagram.com/panisse_optica/" class="footer__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61586908144350" class="footer__social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@panisse_optica" class="footer__social-link" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
          </a>
        </div>
      </div>

      <!-- Col 2: Enlaces rápidos -->
      <nav class="footer__col footer__col--links" aria-label="Navegación del footer">
        <h3 class="footer__heading">Explorar</h3>
        <ul class="footer__list">
          <li><a href="catalogo.html?tipo=graduadas" class="footer__link">Gafas Graduadas</a></li>
          <li><a href="catalogo.html?tipo=sol" class="footer__link">Gafas de Sol</a></li>
          <li><a href="catalogo.html" class="footer__link">Marcas</a></li>
          <li><a href="servicios.html" class="footer__link">Servicios</a></li>
          <li><a href="contacto.html" class="footer__link">Cita Previa</a></li>
          <li><a href="blog.html" class="footer__link">Blog</a></li>
        </ul>
        <h3 class="footer__heading" style="margin-top: 28px;">Información</h3>
        <ul class="footer__list">
          <li><a href="nosotros.html" class="footer__link">Sobre Nosotros</a></li>
          <li><a href="envios.html" class="footer__link">Política de Envíos</a></li>
          <li><a href="devoluciones.html" class="footer__link">Devoluciones</a></li>
          <li><a href="aviso-legal.html" class="footer__link">Aviso Legal</a></li>
          <li><a href="privacidad.html" class="footer__link">Privacidad y Cookies</a></li>
        </ul>
      </nav>

      <!-- Col 3: Nuestra Tienda -->
      <div class="footer__col footer__col--stores">
        <h3 class="footer__heading">Nuestra Tienda</h3>
        <div class="footer__store">
          <p class="footer__store-name">Panisse Óptica</p>
          <address class="footer__address">
            Calle Teatro, 2 Bajo<br>
            27001 Lugo
          </address>
          <ul class="footer__store-details">
            <li><a href="tel:+34982301193">982 301 193</a></li>
            <li><a href="mailto:info@panisse.es">info@panisse.es</a></li>
            <li>L–V 10:00–13:30 / 16:30–20:30<br>Sáb 10:30–13:30</li>
          </ul>
        </div>
      </div>

      <!-- Col 4: Newsletter -->
      <div class="footer__col footer__col--newsletter">
        <h3 class="footer__heading">Newsletter</h3>
        <p class="footer__newsletter-text">Suscríbete para recibir novedades y consejos.</p>
        <form class="footer__form" id="newsletter-form">
          <input type="email" id="newsletter-email" placeholder="tu@email.com" required />
          <button type="submit">OK</button>
        </form>
      </div>

    </div>
    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p class="footer__copy">© <span id="footer-year"></span> Panisse Óptica · Todos los derechos reservados</p>
      </div>
    </div>
  </footer>`;

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let original = content;

  content = content.replace(/<footer class="footer"[\s\S]*?<\/footer>/, newFooter);

  if (content !== original) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Updated footer in ${file}`);
  }
});
