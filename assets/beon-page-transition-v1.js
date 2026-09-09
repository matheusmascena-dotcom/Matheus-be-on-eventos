(() => {
  'use strict';
  if (window.__beonPageTransitionBound) return;
  window.__beonPageTransitionBound = true;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const isInternalEventLink = (a) => {
    if (!a || !a.href) return false;
    try {
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return false;
      return u.pathname.endsWith('/event.html') || /\/eventos\/[^/]+\.html$/i.test(u.pathname);
    } catch { return false; }
  };

  const getCard = (el) => el?.closest?.('.card');
  const markLeaving = (card) => {
    document.body.classList.add('beon-page-leaving');
    card?.classList.add('beon-page-target');
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target?.closest?.('a');
    const card = getCard(event.target);
    if (!card || !isInternalEventLink(link)) return;

    /* Shared element for browsers supporting cross-document View Transitions. */
    const image = card.querySelector('.pic img');
    if (image) image.style.viewTransitionName = 'event-cover';
    markLeaving(card);

    try {
      sessionStorage.setItem('beon-page-transition-v1', JSON.stringify({
        slug: card.dataset.slug || '',
        startedAt: Date.now()
      }));
    } catch {}
  }, { capture: true });

  const applyEnterState = () => {
    const hasPending = (() => {
      try {
        const raw = JSON.parse(sessionStorage.getItem('beon-page-transition-v1') || 'null');
        return raw && (Date.now() - Number(raw.startedAt || 0) < 5000);
      } catch { return false; }
    })();
    if (!hasPending) return;

    const cover = document.querySelector('#cover, .poster img');
    if (cover) cover.style.viewTransitionName = 'event-cover';

    document.documentElement.classList.add('beon-page-enter');
    requestAnimationFrame(() => document.documentElement.classList.add('beon-page-enter-ready'));
    window.setTimeout(() => {
      document.documentElement.classList.remove('beon-page-enter', 'beon-page-enter-ready');
      try { sessionStorage.removeItem('beon-page-transition-v1'); } catch {}
    }, 520);
  };

  if (location.pathname.endsWith('/event.html') || /\/eventos\/[^/]+\.html$/i.test(location.pathname)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyEnterState, { once: true });
    else applyEnterState();
  }
})();
