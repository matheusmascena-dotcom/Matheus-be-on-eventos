(() => {
  const SUPABASE_URL='https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY='sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const normalizeInstagram=u=>{try{const x=new URL(u);const m=x.pathname.match(/^\/(reel|p)\/([^/]+)/i);return m?`https://www.instagram.com/${m[1]}/${m[2]}/`:u;}catch{return u;}};
  const instagramId=u=>{try{const x=new URL(u);const m=x.pathname.match(/^\/(?:reel|p)\/([^/]+)/i);return m?.[1]||null;}catch{return null;}};
  const tiktokId=u=>{try{const x=new URL(u);const m=x.pathname.match(/\/video\/(\d+)/);return m?.[1]||null;}catch{return null;}};

  function style(){
    if(document.getElementById('beon-social-videos-style'))return;
    const s=document.createElement('style');
    s.id='beon-social-videos-style';
    s.textContent=`
      .beon-social-videos{margin-top:22px;padding:20px;border:1px solid #fff2;border-radius:18px;background:#120e1b}
      .beon-social-videos h2{font:34px 'Bebas Neue';margin:0}
      .beon-social-videos-sub{color:#9b91ae;font-size:12px;margin-top:3px}
      .beon-social-videos-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}
      .beon-social-video{min-width:0;padding:10px;border:1px solid #fff2;border-radius:14px;background:#0b0812}
      .beon-social-video-title{font-size:12px;font-weight:700;margin-bottom:8px}
      .beon-social-video-meta{font-size:9px;color:#9b91ae;text-transform:uppercase;margin-top:8px}
      .beon-social-video iframe{width:100%;height:620px;border:0;border-radius:10px;background:#000;display:block}
      .beon-social-video-actions{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:8px;flex-wrap:wrap}
      .beon-social-video-platform-link{color:#3fe0d0;font-size:10px;font-weight:700;text-decoration:none}
      .beon-social-video-platform-link:hover{text-decoration:underline}
      .beon-social-video-note{padding:12px;border:1px dashed #3fe0d033;border-radius:10px;color:#bfb7c8;font-size:11px}
      @media(max-width:760px){.beon-social-videos-grid{grid-template-columns:1fr}.beon-social-video iframe{height:620px}}
    `;
    document.head.appendChild(s);
  }

  async function run(){
    const raw=new URLSearchParams(location.search).get('event');
    if(!raw)return;
    const slug=raw==='unreal-the-grid'?'unreal-x-the-grid':raw;
    const sb=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY);
    if(!sb)return;
    try{
      const {data:event,error:eerr}=await sb.from('events').select('id,name,slug').eq('slug',slug).maybeSingle();
      if(eerr||!event)return;
      const {data:videos,error}=await sb.from('event_social_videos').select('id,platform,video_url,title,position,published').eq('event_id',event.id).eq('published',true).order('position').order('created_at');
      if(error||!videos?.length)return;

      style();
      const section=document.createElement('section');
      section.className='beon-social-videos';
      section.id='socialVideos';
      section.innerHTML='<h2>🎬 Vídeos do evento</h2><div class="beon-social-videos-sub">Vídeos publicados no Instagram e TikTok</div><div class="beon-social-videos-grid"></div>';
      const anchor=document.getElementById('gallery')||document.getElementById('mapbox');
      anchor?.parentNode?.insertBefore(section,anchor.nextSibling);
      if(!section.parentNode)return;

      const grid=section.querySelector('.beon-social-videos-grid');
      videos.forEach(v=>{
        const card=document.createElement('article');
        card.className='beon-social-video';
        if(v.title){const h=document.createElement('div');h.className='beon-social-video-title';h.textContent=v.title;card.appendChild(h);}

        const body=document.createElement('div');
        let externalUrl=v.video_url;

        if(v.platform==='instagram'){
          const cleanUrl=normalizeInstagram(v.video_url);
          const id=instagramId(cleanUrl);
          externalUrl=cleanUrl;
          if(id){
            const iframe=document.createElement('iframe');
            iframe.src=`https://www.instagram.com/reel/${encodeURIComponent(id)}/embed/`;
            iframe.loading='lazy';
            iframe.allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
            iframe.allowFullscreen=true;
            iframe.referrerPolicy='strict-origin-when-cross-origin';
            iframe.title=v.title||`${event.name} — Instagram`;
            body.appendChild(iframe);
          }else{
            const note=document.createElement('div');note.className='beon-social-video-note';note.textContent='Não foi possível identificar o Reel. Use o link abaixo para abrir no Instagram.';body.appendChild(note);
          }
        }else{
          const id=tiktokId(v.video_url);
          if(id){
            const iframe=document.createElement('iframe');
            iframe.src=`https://www.tiktok.com/player/v1/${id}?description=1&music_info=1`;
            iframe.allow='fullscreen';
            iframe.loading='lazy';
            iframe.title=v.title||`${event.name} — TikTok`;
            body.appendChild(iframe);
          }else{
            const note=document.createElement('div');note.className='beon-social-video-note';note.textContent='Não foi possível incorporar este link automaticamente.';body.appendChild(note);
          }
        }

        card.appendChild(body);
        const actions=document.createElement('div');
        actions.className='beon-social-video-actions';
        const meta=document.createElement('div');
        meta.className='beon-social-video-meta';
        meta.textContent=v.platform==='instagram'?'Instagram':'TikTok';
        actions.appendChild(meta);

        const link=document.createElement('a');
        link.className='beon-social-video-platform-link';
        link.href=externalUrl;
        link.target='_blank';
        link.rel='noopener noreferrer external';
        link.textContent=v.platform==='instagram'?'Ver no Instagram ↗':'Ver no TikTok ↗';
        actions.appendChild(link);
        card.appendChild(actions);
        grid.appendChild(card);
      });
    }catch(_){ }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();