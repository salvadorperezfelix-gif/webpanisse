import os

DIR = r"c:\Users\Panisse Óptica Lugo\Desktop\Web Panisse"

FILES = [
    "index.html","catalogo.html","producto.html","nosotros.html",
    "blog.html","servicios.html","contacto.html","aviso-legal.html",
    "privacidad.html","devoluciones.html","envios.html","tarjeta-regalo.html"
]

ANCHOR = '      <div class="mobile-menu__social">'
INSERT = ('      <div class="mobile-menu__lang">\n'
          '        <button id="mobile-lang-btn" class="lang-flag-btn"\n'
          '                onclick="panisseLangToggle()"\n'
          '                aria-label="Switch language / Cambiar idioma"\n'
          '                style="font-size:15px;padding:8px 12px;gap:8px;display:flex;align-items:center;">\n'
          '          &#x1F1EC;&#x1F1E7; <span class="mobile-lang-label">English</span>\n'
          '        </button>\n'
          '      </div>\n'
          '      <div class="mobile-menu__social">')

# Also update the DOMContentLoaded in each file to update BOTH buttons
OLD_BTN_UPDATE = ("        var btn  = document.getElementById('lang-toggle-btn');\n"
                  "        if (!btn) return;\n"
                  "        var lang = getLang();\n"
                  "        btn.innerHTML = lang === 'en' ? '&#x1F1EA;&#x1F1F8;' : '&#x1F1EC;&#x1F1E7;';\n"
                  "        btn.title     = lang === 'en' ? 'Cambiar a español'  : 'Switch to English';")

NEW_BTN_UPDATE  = ("        var lang = getLang();\n"
                   "        var isEn = lang === 'en';\n"
                   "        var flagEs = '&#x1F1EA;&#x1F1F8;', flagEn = '&#x1F1EC;&#x1F1E7;';\n"
                   "        var btn = document.getElementById('lang-toggle-btn');\n"
                   "        if (btn) { btn.innerHTML = isEn ? flagEs : flagEn;\n"
                   "                   btn.title = isEn ? 'Cambiar a español' : 'Switch to English'; }\n"
                   "        var mBtn = document.getElementById('mobile-lang-btn');\n"
                   "        if (mBtn) {\n"
                   "          mBtn.innerHTML = isEn\n"
                   "            ? flagEs + ' <span class=\"mobile-lang-label\">Español</span>'\n"
                   "            : flagEn + ' <span class=\"mobile-lang-label\">English</span>';\n"
                   "        }")

for fname in FILES:
    path = os.path.join(DIR, fname)
    with open(path, 'r', encoding='utf-8') as f:
        orig = f.read()
    c = orig

    if 'mobile-lang-btn' not in c and ANCHOR in c:
        c = c.replace(ANCHOR, INSERT, 1)

    if OLD_BTN_UPDATE in c:
        c = c.replace(OLD_BTN_UPDATE, NEW_BTN_UPDATE, 1)

    if c == orig:
        print(f'NO CHANGE: {fname}')
    else:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'OK: {fname}')
