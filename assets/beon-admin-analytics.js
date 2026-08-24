(() => {
  const SB_URL='https://bellpluuhrrluwsgouob.supabase.co';
  const SB_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const db=window.supabase?.createClient?.(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  if(!db)return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
  const css=document.createElement('style');css.id='beon-admin-analytics-style';css.textContent=`
    .analytics-wrap{display:grid;gap:12px}
    .analytics-toolbar{display:grid;grid-template-columns:170px 1fr auto;gap:8px}
    .analytics-toolbar select,.analytics-toolbar button{padding:10px 12px;border-radius:10px;border:1px solid #ffffff18;background:#08060d;color:#fff}
    .analytics-toolbar .primary{background:#f5f0fa;color:#090711;border:0;font-weight:700}
    .analytics-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}
    .analytics-kpi{padding:13px;border:1px solid #ffffff12;border-radius:12px;background:#0b0812}
    .analytics-kpi b{font:30px 'Bebas Neue';display:block}.analytics-kpi span{font-size:10px;color:#a49ab5}
    .analytics-cols{display:grid;grid-template-columns:1.2fr .8fr;gap:10px}.analytics-card{padding:14px;border:1px solid #ffffff12;border-radius:14px;background:#0b0812}
    .analytics-card h3{margin:0 0 11px;font-size:13px}
    .analytics-bars{display:grid;gap:8px}.analytics-barrow{display:grid;grid-template-columns:170px 1fr 42px;gap:7px;align-items:center;font-size:11px}.analytics-bar{height:9px;border-radius:999px;background:#ffffff0b;overflow:hidden}.analytics-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#7c5cff,#ff2f92)}
    .analytics-list{display:grid;gap:7px}.analytics-list div{display:flex;justify-content:space-between;gap:10px;padding:9px;border:1px solid #ffffff10;border-radius:9px;font-size:11px}.analytics-list strong{color:#3fe0d0}
    .analytics-trend{display:grid;grid-template-columns:repeat(14,1fr);gap:5px;align-items:end;height:150px}.analytics-day{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%}.analytics-day i{display:block;width:100%;max-width:23px;min-height:2px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#ff2f92,#7c5cff)}.analytics-day span{font-size:8px;color:#a49ab5}
    .analytics-funnel{display:grid;gap:7px}.analytics-funnel div{display:grid;grid-template-columns:1fr 70px 50px;gap:8px;padding:8px;border:1px solid #ffffff10;border-radius:9px;font-size:11px}.analytics-funnel strong{color:#3fe0d0}
    .analytics-note{color:#a49ab5;font-size:10px}
    @media(max-width:900px){.analytics-kpis{grid-template-columns:repeat(3,1fr)}.analytics-cols{grid-template-columns:1fr}.analytics-toolbar{grid-template-columns:1fr}}
    @media(max-width:600px){.analytics-kpis{grid-template-columns:1fr 1fr}.analytics-barrow{grid-template-columns:110px 1fr 36px}.analytics-trend{gap:3px}}
  `;document.head.appendChild(css);

  let events=[];
  const daysAgo=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d;};
  async function loadEvents(){const r=await db.from('events').select('id,name,event_date,slug').order('event_date');if(!r.error)events=r.data||[];}
  async function loadData(){
    const range=$('beonAnalyticsRange')?.value||'30';
    const eventId=$('beonAnalyticsEvent')?.value||'all';
    const since=range==='all'?null:daysAgo(Number(range));
    let q=db.from('site_metrics').select('metric_type,event_id,created_at,source,session_id,path,referrer').like('metric_type','analytics_%').order('created_at',{ascending:true}).limit(10000);
    if(since)q=q.gte('created_at',since.toISOString());
    if(eventId!=='all')q=q.eq('event_id',eventId);
    const r=await q;if(r.error)throw r.error;return r.data||[];
  }
  function currentEventsHtml(){return '<option value="all">Todos os eventos</option>'+events.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('');}
  function render(data){
    const count=t=>data.filter(x=>x.metric_type===t).length;
    const sessions=new Set(data.map(x=>x.session_id).filter(Boolean)).size;
    $('beonAnalyticsKpis').innerHTML=[['Visitas',count('analytics_page_view')],['Visitantes únicos',sessions],['Ingressos',count('analytics_ticket_click')],['Favoritos',count('analytics_favorite_click')],['Compartilhamentos',count('analytics_share_click')],['Buscas',count('analytics_search')]].map(([l,v])=>`<div class="analytics-kpi"><b>${fmt(v)}</b><span>${l}</span></div>`).join('');
    const range=$('beonAnalyticsRange').value;const n=range==='all'?14:Number(range);const totalDays=Math.min(14,n);const map={};data.filter(x=>x.metric_type==='analytics_page_view').forEach(x=>{const k=x.created_at.slice(0,10);map[k]=(map[k]||0)+1});const keys=[];for(let i=totalDays-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);keys.push(d.toISOString().slice(0,10));}const max=Math.max(1,...keys.map(k=>map[k]||0));$('beonAnalyticsTrend').innerHTML=keys.map(k=>`<div class="analytics-day" title="${k}: ${map[k]||0}"><i style="height:${Math.max(3,((map[k]||0)/max)*115)}px"></i><span>${k.slice(8)}</span></div>`).join('');
    const base=Math.max(1,count('analytics_page_view'));const funnel=[['Visitas','analytics_page_view'],['Cliques em ingresso','analytics_ticket_click'],['Favoritos','analytics_favorite_click'],['Compartilhamentos','analytics_share_click']];$('beonAnalyticsFunnel').innerHTML=funnel.map(([l,t])=>`<div><span>${l}</span><strong>${fmt(count(t))}</strong><span>${Math.round(count(t)/base*100)}%</span></div>`).join('');
    const evmap={};data.filter(x=>x.event_id&&x.metric_type==='analytics_page_view').forEach(x=>{evmap[x.event_id]=(evmap[x.event_id]||0)+1});const ranked=Object.entries(evmap).sort((a,b)=>b[1]-a[1]).slice(0,6),maxE=Math.max(1,...ranked.map(x=>x[1]));$('beonAnalyticsEvents').innerHTML=ranked.map(([id,v])=>{const e=events.find(e=>e.id===id);return `<div class="analytics-barrow"><span>${esc(e?.name||'Evento')}</span><div class="analytics-bar"><i style="width:${(v/maxE)*100}%"></i></div><strong>${fmt(v)}</strong></div>`}).join('')||'<div class="analytics-note">Sem dados ainda.</div>';
    const src={};data.forEach(x=>{const k=x.source||'Direto / orgânico';src[k]=(src[k]||0)+1});const sr=Object.entries(src).sort((a,b)=>b[1]-a[1]).slice(0,8),maxS=Math.max(1,...sr.map(x=>x[1]));$('beonAnalyticsSources').innerHTML=sr.map(([k,v])=>`<div class="analytics-barrow"><span>${esc(k)}</span><div class="analytics-bar"><i style="width:${(v/maxS)*100}%"></i></div><strong>${fmt(v)}</strong></div>`).join('')||'<div class="analytics-note">Sem dados ainda.</div>';
    const interactions=[['Mapa','analytics_map_click'],['WhatsApp','analytics_whatsapp_click'],['Instagram','analytics_instagram_click'],['Compartilhar','analytics_share_click'],['Pesquisa','analytics_search']];$('beonAnalyticsInteractions').innerHTML=interactions.map(([l,t])=>`<div><span>${l}</span><strong>${fmt(count(t))}</strong></div>`).join('');
    const cut7=Date.now()-7*86400000,cut14=Date.now()-14*86400000,a={},b={};data.filter(x=>x.event_id&&x.metric_type==='analytics_page_view').forEach(x=>{const t=new Date(x.created_at).getTime();if(t>=cut7)a[x.event_id]=(a[x.event_id]||0)+1;else if(t>=cut14)b[x.event_id]=(b[x.event_id]||0)+1;});const rising=Object.keys(a).map(id=>({id,g:(a[id]||0)-(b[id]||0)})).sort((x,y)=>y.g-x.g).slice(0,5);$('beonAnalyticsRising').innerHTML=rising.map(x=>{const e=events.find(e=>e.id===x.id);return `<div><span>${esc(e?.name||'Evento')}</span><strong>${x.g>=0?'+':''}${x.g}</strong></div>`}).join('')||'<div class="analytics-note">Sem dados suficientes.</div>';
    $('beonAnalyticsStatus').textContent=`Atualizado em ${new Date().toLocaleString('pt-BR')} · ${data.length} registros analisados`;
    window.__beonAnalyticsLast={data,events,range,eventId:$('beonAnalyticsEvent').value};
  }
  async function refresh(){try{const data=await loadData();render(data);}catch(e){$('beonAnalyticsStatus').textContent='Erro ao carregar métricas: '+(e?.message||'erro');}}
  async function ensureXlsx(){if(window.XLSX)return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  async function report(){const b=$('beonAnalyticsReport');b.disabled=true;b.textContent='Gerando…';try{await ensureXlsx();const {data,events}=window.__beonAnalyticsLast||{data:[],events:[]};const count=t=>data.filter(x=>x.metric_type===t).length;const names={};events.forEach(e=>names[e.id]=e.name);const resumo=[['Indicador','Valor'],['Visitas',count('analytics_page_view')],['Visitantes únicos',new Set(data.map(x=>x.session_id).filter(Boolean)).size],['Cliques em ingresso',count('analytics_ticket_click')],['Favoritos',count('analytics_favorite_click')],['Compartilhamentos',count('analytics_share_click')],['Buscas',count('analytics_search')]];
 const diario={};data.filter(x=>x.metric_type==='analytics_page_view').forEach(x=>{const k=x.created_at.slice(0,10);diario[k]=(diario[k]||0)+1});const diarios=Object.entries(diario).sort().map(([dia,visitas])=>({Data:dia,Visitas:visitas}));
 const evMap={};data.filter(x=>x.event_id).forEach(x=>{const key=x.event_id;evMap[key]??={Evento:names[key]||key,Visualizacoes:0,Ingressos:0,Favoritos:0,Compartilhamentos:0,Buscas:0};const m=x.metric_type;if(m==='analytics_page_view')evMap[key].Visualizacoes++;if(m==='analytics_ticket_click')evMap[key].Ingressos++;if(m==='analytics_favorite_click')evMap[key].Favoritos++;if(m==='analytics_share_click')evMap[key].Compartilhamentos++;if(m==='analytics_search')evMap[key].Buscas++;});
 const eventos=Object.values(evMap).sort((a,b)=>b.Visualizacoes-a.Visualizacoes);
 const src={};data.forEach(x=>{const k=x.source||'Direto / orgânico';src[k]=(src[k]||0)+1});const origens=Object.entries(src).sort((a,b)=>b[1]-a[1]).map(([Origem,Interacoes])=>({Origem,Interacoes}));
 const interacoes=[['Mapa',count('analytics_map_click')],['WhatsApp',count('analytics_whatsapp_click')],['Instagram',count('analytics_instagram_click')],['Compartilhar',count('analytics_share_click')],['Pesquisa',count('analytics_search')]].map(([Interacao,Quantidade])=>({Interacao,Quantidade}));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(resumo),'Resumo');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(eventos),'Eventos');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(diarios),'Diario');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(origens),'Origens');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(interacoes),'Interacoes');XLSX.writeFile(wb,`BeOn-Analytics-${new Date().toISOString().slice(0,10)}.xlsx`);
 }catch(e){alert('Não foi possível gerar o relatório: '+(e?.message||'erro'));}finally{b.disabled=false;b.textContent='📊 Gerar relatório Excel';}}
  async function showAnalytics(){
    $('panel').innerHTML=`<div class="analytics-wrap"><div class="row" style="justify-content:space-between"><div><h2 style="margin:0">Analytics</h2><div id="beonAnalyticsStatus" class="muted">Carregando…</div></div><button id="beonAnalyticsReport" class="primary">📊 Gerar relatório Excel</button></div><div class="analytics-toolbar"><select id="beonAnalyticsRange"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Desde o início</option></select><select id="beonAnalyticsEvent"><option value="all">Todos os eventos</option></select><button id="beonAnalyticsRefresh">Atualizar</button></div><div id="beonAnalyticsKpis" class="analytics-kpis"></div><div class="analytics-cols"><section class="analytics-card"><h3>Visualizações por dia</h3><div id="beonAnalyticsTrend" class="analytics-trend"></div></section><section class="analytics-card"><h3>Funil de conversão</h3><div id="beonAnalyticsFunnel" class="analytics-funnel"></div></section></div><div class="analytics-cols"><section class="analytics-card"><h3>Eventos com maior interesse</h3><div id="beonAnalyticsEvents" class="analytics-bars"></div></section><section class="analytics-card"><h3>Origem dos acessos</h3><div id="beonAnalyticsSources" class="analytics-bars"></div></section></div><div class="analytics-cols"><section class="analytics-card"><h3>Eventos em alta</h3><div id="beonAnalyticsRising" class="analytics-list"></div></section><section class="analytics-card"><h3>Interações</h3><div id="beonAnalyticsInteractions" class="analytics-list"></div></section></div><div class="analytics-note">As métricas são agregadas e usam identificador de sessão local; não coletamos endereço IP. O relatório Excel é gerado no seu navegador com os dados do filtro selecionado.</div></div>`;
    await loadEvents();$('beonAnalyticsEvent').innerHTML=currentEventsHtml();$('beonAnalyticsEvent').onchange=refresh;$('beonAnalyticsRange').onchange=refresh;$('beonAnalyticsRefresh').onclick=refresh;$('beonAnalyticsReport').onclick=report;await refresh();
  }
  window.showMetrics=showAnalytics;
  const tabBtn=[...document.querySelectorAll('.tabs button')].find(b=>b.dataset.tab==='metrics');if(tabBtn){tabBtn.textContent='📊 Analytics';tabBtn.title='Dashboard de dados e relatório Excel';}
})();
