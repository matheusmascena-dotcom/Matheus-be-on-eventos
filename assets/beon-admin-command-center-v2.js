(() => {
  const SB_URL='https://bellpluuhrrluwsgouob.supabase.co';
  const SB_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const db=window.supabase?.createClient?.(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  if(!db)return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>new Intl.NumberFormat('pt-BR').format(Number(n)||0);
  const pct=n=>`${(Number(n)||0).toFixed(1).replace('.',',')}%`;
  const ago=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d;};
  const validUrl=v=>{try{const u=new URL(v);return /^https?:$/.test(u.protocol)}catch{return false}};
  const validMaps=v=>/(google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(String(v||''));
  const aliases={page_view:['page_view','analytics_page_view'],ticket_click:['ticket_click','analytics_ticket_click'],favorite:['favorite_toggle','analytics_favorite_click'],share:['analytics_share_click'],search:['analytics_search']};
  const has=(r,k)=>aliases[k]?.includes(r.metric_type);
  const count=(d,k)=>d.filter(r=>has(r,k)).length;

  function styles(){
    if($('bc2-styles'))return;
    const s=document.createElement('style');s.id='bc2-styles';s.textContent=`
      .bc2{display:grid;gap:12px}.bc2-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.bc2-grid6{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}.bc2-kpi,.bc2-card{padding:14px;border:1px solid #ffffff12;border-radius:14px;background:#0b0812}.bc2-kpi b{font:32px 'Bebas Neue';display:block}.bc2-kpi span,.bc2-sub{font-size:10px;color:#a49ab5}.bc2-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.bc2-title{margin:0;font-size:24px}.bc2-cols{display:grid;grid-template-columns:1.1fr .9fr;gap:10px}.bc2-list{display:grid;gap:8px}.bc2-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px;border:1px solid #ffffff0f;border-radius:10px;font-size:11px}.bc2-row strong{color:#3fe0d0}.bc2-ok{color:#3fe0d0}.bc2-warn{color:#ffd36b}.bc2-err{color:#ff7cae}.bc2-badge{display:inline-flex;padding:4px 7px;border-radius:999px;border:1px solid #ffffff14;font-size:10px}.bc2-badge.ok{color:#3fe0d0}.bc2-badge.warn{color:#ffd36b}.bc2-badge.err{color:#ff7cae}.bc2-health{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.bc2-health-item{padding:10px;border:1px solid #ffffff0f;border-radius:10px}.bc2-dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px}.bc2-dot.ok{background:#3fe0d0}.bc2-dot.err{background:#ff7cae}.bc2-table{width:100%;border-collapse:collapse;font-size:11px}.bc2-table th,.bc2-table td{padding:8px 6px;border-bottom:1px solid #ffffff0d;text-align:left}.bc2-table th{font-size:9px;color:#a49ab5;text-transform:uppercase;letter-spacing:.08em}.bc2-modal{position:fixed;inset:0;background:#000b;display:none;align-items:center;justify-content:center;padding:18px;z-index:99999}.bc2-modal.open{display:flex}.bc2-modal-box{width:min(680px,100%);max-height:85vh;overflow:auto;background:#100b17;border:1px solid #ffffff1c;border-radius:18px;padding:18px}.bc2-check{display:flex;gap:8px;padding:9px 0;border-bottom:1px solid #ffffff0d;font-size:11px}.bc2-check:last-child{border-bottom:0}.bc2-check small{display:block;color:#a49ab5}.bc2-analytics-extra{margin-top:12px}.bc2-validate{margin-left:6px}
      @media(max-width:1050px){.bc2-grid6{grid-template-columns:repeat(3,1fr)}.bc2-health{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:820px){.bc2-grid{grid-template-columns:repeat(2,1fr)}.bc2-cols{grid-template-columns:1fr}}
      @media(max-width:560px){.bc2-grid,.bc2-grid6,.bc2-health{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(s);
  }

  async function getEvents(){const r=await db.from('events').select('*').order('event_date');if(r.error)throw r.error;return r.data||[];}
  async function getMetrics(){const r=await db.from('site_metrics').select('metric_type,event_id,created_at,source,session_id,path,referrer').order('created_at',{ascending:true}).limit(10000);if(r.error)throw r.error;return r.data||[];}
  async function getGalleryCounts(events){if(!events.length)return{};const ids=events.map(e=>e.id);const r=await db.from('event_gallery_photos').select('event_id').in('event_id',ids);if(r.error)throw r.error;const out={};(r.data||[]).forEach(x=>out[x.event_id]=(out[x.event_id]||0)+1);return out;}

  function validation(event,galleries={},publication=false){
    const c=[];const add=(label,ok,detail,severity='warn')=>c.push({label,ok,detail,severity});
    add('Nome',!!String(event?.name||'').trim(),'Obrigatório','error');
    add('Data',/^\d{4}-\d{2}-\d{2}$/.test(event?.event_date||''),'Data válida','error');
    add('Link de compra',validUrl(event?.purchase_url||''),'URL http/https','error');
    add('Capa',!!String(event?.image_url||'').trim()&&validUrl(event.image_url),'URL da capa','error');
    add('Localização',!!String(event?.location||'').trim(),'Recomendado','warn');
    add('Line-up / artistas',!!String(event?.artists||'').trim(),'Recomendado','warn');
    add('Descrição',String(event?.description||'').trim().length>=40,'Pelo menos 40 caracteres','warn');
    add('Google Maps',!!String(event?.source_url||'').trim()&&validMaps(event.source_url),'Link do Maps','warn');
    add('Slug',!!String(event?.slug||'').trim()||!!String(event?.name||'').trim(),'Presente ou derivável','error');
    if(event?.id)add('Galeria',(galleries[event.id]||0)>0,`${fmt(galleries[event.id]||0)} foto(s)`, 'warn');
    if(publication)add('Publicação',event?.published===true,'Evento publicado','error');
    return c;
  }
  function summary(c){return{errors:c.filter(x=>!x.ok&&x.severity==='error').length,warnings:c.filter(x=>!x.ok&&x.severity==='warn').length};}
  function badge(c){const s=summary(c);if(s.errors)return `<span class="bc2-badge err">✕ ${s.errors} crítico(s)</span>`;if(s.warnings)return `<span class="bc2-badge warn">⚠ ${s.warnings} pendência(s)</span>`;return `<span class="bc2-badge ok">✓ Completo</span>`;}
  function checksHtml(c){return c.map(x=>`<div class="bc2-check"><div>${x.ok?'✅':(x.severity==='error'?'❌':'⚠️')}</div><div><b class="${x.ok?'bc2-ok':x.severity==='error'?'bc2-err':'bc2-warn'}">${esc(x.label)}</b><small>${esc(x.detail)}</small></div></div>`).join('');}
  function modal(title,c){
    let m=$('bc2-modal');if(!m){m=document.createElement('div');m.id='bc2-modal';m.className='bc2-modal';m.innerHTML=`<div class="bc2-modal-box"><div class="bc2-head"><div><h3 id="bc2-modal-title" class="bc2-title"></h3><div id="bc2-modal-sub" class="bc2-sub"></div></div><button id="bc2-modal-close">Fechar</button></div><div id="bc2-modal-body"></div></div>`;document.body.appendChild(m);$('bc2-modal-close').onclick=()=>m.classList.remove('open');m.onclick=e=>{if(e.target===m)m.classList.remove('open')}}
    const s=summary(c);$('bc2-modal-title').textContent=title;$('bc2-modal-sub').textContent=`${s.errors} crítico(s) · ${s.warnings} recomendado(s)`;$('bc2-modal-body').innerHTML=checksHtml(c);m.classList.add('open');
  }

  async function health(metrics,galleries){
    const out=[];out.push(['Supabase / Banco',true,'Leitura do banco funcionando']);out.push(['Galerias',true,`${fmt(Object.values(galleries).reduce((a,b)=>a+b,0))} fotos vinculadas`]);
    const lm=metrics.at(-1)?.created_at;out.push(['Analytics',!!lm,lm?`Último registro: ${new Date(lm).toLocaleString('pt-BR')}`:'Sem registros']);
    for(const [label,url] of [['GitHub Pages','https://matheusmascena-dotcom.github.io/Matheus-be-on-eventos/robots.txt'],['Sitemap','https://matheusmascena-dotcom.github.io/Matheus-be-on-eventos/sitemap.xml']]){try{const r=await fetch(url,{cache:'no-store'});out.push([label,r.ok,r.ok?'Acessível':'HTTP '+r.status])}catch{out.push([label,false,'Falha de rede no navegador'])}}
    return out;
  }

  async function commandCenter(){
    styles();const p=$('panel');if(!p)return;
    p.innerHTML=`<div class="bc2"><div class="bc2-head"><div><h2 class="bc2-title">Command Center</h2><div class="bc2-sub">Gestão, validação, saúde do sistema e alertas em uma única visão.</div></div><button id="bc2-refresh">Atualizar</button></div><div id="bc2-load" class="bc2-card">Carregando…</div><div id="bc2-data" class="bc2" style="display:none"></div></div>`;
    $('bc2-refresh').onclick=commandCenter;
    try{
      const [events,metrics]=await Promise.all([getEvents(),getMetrics()]);const galleries=await getGalleryCounts(events);const published=events.filter(e=>e.published);const today=new Date();today.setHours(0,0,0,0);const upcoming=published.filter(e=>new Date(`${e.event_date}T00:00:00`)>=today).sort((a,b)=>a.event_date.localeCompare(b.event_date))[0];
      const views=count(metrics,'page_view'),tickets=count(metrics,'ticket_click'),sessions=new Set(metrics.map(x=>x.session_id).filter(Boolean)).size,ctr=views?tickets/views*100:0;const recent=metrics.filter(x=>new Date(x.created_at)>=ago(7)),prev=metrics.filter(x=>new Date(x.created_at)>=ago(14)&&new Date(x.created_at)<ago(7));const rv=count(recent,'page_view'),pv=count(prev,'page_view'),growth=pv?((rv-pv)/pv)*100:(rv?100:0);
      const stats=published.map(e=>{const d=metrics.filter(x=>x.event_id===e.id);const v=count(d,'page_view'),t=count(d,'ticket_click');return{e,v,t,ctr:v?t/v*100:0}}).sort((a,b)=>b.v-a.v);const top=stats[0];const alerts=[];
      for(const e of published){const c=validation(e,galleries);const s=summary(c);if(s.errors)alerts.push({k:'err',t:e.name,x:`${s.errors} problema(s) crítico(s) antes da publicação.`});else if(s.warnings>=4)alerts.push({k:'warn',t:e.name,x:`${s.warnings} recomendações ainda pendentes.`})}
      const lm=metrics.at(-1)?.created_at;if(!lm||new Date(lm)<ago(1))alerts.push({k:'warn',t:'Analytics',x:'Nenhum registro de métrica recebido nas últimas 24 horas.'});
      if(top&&top.v>=10&&top.t===0)alerts.push({k:'warn',t:'Conversão',x:`${top.e.name} tem ${fmt(top.v)} visualizações e nenhum clique em ingresso.`});
      if(growth>=25)alerts.push({k:'ok',t:'Tendência positiva',x:`Visualizações cresceram ${pct(growth)} nos últimos 7 dias.`});
      const h=await health(metrics,galleries),hs=h.filter(x=>x[1]).length,score=Math.round(hs/h.length*100);
      const data=$('bc2-data');data.innerHTML=`
        <div class="bc2-grid"><div class="bc2-kpi"><b>${fmt(events.length)}</b><span>Eventos cadastrados</span></div><div class="bc2-kpi"><b>${fmt(published.length)}</b><span>Eventos publicados</span></div><div class="bc2-kpi"><b>${fmt(Object.values(galleries).reduce((a,b)=>a+b,0))}</b><span>Fotos de galerias</span></div><div class="bc2-kpi"><b>${fmt(views)}</b><span>Visualizações</span></div></div>
        <div class="bc2-grid6"><div class="bc2-kpi"><b>${fmt(sessions)}</b><span>Visitantes únicos</span></div><div class="bc2-kpi"><b>${fmt(tickets)}</b><span>Cliques em ingresso</span></div><div class="bc2-kpi"><b>${pct(ctr)}</b><span>CTR ingresso</span></div><div class="bc2-kpi"><b>${fmt(rv)}</b><span>Views · 7 dias</span></div><div class="bc2-kpi"><b>${growth>=0?'+':''}${pct(growth)}</b><span>Crescimento · 7 dias</span></div><div class="bc2-kpi"><b>${score}</b><span>Saúde do sistema</span></div></div>
        <div class="bc2-cols"><section class="bc2-card"><h3>Próximo evento</h3>${upcoming?`<div class="bc2-row"><div><strong>${esc(upcoming.name)}</strong><div class="bc2-sub">${esc(upcoming.event_date)} · ${esc(upcoming.location||'Local não informado')}</div></div><span>${badge(validation(upcoming,galleries))}</span></div>`:'<div class="bc2-sub">Nenhum evento futuro publicado.</div>'}</section><section class="bc2-card"><h3>Evento com maior interesse</h3>${top?`<div class="bc2-row"><div><strong>${esc(top.e.name)}</strong><div class="bc2-sub">${fmt(top.v)} views · ${fmt(top.t)} ingressos</div></div><strong>${pct(top.ctr)}</strong></div>`:'<div class="bc2-sub">Sem dados por evento.</div>'}</section></div>
        <section class="bc2-card"><h3>Saúde do Be-On</h3><div class="bc2-health">${h.map(x=>`<div class="bc2-health-item"><div><span class="bc2-dot ${x[1]?'ok':'err'}"></span><b>${esc(x[0])}</b></div><div class="bc2-sub" style="margin-top:5px">${esc(x[2])}</div></div>`).join('')}</div></section>
        <section class="bc2-card"><div class="bc2-head"><div><h3 style="margin:0">Alertas e recomendações</h3><div class="bc2-sub">Gerados automaticamente com base no conteúdo e no comportamento recente.</div></div><span class="bc2-badge ${alerts.some(a=>a.k==='err')?'err':alerts.length?'warn':'ok'}">${alerts.length?fmt(alerts.length)+' alerta(s)':'✓ Nenhum alerta'}</span></div><div class="bc2-list" style="margin-top:10px">${alerts.slice(0,12).map(a=>`<div class="bc2-row"><div><strong>${esc(a.t)}</strong><div class="bc2-sub">${esc(a.x)}</div></div><span class="bc2-${a.k==='err'?'err':a.k==='warn'?'warn':'ok'}">${a.k==='err'?'Crítico':a.k==='warn'?'Atenção':'Info'}</span></div>`).join('')||'<div class="bc2-sub">Nenhuma pendência relevante detectada.</div>'}</div></section>
        <section class="bc2-card"><h3>Ranking de eventos</h3><div style="overflow:auto"><table class="bc2-table"><thead><tr><th>#</th><th>Evento</th><th>Views</th><th>Ingressos</th><th>CTR</th><th>Validação</th></tr></thead><tbody>${stats.slice(0,8).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.e.name)}</td><td>${fmt(x.v)}</td><td>${fmt(x.t)}</td><td>${pct(x.ctr)}</td><td>${badge(validation(x.e,galleries))}</td></tr>`).join('')||'<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></div></section>
      `;data.querySelectorAll('.bc2-row').forEach(()=>{});data.querySelectorAll('table tbody tr').forEach((row,i)=>{const x=stats[i];if(x)row.onclick=()=>modal(x.e.name,validation(x.e,galleries))});
      $('bc2-load').style.display='none';data.style.display='grid';
    }catch(e){$('bc2-load').className='bc2-card bc2-err';$('bc2-load').textContent='Falha ao carregar o Command Center: '+(e?.message||'erro')}
  }

  function addCommandTab(){
    const tabs=document.querySelector('.tabs');if(!tabs)return false;let b=[...tabs.querySelectorAll('button')].find(x=>x.dataset.tab==='command');if(!b){b=document.createElement('button');b.dataset.tab='command';b.textContent='⌂ Visão geral';tabs.insertBefore(b,tabs.firstChild)}
    if(b.dataset.bc2Bound!=='1'){b.dataset.bc2Bound='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));try{const s=JSON.parse(localStorage.getItem('beon-admin-ui-v2')||'{}');localStorage.setItem('beon-admin-ui-v2',JSON.stringify({...s,tab:'command',eventEditor:{open:false}}))}catch{};commandCenter()},true)}
    return true;
  }

  function interceptValidation(){
    document.addEventListener('click',async e=>{
      const pb=e.target?.closest?.('[data-pub]');
      if(pb&&!pb.dataset.bc2Pass){e.preventDefault();e.stopImmediatePropagation();try{const r=await db.from('events').select('*').eq('id',pb.dataset.pub).maybeSingle();if(r.error)throw r.error;const g=await getGalleryCounts([r.data]);const c=validation(r.data,g,true);if(summary(c).errors){modal(r.data.name,c);return}pb.dataset.bc2Pass='1';pb.click();setTimeout(()=>delete pb.dataset.bc2Pass,0)}catch(err){modal('Validação', [{label:'Consulta',ok:false,detail:err?.message||'Erro',severity:'error'}])}return}
      if(e.target?.closest?.('#save')&&!e.target.closest('#save').dataset.bc2Pass&&$('eventEditorBox')){const b=e.target.closest('#save');const pseudo={name:$('n')?.value,event_date:$('d')?.value,purchase_url:$('b')?.value,image_url:$('i')?.value,location:$('l')?.value,artists:$('a')?.value,description:$('desc')?.value,source_url:$('m')?.value,slug:$('n')?.value,published:$('p')?.value==='true'};const c=validation(pseudo,{},false);if(summary(c).errors){e.preventDefault();e.stopImmediatePropagation();modal('Validação antes de salvar',c);return}}
    },true);
  }

  function addValidateButtons(){
    const panel=$('panel');if(!panel||panel.dataset.bc2Rows)return;const obs=new MutationObserver(()=>{panel.querySelectorAll('.item').forEach(row=>{if(row.dataset.bc2Row)return;const id=row.querySelector('[data-edit]')?.dataset.edit;if(!id)return;row.dataset.bc2Row='1';const b=document.createElement('button');b.className='bc2-validate';b.textContent='Validar';row.appendChild(b);b.onclick=async()=>{try{const r=await db.from('events').select('*').eq('id',id).maybeSingle();if(r.error)throw r.error;const g=await getGalleryCounts([r.data]);modal(r.data.name,validation(r.data,g))}catch(err){modal('Validação',[{label:'Consulta',ok:false,detail:err?.message||'Erro',severity:'error'}])}}})});obs.observe(panel,{childList:true,subtree:true});panel.dataset.bc2Rows='1'}

  function enhanceAnalytics(){
    const p=$('panel');if(!p||!p.querySelector('#beonAnalyticsKpis')||p.querySelector('.bc2-analytics-extra'))return false;const src=window.__beonAnalyticsLast;if(!src?.data?.length)return false;const data=src.data,events=src.events||[];const stats=events.map(e=>{const d=data.filter(x=>x.event_id===e.id),v=count(d,'page_view'),t=count(d,'ticket_click'),f=count(d,'favorite');return{e,v,t,f,ctr:v?t/v*100:0}}).filter(x=>x.v||x.t).sort((a,b)=>b.v-a.v);const v=count(data,'page_view'),t=count(data,'ticket_click');const sec=document.createElement('section');sec.className='bc2-card bc2-analytics-extra';sec.innerHTML=`<div class="bc2-head"><div><h3 style="margin:0">Performance e CTR por evento</h3><div class="bc2-sub">Ranking baseado nas métricas carregadas no período selecionado.</div></div><span class="bc2-badge ok">CTR geral: ${pct(v?t/v*100:0)}</span></div><div style="overflow:auto"><table class="bc2-table" style="margin-top:8px"><thead><tr><th>#</th><th>Evento</th><th>Views</th><th>Ingressos</th><th>CTR</th><th>Favoritos</th></tr></thead><tbody>${stats.slice(0,10).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.e?.name||'Evento')}</td><td>${fmt(x.v)}</td><td>${fmt(x.t)}</td><td>${pct(x.ctr)}</td><td>${fmt(x.f)}</td></tr>`).join('')||'<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></div>`;const w=p.querySelector('.analytics-wrap');(w||p).appendChild(sec);return true;
  }

  function init(){styles();addCommandTab();interceptValidation();addValidateButtons();const p=$('panel');if(p){const o=new MutationObserver(()=>{addCommandTab();enhanceAnalytics()});o.observe(p,{childList:true,subtree:true})}const t=setInterval(()=>{addCommandTab();if(enhanceAnalytics())clearInterval(t)},300);setTimeout(()=>clearInterval(t),15000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
