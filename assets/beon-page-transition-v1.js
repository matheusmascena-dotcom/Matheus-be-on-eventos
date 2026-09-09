(() => {
  'use strict';
  if (window.__beonPageTransitionBound) return;
  window.__beonPageTransitionBound = true;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'beon-transition-v3';
  const DURATION = 420;

  const isInternalEventUrl = (a) => {
    if (!a?.href) return false;
    try {
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return false;
      return u.pathname.endsWith('/event.html') || /\/eventos\/[^/]+\.html$/i.test(u.pathname);
    } catch { return false; }
  };

  const getCard = (el) => el?.closest?.('.card');
  const savePending = (data) => { try { sessionStorage.setItem(KEY, JSON.stringify({ ...data, startedAt: Date.now() })); } catch {} };
  const readPending = () => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!raw || Date.now() - Number(raw.startedAt || 0) > 6000) return null;
      return raw;
    } catch { return null; }
  };
  const clearPending = () => { try { sessionStorage.removeItem(KEY); } catch {} };

  const createOverlay = (src, rect, mode) => {
    if (!src) return null;
    const el = document.createElement('div');
    el.className = `beon-transition-overlay beon-transition-${mode}`;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    el.appendChild(img);
    if (rect) {
      el.style.setProperty('--beon-x', `${rect.left}px`);
      el.style.setProperty('--beon-y', `${rect.top}px`);
      el.style.setProperty('--beon-w', `${rect.width}px`);
      el.style.setProperty('--beon-h', `${rect.height}px`);
    }
    document.body.appendChild(el);
    return el;
  };

  const animateOutgoing = (image, url, slug) => {
    if (!image) { location.href = url; return; }
    const src = image.currentSrc || image.src;
    if (!src) { location.href = url; return; }
    const rect = image.getBoundingClientRect();
    savePending({ src, slug });
    const overlay = createOverlay(src, rect, 'out');
    document.body.classList.add('beon-transition-active');
    requestAnimationFrame(() => requestAnimationFrame(() => overlay?.classList.add('is-moving')));
    window.setTimeout(() => { location.href = url; }, DURATION);
  };

  if (!reduced) {
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const card = getCard(event.target);
      if (!card) return;
      const link = event.target?.closest?.('a');
      if (!isInternalEventUrl(link)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      animateOutgoing(card.querySelector('.pic img'), link.href, card.dataset.slug || '');
    }, { capture: true });
  }

  const applyIncoming = () => {
    const pending = readPending();
    if (!pending?.src) return;
    const overlay = createOverlay(pending.src, null, 'in');
    if (!overlay) { clearPending(); return; }
    document.body.classList.add('beon-transition-active');
    const finish = () => {
      overlay.classList.add('is-done');
      window.setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('beon-transition-active');
      }, 360);
      clearPending();
    };
    const cover = document.querySelector('#cover');
    if (cover) {
      let called = false;
      const done = () => { if (called) return; called = true; finish(); };
      if (cover.complete && cover.naturalWidth > 0) window.setTimeout(done, 60);
      else cover.addEventListener('load', done, { once: true });
      window.setTimeout(done, 1800);
    } else {
      window.setTimeout(finish, 650);
    }
  };

  if (location.pathname.endsWith('/event.html') || /\/eventos\/[^/]+\.html$/i.test(location.pathname)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyIncoming, { once: true });
    else applyIncoming();
  }
})();
