/**
 * RUSHIKESH PATIL — EDITORIAL PORTFOLIO ENGINE
 * Live IST Clock, Technical Inspector Tabs, Theme Switcher, and Copy Utilities
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initThemeSwitcher();
  initTechnicalTabs();
  initCopyUtilities();
  initContactForm();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   1. Live Pune Time Clock (IST)
   -------------------------------------------------------------------------- */
function initLiveClock() {
  const clockEl = document.getElementById('pune-clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    // Format to Indian Standard Time (IST: UTC+5:30)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const timeStr = now.toLocaleTimeString('en-GB', options);
    clockEl.textContent = `PUNE, IN [${timeStr} IST]`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* --------------------------------------------------------------------------
   2. Archival Dark / Warm Cream Theme Switcher
   -------------------------------------------------------------------------- */
function initThemeSwitcher() {
  const themeBtn = document.getElementById('theme-toggle');
  const labelEl = document.getElementById('theme-mode-label');
  if (!themeBtn) return;

  // Retrieve stored theme or default to dark
  const storedTheme = localStorage.getItem('rp_editorial_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);
  updateLabel(storedTheme);

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rp_editorial_theme', next);
    updateLabel(next);
    showToast(`Palette: ${next.toUpperCase()} MODE`);
  });

  function updateLabel(theme) {
    if (labelEl) {
      labelEl.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
    }
  }
}

/* --------------------------------------------------------------------------
   3. Technical Panel Tab Switching
   -------------------------------------------------------------------------- */
function initTechnicalTabs() {
  const tabBtns = document.querySelectorAll('.panel-tab-btn[data-tab]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      const parentPanel = btn.closest('.case-technical-panel');
      if (!parentPanel) return;

      // Update buttons inside this panel
      parentPanel.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panes inside this panel
      parentPanel.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
      });

      const activePane = parentPanel.querySelector(`#pane-${targetId}`);
      if (activePane) {
        activePane.style.display = 'block';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Copy Utilities & Discrete Toast Notification
   -------------------------------------------------------------------------- */
function initCopyUtilities() {
  const emailBtn = document.getElementById('copy-email-btn');
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'rushikesh.patil.work@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Address copied: rushikesh.patil.work@gmail.com');
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast-el');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

/* --------------------------------------------------------------------------
   5. Editorial Memo Correspondence Handler
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('editorial-memo-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sender = document.getElementById('memo-sender')?.value || 'Colleague';
    const email = document.getElementById('memo-email')?.value || '';
    const body = document.getElementById('memo-body')?.value || '';

    showToast('Preparing dispatch via default email client...');

    const mailtoLink = `mailto:rushikesh.patil.work@gmail.com?subject=${encodeURIComponent(`Inquiry from ${sender}`)}&body=${encodeURIComponent(body + `\n\nReturn Address: ${email}`)}`;

    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 600);
  });
}

/* --------------------------------------------------------------------------
   6. Scroll Spy for Navigation Links
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}
