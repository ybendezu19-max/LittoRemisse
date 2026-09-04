/* ─────────────────────────────────────────────────────────
   LIITO REMISSE — Interacciones del sitio
   ───────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  const header      = document.querySelector('.header');
  const hamburger    = document.querySelector('.hamburger');
  const mobileNav    = document.querySelector('.mobile-nav');
  const volverArriba = document.querySelector('.volver-arriba');

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ───────────────────────────────
     ANIMACIÓN AL HACER SCROLL
     ─────────────────────────────── */
  const secciones = document.querySelectorAll('.animar');

  if (secciones.length) {
    if (prefersReducedMotion) {
      secciones.forEach(el => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      secciones.forEach(el => observer.observe(el));
    }
  }

  /* ───────────────────────────────
     MENÚ MÓVIL
     ─────────────────────────────── */
  const abrirMenu = () => {
    mobileNav.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
  };

  const cerrarMenu = () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
  };

  if (hamburger && mobileNav) {
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', () => {
      mobileNav.classList.contains('open') ? cerrarMenu() : abrirMenu();
    });

    // Cierra el menú al elegir una opción
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', cerrarMenu);
    });

    // Cierra el menú con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        cerrarMenu();
        hamburger.focus();
      }
    });

    // Cierra el menú si la ventana pasa a tamaño de escritorio
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mobileNav.classList.contains('open')) {
        cerrarMenu();
      }
    });
  }

  /* ───────────────────────────────
     HEADER Y BOTÓN "VOLVER ARRIBA" AL HACER SCROLL
     ─────────────────────────────── */
  const alScrollear = () => {
    const y = window.scrollY;

    if (header) {
      header.classList.toggle('scrolled', y > 40);
    }

    if (volverArriba) {
      volverArriba.classList.toggle('visible', y > 600);
    }
  };

  window.addEventListener('scroll', alScrollear, { passive: true });
  alScrollear();

  if (volverArriba) {
    volverArriba.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

});