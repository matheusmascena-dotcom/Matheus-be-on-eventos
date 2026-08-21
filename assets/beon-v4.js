(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const sb = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);
  if (!sb) return;

  const qs = (s, r=document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const favKey = 'beon-fav';
  const getFavs = () => JSON.parse(localStorage.getItem(favKey) || '[]');
  const saveFavs = x => localStorage.setItem(favKey, JSON.stringify(x));

  async function metric(type, eventId=null) {
    try { await sb.from('site_metrics').insert({ metric_type:type, event_id:eventId, path:location.pathname + location.search, referrer:document.referrer || null, user_agent:navigator.userAgent }); } catch {}
  }

  function normalizeEvent(e) {
    return { ...e, date:e.event_date, image:e.image_url, buy:e.purchase_url, slug:e.slug || e.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') };
  }

  async function loadEvents() {
    const { data, error } = await sb.from('events').select('*').eq('published', true).order('event_date', { ascending:true });
    if (error) throw error;
    return (data || []).map(normalizeEvent);
  }

  function renderCards(events) {
    const grid = qs('#grid');
    if (!grid) return;
    const favs = getFavs();
    grid.innerHTML = events.map((e,i) => `<article class="card" data-slug="${esc(e.slug)}" data-event-id="${esc(e.id)}" data-search="${esc([e.name,e.location,e.artists,e.event_date].join(' '))}" style="animation:cardIn .55s ${i*.06}s both"><div class="pic"><img src="${esc(e.image)}" alt="${esc(e.name)}" ${i<3?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="tag">${new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','')}</span><span class="off">5% OFF</span><button class="fav ${favs.includes(e.slug)?'on':''}" aria-label="Favoritar">${favs.includes(e.slug)?'♥':'♡'}</button></div><div class="card-body"><h3 class="card-title">${esc(e.name)}</h3><div class="meta"><span>📅 ${new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR')}</span><span>📍 ${esc(e.location)}</span><span>🎧 ${esc(e.artists)}</span></div><div class="actions"><a class="act maps" href="${esc(e.source_url || '#')}" target="_blank" rel="noopener">📍 Maps</a><a class="act buy" href="event.html?event=${encodeURIComponent(e.slug)}">Ver evento ↗</a></div></div></article>`).join('');
    grid.querySelectorAll('.card').forEach(card => {
      const slug=card.dataset.slug, id=card.dataset.eventId, fav=card.querySelector('.fav');
      fav.onclick = ev => { ev.stopPropagation(); let a=getFavs(); a=a.includes(slug)?a.filter(x=>x!==slug):[...a,slug]; saveFavs(a); fav.classList.toggle('on'); fav.textContent=a.includes(slug)?'♥':'♡'; metric('favorite_toggle', id); };
      card.onclick = ev => { if (ev.target.closest('a,button')) return; location.href='event.html?event='+encodeURIComponent(slug); };
    });
  }

  function renderFeatured(events) {
    const host = qs('#featuredUpcoming'); const section=qs('#featured-upcoming');
    if (!host || !section) return;
    const upcoming = events.find(e => new Date(e.event_date+'T00:00:00-03:00').getTime() >= Date.now());
    if (!upcoming) { section.style.display='none'; return; }
    const ts = new Date(upcoming.event_date+'T00:00:00-03:00').getTime();
    host.innerHTML = `<div class="featured-card"><div class="featured-media"><img src="${esc(upcoming.image)}" alt="${esc(upcoming.name)}" loading="eager" fetchpriority="high"></div><div class="featured-copy"><span class="featured-badge">✦ Próximo evento</span><h2>${esc(upcoming.name)}</h2><div class="featured-meta"><span class="featured-chip">📅 ${new Date(upcoming.event_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</span><span class="featured-chip">📍 ${esc(upcoming.location)}</span><span class="featured-chip">🎧 ${esc(upcoming.artists)}</span></div><div class="featured-countdown" aria-live="polite"><div class="featured-unit"><strong id="fcDays">--</strong><span>Dias</span></div><div class="featured-unit"><strong id="fcHours">--</strong><span>Horas</span></div><div class="featured-unit"><strong id="fcMinutes">--</strong><span>Min</span></div><div class="featured-unit"><strong id="fcSeconds">--</strong><span>Seg</span></div></div><div class="featured-actions"><a class="featured-action featured-buy" href="${esc(upcoming.buy || '#')}" target="_blank" rel="noopener">Garantir meu ingresso</a><a class="featured-action featured-event" href="event.html?event=${encodeURIComponent(upcoming.slug)}">Ver evento ↗</a></div></div></div>`;
    const tick=()=>{const left=Math.max(0,ts-Date.now()),t=Math.floor(left/1000); const vals=[Math.floor(t/86400),Math.floor(t%86400/3600),Math.floor(t%3600/60),t%60]; ['fcDays','fcHours','fcMinutes','fcSeconds'].forEach((id,i)=>{const el=qs('#'+id); if(el) el.textContent=String(vals[i]).padStart(2,'0');});}; tick(); clearInterval(window.__beonCountdown); window.__beonCountdown=setInterval(tick,1000);
  }

  function enhanceSearch(events) {
    const input=qs('#eventSearch'); if(!input) return;
    input.oninput=()=>{const q=input.value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');let n=0; document.querySelectorAll('.card').forEach(c=>{const text=(c.dataset.search+' '+c.innerText).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const ok=!q||text.includes(q);c.style.display=ok?'':'none';if(ok)n++;}); const no=qs('#noResults'); if(no) no.style.display=n?'none':'block';};
  }

  async function publicHome() {
    if (!qs('#grid')) return;
    try {
      const events=await loadEvents();
      renderCards(events); renderFeatured(events); enhanceSearch(events); metric('page_view');
    } catch (e) { console.warn('BeOn CMS fallback:', e); }
  }

  function injectAdminUI(modal) {
    if (!modal || qs('#beon-admin-v4', modal)) return;
    const app=qs('#adminApp',modal); if(!app) return;
    const panel=document.createElement('div'); panel.id='beon-admin-v4'; panel.style.marginTop='18px';
    panel.innerHTML=`<div style="border-top:1px solid #ffffff18;padding-top:16px"><div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px"><button id="v4TabEvents">Eventos</button><button id="v4TabGallery">Galerias</button><button id="v4TabMetrics">Métricas</button><label style="display:inline-flex;align-items:center;padding:10px 13px;border:1px solid #ffffff18;border-radius:9px;color:#fff;background:#ffffff08;cursor:pointer">📊 Importar planilha<input id="v4Sheet" type="file" accept=".xlsx,.xls" style="display:none"></label></div><div id="v4Body"></div><div id="v4Status" style="margin-top:10px;color:#3fe0d0;font-size:12px"></div></div>`;
    app.appendChild(panel);

    const body=qs('#v4Body',panel), status=qs('#v4Status',panel);
    const setTab=(name)=>{[...panel.querySelectorAll('button')].forEach(b=>b.style.color='#fff'); const f={events:renderAdminEvents,gallery:renderAdminGallery,metrics:renderAdminMetrics}[name]; if(f) f();};
    qs('#v4TabEvents',panel).onclick=()=>setTab('events'); qs('#v4TabGallery',panel).onclick=()=>setTab('gallery'); qs('#v4TabMetrics',panel).onclick=()=>setTab('metrics');

    async function renderAdminEvents(){const {data,error}=await sb.from('events').select('*').order('event_date'); if(error){body.textContent=error.message;return;} body.innerHTML=`<div style="display:grid;gap:8px">${(data||[]).map(e=>`<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;padding:10px;border:1px solid #ffffff12;border-radius:10px"><div><b>${esc(e.name)}</b><div style="font-size:11px;color:#a49ab5">${esc(e.event_date)} · ${esc(e.location)}</div></div><button data-act="edit" data-id="${e.id}">✏️</button><button data-act="pub" data-id="${e.id}">${e.published?'👁️':'🚫'}</button><button data-act="del" data-id="${e.id}">🗑️</button></div>`).join('')}</div>`; body.querySelectorAll('button[data-act]').forEach(b=>b.onclick=async()=>{const id=b.dataset.id,act=b.dataset.act;if(act==='pub'){const e=data.find(x=>x.id===id);await sb.from('events').update({published:!e.published,updated_at:new Date().toISOString()}).eq('id',id);renderAdminEvents();}else if(act==='del'){if(confirm('Excluir este evento?')){await sb.from('events').delete().eq('id',id);renderAdminEvents();}}else{const e=data.find(x=>x.id===id); body.innerHTML=`<div style="display:grid;gap:8px"><input id="v4Name" value="${esc(e.name)}"><input id="v4Date" type="date" value="${e.event_date}"><input id="v4Loc" value="${esc(e.location)}"><input id="v4Artists" value="${esc(e.artists)}"><input id="v4Buy" value="${esc(e.purchase_url)}"><input id="v4Image" value="${esc(e.image_url)}"><textarea id="v4Desc">${esc(e.description||'')}</textarea><label>Publicado <input id="v4Pub" type="checkbox" ${e.published?'checked':''}></label><button id="v4Save">Salvar</button><button id="v4Cancel">Cancelar</button></div>`; qs('#v4Cancel').onclick=renderAdminEvents; qs('#v4Save').onclick=async()=>{const p={name:qs('#v4Name').value.trim(),event_date:qs('#v4Date').value,location:qs('#v4Loc').value,artists:qs('#v4Artists').value,purchase_url:qs('#v4Buy').value,image_url:qs('#v4Image').value,description:qs('#v4Desc').value,published:qs('#v4Pub').checked,updated_at:new Date().toISOString()}; const r=await sb.from('events').update(p).eq('id',id); status.textContent=r.error?.message||'Evento atualizado.'; renderAdminEvents();};}})};

    async function renderAdminGallery(){const {data:events}=await sb.from('events').select('id,name').order('event_date'); body.innerHTML=`<div style="display:grid;gap:10px"><select id="v4GalEvent">${(events||[]).map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select><input id="v4GalFile" type="file" accept="image/*" multiple><input id="v4Credit" placeholder="Crédito / fotógrafo"><input id="v4CreditUrl" placeholder="Instagram do fotógrafo"><button id="v4Upload">Adicionar fotos</button><div id="v4GalList"></div></div>`; const refresh=async()=>{const id=qs('#v4GalEvent').value;const {data}=await sb.from('event_gallery_photos').select('*').eq('event_id',id).order('position'); qs('#v4GalList').innerHTML=(data||[]).map(p=>`<div style="display:flex;gap:8px;align-items:center;margin-top:6px"><img src="${esc(p.src_url)}" style="width:52px;height:40px;object-fit:cover;border-radius:6px"><span style="font-size:11px;flex:1">${esc(p.photo_name||'foto')}</span><button data-del="${p.id}">Excluir</button></div>`).join(''); qs('#v4GalList').querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{await sb.from('event_gallery_photos').delete().eq('id',b.dataset.del);refresh();});}; qs('#v4GalEvent').onchange=refresh; qs('#v4Upload').onclick=async()=>{const id=qs('#v4GalEvent').value, files=[...qs('#v4GalFile').files]; for(const file of files){const path=`${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`; const up=await sb.storage.from('event-media').upload(path,file,{upsert:false}); if(up.error){status.textContent=up.error.message; continue;} const url=sb.storage.from('event-media').getPublicUrl(path).data.publicUrl; const {count}=await sb.from('event_gallery_photos').select('*',{count:'exact',head:true}).eq('event_id',id); await sb.from('event_gallery_photos').insert({event_id:id,src_url:url,photo_name:file.name,credit_label:qs('#v4Credit').value,credit_url:qs('#v4CreditUrl').value,position:(count||0)});} status.textContent='Fotos adicionadas.'; refresh();}; await refresh();}

    async function renderAdminMetrics(){const {data}=await sb.from('site_metrics').select('metric_type,event_id,created_at').order('created_at',{ascending:false}).limit(1000); const total=(data||[]).length,views=(data||[]).filter(x=>x.metric_type==='page_view').length,clicks=(data||[]).filter(x=>x.metric_type==='ticket_click').length,favs=(data||[]).filter(x=>x.metric_type==='favorite_toggle').length; body.innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px"><div style="padding:14px;border:1px solid #ffffff12;border-radius:12px"><b style="font-size:28px">${views}</b><div style="font-size:11px;color:#a49ab5">Visitas</div></div><div style="padding:14px;border:1px solid #ffffff12;border-radius:12px"><b style="font-size:28px">${clicks}</b><div style="font-size:11px;color:#a49ab5">Cliques em ingresso</div></div><div style="padding:14px;border:1px solid #ffffff12;border-radius:12px"><b style="font-size:28px">${favs}</b><div style="font-size:11px;color:#a49ab5">Favoritos</div></div></div>`;}

    qs('#v4Sheet',panel).onchange=async (ev)=>{const file=ev.target.files?.[0]; if(!file)return; status.textContent='Lendo planilha...'; if(!window.XLSX){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});} const wb=window.XLSX.read(await file.arrayBuffer(),{type:'array'}); const rows=window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames.find(s=>s.toLowerCase().includes('página1'))||wb.SheetNames[0]],{defval:''}); const cfgSheet=wb.Sheets[wb.SheetNames.find(s=>s.toLowerCase().includes('configura'))]; const cfgRows=cfgSheet?window.XLSX.utils.sheet_to_json(cfgSheet,{defval:''}):[]; const config={}; cfgRows.forEach(r=>{const k=r['Configuração']||r['configuração'];const v=r['Valor']||r['valor'];if(k)config[k]=v;}); const events=rows.filter(r=>r['Evento']&&r['Data']).map(r=>({name:r['Evento'],event_date:String(r['Data']).slice(0,10),location:r['Local']||'',artists:r['Artistas']||'',image_url:r['Imagem']||'',purchase_url:r['Link de compra']&&r['Link de compra']!=='Tickets com desconto'?r['Link de compra']:'',source_url:r['Endereço']||''})); const r=await sb.functions.invoke('admin-sync-spreadsheet',{body:{events,config}}); status.textContent=r.error?.message||`Planilha sincronizada: ${r.data?.importedEvents||events.length} eventos.`; await setTab('events');};
    renderAdminEvents();
  }

  function initAdmin() {
    const modal=qs('#admin'); if(!modal || new URLSearchParams(location.search).get('admin')!=='1') return;
    const wait=setInterval(()=>{const app=qs('#adminApp'); if(app){clearInterval(wait); injectAdminUI(modal);}},100);
  }

  function wireTicketClicks(){document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(href.includes('ingresse.com')||href.includes('cart.ingresse.com')) metric('ticket_click');});}

  publicHome(); initAdmin(); wireTicketClicks();
})();