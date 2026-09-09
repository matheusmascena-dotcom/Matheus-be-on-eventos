(() => {
  'use strict';

  const CSS = 'assets/beon-ux-micro-v1.css?v=cef52185';
  const LOADER_KEY = '__beonUxLoaded';
  if (window[LOADER_KEY]) return;
  window[LOADER_KEY] = true;

  const loadStyles = () => {
    if (document.querySelector('link[data-beon-ux-micro]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS;
    link.dataset.beonUxMicro = '1';
    document.head.appendChild(link);
  };

  const toastRegion = () => {
    let region = document.getElementById('beonUxToastRegion');
    if (!region) {
      region = document.createElement('div');
      region.id = 'beonUxToastRegion';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      document.body.appendChild(region);
    }
    return region;
  };

  function toast(message, type = 'success', duration = 1800) {
    if (!message || !document.body) return;
    const region = toastRegion();
    const item = document.createElement('div');
    item.className = `beon-ux-toast ${type}`;
    item.textContent = message;
    region.appendChild(item);
    requestAnimationFrame(() => item.classList.add('show'));
    window.setTimeout(() => {
      item.classList.remove('show');
      window.setTimeout(() => item.remove(), 260);
    }, duration);
  }

  function addSkeletonIfNeeded() {
    const grid = document.querySelector('#grid');
    if (!grid || grid.children.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'beon-skeleton-grid';
    wrapper.dataset.beonSkeleton = '1';
    wrapper.innerHTML = Array.from({ length: 3 }, () => `
      <div class="beon-skeleton-card" aria-hidden="true">
        <div class="beon-skeleton-media"></div>
        <div class="beon-skeleton-body">
          <div class="beon-skeleton-line wide"></div>
          <div class="beon-skeleton-line mid"></div>
          <div class="beon-skeleton-line short"></div>
        </div>
      </div>
    `).join('');
    grid.appendChild(wrapper);

    const cleanup = () => {
      const skeleton = grid.querySelector('[data-beon-skeleton]');
      if (!skeleton) return;
      const hasRealContent = [...grid.children].some(child => child !== skeleton);
      if (hasRealContent) skeleton.remove();
    };
    const observer = new MutationObserver(cleanup);
    observer.observe(grid, { childList: true });
    window.setTimeout(() => {
      observer.disconnect();
      grid.querySelector('[data-beon-skeleton]')?.remove();
    }, 12000);
  }

  function bindMicroFeedback() {
    document.addEventListener('click', (event) => {
      const target = event.target?.closest?.('a,button');
      if (!target) return;

      if (target.matches('.copy-btn')) {
        window.setTimeout(() => {
          const note = target.closest('.coupon-card, .coupon-text, body')?.querySelector?.('.copy-note.show');
          if (note || /copiad|copiado/i.test(target.textContent || '')) toast('✓ Cupom copiado', 'success');
        }, 180);
      }

      if (target.matches('.fav, #favorite')) {
        window.setTimeout(() => {
          const active = target.classList.contains('on') || /favoritad[oa]/i.test(target.textContent || '') || target.textContent?.trim() === '♥';
          toast(active ? '♥ Evento salvo nos favoritos' : 'Favorito removido', active ? 'success' : 'info');
        }, 40);
      }

      if (target.matches('[data-beon-toast]')) {
        const message = target.getAttribute('data-beon-toast');
        if (message) toast(message, target.getAttribute('data-beon-toast-type') || 'success');
      }

      const isNavigationAction = target.matches('a.buy, a.featured-buy, #buy');
      if (isNavigationAction && target.getAttribute('href') && target.getAttribute('href') !== '#') {
        target.classList.add('beon-ux-loading');
        target.setAttribute('aria-busy', 'true');
        window.setTimeout(() => {
          target.classList.remove('beon-ux-loading');
          target.removeAttribute('aria-busy');
        }, 2200);
      }
    }, { passive: true });
  }

  function bindDynamicStates() {
    const apply = (root = document) => {
      root.querySelectorAll?.('.hidden-result, [aria-busy="true"]').forEach(el => el.classList.add('beon-ux-ready-state'));
    };
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 20000);
  }

  function init() {
    loadStyles();
    addSkeletonIfNeeded();
    toastRegion();
    bindMicroFeedback();
    bindDynamicStates();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();