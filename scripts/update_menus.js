const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newDesktopMenu = `<div class="dropdown dropdown--wide" id="dropdown-marcas" role="menu" aria-label="Marcas">
              <div class="dropdown__grid">
                <a href="catalogo.html?marca=panisse" class="dropdown__link" role="menuitem">Panisse</a>
                <a href="catalogo.html?marca=panisse-boutique" class="dropdown__link" role="menuitem">Panisse Boutique</a>
                <a href="catalogo.html?marca=emporio-armani" class="dropdown__link" role="menuitem">Emporio Armani</a>
                <a href="catalogo.html?marca=swarovski" class="dropdown__link" role="menuitem">Swarovski</a>
                <a href="catalogo.html?marca=ray-ban" class="dropdown__link" role="menuitem">Ray-Ban</a>
                <a href="catalogo.html?marca=polaroid" class="dropdown__link" role="menuitem">Polaroid</a>
                <a href="catalogo.html?marca=panisse-kids" class="dropdown__link" role="menuitem">Panisse Kids</a>
                <a href="catalogo.html?marca=mr-boho" class="dropdown__link" role="menuitem">Mr. Boho</a>
              </div>
              <div class="dropdown__footer-bar">
                <a href="catalogo.html" class="dropdown__all">Ver todas las marcas →</a>
              </div>
            </div>`;

const newMobileMenu = `<ul class="mobile-submenu" id="mm-marcas" aria-hidden="true">
            <li><a href="catalogo.html?marca=panisse" class="mobile-sublink">Panisse</a></li>
            <li><a href="catalogo.html?marca=panisse-boutique" class="mobile-sublink">Panisse Boutique</a></li>
            <li><a href="catalogo.html?marca=emporio-armani" class="mobile-sublink">Emporio Armani</a></li>
            <li><a href="catalogo.html?marca=swarovski" class="mobile-sublink">Swarovski</a></li>
            <li><a href="catalogo.html?marca=ray-ban" class="mobile-sublink">Ray-Ban</a></li>
            <li><a href="catalogo.html?marca=polaroid" class="mobile-sublink">Polaroid</a></li>
            <li><a href="catalogo.html?marca=panisse-kids" class="mobile-sublink">Panisse Kids</a></li>
            <li><a href="catalogo.html?marca=mr-boho" class="mobile-sublink">Mr. Boho</a></li>
            <li><a href="catalogo.html" class="mobile-sublink mobile-sublink--all">Ver todas las marcas →</a></li>
          </ul>`;

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let originalContent = content;
  
  // Replace desktop menu
  content = content.replace(/<div class="dropdown dropdown--wide" id="dropdown-marcas"[\s\S]*?<\/div>\s*<\/div>/, newDesktopMenu);
  
  // Replace mobile menu
  content = content.replace(/<ul class="mobile-submenu" id="mm-marcas"[\s\S]*?<\/ul>/, newMobileMenu);

  if (content !== originalContent) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Updated menus in ' + file);
  } else {
    console.log('No changes needed or regex failed in ' + file);
  }
});
