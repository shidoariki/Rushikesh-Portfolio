/**
 * RUSHIKESH PATIL - PORTFOLIO INTERACTION ENGINE
 * Interactive SQL/DAX Simulator, Theme Switching, and Dynamic State
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initAnalyticsPlayground();
  initCopyButtons();
  initContactForm();
  initMobileMenu();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Check persisted or system preference
  const savedTheme = localStorage.getItem('rp_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme, themeIcon);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('rp_theme', newTheme);
      updateThemeIcon(newTheme, themeIcon);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

function updateThemeIcon(theme, iconEl) {
  if (!iconEl) return;
  if (theme === 'light') {
    iconEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  } else {
    iconEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  }
}

/* --------------------------------------------------------------------------
   2. Interactive Analytics Playground
   -------------------------------------------------------------------------- */
const PLAYGROUND_SCENARIOS = {
  clv: {
    title: 'Top Customers by Lifetime Value (CLV)',
    badge: 'PostgreSQL CTE + Window Function',
    explanation: 'Ranks customers by cumulative spend across completed transactions. Uses ROW_NUMBER() to identify each buyer\'s most recent purchase date and DENSE_RANK() for spend tiering.',
    sql: `WITH customer_orders AS (
    SELECT 
        c.customer_id, c.customer_name, c.state,
        o.order_id, o.order_date,
        SUM(oi.quantity * oi.unit_price * (1 - oi.discount)) AS order_value,
        ROW_NUMBER() OVER (PARTITION BY c.customer_id ORDER BY o.order_date DESC) as recency_rank
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'Completed'
    GROUP BY c.customer_id, c.customer_name, c.state, o.order_id, o.order_date
)
SELECT 
    customer_name, state, COUNT(order_id) as total_orders,
    ROUND(SUM(order_value)::numeric, 2) as lifetime_spend,
    DENSE_RANK() OVER (ORDER BY SUM(order_value) DESC) as spend_rank
FROM customer_orders
GROUP BY customer_id, customer_name, state
ORDER BY lifetime_spend DESC LIMIT 5;`,
    headers: ['Rank', 'Customer Name', 'State', 'Orders', 'Lifetime Spend'],
    rows: [
      ['#1', 'Aditi Sharma', 'Maharashtra', '18', '₹1,42,850'],
      ['#2', 'Rohan Mehta', 'Karnataka', '14', '₹1,18,400'],
      ['#3', 'Priya Kulkarni', 'Maharashtra', '12', '₹96,200'],
      ['#4', 'Vikram Sen', 'Delhi NCR', '11', '₹89,550'],
      ['#5', 'Neha Deshmukh', 'Gujarat', '9', '₹76,100']
    ]
  },
  mom: {
    title: 'Quarterly MoM Revenue & AOV Performance',
    badge: 'Power BI DAX Time-Intelligence',
    explanation: 'Tracks monthly sales and compares against the prior period using DATEADD in DAX. Evaluates Average Order Value (AOV) to identify if growth is driven by volume or basket size.',
    sql: `-- DAX Measures Evaluated:
Total Revenue = SUMX(Fact_Sales, Fact_Sales[Quantity] * Fact_Sales[UnitPrice] * (1 - Fact_Sales[Discount]))

Prior Month Revenue = CALCULATE([Total Revenue], DATEADD(Dim_Date[Date], -1, MONTH))

MoM Growth % = DIVIDE([Total Revenue] - [Prior Month Revenue], [Prior Month Revenue], 0)

AOV = DIVIDE([Total Revenue], DISTINCTCOUNT(Fact_Sales[OrderID]), 0)`,
    headers: ['Month', 'Total Revenue', 'Prior Month', 'MoM Growth', 'AOV'],
    rows: [
      ['Oct 2024', '₹8,42,000', '₹7,15,000', '+17.76%', '₹2,840'],
      ['Nov 2024 (Festive)', '₹12,85,000', '₹8,42,000', '+52.61%', '₹3,410'],
      ['Dec 2024', '₹10,10,000', '₹12,85,000', '-21.40%', '₹2,990'],
      ['Jan 2025', '₹9,30,000', '₹10,10,000', '-7.92%', '₹2,780'],
      ['Feb 2025', '₹10,45,000', '₹9,30,000', '+12.36%', '₹3,050']
    ]
  },
  churn: {
    title: 'Telecom Churn Segmentation Analysis',
    badge: 'Python (Pandas & NumPy)',
    explanation: 'Exploratory data analysis on 7,043 subscriber records. Segments churn rates across contract types, proving month-to-month subscribers represent 88% of all churned accounts.',
    sql: `# Python Pandas Script Execution:
df['churn_flag'] = (df['churn'] == 'Yes').astype(int)

churn_summary = df.groupby('contract_type').agg(
    total_users=('customer_id', 'count'),
    churned_users=('churn_flag', 'sum'),
    avg_monthly_fee=('monthly_charges', 'mean')
).reset_index()

churn_summary['churn_rate'] = (churn_summary['churned_users'] / churn_summary['total_users'] * 100).round(2)
display(churn_summary)`,
    headers: ['Contract Type', 'Subscribers', 'Churned', 'Avg Monthly Fee', 'Churn Rate'],
    rows: [
      ['Month-to-Month', '3,875', '1,655', '₹1,850', '42.71% ⚠️'],
      ['One Year Contract', '1,473', '166', '₹1,520', '11.27%'],
      ['Two Year Contract', '1,695', '48', '₹1,410', '2.83% ✅']
    ]
  }
};

function initAnalyticsPlayground() {
  const buttons = document.querySelectorAll('.query-btn');
  const previewBox = document.getElementById('playground-code');
  const titleEl = document.getElementById('playground-title');
  const badgeEl = document.getElementById('playground-badge');
  const descEl = document.getElementById('playground-desc');
  const tableHead = document.getElementById('playground-thead');
  const tableBody = document.getElementById('playground-tbody');

  if (!buttons.length) return;

  function renderScenario(key) {
    const data = PLAYGROUND_SCENARIOS[key];
    if (!data) return;

    // Update active button state
    buttons.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.query-btn[data-scenario="${key}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update texts
    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (descEl) descEl.textContent = data.explanation;
    if (previewBox) previewBox.textContent = data.sql;

    // Update Table Headers
    if (tableHead) {
      tableHead.innerHTML = `<tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    }

    // Update Table Rows
    if (tableBody) {
      tableBody.innerHTML = data.rows.map(row => `
        <tr>
          ${row.map((cell, idx) => `<td><strong>${cell}</strong></td>`).join('')}
        </tr>
      `).join('');
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const scenarioKey = btn.getAttribute('data-scenario');
      renderScenario(scenarioKey);
    });
  });

  // Default render
  renderScenario('clv');
}

/* --------------------------------------------------------------------------
   3. Copy to Clipboard
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const copyBtns = document.querySelectorAll('[data-copy]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetText = btn.getAttribute('data-copy');
      if (targetText) {
        navigator.clipboard.writeText(targetText).then(() => {
          showToast(`Copied to clipboard: ${targetText}`);
        }).catch(() => {
          showToast('Failed to copy to clipboard');
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Contact Form Simulation
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('quick-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sender-name')?.value || 'Recruiter';
    const email = document.getElementById('sender-email')?.value || '';
    const message = document.getElementById('sender-message')?.value || '';

    // Create a mailto URL
    const mailtoUrl = `mailto:rushikesh.patil.work@gmail.com?subject=Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(message + "\n\nContact: " + email)}`;
    
    showToast(`Opening email client to reach Rushikesh Patil...`);
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 600);
  });
}

/* --------------------------------------------------------------------------
   5. Mobile Navigation
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '72px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'var(--bg-surface)';
      navLinks.style.padding = '20px';
      navLinks.style.borderBottom = '1px solid var(--border-subtle)';
    });
  }
}

/* --------------------------------------------------------------------------
   Toast Notifications
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success-color)">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;
  toast.style.display = 'flex';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}
