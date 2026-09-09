(() => {
  'use strict';
  if (window.__beonPageTransitionBound) return;
  window.__beonPageTransitionBound = true;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const isInternalEventUrl = (a) => {
    if (!a?.href) return false;
    try {
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return false;
      return u.pathname.endsWith('/event.html') || /\/eventos\/[^/]+\.html$/i.test(u.pathname);
    } catch { return false; }
  };

  const getCard = (el) => el?.closest?.('.card');

  const prepare = (card) => {
    if (!card) return null;
    const image = card.querySelector('.pic img');
    if (image) image.style.viewTransitionName = 'event-cover';
    card.classList.add('beon-page-target');
    document.body.classList.add('beon-page-leaving');
    try {
      sessionStorage.setItem('beon-page-transition-v1', JSON.stringify({
        slug: card.dataset.slug || '',
        startedAt: Date.now()
      }));
    } catch {}
    return image;
  };

  const navigateLater = (url) => {
    window.setTimeout(() => { location.href = url; }, reduced ? 0 : 170);
  };

  if (!reduced) {
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const card = getCard(event.target);
      if (!card) return;

      const link = event.target?.closest?.('a');
      const targetLink = isInternalEventUrl(link) ? link : card.querySelector('a.act.buy, a[href*="event.html"], a[href*="/eventos/"]');
      if (!targetLink || !isInternalEventUrl(targetLink)) return;

      /* Take control of the current navigation for a short, deliberate exit beat. */
      const url = targetLink.href;
      event.preventDefault();
      event.stopImmediatePropagation();
      prepare(card);
      navigateLater(url);
    }, { capture: true });
  }

  const applyEnterState = () => {
    let hasPending = false;
    try {
      const raw = JSON.parse(sessionStorage.getItem('beon-page-transition-v1') || 'null');
      hasPending = !!raw && (Date.now() - Number(raw.startedAt || 0) < 5000);
    } catch {}
    if (!hasPending) return;

    const cover = document.querySelector('#cover, .poster img');
    if (cover) cover.style.viewTransitionName = 'event-cover';

    if (!reduced) {
      document.documentElement.classList.add('beon-page-enter');
      requestAnimationFrame(() => document.documentElement.classList.add('beon-page-enter-ready'));
      window.setTimeout(() => {
        document.documentElement.classList.remove('beon-page-enter', 'beon-page-enter-ready');
      }, 520);
    }
    try { sessionStorage.removeItem('beon-page-transition-v1'); } catch {}
  };

  if (location.pathname.endsWith('/event.html') || /\/eventos\/[^/]+\.html$/i.test(location.pathname)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyEnterState, { once: true });
    else applyEnterState();
  }
})();
