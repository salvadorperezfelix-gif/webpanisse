# Prompt para Claude (Desarrollo Panisse Óptica)

Copia y pega el siguiente texto en Claude para continuar con el desarrollo de la web:

---

**Contexto del Proyecto:**
Estamos desarrollando la web de **Panisse Óptica**, una óptica boutique en Lugo, Galicia. El objetivo es crear una "web escaparate" premium, con estética limpia y minimalista, inspirada en referentes como *L'Atelier Óptica*.

**Estado Actual:**
1. **Estructura Organizada:** Hemos reorganizado el proyecto moviendo los activos a `/assets/` (`css`, `js`, `img`) y los scripts de utilidad a `/scripts/`. Los archivos HTML están en la raíz y tienen las rutas actualizadas.
2. **Funcionalidades:** Tenemos un catálogo con filtros funcionales, integración de Calendly en la página de contacto y un sistema de sincronización de menús.
3. **Base de Datos:** Se ha creado un archivo `data/products.json` para empezar a gestionar los productos de forma dinámica.

**Tu Misión (Siguientes Pasos):**
Actúa como un Desarrollador Frontend Senior y Webmaster experto. Necesito que ejecutes las siguientes tareas priorizando la calidad estética y la experiencia de usuario:

1. **Catálogo Dinámico (JS):** Refactoriza la lógica de `assets/js/main.js` para que cargue los productos desde `data/products.json` mediante `fetch`. Asegúrate de que los filtros de marca (Panisse, Ray-Ban, etc.) y tipo (Sol/Graduadas) sigan funcionando perfectamente con este nuevo sistema.
2. **Excelencia Visual (Imágenes):** Genera descripciones detalladas o sugerencias para las imágenes que faltan. Actualmente usamos placeholders. Necesitamos imágenes que transmitan "lujo artesanal", "atención cercana" y "precisión técnica".
3. **Contenido de Valor (Blog):** Redacta el primer artículo para `blog.html`. El tema debe ser "El valor de las gafas de autor frente a la fabricación en serie". Dale un tono editorial y sofisticado.
4. **Pulido Premium:** Revisa `assets/css/style.css` para añadir micro-animaciones suaves (hovers, transiciones de entrada al hacer scroll) que den una sensación de fluidez y modernidad.
5. **Consistencia de Marca:** Asegúrate de que el Footer sea idéntico en todas las páginas. Si es necesario, crea un script similar a `scripts/update_menus.js` para automatizar la sincronización del footer.

**Preferencia de Interacción (CRÍTICO):**
- El usuario interactúa mediante **voz en ESPAÑOL**. 
- Si recibes una transcripción que parece "gibberish" o palabras en inglés sin sentido, interpreta que es un error del dictado y trata de leerlo **fonéticamente como si fuera español**.
- Responde siempre en un español natural, elegante y directo.
- Si una instrucción no está clara por culpa del dictado, pide una aclaración amigable antes de ejecutar cambios grandes.

**Reglas de Trabajo:**
- Mantén el diseño minimalista y boutique.
- Usa fuentes elegantes (Cormorant Garamond y Lato).
- Asegúrate de que todo sea 100% responsivo.
- No añadas funcionalidades innecesarias; menos es más.

¿Por dónde quieres empezar?

---
