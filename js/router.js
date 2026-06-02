const app = document.getElementById('app');
const links = document.querySelectorAll('.sb-link');
const cache = {};

// ── Navigation ──────────────────────────────────────────────
async function loadPage(name) {
  // Mettre à jour le lien actif
  links.forEach(l => l.classList.toggle('active', l.dataset.page === name));
  closeSidebar();

  if (cache[name]) { render(cache[name]); return; }

  try {
    const r = await fetch(`pages/${name}.html`);
    if (!r.ok) throw new Error();
    const html = await r.text();
    cache[name] = html;
    render(html);
  } catch {
    app.innerHTML = `<div class="page-wrap"><p style="color:var(--muted)">Page introuvable.</p></div>`;
  }
}

function render(html) {
  app.innerHTML = html;
  window.scrollTo(0, 0);
  // Déclencher les scripts de la page (compteurs, filtres…)
  initPage();
}

links.forEach(l => {
  l.addEventListener('click', e => {
    e.preventDefault();
    const page = l.dataset.page;
    history.pushState({ page }, '', `#${page}`);
    loadPage(page);
  });
});

window.addEventListener('popstate', e => loadPage(e.state?.page || 'accueil'));
loadPage(window.location.hash.replace('#', '') || 'accueil');

// ── Sidebar mobile ──────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
  document.getElementById('hamburger').classList.toggle('active');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('hamburger').classList.remove('active');
}

// ── Init scripts par page ───────────────────────────────────
function initPage() {

  // Compteurs animés
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const duration = 1200;
    const steps = Math.max(target, 1);
    const interval = duration / steps;
    const timer = setInterval(() => {
      current++;
      el.textContent = current + suffix;
      if (current >= target) { el.textContent = target + suffix; clearInterval(timer); }
    }, interval);
  });

  // Filtres projets
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.proj-card').forEach(card => {
        card.classList.toggle('hidden', f !== 'all' && !(card.dataset.tags || '').includes(f));
      });
    });
  });

  // Formulaire contact
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.textContent = 'Message envoyé ✓';
      btn.style.cssText = 'background:#22c55e;border-color:#22c55e;color:#fff';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Envoyer →';
        btn.style.cssText = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  // Animation d'entrée des cards
  const items = document.querySelectorAll(
    '.proj-card, .tl-card, .veille-card, .ep-card, .skill-cat, .stat-card'
  );
  const obs = new IntersectionObserver(entries => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.style.opacity = '1';
        el.target.style.transform = el.target.style.transform.replace('translateY(16px)', 'translateY(0)');
        obs.unobserve(el.target);
      }
    });
  }, { threshold: 0.08 });

  items.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.35s ease ${i * 40}ms, transform 0.35s ease ${i * 40}ms`;
    obs.observe(el);
  });
}


// ── Thème clair / sombre ─────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Appliquer le thème sauvegardé au chargement
(function() {
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
})();
