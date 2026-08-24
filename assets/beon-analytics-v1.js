(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const EVENT_RE = /(?:^|\/)event\.html(?:$|\?)/;
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);
  if (!client) return;

  const sessionKey = 'beon_analytics_session_v1';
  let sessionId = localStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(sessionKey, sessionId);
  }

  const params = new URLSearchParams(location.search);
  const eventSlug = params.get('event') || null;
  const source = params.get('src') || params.get('utm_source') || null;
  const path = `${location.pathname}${location.search}`;
  const referrer = document.referrer || null;
  const once = new Set();

  async function track(metricType, extra = {}) {
    const key = `${metricType}:${extra.event_id || ''}:${path}`;
    if (metricType === 'page_view' && once.has(key)) return;
    if (metricType === 'page_view') once.add(key);
    try {
      await client.from('site_metrics').insert({
        metric_type: metricType,
        event_id: extra.event_id || null,
        path,
        referrer,
        user_agent: navigator.userAgent,
        source,
        session_id: sessionId
      });
    } catch (_) {}
  }

  async function resolveEventId() {
    if (!eventSlug) return null;
    const { data } = await client.from('events').select('id').eq('slug', eventSlug).maybeSingle();
    return data?.id || null;
  }

  async function bind() {
    const eventId = await resolveEventId();
    track('page_view', { event_id: eventId });

    document.addEventListener('click', (ev) => {
      const el = ev.target.closest?.('a,button');
      if (!el) return;
      const href = el.getAttribute('href') || '';
      const text = (el.textContent || '').trim().toLowerCase();
      const metric = href.includes('ingresse.com') || text.includes('comprar ingresso') || text.includes('garantir meu ingresso') ? 'ticket_click'
        : text.includes('favorit') || el.classList.contains('fav') ? 'favorite_click'
        : text.includes('compart') ? 'share_click'
        : href.includes('wa.me') || href.includes('whatsapp') ? 'whatsapp_click'
        : href.includes('instagram.com') ? 'instagram_click'
        : href.includes('google.com/maps') ? 'map_click'
        : null;
      if (metric) track(metric, { event_id: eventId });
    }, { passive: true });

    document.addEventListener('input', (ev) => {
      const el = ev.target;
      if (!el.matches?.('input[type="search"], #eventSearch, .event-search')) return;
      clearTimeout(el.__beonSearchTimer);
      el.__beonSearchTimer = setTimeout(() => {
        const query = el.value.trim();
        if (query.length >= 2) track('search', { event_id: eventId, query });
      }, 800);
    }, { passive: true });

    window.beonTrack = (metricType, extra = {}) => track(metricType, { ...extra, event_id: extra.event_id || eventId });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
