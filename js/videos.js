/* =====================================================
   MENÚ MÓVIL
   ===================================================== */

const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});


/* =====================================================
   LIGHTBOX REPRODUCTOR DE VIDEO
   ===================================================== */

function openLightbox(el) {
  const title = el.dataset.title;
  const cat = el.dataset.cat;
  const glow = el.dataset.glow;
  const youtubeId = el.dataset.youtube;

  document.getElementById('lightbox-ptitle').textContent = title;
  document.getElementById('lightbox-ltitle').textContent = title;
  document.getElementById('lightbox-lcat').textContent = cat;
  document.getElementById('lightbox-glow').style.background = glow;

  const videoEl = document.getElementById('lightbox-video');
  const placeholderEl = document.getElementById('lightbox-content');

  // Si la tarjeta trae un ID real de YouTube, incrustamos el video.
  const tieneVideo = youtubeId && !youtubeId.includes('TU_ID_DE_YOUTUBE');

  if (tieneVideo) {
    const iframe = document.createElement('iframe');

    iframe.src =
      'https://www.youtube-nocookie.com/embed/' +
      youtubeId +
      '?autoplay=1&rel=0&modestbranding=1';

    iframe.title = title;
    iframe.frameBorder = '0';
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    videoEl.innerHTML = '';
    videoEl.appendChild(iframe);
    videoEl.classList.add('visible');
    placeholderEl.style.display = 'none';
  } else {
    videoEl.innerHTML = '';
    videoEl.classList.remove('visible');
    placeholderEl.style.display = '';
  }

  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');

  // Quitamos el iframe al cerrar para detener la reproducción en segundo plano
  const videoEl = document.getElementById('lightbox-video');
  videoEl.innerHTML = '';
  videoEl.classList.remove('visible');

  document.getElementById('lightbox-content').style.display = '';
  document.body.style.overflow = '';
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

document.getElementById('lightbox').addEventListener('click', function (e) {
  if (e.target === document.getElementById('lightbox')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});


/* =====================================================
   CATEGORÍAS: Filtrar el grid de videos
   ===================================================== */

const videoCards = Array.from(document.querySelectorAll('.video-card'));
const catCards = Array.from(document.querySelectorAll('.cat-card'));
const catReset = document.getElementById('cat-reset');

// Calcula y pinta cuántos videos hay realmente en cada categoría
function actualizarConteoCategorias() {
  document.querySelectorAll('.cat-count').forEach(function (span) {
    const grupo = span.dataset.count;

    const total = videoCards.filter(function (card) {
      return card.dataset.group === grupo;
    }).length;

    span.textContent = total + (total === 1 ? ' video' : ' videos');
  });
}

function filterByCategory(catEl) {
  const grupo = catEl.dataset.filter;
  const yaActiva = catEl.classList.contains('active');

  // Si se hace click sobre la misma categoría activa, se quita el filtro
  if (yaActiva) {
    resetCategoryFilter();
    return;
  }

  catCards.forEach(function (c) {
    c.classList.remove('active');
  });

  catEl.classList.add('active');

  videoCards.forEach(function (card) {
    if (card.dataset.group === grupo) {
      card.classList.remove('is-hidden');
    } else {
      card.classList.add('is-hidden');
    }
  });

  catReset.classList.add('visible');

  document.querySelector('.section-videos').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function resetCategoryFilter() {
  catCards.forEach(function (c) {
    c.classList.remove('active');
  });

  videoCards.forEach(function (card) {
    card.classList.remove('is-hidden');
  });

  catReset.classList.remove('visible');
}

actualizarConteoCategorias();


/* =====================================================
   COMENTARIOS (Supabase)
   ===================================================== */

const SUPABASE_URL = 'https://jsdkiryfeuqktrtfkoyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZGtpcnlmZXVxa3RydGZrb3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDc1MDIsImV4cCI6MjEwNDEyMzUwMn0.3TZZBjnoqbYtpFz8uTmWg--_3MVgOrCNcuG7GfChKY8';
const TABLA_COMENTARIOS = 'comentarios_videos';

const supabaseConfigurado =
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_ANON_KEY.includes('AQUI');

const supabaseClient = supabaseConfigurado
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const commentsList = document.getElementById('comments-list');
const commentsEmpty = document.getElementById('comments-empty');
const commentForm = document.getElementById('comment-form');
const commentStatus = document.getElementById('comment-status');
const commentSubmit = document.getElementById('comment-submit');

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function renderComentarios(comentarios) {
  commentsList.innerHTML = '';

  if (!comentarios || comentarios.length === 0) {
    commentsList.innerHTML =
      '<p class="comments-empty">Sé el primero en dejar un comentario.</p>';
    return;
  }

  comentarios.forEach(function (c) {
    const item = document.createElement('div');
    item.className = 'comment-item';

    item.innerHTML =
      '<div class="comment-item-head">' +
        '<span class="comment-author">' + escapeHTML(c.nombre) + '</span>' +
        '<span class="comment-date">' + formatearFecha(c.created_at) + '</span>' +
      '</div>' +
      '<p class="comment-text">' + escapeHTML(c.mensaje) + '</p>';

    commentsList.appendChild(item);
  });
}

async function cargarComentarios() {
  if (!supabaseConfigurado) {
    commentsList.innerHTML =
      '<p class="comments-empty">' +
      'Conecta tu proyecto de Supabase (URL y anon key en el script) ' +
      'para activar los comentarios.' +
      '</p>';
    return;
  }

  const { data, error } = await supabaseClient
    .from(TABLA_COMENTARIOS)
    .select('nombre,mensaje,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    commentsList.innerHTML =
      '<p class="comments-empty">No se pudieron cargar los comentarios.</p>';
    console.error(error);
    return;
  }

  renderComentarios(data);
}

if (commentForm) {
  commentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!supabaseConfigurado) {
      commentStatus.textContent =
        'Los comentarios estarán disponibles cuando conectemos Supabase.';
      commentStatus.classList.add('visible');
      return;
    }

    const nombre = document.getElementById('comment-name').value.trim();
    const mensaje = document.getElementById('comment-message').value.trim();

    if (!nombre || !mensaje) {
      return;
    }

    commentSubmit.disabled = true;
    commentSubmit.textContent = 'Publicando...';

    const { error } = await supabaseClient
      .from(TABLA_COMENTARIOS)
      .insert([{ nombre: nombre, mensaje: mensaje }]);

    commentSubmit.disabled = false;
    commentSubmit.textContent = 'Publicar comentario';

    if (error) {
      commentStatus.textContent =
        'Ocurrió un error al publicar tu comentario. Intenta de nuevo.';
      commentStatus.classList.add('visible');
      console.error(error);
      return;
    }

    commentForm.reset();
    commentStatus.textContent = '';
    commentStatus.classList.remove('visible');

    cargarComentarios();
  });
}

cargarComentarios();