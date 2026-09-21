(() => {
  if (window.__beonAnalyticsV2) return;
  window.__beonAnalyticsV2 = true;

  const SUPABASE_URL='https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const qs=(s,r=document)=>r.querySelector(s);
  const safeGet=(storage,key,fallback=null)=>{try{const v=storage.getItem(key);return v==null?fallback:v}catch{return fallback}};
  const safeSet=(storage,key,value)=>{try{storage.setItem(key,value)}catch{}};
  const makeId=()=>{try{if(crypto.randomUUID)return crypto.randomUUID()}catch{}return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)};

  const VISITOR_KEY='beon_analytics_visitor_v2';
  const SESSION_KEY='beon_analytics_session_v2';
  const SESSION_TIMEOUT=30*60*1000;

  let visitorId=safeGet(localStorage,VISITOR_KEY);
  if(!visitorId){visitorId=makeId();safeSet(localStorage,VISITOR_KEY,visitorId);}

  const now=Date.now();
  let session={};
  try{session=JSON.parse(safeGet(localStorage,SESSION_KEY,'{}')||'{}')}catch{session={};}
  if(!session.id||!session.lastActivity||now-Number(session.lastActivity)>SESSION_TIMEOUT) session={id:makeId(),lastActivity:now};
  else session.lastActivity=now;
  safeSet(localStorage,SESSION_KEY,JSON.stringify(session));

  const params=new URLSearchParams(location.search);
  const sourceKey='beon_analytics_source_v2';
  let source=safeGet(sessionStorage,sourceKey);
  const incomingSource=params.get('utm_source')||params.get('src')||'';
  if(incomingSource){source=incomingSource.slice(0,80);safeSet(sessionStorage,sourceKey,source);}
  else if(!source) source=null;

  const medium=params.get('utm_medium')?.slice(0,80)||safeGet(sessionStorage,'beon_analytics_medium_v2');
  const campaign=params.get('utm_campaign')?.slice(0,120)||safeGet(sessionStorage,'beon_analytics_campaign_v2');
  const content=params.get('utm_content')?.slice(0,120)||safeGet(sessionStorage,'beon_analytics_content_v2');
  if(params.get('utm_medium'))safeSet(sessionStorage,'beon_analytics_medium_v2',medium);
  if(params.get('utm_campaign'))safeSet(sessionStorage,'beon_analytics_campaign_v2',campaign);
  if(params.get('utm_content'))safeSet(sessionStorage,'beon_analytics_content_v2',content);

  const path=rawSlug?location.pathname+'?event='+encodeURIComponent(rawSlug):location.pathname;
  const referrer=document.referrer||null;
  const rawSlug=params.get('event');
  const staticMatch=location.pathname.match(/\/eventos\/([^/]+)\.html$/i);
  const eventSlug=rawSlug||(staticMatch?decodeURIComponent(staticMatch[1]):null);

  let eventId=null;
  let sessionId=session.id;
  let initialized=false;

  async function resolveEventId(){
    if(!eventSlug)return null;
    try{
      const u=SUPABASE_URL+'/rest/v1/events?select=id&slug=eq.'+encodeURIComponent(eventSlug)+'&published=eq.true&limit=1';
      const res=await fetch(u,{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY}});
      if(!res.ok)return null;
      const data=await res.json();
      return data?.[0]?.id||null;
    }catch{return null;}
  }

  function currentEventId(el){
    const id=el?.closest?.('[data-event-id]')?.dataset?.eventId;
    return id||eventId||null;
  }

  function placementOf(el){
    if(!el)return 'other';
    if(el.closest('#featuredUpcoming'))return 'featured';
    if(el.closest('.card-realized'))return 'realized_card';
    if(el.closest('.card'))return 'card';
    if(el.closest('.actions'))return 'event_page';
    if(el.closest('.amb-links'))return 'ambassador';
    return 'other';
  }

  function refreshSession(){
    const t=Date.now();
    let current={};
    try{current=JSON.parse(safeGet(localStorage,SESSION_KEY,'{}')||'{}')}catch{current={};}
    if(!current.id||!current.lastActivity||t-Number(current.lastActivity)>SESSION_TIMEOUT) current={id:makeId(),lastActivity:t};
    else current.lastActivity=t;
    safeSet(localStorage,SESSION_KEY,JSON.stringify(current));
    sessionId=current.id;
  }

  async function track(metricType,extra={}){
    refreshSession();
    const payload={
      metric_type:metricType,
      event_id:extra.event_id||null,
      path,
      referrer,
      user_agent:navigator.userAgent,
      source:extra.source??source,
      medium:extra.medium??medium??null,
      campaign:extra.campaign??campaign??null,
      content:extra.content??content??null,
      placement:extra.placement||'other',
      action:extra.action||'view',
      session_id:sessionId,
      visitor_id:visitorId
    };
    try{
      await fetch(SUPABASE_URL+'/rest/v1/site_metrics',{
        method:'POST',
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:'Bearer '+SUPABASE_KEY,
          'Content-Type':'application/json',
          Prefer:'return=minimal'
        },
        body:JSON.stringify(payload),
        keepalive:true
      });
    }catch{}
  }

  function eventFromElement(el){
    const data=currentEventId(el);
    if(data)return data;
    const slug=el?.closest?.('[data-slug]')?.dataset?.slug;
    if(slug){
      const known=document.querySelector('[data-slug="'+CSS.escape(slug)+'"]')?.dataset?.eventId;
      return known||null;
    }
    return null;
  }

  async function classifyClick(ev){
    const el=ev.target.closest?.('a,button');
    if(!el)return;
    const href=el.getAttribute('href')||'';
    const text=(el.textContent||'').trim().toLowerCase();
    const eid=eventFromElement(el);
    let metric=null;
    let action='click';
    if(href.includes('ingresse.com')||text.includes('comprar ingresso')||text.includes('garantir meu ingresso')){
      metric='analytics_ticket_click';
    }else if(el.classList.contains('fav')||text.includes('favoritar')||text.includes('favoritado')){
      metric='analytics_favorite_click';
      action=(el.classList.contains('on')||text.includes('favoritado')||text.includes('favoritado'))?'add':'remove';
    }else if(el.id==='share'||text.includes('compartilhar')){
      metric='analytics_share_click';
    }else if(el.id==='maps'||el.classList.contains('map')||href.includes('google.com/maps')){
      metric='analytics_map_click';
    }else if(href.includes('wa.me')||href.toLowerCase().includes('whatsapp')){
      metric='analytics_whatsapp_click';
    }else if(href.includes('instagram.com')){
      metric='analytics_instagram_click';
    }
    if(metric)track(metric,{event_id:eid,placement:placementOf(el),action});
  }

  function bindSearch(){
    document.addEventListener('input',ev=>{
      const el=ev.target;
      if(!el.matches?.('input[type="search"],#eventSearch,.event-search'))return;
      clearTimeout(el.__beonAnalyticsTimer);
      const value=el.value.trim();
      if(value.length<2)return;
      el.__beonAnalyticsTimer=setTimeout(()=>track('analytics_search',{placement:'search',action:'query'}),700);
    },{passive:true});
  }

  async function bind(){
    if(initialized)return;
    initialized=true;
    eventId=await resolveEventId();
    track('analytics_page_view',{event_id:eventId,placement:eventId?'event_page':'page',action:'view'});
    document.addEventListener('click',classifyClick,{passive:true});
    bindSearch();
    window.beonTrack=(metricType,extra={})=>track('analytics_'+metricType,{...extra,event_id:extra.event_id||eventId});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})();