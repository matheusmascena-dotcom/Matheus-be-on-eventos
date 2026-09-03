from pathlib import Path
import re

p = Path('assets/beon-v4.js')
s = p.read_text(encoding='utf-8')
needle = "    grid.querySelectorAll('.card').forEach(card => {\n      const slug=card.dataset.slug, id=card.dataset.eventId, fav=card.querySelector('.fav');"
insert = "    grid.querySelectorAll('.card').forEach(card => {\n      const slug=card.dataset.slug, id=card.dataset.eventId, fav=card.querySelector('.fav');\n      const eventData = events.find(e => e.slug === slug);\n      const cachePreview = () => { try { if (eventData) sessionStorage.setItem('beon-event-preview:'+slug, JSON.stringify(eventData)); } catch {} };\n      card.querySelectorAll('a').forEach(a => a.addEventListener('click', cachePreview));"
if needle not in s:
    raise SystemExit('home patch target not found')
p.write_text(s.replace(needle, insert, 1), encoding='utf-8')

p = Path('event.html')
s = p.read_text(encoding='utf-8')
pattern = re.compile(r"const slug=new URLSearchParams\(location\.search\).*?document\.getElementById\('share'\)\.onclick=.*?;\n", re.S)
replacement = """const requestedSlug = new URLSearchParams(location.search).get('event') || 'the-grid-outworld';\nconst slug = ({'unreal-the-grid':'unreal-x-the-grid'}[requestedSlug] || requestedSlug);\nconst fk='beon-fav',favs=()=>JSON.parse(localStorage.getItem(fk)||'[]'),save=x=>localStorage.setItem(fk,JSON.stringify(x));\nlet ev=null;\nfunction renderEvent(e){ev=e;document.getElementById('name').textContent=e.name||'';document.getElementById('cover').src=e.image_url||e.image||'';document.getElementById('cover').alt=e.name||'';const date=e.event_date||e.date;document.getElementById('date').textContent=new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});document.getElementById('local').textContent=e.location||'';document.getElementById('artists').textContent=e.artists||'';document.getElementById('buy').href=e.purchase_url||'#';document.getElementById('maps').href=e.source_url||'#';document.title=(e.name||'Evento')+' — BE·ON';const fb=document.getElementById('favorite');fb.textContent=favs().includes(slug)?'♥ Favoritado':'♡ Favoritar';fb.onclick=()=>{let x=favs();x=x.includes(slug)?x.filter(v=>v!==slug):[...x,slug];save(x);fb.textContent=x.includes(slug)?'♥ Favoritado':'♡ Favoritar'};document.getElementById('share').onclick=()=>navigator.share?navigator.share({title:e.name,url:location.href}).catch(()=>{}):navigator.clipboard?.writeText(location.href);}\n(async()=>{let cached=null;try{cached=JSON.parse(sessionStorage.getItem('beon-event-preview:'+slug)||'null')}catch{}if(cached)renderEvent(cached);try{const r=await fetch('https://bellpluuhrrluwsgouob.supabase.co/rest/v1/events?select=*&slug=eq.'+encodeURIComponent(slug)+'&published=eq.true',{headers:{apikey:document.querySelector('script')?.textContent||''}});if(r.ok){const rows=await r.json();if(rows[0]){renderEvent(rows[0]);try{sessionStorage.setItem('beon-event-preview:'+slug,JSON.stringify(rows[0]))}catch{}}}}catch{}if(!ev){document.getElementById('name').textContent='Evento não encontrado';document.getElementById('gallery').style.display='none';}})();\n"""
if not pattern.search(s):
    raise SystemExit('event patch target not found')
p.write_text(pattern.sub(replacement, s, count=1), encoding='utf-8')
"""