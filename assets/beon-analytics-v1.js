(() => {
  const SUPABASE_URL='https://bellpluuhrrluwsgouob.supabase.co',SUPABASE_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const db=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}); if(!db)return;
  const sessionKey='beon_analytics_session_v1';
  let sessionId=localStorage.getItem(sessionKey);
  if(!sessionId){sessionId=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(sessionKey,sessionId);}
  const params=new URLSearchParams(location.search);
  const sourceKey='beon_analytics_source_v1';
  const incomingSource=params.get('src')||params.get('utm_source')||'';
  if(incomingSource)sessionStorage.setItem(sourceKey,incomingSource.slice(0,80));
  const source=sessionStorage.getItem(sourceKey)||null;
  const eventSlug=params.get('event')||null;
  const path=`${location.pathname}${location.search}`;
  const referrer=document.referrer||null;
  const once=new Set();
  async function track(type,extra={}){
    const key=`${type}:${extra.event_id||''}:${path}`;
    if(type==='analytics_page_view'&&once.has(key))return;
    if(type==='analytics_page_view')once.add(key);
    try{await client.from('site_metrics').insert({metric_type:type,event_id:extra.event_id||null,path,referrer,user_agent:navigator.userAgent,source,session_id:sessionId});}catch{}
  }
  async function resolveEventId(){if(!eventSlug)return null;const {data}=await client.from('events').select('id').eq('slug',eventSlug).maybeSingle();return data?.id||null;}
  async function bind(){
    const eventId=await resolveEventId(); track('analytics_page_view',{event_id:eventId});
    document.addEventListener('click',ev=>{
      const el=ev.target.closest?.('a,button'); if(!el)return;
      const href=el.getAttribute('href')||''; const text=(el.textContent||'').trim().toLowerCase();
      const metric=href.includes('ingresse.com')||text.includes('comprar ingresso')||text.includes('garantir meu ingresso')?'analytics_ticket_click'
        :text.includes('favorit')||el.classList.contains('fav')?'analytics_favorite_click'
        :text.includes('compart')?'analytics_share_click'
        :href.includes('wa.me')||href.includes('whatsapp')?'analytics_whatsapp_click'
        :href.includes('instagram.com')?'analytics_instagram_click'
        :href.includes('google.com/maps')?'analytics_map_click'
        :null;
      if(metric)track(metric,{event_id:eventId});
    },{passive:true});
    document.addEventListener('input',ev=>{
      const el=ev.target; if(!el.matches?.('input[type="search"], #eventSearch, .event-search'))return;
      clearTimeout(el.__beonSearchTimer); el.__beonSearchTimer=setTimeout(()=>{if(el.value.trim().length>=2)track('analytics_search',{event_id:eventId});},800);
    },{passive:true});
    window.beonTrack=(metricType,extra={})=>track(`analytics_${metricType}`,{...extra,event_id:extra.event_id||eventId});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();

  // Automatic presentation of finished events on the public home without changing the CMS data.
  async function organizeRealizedEvents(){
    if(!location.pathname.endsWith('/index.html') && !location.pathname.endsWith('/Matheus-be-on-eventos/') && !location.pathname.endsWith('/Matheus-be-on-eventos')) return;
    const grid=document.querySelector('#grid');
    if(!grid) return;
    try{
      const {data,error}=await db.from('events').select('id,slug,event_date,published').eq('published',true);
      if(error||!data?.length)return;
      const byId=new Map(data.map(e=>[String(e.id),e]));
      const now=Date.now();
      const past=[];
      grid.querySelectorAll('.card').forEach(card=>{
        const e=byId.get(String(card.dataset.eventId));
        if(e && new Date(e.event_date+'T00:00:00-03:00').getTime()<now) past.push({card,e});
      });
      if(!past.length)return;

      let section=document.getElementById('realized-events-section');
      if(!section){
        section=document.createElement('section');
        section.id='realized-events-section';
        section.className='section realized-events-section';
        section.innerHTML='<div class="wrap"><div class="head"><h2>Eventos realizados</h2><p>Reviva os eventos que já passaram e confira os detalhes históricos.</p></div><div id="realizedGrid" class="grid"></div></div>';
        const current=grid.closest('.section');
        if(current)current.after(section);else grid.parentNode.appendChild(section);
      }
      const realizedGrid=section.querySelector('#realizedGrid');
      if(!realizedGrid)return;
      past.sort((a,b)=>new Date(b.e.event_date)-new Date(a.e.event_date));
      past.forEach(({card,e})=>{
        card.classList.add('card-realized');
        const pic=card.querySelector('.pic');
        if(pic){
          pic.querySelector('.off')?.remove();
          if(!pic.querySelector('.realized-ribbon')){
            const ribbon=document.createElement('span');
            ribbon.className='realized-ribbon';
            ribbon.textContent='✓ REALIZADO';
            pic.appendChild(ribbon);
          }
        }
        const meta=card.querySelector('.meta');
        if(meta && !meta.querySelector('.realized-label')){
          const label=document.createElement('span');
          label.className='realized-label';
          label.textContent='✓ Evento realizado';
          meta.appendChild(label);
        }
        const buy=card.querySelector('.act.buy');
        if(buy){buy.href=`eventos/${encodeURIComponent(e.slug)}.html`;buy.textContent='Ver detalhes ↗';}
        card.onclick=ev=>{
          if(ev.target.closest('a,button'))return;
          location.href=`eventos/${encodeURIComponent(e.slug)}.html`;
        };
        realizedGrid.appendChild(card);
      });
      const cssId='beon-realized-events-style';
      if(!document.getElementById(cssId)){
        const style=document.createElement('style');
        style.id=cssId;
        style.textContent=`
          .realized-events-section{padding-top:20px}
          .card-realized{opacity:.96}
          .card-realized .pic{background:#08070d}
          .card-realized .pic img{filter:grayscale(.52) saturate(.55) brightness(.74)!important;transition:filter .35s ease,transform .45s ease}
          .card-realized:hover .pic img{filter:grayscale(.30) saturate(.70) brightness(.82)!important}
          .card-realized .off{display:none!important}
          .realized-ribbon{position:absolute;left:10px;top:50%;transform:translateY(-50%) rotate(-8deg);z-index:5;padding:8px 14px;border:1px solid rgba(255,255,255,.24);border-radius:8px;background:rgba(124,92,255,.92);color:#fff;font-size:11px;font-weight:800;letter-spacing:.14em;box-shadow:0 8px 24px rgba(0,0,0,.42),0 0 28px rgba(124,92,255,.22);text-transform:uppercase;pointer-events:none}
          .realized-label{color:#b9a9df!important;font-weight:700}
          .card-realized .buy{background:#d8d0e0;color:#100c16}
          @media(max-width:700px){.realized-ribbon{left:50%;top:50%;transform:translate(-50%,-50%) rotate(-7deg);font-size:10px;padding:7px 12px}}
        `;
        document.head.appendChild(style);
      }
    }catch{}
  }
  if(location.pathname.includes('Matheus-be-on-eventos')){setTimeout(organizeRealizedEvents,350);setTimeout(organizeRealizedEvents,1200);}
})();
