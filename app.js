/**
 * RUSHIKESH PATIL — EDITORIAL MONOGRAPH ENGINE
 * Live IST Clock, Technical Tabs, Palette Switcher, and Copy Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTheme();
  initInspectorTabs();
  initCopy();
  initForm();
  initScrollSpy();
});

/* 1. Live Indian Standard Time Clock */
function initClock() {
  const clock = document.getElementById('pune-clock');
  if (!clock) return;

  function update() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    clock.textContent = `PUNE [${timeStr} IST]`;
  }

  update();
  setInterval(update, 1000);
}

/* 2. Dark / Light Palette Switcher */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const label = document.getElementById('theme-mode-label');
  if (!btn) return;

  const current = localStorage.getItem('rp_theme_mode') || 'dark';
  document.documentElement.setAttribute('data-theme', current);
  if (label) label.textContent = current === 'dark' ? 'LIGHT' : 'DARK';

  btn.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = active === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rp_theme_mode', next);
    if (label) label.textContent = next === 'dark' ? 'LIGHT' : 'DARK';
    showToast(`PALETTE: ${next.toUpperCase()}`);
  });
}

/* 3. Case 01 Technical Inspector Tabs */
function initInspectorTabs() {
  const tabs = document.querySelectorAll('.inspector-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const panes = document.querySelectorAll('.pane-content');
      panes.forEach(p => p.style.display = 'none');

      const activePane = document.getElementById(`tab-${target}`);
      if (activePane) activePane.style.display = 'block';
    });
  });
}

/* 4. One-Click Copy Feedback */
function initCopy() {
  const emailBtn = document.getElementById('copy-email-btn');
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'rushikesh.patil.work@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('COPIED: rushikesh.patil.work@gmail.com');
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

/* 5. Contact Form Handler */
function initForm() {
  const form = document.getElementById('memo-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name-input')?.value || 'Colleague';
    const email = document.getElementById('email-input')?.value || '';
    const msg = document.getElementById('msg-input')?.value || '';

    showToast('OPENING EMAIL CLIENT...');
    const url = `mailto:rushikesh.patil.work@gmail.com?subject=${encodeURIComponent(`Inquiry from ${name}`)}&body=${encodeURIComponent(msg + `\n\nReturn Contact: ${email}`)}`;

    setTimeout(() => {
      window.location.href = url;
    }, 500);
  });
}

/* 6. Active Nav Link on Scroll */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.masthead-nav a');

  window.addEventListener('scroll', () => {
    let current = '';
    const pos = window.scrollY + 100;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (pos >= top && pos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    links.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === `#${current}`) {
        l.classList.add('active');
      }
    });
  }, { passive: true });
}
