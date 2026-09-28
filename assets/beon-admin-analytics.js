(() => {
  const SB_URL='https://bellpluuhrrluwsgouob.supabase.co',SB_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const db=window.supabase?.createClient?.(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}}); if(!db)return;
  const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])), fmt=n=>new Intl.NumberFormat('pt-BR').format(Number(n)||0), pct=n=>Number.isFinite(n)?n.toLocaleString('pt-BR',{maximumFractionDigits:1})+'%':'0%';
  const css=document.createElement('style');css.textContent=`
    .analytics-wrap{display:grid;gap:12px}.analytics-toolbar{display:grid;grid-template-columns:170px 1fr auto;gap:8px}
    .analytics-toolbar select,.analytics-toolbar button{padding:10px 12px;border-radius:10px;border:1px solid #ffffff18;background:#08060d;color:#fff}
    .analytics-toolbar .primary{background:#f5f0fa;color:#090711;border:0;font-weight:700}
    .analytics-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}.analytics-kpi{padding:13px;border:1px solid #ffffff12;border-radius:12px;background:#0b0812}
    .analytics-kpi b{font:30px 'Bebas Neue';display:block}.analytics-kpi span{font-size:10px;color:#a49ab5}
    .analytics-cols{display:grid;grid-template-columns:1.2fr .8fr;gap:10px}.analytics-card{padding:14px;border:1px solid #ffffff12;border-radius:14px;background:#0b0812}.analytics-card h3{margin:0 0 11px;font-size:13px}
    .analytics-bars,.analytics-list,.analytics-funnel{display:grid;gap:8px}.analytics-barrow{display:grid;grid-template-columns:170px 1fr 58px;gap:7px;align-items:center;font-size:11px}
    .analytics-bar{height:9px;border-radius:999px;background:#ffffff0b;overflow:hidden}.analytics-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#7c5cff,#ff2f92)}
    .analytics-list div,.analytics-funnel div{display:flex;justify-content:space-between;gap:10px;padding:9px;border:1px solid #ffffff10;border-radius:9px;font-size:11px}.analytics-list strong,.analytics-funnel strong{color:#3fe0d0}
    .analytics-trend{display:grid;grid-template-columns:repeat(14,1fr);gap:5px;align-items:end;height:150px}.analytics-day{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%}
    .analytics-day i{display:block;width:100%;max-width:23px;min-height:2px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#ff2f92,#7c5cff)}.analytics-day span{font-size:8px;color:#a49ab5}
    .analytics-note{color:#a49ab5;font-size:10px}.analytics-table{width:100%;border-collapse:collapse;font-size:11px}.analytics-table th,.analytics-table td{padding:9px 7px;border-bottom:1px solid #ffffff0d;text-align:left}
    .analytics-table th{color:#a49ab5;font-size:10px;font-weight:600}.analytics-table td.num{text-align:right}
    @media(max-width:900px){.analytics-kpis{grid-template-columns:repeat(3,1fr)}.analytics-cols{grid-template-columns:1fr}.analytics-toolbar{grid-template-columns:1fr}}
    @media(max-width:600px){.analytics-kpis{grid-template-columns:1fr 1fr}.analytics-barrow{grid-template-columns:110px 1fr 50px}.analytics-trend{gap:3px}.analytics-table{font-size:10px}}
  `;document.head.appendChild(css);
  let events=[];const daysAgo=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d};const localKey=d=>{const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
  const eventName=id=>events.find(e=>e.id===id)?.name||'Evento';const count=(data,type)=>data.filter(x=>x.metric_type===type).length;
  const eventViews=data=>data.filter(x=>x.metric_type==='analytics_page_view'&&x.event_id);const ticketClicks=data=>data.filter(x=>x.metric_type==='analytics_ticket_click');
  async function loadEvents(){const r=await db.from('events').select('id,name,event_date,slug').order('event_date');if(!r.error)events=r.data||[]}
  function extractEventSlug(row){
    const text=`${row.path||''} ${row.referrer||''}`;
    const m=text.match(/[?&]event=([^&#]+)/i)||text.match(/\/eventos\/([a-z0-9-]+)\.html/i);
    return m?decodeURIComponent(m[1]):null;
  }
  function inferEventId(row){
    if(row.event_id)return row.event_id;
    const slug=extractEventSlug(row);
    if(!slug)return null;
    return events.find(e=>e.slug===slug)?.id||null;
  }
  function canonicalRow(row){
    const eid= inferEventId(row);
    if(eid)return 'event:'+eid;
    try{
      const u=new URL(row.path||'','https://beon.local');
      return 'page:'+u.pathname;
    }catch{return 'page:'+(row.path||'').split('?')[0];}
  }
  function isSameRecordedAction(a,b,maxSeconds=10){
    if(!a||!b)return false;
    if(canonicalRow(a)!==canonicalRow(b))return false;
    return Math.abs(new Date(a.created_at).getTime()-new Date(b.created_at).getTime())<=maxSeconds*1000;
  }
  function mergeRows(legacyRows,v2Rows){
    const merged=[...legacyRows];
    v2Rows.forEach(row=>{
      if(!merged.some(old=>isSameRecordedAction(old,row)))merged.push(row);
    });
    return merged;
  }
  function sourceFromRow(row){
    if(row.source)return row.source;
    try{
      const u=new URL(row.path||'','https://beon.local');
      return u.searchParams.get('utm_source')||'Direto / orgânico';
    }catch{return 'Direto / orgânico';}
  }
  async function loadData(){
    const range=$('beonAnalyticsRange')?.value||'all';
    const since=range==='all'?null:daysAgo(Number(range));
    let q=db.from('site_metrics').select('id,metric_type,event_id,created_at,source,medium,campaign,content,placement,action,session_id,visitor_id,path,referrer,user_agent').order('created_at',{ascending:true}).limit(50000);
    if(since)q=q.gte('created_at',since.toISOString());
    const r=await q;if(r.error)throw r.error;
    return (r.data||[]).filter(x=>!(x.path||'').includes('admin=1'));
  }
  function buildModel(rows){
    const legacyPage=rows.filter(x=>x.metric_type==='page_view');
    const legacyEvent=rows.filter(x=>x.metric_type==='event_view');
    const legacyTickets=rows.filter(x=>x.metric_type==='ticket_click');
    const v2Page=rows.filter(x=>x.metric_type==='analytics_page_view');
    const v2Tickets=rows.filter(x=>x.metric_type==='analytics_ticket_click');

    const unifiedPage=mergeRows(legacyPage,v2Page.filter(x=>!x.event_id));
    const unifiedEvent=mergeRows(legacyEvent,v2Page.filter(x=>inferEventId(x)));
    const unifiedViews=[...unifiedPage,...unifiedEvent];

    const unifiedTickets=mergeRows(legacyTickets,v2Tickets);
    const identifiedRows=rows.filter(x=>x.visitor_id);
    const visitors=new Set(identifiedRows.map(x=>x.visitor_id)).size;
    const sessions=new Set(identifiedRows.map(x=>x.session_id).filter(Boolean)).size;
    const favorites=rows.filter(x=>x.metric_type==='analytics_favorite_click'&&x.action==='add');
    const shares=rows.filter(x=>x.metric_type==='analytics_share_click');
    const maps=rows.filter(x=>x.metric_type==='analytics_map_click');
    const whatsapp=rows.filter(x=>x.metric_type==='analytics_whatsapp_click');
    const instagram=rows.filter(x=>x.metric_type==='analytics_instagram_click');
    const searches=rows.filter(x=>x.metric_type==='analytics_search');

    const byEvent={};
    events.forEach(e=>byEvent[e.id]={name:e.name,views:0,tickets:0,favorites:0,shares:0,maps:0});
    unifiedEvent.forEach(x=>{const id=inferEventId(x);if(id&&byEvent[id])byEvent[id].views++});
    unifiedTickets.forEach(x=>{const id=inferEventId(x);if(id&&byEvent[id])byEvent[id].tickets++});
    favorites.forEach(x=>{const id=inferEventId(x);if(id&&byEvent[id])byEvent[id].favorites++});
    shares.forEach(x=>{const id=inferEventId(x);if(id&&byEvent[id])byEvent[id].shares++});
    maps.forEach(x=>{const id=inferEventId(x);if(id&&byEvent[id])byEvent[id].maps++});
    const eventRows=Object.entries(byEvent).map(([id,v])=>({id,...v})).filter(x=>x.views||x.tickets||x.favorites||x.shares||x.maps).sort((a,b)=>b.views-a.views);

    const sources={};
    unifiedViews.forEach(x=>{const k=sourceFromRow(x);sources[k]=(sources[k]||0)+1});

    return {
      rows,views:unifiedViews,pageViews:unifiedPage,eventViews:unifiedEvent,tickets:unifiedTickets,
      visitors,sessions,favorites,shares,maps,whatsapp,instagram,searches,eventRows,sources,
      legacy:{page:legacyPage.length,event:legacyEvent.length,tickets:legacyTickets.length},
      v2:{page:v2Page.length,tickets:v2Tickets.length}
    };
  }
  function applyEventFilter(model){
    const eventId=$('beonAnalyticsEvent')?.value||'all';
    if(eventId==='all')return model;
    const keep=x=>inferEventId(x)===eventId;
    return {
      ...model,
      views:model.views.filter(keep),
      pageViews:model.pageViews.filter(keep),
      eventViews:model.eventViews.filter(keep),
      tickets:model.tickets.filter(keep),
      favorites:model.favorites.filter(keep),
      shares:model.shares.filter(keep),
      maps:model.maps.filter(keep),
      whatsapp:model.whatsapp.filter(keep),
      instagram:model.instagram.filter(keep),
      searches:model.searches.filter(keep),
      eventRows:model.eventRows.filter(x=>x.id===eventId)
    };
  }
  function render(rows){
    const base=buildModel(rows),data=applyEventFilter(base);
    const ticketCtr=data.eventViews.length?data.tickets.length/data.eventViews.length*100:0;
    const visitorLabel=data.visitors?fmt(data.visitors):'—',sessionLabel=data.sessions?fmt(data.sessions):'—';
    $('beonAnalyticsKpis').innerHTML=[
      ['Visualizações',data.views.length],['Visitantes únicos',visitorLabel],['Sessões',sessionLabel],
      ['Acessos a eventos',data.eventViews.length],['Cliques em ingresso',data.tickets.length],['CTR de ingresso',pct(ticketCtr)]
    ].map(([l,v])=>`<div class="analytics-kpi"><b>${typeof v==='string'?v:fmt(v)}</b><span>${l}</span></div>`).join('');

    const range=$('beonAnalyticsRange').value,totalDays=Math.min(14,range==='all'?14:Number(range)),map={};
    data.views.forEach(x=>{const k=localKey(new Date(x.created_at));map[k]=(map[k]||0)+1});
    const keys=[];for(let i=totalDays-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);keys.push(localKey(d))}
    const max=Math.max(1,...keys.map(k=>map[k]||0));
    $('beonAnalyticsTrend').innerHTML=keys.map(k=>`<div class="analytics-day" title="${k}: ${map[k]||0}"><i style="height:${Math.max(3,((map[k]||0)/max)*115)}px"></i><span>${k.slice(8)}</span></div>`).join('');

    const favs=data.favorites.length,shares=data.shares.length;
    const eventBase=data.eventViews.length||1;
    $('beonAnalyticsFunnel').innerHTML=[
      ['Visualizações de eventos',data.eventViews.length,'100%'],
      ['Cliques em ingresso',data.tickets.length,pct(data.tickets.length/eventBase*100)],
      ['Favoritos',favs,pct(favs/eventBase*100)],
      ['Compartilhamentos',shares,pct(shares/eventBase*100)]
    ].map(([l,v,p])=>`<div><span>${l}</span><strong>${fmt(v)}</strong><span>${p}</span></div>`).join('');

    const rowsE=data.eventRows,maxE=Math.max(1,...rowsE.map(x=>x.views));
    $('beonAnalyticsEvents').innerHTML=rowsE.length
      ?rowsE.slice(0,8).map(x=>`<div class="analytics-barrow"><span>${esc(x.name)}</span><div class="analytics-bar"><i style="width:${(x.views/maxE)*100}%"></i></div><strong>${fmt(x.views)} · ${pct(x.views?x.tickets/x.views*100:0)}</strong></div>`).join('')
      :'<div class="analytics-note">Sem acessos de eventos no período.</div>';

    const sr=Object.entries(data.sources).sort((a,b)=>b[1]-a[1]).slice(0,8),maxS=Math.max(1,...sr.map(x=>x[1]));
    $('beonAnalyticsSources').innerHTML=sr.length?sr.map(([k,v])=>`<div class="analytics-barrow"><span>${esc(k)}</span><div class="analytics-bar"><i style="width:${(v/maxS)*100}%"></i></div><strong>${fmt(v)}</strong></div>`).join(''):'<div class="analytics-note">Sem origem identificável.</div>';

    const interactionRows=[['Mapa',data.maps.length],['WhatsApp',data.whatsapp.length],['Instagram',data.instagram.length],['Compartilhar',data.shares.length],['Pesquisa',data.searches.length]];
    $('beonAnalyticsInteractions').innerHTML=interactionRows.map(([l,v])=>`<div><span>${l}</span><strong>${v?fmt(v):'—'}</strong></div>`).join('');

    const cut7=Date.now()-7*86400000,cut14=Date.now()-14*86400000,a={},b={};
    data.eventViews.forEach(x=>{const t=new Date(x.created_at).getTime(),id=inferEventId(x);if(!id)return;if(t>=cut7)a[id]=(a[id]||0)+1;else if(t>=cut14)b[id]=(b[id]||0)+1});
    const rising=Object.keys(a).map(id=>({id,g:(a[id]||0)-(b[id]||0),now:a[id]||0,prev:b[id]||0})).sort((x,y)=>y.g-x.g).slice(0,5);
    $('beonAnalyticsRising').innerHTML=rising.length?rising.map(x=>`<div><span>${esc(eventName(x.id))}</span><strong>${x.g>=0?'+':''}${fmt(x.g)} views</strong></div>`).join(''):'<div class="analytics-note">Sem dados suficientes.</div>';

    $('beonAnalyticsEventTable').innerHTML=rowsE.length?`<table class="analytics-table"><thead><tr><th>Evento</th><th class="num">Visualizações</th><th class="num">Ingressos</th><th class="num">CTR</th><th class="num">Fav.</th><th class="num">Shares</th><th class="num">Maps</th></tr></thead><tbody>${rowsE.map(x=>`<tr><td>${esc(x.name)}</td><td class="num">${fmt(x.views)}</td><td class="num">${fmt(x.tickets)}</td><td class="num">${pct(x.views?x.tickets/x.views*100:0)}</td><td class="num">${fmt(x.favorites)}</td><td class="num">${fmt(x.shares)}</td><td class="num">${fmt(x.maps)}</td></tr>`).join('')}</tbody></table>`:'<div class="analytics-note">Nenhum evento com dados no período.</div>';

    $('beonAnalyticsStatus').textContent=`Atualizado em ${new Date().toLocaleString('pt-BR')} · ${fmt(data.views.length)} visualizações unificadas · ${fmt(data.tickets.length)} cliques em ingresso`;
    window.__beonAnalyticsLast={model:base,filtered:data,events};
  }
  async function refresh(){try{render(await loadData())}catch(e){$('beonAnalyticsStatus').textContent='Erro ao carregar métricas: '+(e?.message||'erro)'}}
  async function ensureXlsx(){if(window.XLSX)return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  async function report(){
    const b=$('beonAnalyticsReport');b.disabled=true;b.textContent='Gerando…';
    try{
      await ensureXlsx();const {data,events}=window.__beonAnalyticsLast||{data:[],events:[]};const views=eventViews(data),tickets=ticketClicks(data);
      const resumo=[['Indicador','Valor'],['Visualizações',count(data,'analytics_page_view')],['Visitantes únicos',new Set(data.map(x=>x.visitor_id).filter(Boolean)).size],['Sessões',new Set(data.map(x=>x.session_id).filter(Boolean)).size],['Acessos a eventos',views.length],['Cliques em ingresso',tickets.length],['CTR de ingresso',views.length?((tickets.length/views.length)*100).toFixed(1)+'%':'0%'],['Favoritos (adicionar)',data.filter(x=>x.metric_type==='analytics_favorite_click'&&x.action==='add').length],['Compartilhamentos',count(data,'analytics_share_click')],['Mapas',count(data,'analytics_map_click')],['WhatsApp',count(data,'analytics_whatsapp_click')],['Instagram',count(data,'analytics_instagram_click')],['Buscas',count(data,'analytics_search')]];
      const ev={};events.forEach(e=>ev[e.id]={Evento:e.name,Visualizacoes:0,Ingressos:0,CTR:'0%',Favoritos:0,Compartilhamentos:0,Maps:0});
      data.forEach(x=>{if(!x.event_id||!ev[x.event_id])return;if(x.metric_type==='analytics_page_view')ev[x.event_id].Visualizacoes++;if(x.metric_type==='analytics_ticket_click')ev[x.event_id].Ingressos++;if(x.metric_type==='analytics_favorite_click'&&x.action==='add')ev[x.event_id].Favoritos++;if(x.metric_type==='analytics_share_click')ev[x.event_id].Compartilhamentos++;if(x.metric_type==='analytics_map_click')ev[x.event_id].Maps++});
      Object.values(ev).forEach(x=>x.CTR=x.Visualizacoes?((x.Ingressos/x.Visualizacoes)*100).toFixed(1)+'%':'0%');
      const diario={};data.filter(x=>x.metric_type==='analytics_page_view').forEach(x=>{const k=x.created_at.slice(0,10);diario[k]=(diario[k]||0)+1});
      const diarios=Object.entries(diario).sort().map(([Data,Visualizacoes])=>({Data,Visualizacoes}));
      const src={};data.filter(x=>x.metric_type==='analytics_page_view').forEach(x=>{const k=x.source||'Direto / orgânico';src[k]=(src[k]||0)+1});
      const origens=Object.entries(src).sort((a,b)=>b[1]-a[1]).map(([Origem,Visualizacoes])=>({Origem,Visualizacoes}));
      const interacoes=[['Mapa','analytics_map_click'],['WhatsApp','analytics_whatsapp_click'],['Instagram','analytics_instagram_click'],['Compartilhar','analytics_share_click'],['Pesquisa','analytics_search']].map(([Interacao,Quantidade])=>({Interacao,Quantidade:count(data,Quantidade)}));
      const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(resumo),'Resumo');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(Object.values(ev)),'Eventos');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(diarios),'Diario');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(origens),'Origens');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(interacoes),'Interacoes');XLSX.writeFile(wb,`BeOn-Analytics-V2-${new Date().toISOString().slice(0,10)}.xlsx`);
    }catch(e){alert('Não foi possível gerar o relatório: '+(e?.message||'erro'))}finally{b.disabled=false;b.textContent='📊 Gerar relatório Excel'}
  }
  async function showAnalytics(){
    $('panel').innerHTML=`<div class="analytics-wrap"><div class="row" style="justify-content:space-between"><div><h2 style="margin:0">Analytics</h2><div id="beonAnalyticsStatus" class="muted">Carregando…</div></div><button id="beonAnalyticsReport" class="primary">📊 Gerar relatório Excel</button></div>
    <div class="analytics-toolbar"><select id="beonAnalyticsRange"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Desde o início</option></select><select id="beonAnalyticsEvent"><option value="all">Todos os eventos</option></select><button id="beonAnalyticsRefresh">Atualizar</button></div>
    <div id="beonAnalyticsKpis" class="analytics-kpis"></div><div class="analytics-cols"><section class="analytics-card"><h3>Visualizações por dia</h3><div id="beonAnalyticsTrend" class="analytics-trend"></div></section><section class="analytics-card"><h3>Funil</h3><div id="beonAnalyticsFunnel" class="analytics-funnel"></div></section></div>
    <div class="analytics-cols"><section class="analytics-card"><h3>Eventos com maior interesse</h3><div id="beonAnalyticsEvents" class="analytics-bars"></div></section><section class="analytics-card"><h3>Origem das visualizações</h3><div id="beonAnalyticsSources" class="analytics-bars"></div></section></div>
    <div class="analytics-cols"><section class="analytics-card"><h3>Eventos em alta</h3><div id="beonAnalyticsRising" class="analytics-list"></div></section><section class="analytics-card"><h3>Interações</h3><div id="beonAnalyticsInteractions" class="analytics-list"></div></section></div>
    <section class="analytics-card"><h3>Desempenho por evento</h3><div id="beonAnalyticsEventTable"></div></section>
    <div class="analytics-note">O dashboard usa somente registros Analytics V2 padronizados (visitor_id preenchido). Os dados legados permanecem no banco e não são somados aos KPIs.</div></div>`;
    await loadEvents();$('beonAnalyticsEvent').innerHTML='<option value="all">Todos os eventos</option>'+events.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('');
    $('beonAnalyticsEvent').onchange=refresh;$('beonAnalyticsRange').onchange=refresh;$('beonAnalyticsRefresh').onclick=refresh;$('beonAnalyticsReport').onclick=report;await refresh();
  }
  window.showMetrics=showAnalytics;const tabBtn=[...document.querySelectorAll('.tabs button')].find(b=>b.dataset.tab==='metrics');if(tabBtn){tabBtn.textContent='📊 Analytics';tabBtn.title='Dashboard de Analytics V2 e relatório Excel'}
})();