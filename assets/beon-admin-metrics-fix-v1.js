(() => {
  const activate = () => {
    const panel = document.getElementById('panel');
    const tab = [...document.querySelectorAll('.tabs button')].find(b => b.dataset.tab === 'metrics');
    if (!panel || !tab || typeof window.showMetrics !== 'function') return false;

    const show = () => {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b === tab));
      try { localStorage.setItem('beon-admin-ui-v2', JSON.stringify({ ...(JSON.parse(localStorage.getItem('beon-admin-ui-v2') || '{}')), tab: 'metrics', eventEditor: { open: false } })); } catch {}
      window.showMetrics();
    };

    if (!tab.dataset.metricsFixBound) {
      tab.dataset.metricsFixBound = '1';
      tab.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); show(); }, true);
    }

    if (panel.querySelector('.kpis') && !panel.querySelector('#beonAnalyticsKpis')) show();
    return true;
  };

  const observer = new MutationObserver(() => activate());
  const start = () => {
    const panel = document.getElementById('panel');
    if (panel) observer.observe(panel, { childList: true, subtree: true });
    activate();
    const timer = setInterval(() => {
      if (activate()) clearInterval(timer);
    }, 250);
    setTimeout(() => clearInterval(timer), 10000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
