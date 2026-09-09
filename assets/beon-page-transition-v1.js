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

  /*
   * Visual-only preparation. The browser keeps control of the real navigation;
   * this avoids the artificial 170 ms delay and prevents the transition layer
   * from becoming part of the data-loading path.
   */
  const prepare = (card) => {
    if (!card || reduced) return;
    const image = card.querySelector('.pic img');
    if (image) image.style.viewTransitionName = 'event-cover';
    card.classList.add('beon-page-target');
    window.setTimeout(() => card.classList.remove('beon-page-target'), 260);
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const card = getCard(event.target);
    if (!card) return;

    const link = event.target?.closest?.('a');
    if (!isInternalEventUrl(link)) return;

    prepare(card);
    /* Do not preventDefault, do not stopPropagation and do not redirect manually. */
  }, { capture: true, passive: true });
})();
