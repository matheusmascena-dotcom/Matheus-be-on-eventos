(() => {
  const SUPABASE_URL='https://bellpluuhrrluwsgouob.supabase.co'; const SUPABASE_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const PURCHASE_URLS={
    'the-grid-outworld':'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/96109?coupon=MATHEUSMASCENA',
    'adriatique-x-sao-paulo':'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/91444?coupon=MATHEUSMASCENA',
    'crochestra-brasil':'https://cart.ingresse.com/7bc10b1b-bef9-45cf-a45b-135651fd921a/tickets?passkey=MATHEUSMASCENA',
    'music-on-sao-paulo':'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/102379?coupon=MATHEUSMASCENA',
    'unreal-the-grid':'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/103569?coupon=MATHEUSMASCENA',
    'one-life-sao-paulo':'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/95761?coupon=MATHEUSMASCENA'
  };
  const qs=s=>document.querySelector(s); const slug=new URLSearchParams(location.search).get('event'); if(!slug)return;
  if(qs('#buy') && PURCHASE_URLS[slug]) qs('#buy').href=PURCHASE_URLS[slug];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const sb=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY); if(!sb)return;
  async function run(){
    const {data:e,error}=await sb.from('events').select('*').eq('slug',slug).maybeSingle(); if(error||!e)return;
    document.title=e.name+' — BE·ON';
    const cover=qs('#cover'); if(cover){cover.src=e.image_url||'';cover.alt=e.name;}
    if(qs('#name'))qs('#name').textContent=e.name; if(qs('#date'))qs('#date').textContent=new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}); if(qs('#local'))qs('#local').textContent=e.location||''; if(qs('#artists'))qs('#artists').textContent=e.artists||'';
    if(qs('#buy'))qs('#buy').href=PURCHASE_URLS[e.slug]||e.purchase_url||'#';
    const map=qs('#maps'); if(map&&e.source_url) map.href=e.source_url;
    const {data:photos}=await sb.from('event_gallery_photos').select('*').eq('event_id',e.id).order('position');
    const list=photos||[]; const gallery=qs('#gal'), credits=qs('#credits'), section=qs('#gallery');
    if(section){ if(!list.length){section.style.display='none';} else {gallery.innerHTML=list.slice(0,8).map((p,i)=>`<a class="galitem" data-i="${i}"><img src="${esc(p.src_url)}" alt="${esc(p.photo_name||e.name)}" loading="lazy"></a>`).join(''); const uniq=[]; list.forEach(p=>{if(p.credit_label&&!uniq.some(c=>c.label===p.credit_label))uniq.push({label:p.credit_label,url:p.credit_url});}); credits.innerHTML=uniq.map(c=>c.url?`<a href="${esc(c.url)}" target="_blank" rel="noopener">📷 ${esc(c.label)}</a>`:`📷 ${esc(c.label)}`).join(' · '); window.__beonPhotos=list; document.querySelectorAll('.galitem').forEach(a=>a.onclick=()=>window.__beonOpen?.(+a.dataset.i));}}
    const target=new Date(e.event_date+'T00:00:00-03:00').getTime(); const tick=()=>{let x=Math.max(0,target-Date.now()),d=Math.floor(x/86400000);x%=86400000;let h=Math.floor(x/3600000);x%=3600000;let m=Math.floor(x/60000),s=Math.floor(x/1000)%60;[['d',d],['h',h],['m',m],['s',s]].forEach(([id,v])=>{const el=qs('#'+id);if(el)el.textContent=String(v).padStart(2,'0')});};tick();setInterval(tick,1000);
    try{await sb.from('site_metrics').insert({metric_type:'event_view',event_id:e.id,path:location.pathname+location.search,referrer:document.referrer||null,user_agent:navigator.userAgent});}catch{}
  }
  const lb=qs('#lb'),img=qs('#lbimg'),counter=qs('#counter');let idx=0;window.__beonOpen=i=>{const p=window.__beonPhotos||[];if(!p.length)return;idx=i;lb?.classList.add('on');show();};function show(){const p=window.__beonPhotos||[];if(!p[idx])return;img.src=p[idx].src_url;counter.textContent=`${idx+1}/${p.length}`;}function move(n){const p=window.__beonPhotos||[];idx=(idx+n+p.length)%p.length;show();}qs('.close')?.addEventListener('click',()=>lb?.classList.remove('on'));qs('.prev')?.addEventListener('click',()=>move(-1));qs('.next')?.addEventListener('click',()=>move(1));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();