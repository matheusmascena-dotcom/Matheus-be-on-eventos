(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const PURCHASE_URLS = {
    'the-grid-outworld': 'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/96109?coupon=MATHEUSMASCENA',
    'adriatique-x-sao-paulo': 'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/91444?coupon=MATHEUSMASCENA',
    'crochestra-brasil': 'https://cart.ingresse.com/7bc10b1b-bef9-45cf-a45b-135651fd921a/tickets?passkey=MATHEUSMASCENA',
    'music-on-sao-paulo': 'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/102379?coupon=MATHEUSMASCENA',
    'unreal-x-the-grid': 'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/103569?coupon=MATHEUSMASCENA',
    'unreal-the-grid': 'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/103569?coupon=MATHEUSMASCENA',
    'one-life-sao-paulo': 'https://embedstore.ingresse.com/tickets/www.ingresse.com/event/95761?coupon=MATHEUSMASCENA'
  };
  const qs = selector => document.querySelector(selector);
  const rawSlug = new URLSearchParams(location.search).get('event');
  const slug = rawSlug === 'unreal-the-grid' ? 'unreal-x-the-grid' : rawSlug;
  document.documentElement.style.visibility = 'hidden';
  let revealed = false;
  const reveal = () => { if (!revealed) { revealed = true; document.documentElement.style.visibility = ''; } };
  if (!rawSlug) { reveal(); return; }
  if (rawSlug === 'unreal-the-grid') { const canonical = new URL(location.href); canonical.searchParams.set('event','unreal-x-the-grid'); history.replaceState(null,'',canonical.pathname+canonical.search+canonical.hash); }
  const setMeta=(name,content,property=false)=>{if(!content)return;const attr=property?'property':'name';let el=document.head.querySelector(`meta[${attr}="${name}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,name);document.head.appendChild(el);}el.setAttribute('content',content);};
  const setCanonical=href=>{let el=document.head.querySelector('link[rel="canonical"]');if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}el.href=href;};
  const setJsonLd=obj=>{let el=document.head.querySelector('#beon-event-schema');if(!el){el=document.createElement('script');el.id='beon-event-schema';el.type='application/ld+json';document.head.appendChild(el);}el.textContent=JSON.stringify(obj);};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const favKey='beon-fav';
  const getFavs=()=>{try{return JSON.parse(localStorage.getItem(favKey)||'[]');}catch{return[];}};
  const saveFavs=v=>localStorage.setItem(favKey,JSON.stringify(v));
  const sb=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY);
  if(!sb){reveal();return;}

  async function run(){
    try{
      const {data:e,error}=await sb.from('events').select('*').eq('slug',slug).eq('published',true).maybeSingle();
      if(error||!e){reveal();return;}
      const publicUrl=new URL(location.href);publicUrl.searchParams.set('event',e.slug);publicUrl.hash='';const eventUrl=publicUrl.toString();
      const description=`${e.name} — ${e.event_date?new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}):''}. ${e.location||''}. Veja informações, fotos oficiais e compre seu ingresso com 5% de desconto usando o cupom MATHEUSMASCENA.`.replace(/\s+/g,' ').trim();
      document.title=`${e.name} | BeOn Eventos - Embaixador Matheus Mascena`;
      setMeta('description',description);setMeta('robots','index,follow,max-image-preview:large');setCanonical(eventUrl);setMeta('og:type','event',true);setMeta('og:title',document.title,true);setMeta('og:description',description,true);setMeta('og:url',eventUrl,true);if(e.image_url)setMeta('og:image',e.image_url,true);setMeta('og:site_name','BeOn Eventos',true);setMeta('twitter:card','summary_large_image');setMeta('twitter:title',document.title);setMeta('twitter:description',description);if(e.image_url)setMeta('twitter:image',e.image_url);
      const schema={'@context':'https://schema.org','@type':'Event',name:e.name,description,startDate:e.event_date?`${e.event_date}T00:00:00-03:00`:undefined,url:eventUrl,image:e.image_url?[e.image_url]:undefined,location:{'@type':'Place',name:e.location||'São Paulo, SP',address:{'@type':'PostalAddress',addressLocality:'São Paulo',addressRegion:'SP',addressCountry:'BR'}},organizer:{'@type':'Organization',name:'BeOn Eventos'},eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode'};
      const purchaseUrl=PURCHASE_URLS[e.slug]||e.purchase_url;if(purchaseUrl)schema.offers={'@type':'Offer',url:purchaseUrl,availability:'https://schema.org/InStock'};Object.keys(schema).forEach(k=>schema[k]===undefined&&delete schema[k]);setJsonLd(schema);
      const cover=qs('#cover');if(cover){cover.removeAttribute('src');cover.src=e.image_url||'';cover.alt=e.name;}
      if(qs('#name'))qs('#name').textContent=e.name;if(qs('#date'))qs('#date').textContent=new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});if(qs('#local'))qs('#local').textContent=e.location||'';if(qs('#artists'))qs('#artists').textContent=e.artists||'';if(qs('#buy'))qs('#buy').href=purchaseUrl||'#';
      const mapUrl=e.source_url||'#';if(qs('#maps'))qs('#maps').href=mapUrl;
      const fb=qs('#favorite');if(fb){const paint=()=>{fb.textContent=getFavs().includes(e.slug)?'♥ Favoritado':'♡ Favoritar';};paint();fb.onclick=()=>{let vals=getFavs();vals=vals.includes(e.slug)?vals.filter(v=>v!==e.slug):[...vals,e.slug];saveFavs(vals);paint();};}
      const share=qs('#share');if(share){share.onclick=async()=>{try{if(navigator.share)await navigator.share({title:e.name,url:eventUrl});else{await navigator.clipboard?.writeText(eventUrl);share.textContent='✓ Link copiado';setTimeout(()=>share.textContent='↗ Compartilhar',1600);}}catch{}};}
      const mapbox=qs('#mapbox');if(mapbox){const q=encodeURIComponent(e.location||'São Paulo, SP');mapbox.innerHTML=`<div class="maphead"><b>📍 Localização</b><a class="share" href="${esc(mapUrl)}" target="_blank" rel="noopener">Abrir no Maps ↗</a></div><iframe loading="lazy" src="https://www.google.com/maps?q=${q}&output=embed"></iframe>`;}

      const {data:photos}=await sb.from('event_gallery_photos').select('id,src_url,photo_name,position,credit_label,credit_url').eq('event_id',e.id).order('position',{ascending:true});
      const list=photos||[],gallery=qs('#gal'),credits=qs('#credits'),section=qs('#gallery');
      if(section&&gallery&&credits){
        if(!list.length){section.style.display='none';}
        else{
          section.style.display='';
          gallery.innerHTML=list.slice(0,8).map((p,i)=>`<a class="galitem" data-i="${i}" href="${esc(p.src_url)}" aria-label="Abrir foto ${i+1}"><img src="${esc(p.src_url)}" alt="${esc(p.photo_name||e.name)}" loading="lazy" decoding="async"></a>`).join('');
          const uniq=[];list.forEach(p=>{if(p.credit_label&&!uniq.some(c=>c.label===p.credit_label))uniq.push({label:p.credit_label,url:p.credit_url});});
          credits.innerHTML=uniq.map(c=>c.url?`<a href="${esc(c.url)}" target="_blank" rel="noopener">📷 ${esc(c.label)}</a>`:`📷 ${esc(c.label)}`).join(' · ');
          window.__beonPhotos=list;document.querySelectorAll('.galitem').forEach(a=>a.onclick=ev=>{ev.preventDefault();window.__beonOpen?.(Number(a.dataset.i));});
        }
      }

      const target=new Date(e.event_date+'T00:00:00-03:00').getTime();const tick=()=>{let x=Math.max(0,target-Date.now());const d=Math.floor(x/86400000);x%=86400000;const h=Math.floor(x/3600000);x%=3600000;const m=Math.floor(x/60000);const s=Math.floor(x/1000)%60;[['d',d],['h',h],['m',m],['s',s]].forEach(([id,value])=>{const el=qs('#'+id);if(el)el.textContent=String(value).padStart(2,'0');});};tick();clearInterval(window.__beonEventCountdown);window.__beonEventCountdown=setInterval(tick,1000);
      qs('#bsearch')?.addEventListener('click',()=>{location.href='index.html?focus=search#eventos';});
      try{await sb.from('site_metrics').insert({metric_type:'event_view',event_id:e.id,path:location.pathname+location.search,referrer:document.referrer||null,user_agent:navigator.userAgent});}catch{}
    }catch(err){console.warn('BeOn event:',err);}finally{reveal();}
  }

  const lb=qs('#lb'),img=qs('#lbimg'),counter=qs('#counter');let idx=0;
  window.__beonOpen=i=>{const photos=window.__beonPhotos||[];if(!photos.length||!photos[i])return;idx=i;lb?.classList.add('on');show();};
  function show(){const photos=window.__beonPhotos||[];if(!photos[idx]||!img||!counter)return;img.src=photos[idx].src_url;counter.textContent=`${idx+1}/${photos.length}`;}
  function move(n){const photos=window.__beonPhotos||[];if(!photos.length)return;idx=(idx+n+photos.length)%photos.length;show();}
  qs('.close')?.addEventListener('click',()=>lb?.classList.remove('on'));qs('.prev')?.addEventListener('click',()=>move(-1));qs('.next')?.addEventListener('click',()=>move(1));document.addEventListener('keydown',ev=>{if(!lb?.classList.contains('on'))return;if(ev.key==='Escape')lb.classList.remove('on');if(ev.key==='ArrowLeft')move(-1);if(ev.key==='ArrowRight')move(1);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  try{if(!window.__beonAnalyticsLoader){window.__beonAnalyticsLoader=true;const s=document.createElement('script');s.src='assets/beon-analytics-v1.js?v=14202d3e';s.defer=true;document.head.appendChild(s);}}catch{}
})();
