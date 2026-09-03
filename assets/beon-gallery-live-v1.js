(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const qs = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  const rawSlug = new URLSearchParams(location.search).get('event');
  const slug = rawSlug === 'unreal-the-grid' ? 'unreal-x-the-grid' : rawSlug;
  if (!slug || !qs('#gallery')) return;

  async function run() {
    try {
      const eventRes = await fetch(`${SUPABASE_URL}/rest/v1/events?select=id,name,slug&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`, {
        headers: { apikey: SUPABASE_KEY, Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!eventRes.ok) throw new Error(`events:${eventRes.status}`);
      const events = await eventRes.json();
      const event = events[0];
      if (!event) return;

      const photoRes = await fetch(`${SUPABASE_URL}/rest/v1/event_gallery_photos?select=id,src_url,photo_name,position,credit_label,credit_url&event_id=eq.${encodeURIComponent(event.id)}&order=position.asc`, {
        headers: { apikey: SUPABASE_KEY, Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!photoRes.ok) throw new Error(`gallery:${photoRes.status}`);
      const photos = await photoRes.json();
      const section = qs('#gallery');
      const gallery = qs('#gal');
      const credits = qs('#credits');
      if (!section || !gallery || !credits) return;

      section.style.display = '';
      if (!photos.length) {
        gallery.innerHTML = '<div class="muted">Nenhuma foto publicada para este evento ainda.</div>';
        credits.innerHTML = '';
        return;
      }

      gallery.innerHTML = photos.slice(0, 12).map((p, i) => `<a class="galitem" data-live-gallery="${i}" href="${esc(p.src_url)}" aria-label="Abrir foto ${i + 1}"><img src="${esc(p.src_url)}" alt="${esc(p.photo_name || event.name)}" loading="lazy" decoding="async"></a>`).join('');

      const uniq = [];
      photos.forEach(p => {
        if (p.credit_label && !uniq.some(c => c.label === p.credit_label)) uniq.push({ label: p.credit_label, url: p.credit_url });
      });
      credits.innerHTML = uniq.map(c => c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">📷 ${esc(c.label)}</a>` : `📷 ${esc(c.label)}`).join(' · ');

      window.__beonLiveGalleryPhotos = photos;
      document.querySelectorAll('[data-live-gallery]').forEach((a, i) => {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          if (window.__beonOpen) {
            window.__beonPhotos = photos;
            window.__beonOpen(i);
          } else {
            window.open(photos[i].src_url, '_blank', 'noopener');
          }
        });
      });
    } catch (err) {
      console.warn('BeOn live gallery:', err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
