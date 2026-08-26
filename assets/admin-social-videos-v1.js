(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;' }[m]));
  const slugify = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'evento';

  const headers = () => {
    let token = null;
    const exact = 'sb-bellpluuhrrluwsgouob-auth-token';
    try {
      const raw = JSON.parse(localStorage.getItem(exact) || '{}');
      token = raw?.access_token || raw?.currentSession?.access_token || raw?.session?.access_token || null;
    } catch (_) {}
    if (!token) {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
        try {
          const raw = JSON.parse(localStorage.getItem(key) || '{}');
          token = raw?.access_token || raw?.currentSession?.access_token || raw?.session?.access_token || null;
          if (token) break;
        } catch (_) {}
      }
    }
    if (!token) throw new Error('Sessão do Admin não encontrada. Faça login novamente.');
    return { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  async function api(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) }
    });
    const text = await response.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch (_) { data = text; } }
    if (!response.ok) throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
    return data;
  }

  function normalizeUrl(platform, value) {
    let url = String(value || '').trim();
    if (!url) return '';
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      if (platform === 'instagram') {
        if (!/instagram\.com$/.test(host)) throw new Error('Use um link do Instagram.');
        const match = u.pathname.match(/^\/(?:reel|p)\/([^/]+)/i);
        if (!match) throw new Error('Use um link de Reel ou publicação do Instagram.');
        return `https://www.instagram.com/${u.pathname.replace(/\/+$/,'').split('/').filter(Boolean).slice(0,2).join('/')}/`;
      }
      if (!/(?:tiktok\.com)$/.test(host) && host !== 'vm.tiktok.com') throw new Error('Use um link do TikTok.');
      return url;
    } catch (error) {
      throw error?.message ? error : new Error('Informe uma URL válida.');
    }
  }

  function ensureStyles() {
    if (document.getElementById('beon-social-videos-admin-style')) return;
    const style = document.createElement('style');
    style.id = 'beon-social-videos-admin-style';
    style.textContent = `
      .beon-social-videos-box{grid-column:1/-1;margin-top:4px;padding:14px 16px;border:1px solid #ffffff12;border-radius:14px;background:linear-gradient(135deg,#15101e,#0d0915)}
      .beon-social-videos-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}
      .beon-social-videos-title{font-size:12px;font-weight:700;color:#fff}
      .beon-social-videos-note{font-size:10px;color:#8f859d;margin-top:4px}
      .beon-social-video-list{display:grid;gap:7px;margin-top:12px}
      .beon-social-video-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:9px 10px;border:1px solid #ffffff12;border-radius:10px;background:#0b0812}
      .beon-social-video-platform{font-size:10px;font-weight:700;text-transform:uppercase;color:#3fe0d0;min-width:66px}
      .beon-social-video-main{min-width:0}.beon-social-video-main b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.beon-social-video-main small{display:block;color:#8f859d;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
      .beon-social-video-btn{padding:7px 9px;font-size:10px}
      .beon-social-video-form{display:grid;grid-template-columns:130px minmax(0,1.6fr) minmax(0,1fr) auto;gap:7px;align-items:end;margin-top:12px}
      .beon-social-video-field{display:grid;gap:4px}.beon-social-video-field label{font-size:10px;color:#a49ab5}.beon-social-video-field input,.beon-social-video-field select{width:100%;box-sizing:border-box}
      .beon-social-video-status{min-height:16px;margin-top:8px;font-size:10px}.beon-social-video-status.ok{color:#3fe0d0}.beon-social-video-status.err{color:#ff7cae}
      @media(max-width:820px){.beon-social-video-form{grid-template-columns:1fr}.beon-social-video-item{grid-template-columns:auto minmax(0,1fr) auto}.beon-social-video-item .beon-social-video-delete{grid-column:3}.beon-social-video-item .beon-social-video-edit{grid-column:3;grid-row:1}}
    `;
    document.head.appendChild(style);
  }

  async function findEventId() {
    const name = document.getElementById('n')?.value.trim();
    if (!name) return null;
    const slug = slugify(name);
    const rows = await api(`events?select=id,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    return rows?.[0]?.id || null;
  }

  async function renderVideos(wrapper) {
    ensureStyles();
    let eventId = null;
    try { eventId = await findEventId(); } catch (error) {
      wrapper.querySelector('[data-role="video-status"]').textContent = error.message;
      wrapper.querySelector('[data-role="video-status"]').className = 'beon-social-video-status err';
      return;
    }
    const list = wrapper.querySelector('[data-role="video-list"]');
    const status = wrapper.querySelector('[data-role="video-status"]');
    const form = wrapper.querySelector('[data-role="video-form"]');
    const platform = wrapper.querySelector('[data-role="platform"]');
    const url = wrapper.querySelector('[data-role="url"]');
    const title = wrapper.querySelector('[data-role="title"]');
    const save = wrapper.querySelector('[data-role="save"]');
    let editingId = null;

    if (!eventId) {
      list.innerHTML = '<div class="beon-social-video-note">Salve o evento primeiro para adicionar vídeos.</div>';
      form.style.display = 'none';
      return;
    }

    const setStatus = (text, kind='') => { status.textContent = text; status.className = `beon-social-video-status ${kind}`.trim(); };

    const load = async () => {
      const rows = await api(`event_social_videos?select=id,platform,video_url,title,position,published&event_id=eq.${encodeURIComponent(eventId)}&order=position.asc,created_at.asc`);
      list.innerHTML = rows.length ? rows.map(v => `
        <div class="beon-social-video-item" data-video-id="${esc(v.id)}">
          <div class="beon-social-video-platform">${esc(v.platform)}</div>
          <div class="beon-social-video-main"><b>${esc(v.title || 'Vídeo do evento')}</b><small>${esc(v.video_url)}</small></div>
          <button type="button" class="beon-social-video-btn beon-social-video-edit" data-edit="${esc(v.id)}">Editar</button>
          <button type="button" class="beon-social-video-btn beon-social-video-delete" data-delete="${esc(v.id)}">Excluir</button>
        </div>`).join('') : '<div class="beon-social-video-note">Nenhum vídeo cadastrado para este evento.</div>';
      list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => {
        const row = rows.find(v => v.id === btn.dataset.edit); if (!row) return;
        editingId = row.id; platform.value = row.platform; url.value = row.video_url; title.value = row.title || ''; save.textContent = 'Salvar vídeo'; url.focus();
      }));
      list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('Excluir este vídeo do evento?')) return;
        try { await api(`event_social_videos?id=eq.${encodeURIComponent(btn.dataset.delete)}`, { method:'DELETE', headers:{ Prefer:'return=minimal' } }); setStatus('Vídeo excluído.', 'ok'); await load(); } catch (error) { setStatus(error.message, 'err'); }
      }));
    };

    save.addEventListener('click', async () => {
      try {
        const clean = normalizeUrl(platform.value, url.value);
        if (!clean) throw new Error('Informe o link do vídeo.');
        const payload = { platform: platform.value, video_url: clean, title: title.value.trim() || null, updated_at: new Date().toISOString() };
        if (editingId) await api(`event_social_videos?id=eq.${encodeURIComponent(editingId)}`, { method:'PATCH', headers:{ Prefer:'return=minimal' }, body: JSON.stringify(payload) });
        else {
          const current = await api(`event_social_videos?select=id&event_id=eq.${encodeURIComponent(eventId)}`);
          payload.event_id = eventId; payload.position = current.length; payload.published = true;
          await api('event_social_videos', { method:'POST', headers:{ Prefer:'return=minimal' }, body: JSON.stringify(payload) });
        }
        editingId = null; platform.value='instagram'; url.value=''; title.value=''; save.textContent='Adicionar vídeo'; setStatus('Vídeo salvo.','ok'); await load();
      } catch (error) { setStatus(error.message, 'err'); }
    });

    await load();
  }

  function mount() {
    const form = document.getElementById('form');
    const grid = form?.querySelector('.box .grid');
    if (!form || !grid || !document.getElementById('n')) return;
    if (form.querySelector('[data-role="social-videos"]')) return;
    const box = document.createElement('section');
    box.className = 'beon-social-videos-box';
    box.dataset.role = 'social-videos';
    box.innerHTML = `
      <div class="beon-social-videos-head"><div><div class="beon-social-videos-title">🎬 Vídeos do evento</div><div class="beon-social-videos-note">Adicione Reels do Instagram ou vídeos do TikTok. O vídeo permanece hospedado na plataforma.</div></div></div>
      <div class="beon-social-video-list" data-role="video-list"></div>
      <div class="beon-social-video-form" data-role="video-form">
        <div class="beon-social-video-field"><label>Plataforma</label><select data-role="platform"><option value="instagram">Instagram</option><option value="tiktok">TikTok</option></select></div>
        <div class="beon-social-video-field"><label>Link do vídeo</label><input data-role="url" placeholder="https://www.instagram.com/reel/... ou https://www.tiktok.com/@.../video/..." /></div>
        <div class="beon-social-video-field"><label>Título (opcional)</label><input data-role="title" placeholder="Ex.: Reel oficial do One Life" /></div>
        <button type="button" class="primary beon-social-video-btn" data-role="save">Adicionar vídeo</button>
      </div>
      <div class="beon-social-video-status" data-role="video-status"></div>
    `;
    form.querySelector('.box')?.appendChild(box);
    renderVideos(box);
  }

  let timer = 0;
  const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(mount, 50); });
  observer.observe(document.body, { childList:true, subtree:true });
  mount();
})();