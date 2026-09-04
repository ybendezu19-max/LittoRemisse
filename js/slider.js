// Usamos DOMContentLoaded para asegurar que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {

  /* ─── 1. SLIDER ─── */
  // OJO: el contenedor real en el HTML es ".slides-wrapper", no ".slider".
  // Con el selector antiguo (".slider") este bloque nunca se ejecutaba.
  const slider = document.querySelector(".slides-wrapper");
  const heroSection = document.querySelector(".hero");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".slide-arrow.prev");
  const nextBtn = document.querySelector(".slide-arrow.next");

  if (slider && slides.length) {
    let index = 0;
    const total = slides.length;
    let autoplayInterval = null;
    const AUTOPLAY_TIME = 1000; // 1 segundo

    const updateSlider = () => {
      // Aseguramos que el índice sea válido (soporta números negativos)
      index = (index + total) % total;

      slider.style.transform = `translateX(-${index * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    };

    const moveSlider = (newIndex) => {
      index = newIndex;
      updateSlider();
      resetAutoplay(); // Reiniciamos el timer si el usuario interactúa
    };

    const startAutoplay = () => {
      autoplayInterval = setInterval(() => moveSlider(index + 1), AUTOPLAY_TIME);
    };

    const resetAutoplay = () => {
      clearInterval(autoplayInterval);
      startAutoplay();
    };

    // Botones de flecha
    nextBtn?.addEventListener("click", () => moveSlider(index + 1));
    prevBtn?.addEventListener("click", () => moveSlider(index - 1));

    // Dots
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => moveSlider(i));
    });

    // Pausar autoplay al pasar el mouse (mejora UX)
    slider.addEventListener("mouseenter", () => clearInterval(autoplayInterval));
    slider.addEventListener("mouseleave", startAutoplay);

    // Swipe táctil (móvil)
    let touchStartX = 0;
    if (heroSection) {
      heroSection.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      heroSection.addEventListener("touchend", (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? moveSlider(index + 1) : moveSlider(index - 1);
        }
      });
    }

    // Iniciar
    updateSlider();
    startAutoplay();
  }

  /* ─── 1B. FLEET MINI SLIDER ─── */
  const fleetTrack = document.querySelector(".fleet-track");
  const fleetPrev = document.querySelector(".fleet-prev");
  const fleetNext = document.querySelector(".fleet-next");

  if (fleetTrack && fleetPrev && fleetNext) {
    const FLEET_AUTOPLAY_TIME = 2000; // 2 segundos
    let fleetAutoplayInterval = null;

    const getStep = () => {
      const card = fleetTrack.querySelector(".fleet-card");
      if (!card) return 0;
      const gap = parseFloat(getComputedStyle(fleetTrack).gap) || 0;
      return card.getBoundingClientRect().width + gap;
    };

    const isAtEnd = () => {
      const maxScroll = fleetTrack.scrollWidth - fleetTrack.clientWidth - 1;
      return fleetTrack.scrollLeft >= maxScroll;
    };

    const updateFleetArrows = () => {
      const maxScroll = fleetTrack.scrollWidth - fleetTrack.clientWidth - 1;
      fleetPrev.disabled = fleetTrack.scrollLeft <= 0;
      fleetNext.disabled = fleetTrack.scrollLeft >= maxScroll;
    };

    const fleetStepForward = () => {
      if (isAtEnd()) {
        fleetTrack.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        fleetTrack.scrollBy({ left: getStep(), behavior: "smooth" });
      }
    };

    const startFleetAutoplay = () => {
      fleetAutoplayInterval = setInterval(fleetStepForward, FLEET_AUTOPLAY_TIME);
    };

    const resetFleetAutoplay = () => {
      clearInterval(fleetAutoplayInterval);
      startFleetAutoplay();
    };

    fleetNext.addEventListener("click", () => {
      fleetStepForward();
      resetFleetAutoplay();
    });
    fleetPrev.addEventListener("click", () => {
      fleetTrack.scrollBy({ left: -getStep(), behavior: "smooth" });
      resetFleetAutoplay();
    });

    fleetTrack.addEventListener("scroll", updateFleetArrows, { passive: true });
    window.addEventListener("resize", updateFleetArrows);

    // Pausa el autoplay mientras el usuario interactúa (mouse o touch)
    fleetTrack.addEventListener("mouseenter", () => clearInterval(fleetAutoplayInterval));
    fleetTrack.addEventListener("mouseleave", startFleetAutoplay);
    fleetTrack.addEventListener("touchstart", () => clearInterval(fleetAutoplayInterval), { passive: true });
    fleetTrack.addEventListener("touchend", startFleetAutoplay);

    updateFleetArrows();
    startFleetAutoplay();
  }

  /* ─── 2. SCROLL HEADER & ANIMACIONES (IntersectionObserver) ─── */
  // OJO: el <header> del HTML no tiene la clase "header", así que se
  // selecciona por el tag directamente (funciona igual con el CSS,
  // que ya cubre "header, .header").
  const header = document.querySelector("header");

  // Usamos IntersectionObserver en lugar de 'scroll' para el header (mucho más eficiente)
  if (heroSection && header) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            header.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
          }
        });
      },
      { threshold: 0.1 } // Se activa cuando el 10% del hero ha salido de la pantalla
    );

    navObserver.observe(heroSection);
  }

  // Animaciones de scroll (reemplaza el evento scroll masivo)
  const animarElementos = document.querySelectorAll(".animar");
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          animObserver.unobserve(entry.target); // Deja de observarlo una vez animado para ahorrar memoria
        }
      });
    },
    { threshold: 0.15 } // Aparece cuando el 15% del elemento es visible
  );

  animarElementos.forEach((el) => animObserver.observe(el));

  /* ─── 3. MENÚ MÓVIL ─── */
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("active", isOpen);
      // Bloquea el scroll del fondo mientras el menú está abierto
      document.body.classList.toggle("no-scroll", isOpen);
    });

    // Cerrar menú al hacer click en un enlace
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        document.body.classList.remove("no-scroll");
      });
    });
  }

});