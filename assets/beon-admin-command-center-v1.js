(() => {
  const SB_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SB_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const db = window.supabase?.createClient?.(SB_URL, SB_KEY, { auth:{ persistSession:true, autoRefreshToken:true } });
  if (!db) return;

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const fmt = n => new Intl.NumberFormat('pt-BR').format(Number(n) || 0);
  const pct = n => `${(Number(n) || 0).toFixed(1).replace('.', ',')}%`;
  const daysAgo = n => { const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-n); return d; };
  const isUrl = value => { try { const u = new URL(value); return ['http:','https:'].includes(u.protocol); } catch { return false; } };
  const isMaps = value => /(?:google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(String(value||''));
  const slugify = value => String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'evento';

  const aliases = {
    page_view:['analytics_page_view','page_view'],
    ticket_click:['analytics_ticket_click','ticket_click'],
    favorite_click:['analytics_favorite_click','favorite_toggle'],
    share_click:['analytics_share_click'],
    search:['analytics_search'],
    map_click:['analytics_map_click'],
    whatsapp_click:['analytics_whatsapp_click'],
    instagram_click:['analytics_instagram_click']
  };
  const hasMetric = (row,key) => aliases[key]?.includes(row.metric_type);
  const countMetric = (data,key) => data.filter(r => hasMetric(r,key)).length;

  function injectStyles(){
    if($('beonCommandStyles')) return;
    const s=document.createElement('style'); s.id='beonCommandStyles';
    s.textContent=`
      .bc-wrap{display:grid;gap:14px}.bc-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.bc-title{margin:0;font-size:24px}.bc-sub{color:#a49ab5;font-size:12px;margin-top:3px}.bc-actions{display:flex;gap:8px;flex-wrap:wrap}.bc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.bc-grid6{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}.bc-kpi{padding:14px;border:1px solid #ffffff12;border-radius:14px;background:linear-gradient(135deg,#15101e,#0d0915)}.bc-kpi b{font:32px 'Bebas Neue';display:block}.bc-kpi span{font-size:10px;color:#a49ab5}.bc-cols{display:grid;grid-template-columns:1.15fr .85fr;gap:10px}.bc-card{padding:14px;border:1px solid #ffffff12;border-radius:14px;background:#0b0812}.bc-card h3{margin:0 0 10px;font-size:13px}.bc-list{display:grid;gap:8px}.bc-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px;border:1px solid #ffffff0f;border-radius:10px;font-size:11px}.bc-row strong{color:#3fe0d0}.bc-ok{color:#3fe0d0}.bc-warn{color:#ffd36b}.bc-err{color:#ff7cae}.bc-muted{color:#a49ab5}.bc-health{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.bc-health-item{padding:10px;border:1px solid #ffffff0f;border-radius:10px}.bc-dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px}.bc-dot.ok{background:#3fe0d0}.bc-dot.warn{background:#ffd36b}.bc-dot.err{background:#ff7cae}.bc-score{font:42px 'Bebas Neue'}.bc-alert{border-left:3px solid #3fe0d0}.bc-alert.warn{border-left-color:#ffd36b}.bc-alert.err{border-left-color:#ff7cae}.bc-table{width:100%;border-collapse:collapse;font-size:11px}.bc-table th,.bc-table td{padding:9px 7px;border-bottom:1px solid #ffffff0f;text-align:left}.bc-table th{color:#a49ab5;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.bc-badge{display:inline-flex;align-items:center;padding:4px 7px;border-radius:999px;font-size:10px;border:1px solid #ffffff14}.bc-badge.ok{color:#3fe0d0}.bc-badge.warn{color:#ffd36b}.bc-badge.err{color:#ff7cae}.bc-validate{margin-left:8px}.bc-modal{position:fixed;inset:0;background:#000b;display:none;align-items:center;justify-content:center;padding:20px;z-index:99999}.bc-modal.open{display:flex}.bc-modal-box{width:min(680px,100%);max-height:85vh;overflow:auto;background:#100b17;border:1px solid #ffffff1c;border-radius:18px;padding:18px;box-shadow:0 24px 80px #000}.bc-check{display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-bottom:1px solid #ffffff0d}.bc-check:last-child{border-bottom:0}.bc-check b{display:block;font-size:11px}.bc-check small{color:#a49ab5}.bc-check .ico{width:20px}.bc-analytics-extra{display:grid;gap:12px;margin-top:12px}.bc-analytics-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}
      @media(max-width:1050px){.bc-grid6{grid-template-columns:repeat(3,1fr)}.bc-health{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:820px){.bc-grid{grid-template-columns:repeat(2,1fr)}.bc-cols{grid-template-columns:1fr}.bc-health{grid-template-columns:1fr 1fr}} 
      @media(max-width:560px){.bc-grid,.bc-grid6,.bc-health{grid-template-columns:1fr 1fr}.bc-row{align-items:flex-start;flex-direction:column}}
    `; document.head.appendChild(s);
  }

  function setPanel(html){ const panel=$('panel'); if(panel) panel.innerHTML=html; }

  async function getEvents(){
    const r=await db.from('events').select('*').order('event_date');
    if(r.error) throw r.error; return r.data||[];
  }
  async function getGalleryCounts(events){
    const ids=events.map(e=>e.id); if(!ids.length) return {};
    const r=await db.from('event_gallery_photos').select('event_id').in('event_id',ids);
    if(r.error) throw r.error; const out={}; (r.data||[]).forEach(x=>out[x.event_id]=(out[x.event_id]||0)+1); return out;
  }
  async function getMetrics(){
    const r=await db.from('site_metrics').select('metric_type,event_id,created_at,source,session_id,path,referrer').order('created_at',{ascending:true}).limit(10000);
    if(r.error) throw r.error; return r.data||[];
  }
  async function getHealth(events, galleryCounts, metrics){
    const checks=[];
    const latestMetric=metrics.at(-1)?.created_at;
    checks.push(['Supabase / Banco',true,'Leitura de eventos funcionando']);
    checks.push(['Galerias',true,`${Object.values(galleryCounts).reduce((a,b)=>a+b,0)} fotos vinculadas`]);
    checks.push(['Analytics',!!latestMetric,latestMetric?`Último registro: ${new Date(latestMetric).toLocaleString('pt-BR')}`:'Nenhum registro encontrado']);
    try{
      const r=await fetch('https://matheusmascena-dotcom.github.io/Matheus-be-on-eventos/robots.txt',{cache:'no-store'});
      checks.push(['GitHub Pages',r.ok,r.ok?'Site público respondendo':'HTTP '+r.status]);
    }catch(e){ checks.push(['GitHub Pages',false,'Falha de rede no navegador']); }
    try{
      const r=await fetch('https://matheusmascena-dotcom.github.io/Matheus-be-on-eventos/sitemap.xml',{cache:'no-store'});
      checks.push(['Sitemap',r.ok,r.ok?'Sitemap acessível':'HTTP '+r.status]);
    }catch(e){ checks.push(['Sitemap',false,'Falha de rede no navegador']); }
    return checks;
  }

  async function validateEvent(event, galleryCounts={}, opts={}){
    const checks=[]; const add=(label,ok,detail,severity='warn')=>checks.push({label,ok,detail,severity});
    add('Nome do evento',!!event.name?.trim(),'Obrigatório','error');
    add('Data do evento',/^\d{4}-\d{2}-\d{2}$/.test(event.event_date||''),'Data válida','error');
    add('Link de compra',isUrl(event.purchase_url||''),'URL http/https válida','error');
    add('Capa',!!event.image_url?.trim() && isUrl(event.image_url),'URL da capa presente','error');
    add('Localização',!!event.location?.trim(),'Recomendado para apresentação','warn');
    add('Line-up / artistas',!!event.artists?.trim(),'Recomendado','warn');
    add('Descrição',String(event.description||'').trim().length>=40,`Mínimo recomendado: 40 caracteres`,'warn');
    add('Google Maps',!!event.source_url?.trim() && isMaps(event.source_url),'Link do Maps detectado','warn');
    add('Slug',!!event.slug?.trim() || !!event.name?.trim(),'Slug disponível / derivável','error');
    add('Galeria',Number(galleryCounts[event.id]||0)>0,`${fmt(galleryCounts[event.id]||0)} foto(s) cadastrada(s)`,'warn');
    add('Publicação',event.published===true,'Estado atual do evento',opts.publication?'error':'warn');
    return checks;
  }
  function validationSummary(checks){
    return { errors:checks.filter(x=>!x.ok&&x.severity==='error').length, warnings:checks.filter(x=>!x.ok&&x.severity==='warn').length };
  }
  function checkBadge(checks){
    const s=validationSummary(checks); if(s.errors) return `<span class="bc-badge err">✕ ${s.errors} crítico(s)</span>`; if(s.warnings) return `<span class="bc-badge warn">⚠ ${s.warnings} pendência(s)</span>`; return `<span class="bc-badge ok">✓ Completo</span>`;
  }
  function renderChecks(checks){
    return checks.map(c=>`<div class="bc-check"><div class="ico">${c.ok?'✅':(c.severity==='error'?'❌':'⚠️')}</div><div><b class="${c.ok?'bc-ok':(c.severity==='error'?'bc-err':'bc-warn')}">${esc(c.label)}</b><small>${esc(c.detail)}</small></div></div>`).join('');
  }
  function openValidation(title, checks){
    let modal=$('beonValidationModal'); if(!modal){
      modal=document.createElement('div'); modal.id='beonValidationModal'; modal.className='bc-modal'; modal.innerHTML=`<div class="bc-modal-box"><div class="bc-head"><div><h3 id="beonValidationTitle" class="bc-title"></h3><div id="beonValidationMeta" class="bc-sub"></div></div><button id="beonValidationClose">Fechar</button></div><div id="beonValidationBody" style="margin-top:10px"></div></div>`; document.body.appendChild(modal); $('beonValidationClose').onclick=()=>modal.classList.remove('open'); modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
    }
    const s=validationSummary(checks); $('beonValidationTitle').textContent=title; $('beonValidationMeta').textContent=`${s.errors} crítico(s) · ${s.warnings} recomendado(s)`; $('beonValidationBody').innerHTML=renderChecks(checks); modal.classList.add('open');
  }

  async function renderCommand(){
    injectStyles();
    setPanel(`<div class="bc-wrap"><div class="bc-head"><div><h2 class="bc-title">Command Center</h2><div class="bc-sub">Visão administrativa, saúde do sistema, validações e alertas em um único lugar.</div></div><div class="bc-actions"><button id="bcRefresh">Atualizar</button></div></div><div id="bcLoading" class="bc-card">Carregando dados administrativos…</div><div id="bcContent" class="bc-wrap" style="display:none"></div></div>`);
    $('bcRefresh').onclick=renderCommand; await refreshCommand();
  }

  async function refreshCommand(){
    const loading=$('bcLoading'), content=$('bcContent'); try{
      const [events,galleryCounts,metrics]=await Promise.all([getEvents(),null,getMetrics()]);
      const gc=await getGalleryCounts(events); const health=await getHealth(events,gc,metrics);
      const published=events.filter(e=>e.published); const today=new Date(); today.setHours(0,0,0,0); const upcoming=published.filter(e=>new Date(`${e.event_date}T00:00:00`)>=today).sort((a,b)=>a.event_date.localeCompare(b.event_date))[0];
      const sessions=new Set(metrics.map(x=>x.session_id).filter(Boolean)).size; const views=countMetric(metrics,'page_view'); const tickets=countMetric(metrics,'ticket_click'); const ctr=views?tickets/views*100:0; const recent=metrics.filter(x=>new Date(x.created_at)>=daysAgo(7)); const prev=metrics.filter(x=>new Date(x.created_at)>=daysAgo(14)&&new Date(x.created_at)<daysAgo(7)); const recentViews=countMetric(recent,'page_view'),prevViews=countMetric(prev,'page_view'); const growth=prevViews?((recentViews-prevViews)/prevViews*100):(recentViews?100:0);
      const eventStats=published.map(e=>{const d=metrics.filter(x=>x.event_id===e.id);const v=countMetric(d,'page_view'),t=countMetric(d,'ticket_click');return {e,v,t,ctr:v?t/v*100:0}}).sort((a,b)=>b.v-a.v); const top=eventStats[0];
      const alerts=[];
      for(const e of published){const checks=await validateEvent(e,gc);const s=validationSummary(checks);if(s.errors) alerts.push({kind:'err',title:e.name,text:`${s.errors} problema(s) crítico(s) antes da publicação`}); else if(s.warnings>=4) alerts.push({kind:'warn',title:e.name,text:`${s.warnings} itens recomendados ainda pendentes`});}
      if(!latestMetricFresh(metrics)) alerts.push({kind:'warn',title:'Analytics',text:'Nenhum evento de métricas foi recebido nas últimas 24 horas.'});
      if(top && top.v>=10 && top.t===0) alerts.push({kind:'warn',title:'Conversão',text:`${top.e.name} tem ${fmt(top.v)} visualizações e nenhum clique em ingresso.`});
      if(growth>=25) alerts.push({kind:'ok',title:'Tendência positiva',text:`As visualizações cresceram ${pct(growth)} nos últimos 7 dias.`});
      const healthOk=health.filter(x=>x[1]).length, score=Math.round(healthOk/health.length*100);
      content.innerHTML=`
        <div class="bc-grid">
          <div class="bc-kpi"><b>${fmt(events.length)}</b><span>Eventos cadastrados</span></div>
          <div class="bc-kpi"><b>${fmt(published.length)}</b><span>Eventos publicados</span></div>
          <div class="bc-kpi"><b>${fmt(Object.values(gc).reduce((a,b)=>a+b,0))}</b><span>Fotos de galerias</span></div>
          <div class="bc-kpi"><b>${fmt(views)}</b><span>Visualizações</span></div>
        </div>
        <div class="bc-grid6">
          <div class="bc-kpi"><b>${fmt(sessions)}</b><span>Visitantes únicos</span></div>
          <div class="bc-kpi"><b>${fmt(tickets)}</b><span>Cliques em ingresso</span></div>
          <div class="bc-kpi"><b>${pct(ctr)}</b><span>CTR ingresso</span></div>
          <div class="bc-kpi"><b>${fmt(recentViews)}</b><span>Views · 7 dias</span></div>
          <div class="bc-kpi"><b>${growth>=0?'+':''}${pct(growth)}</b><span>Crescimento · 7 dias</span></div>
          <div class="bc-kpi"><b>${score}</b><span>Saúde do sistema</span></div>
        </div>
        <div class="bc-cols">
          <section class="bc-card"><h3>Próximo evento</h3>${upcoming?`<div class="bc-row"><div><strong>${esc(upcoming.name)}</strong><div class="bc-muted">${esc(upcoming.event_date)} · ${esc(upcoming.location||'Local não informado')}</div></div><span>${checkBadge(await validateEvent(upcoming,gc))}</span></div>`:'<div class="bc-muted">Nenhum evento futuro publicado.</div>'}</section>
          <section class="bc-card"><h3>Evento com maior interesse</h3>${top?`<div class="bc-row"><div><strong>${esc(top.e.name)}</strong><div class="bc-muted">${fmt(top.v)} views · ${fmt(top.t)} ingressos</div></div><strong>${pct(top.ctr)}</strong></div>`:'<div class="bc-muted">Ainda não há dados por evento.</div>'}</section>
        </div>
        <section class="bc-card"><h3>Saúde do Be-On</h3><div class="bc-health">${health.map(x=>`<div class="bc-health-item"><div><span class="bc-dot ${x[1]?'ok':'err'}"></span><b>${esc(x[0])}</b></div><div class="bc-muted" style="margin-top:5px">${esc(x[2])}</div></div>`).join('')}</div></section>
        <section class="bc-card"><div class="bc-head"><div><h3 style="margin:0">Alertas e recomendações</h3><div class="bc-sub">Gerados a partir do conteúdo e das métricas atuais.</div></div><span class="bc-badge ${alerts.some(a=>a.kind==='err')?'err':alerts.length?'warn':'ok'}">${alerts.length?fmt(alerts.length)+' alerta(s)':'✓ Nenhum alerta'}</span></div><div class="bc-list" style="margin-top:10px">${alerts.slice(0,10).map(a=>`<div class="bc-row bc-alert ${a.kind==='err'?'err':a.kind==='warn'?'warn':''}"><div><strong>${esc(a.title)}</strong><div class="bc-muted">${esc(a.text)}</div></div><span>${a.kind==='err'?'Crítico':a.kind==='warn'?'Atenção':'Info'}</span></div>`).join('')||'<div class="bc-muted">Tudo certo no momento. O sistema não detectou pendências relevantes.</div>'}</div></section>
        <section class="bc-card"><h3>Eventos com melhor performance</h3><table class="bc-table"><thead><tr><th>Evento</th><th>Views</th><th>Ingressos</th><th>CTR</th><th>Status</th></tr></thead><tbody>${eventStats.slice(0,8).map(x=>`<tr><td>${esc(x.e.name)}</td><td>${fmt(x.v)}</td><td>${fmt(x.t)}</td><td>${pct(x.ctr)}</td><td>${checkBadge(x.e.__checks||(x.e.__checks=await validateEvent(x.e,gc)))}</td></tr>`).join('')||'<tr><td colspan="5" class="bc-muted">Sem dados suficientes.</td></tr>'}</tbody></table></section>
        <section class="bc-card"><h3>Validação rápida</h3><div class="bc-list">${published.map(e=>`<div class="bc-row"><div><strong>${esc(e.name)}</strong><div class="bc-muted">${fmt(gc[e.id]||0)} fotos na galeria</div></div><div><span data-bcvalidate="${esc(e.id)}">${checkBadge(e.__checks||(e.__checks=validateEvent(e,gc)))}</span></div></div>`).join('')}</div></section>
      `;
      content.querySelectorAll('[data-bcvalidate]').forEach(el=>el.onclick=async()=>{const e=events.find(x=>x.id===el.dataset.bcvalidate);const checks=await validateEvent(e,gc);openValidation(e.name,checks);});
      loading.style.display='none'; content.style.display='grid';
      window.__beonCommandData={events,galleryCounts:gc,metrics,alerts,health,eventStats};
    }catch(e){ loading.className='bc-card bc-alert err'; loading.innerHTML=`Falha ao carregar o Command Center: ${esc(e?.message||'erro')}`; }
  }
  function latestMetricFresh(metrics){return !!metrics.at(-1)?.created_at && new Date(metrics.at(-1).created_at)>=daysAgo(1);}

  function setupCommandTab(){
    const tabs=document.querySelector('.tabs'); if(!tabs) return false; let btn=[...tabs.querySelectorAll('button')].find(b=>b.dataset.tab==='command'); if(!btn){btn=document.createElement('button');btn.dataset.tab='command';btn.textContent='⌂ Visão geral';tabs.insertBefore(btn,tabs.firstChild);} 
    if(btn.dataset.bcBound!=='1'){btn.dataset.bcBound='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));try{const s=JSON.parse(localStorage.getItem('beon-admin-ui-v2')||'{}');localStorage.setItem('beon-admin-ui-v2',JSON.stringify({...s,tab:'command',eventEditor:{open:false}}));}catch{} renderCommand();},true);} 
    return true;
  }

  function wrapEventEditorSave(){
    document.addEventListener('click',async e=>{
      const save=e.target?.closest?.('#save'); if(!save || !$('eventEditorBox')) return;
      const name=$('n')?.value.trim()||''; const date=$('d')?.value||''; const purchase=$('b')?.value.trim()||''; const image=$('i')?.value.trim()||''; const location=$('l')?.value.trim()||''; const artists=$('a')?.value.trim()||''; const desc=$('desc')?.value||''; const maps=$('m')?.value.trim()||'';
      const pseudo={name,event_date:date,purchase_url:purchase,image_url:image,location,artists,description:desc,source_url:maps,slug:slugify(name),published:$('p')?.value==='true',id:null};
      const checks=await validateEvent(pseudo,{}); const s=validationSummary(checks);
      if(s.errors){e.preventDefault();e.stopImmediatePropagation();openValidation('Validação antes de salvar',checks);return;}
      const status=$('formStatus');if(status)status.textContent=s.warnings?`Rascunho válido, com ${s.warnings} recomendação(ões).`:'Rascunho validado: tudo certo.';
    },true);
  }

  function watchEventRows(){
    const panel=$('panel');if(!panel)return; const obs=new MutationObserver(async()=>{
      if(!panel.querySelector('[data-edit]'))return;
      const rows=[...panel.querySelectorAll('.item')].filter(r=>!r.dataset.bcValidated); rows.forEach(r=>r.dataset.bcValidated='1');
      for(const row of rows){const id=row.querySelector('[data-edit]')?.dataset.edit;if(!id)continue;const edit=row.querySelector('[data-edit]');let validateBtn=document.createElement('button');validateBtn.className='bc-validate';validateBtn.textContent='Validar';edit.parentNode?.appendChild(validateBtn);validateBtn.onclick=async()=>{try{const er=await db.from('events').select('*').eq('id',id).maybeSingle();if(er.error)throw er.error;const gc=await getGalleryCounts([er.data]);openValidation(er.data.name,await validateEvent(er.data,gc,{publication:true}));}catch(err){openValidation('Validação', [{label:'Consulta do evento',ok:false,detail:err?.message||'Erro',severity:'error'}]);}};}
    }); obs.observe(panel,{childList:true,subtree:true});
  }

  function enhanceAnalytics(){
    const panel=$('panel'); if(!panel || !panel.querySelector('#beonAnalyticsKpis')) return false; if(panel.querySelector('.bc-analytics-extra')) return true; const source=window.__beonAnalyticsLast; if(!source?.data?.length) return false;
    const data=source.data||[],events=source.events||[]; const stats=events.map(e=>{const d=data.filter(x=>x.event_id===e.id),v=countMetric(d,'page_view'),t=countMetric(d,'ticket_click');return {e,v,t,ctr:v?t/v*100:0,shares:countMetric(d,'share_click')}}).filter(x=>x.v||x.t).sort((a,b)=>b.v-a.v);
    const totalV=countMetric(data,'page_view'),totalT=countMetric(data,'ticket_click'),overall=totalV?totalT/totalV*100:0;
    const card=document.createElement('section');card.className='bc-card bc-analytics-extra';card.innerHTML=`<div class="bc-analytics-head"><div><h3 style="margin:0">Performance e CTR por evento</h3><div class="bc-sub">Ranking por visualizações, cliques em ingresso e taxa de conversão para ingresso.</div></div><span class="bc-badge ok">CTR geral: ${pct(overall)}</span></div><div style="overflow:auto"><table class="bc-table" style="margin-top:8px"><thead><tr><th>#</th><th>Evento</th><th>Views</th><th>Ingressos</th><th>CTR</th><th>Compart.</th></tr></thead><tbody>${stats.slice(0,10).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.e?.name||'Evento')}</td><td>${fmt(x.v)}</td><td>${fmt(x.t)}</td><td>${pct(x.ctr)}</td><td>${fmt(x.shares)}</td></tr>`).join('')||'<tr><td colspan="6" class="bc-muted">Sem dados suficientes.</td></tr>'}</tbody></table></div>`;
    const existing=panel.querySelector('.analytics-wrap'); if(existing)existing.appendChild(card); else panel.appendChild(card); return true;
  }

  function init(){
    injectStyles(); setupCommandTab(); wrapEventEditorSave(); watchEventRows();
    const panel=$('panel'); if(panel){const observer=new MutationObserver(()=>{setupCommandTab(); enhanceAnalytics();});observer.observe(panel,{childList:true,subtree:true});}
    const timer=setInterval(()=>{setupCommandTab(); if(enhanceAnalytics()) clearInterval(timer);},300);setTimeout(()=>clearInterval(timer),15000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
