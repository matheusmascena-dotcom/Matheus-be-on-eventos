(() => {
  const SUPABASE_URL='https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const client=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY); if(!client)return;
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
})();