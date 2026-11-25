# ConectaMed RD – sitio web institucional

## Estructura
```
conectamed-rd/
├── index.html · formacion.html · industrias.html · mipymes.html · nosotros.html · login.html
├── components/   navbar.html · footer.html   (se editan una vez y aplican a todas las páginas)
└── assets/
    ├── css/styles.css
    ├── js/main.js
    └── img/      logos y fotos
```

## Cómo editar
- **Contenido:** solo cambia el texto dentro de `<main>` en cada HTML. No hay CSS ni JS dentro de los HTML.
- **Menú y pie de página:** `components/navbar.html` y `components/footer.html`.
- **Colores y tipografías:** variables al inicio de `assets/css/styles.css`.
- **Menú / pie de página requieren servidor:** usa GitHub Pages o la extensión *Live Server* de VS Code (abrir el HTML con doble clic no carga los componentes).

## Fotos (opcional, ya están conectadas)
Guarda estas imágenes en `assets/img/` con estos nombres y aparecen solas; si no existen, se ve un fondo azul:
`hero-inicio.jpg` · `hero-formacion.jpg` · `hero-industrias.jpg` · `hero-mipymes.jpg` · `hero-nosotros.jpg`

## Pendiente de conectar
- Vacantes, cursos y necesidades son de ejemplo (las necesidades y el perfil se guardan en el navegador).
- El inicio de sesión es de demostración; se conecta a Firebase u otro sistema de usuarios.
