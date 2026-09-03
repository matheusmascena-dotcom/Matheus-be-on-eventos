from pathlib import Path
import re

# Trigger patch after workflow installation.
home = Path('assets/beon-v4.js')
s = home.read_text(encoding='utf-8')
needle = "    grid.querySelectorAll('.card').forEach(card => {\n      const slug=card.dataset.slug, id=card.dataset.eventId, fav=card.querySelector('.fav');"
insert = "    grid.querySelectorAll('.card').forEach(card => {\n      const slug=card.dataset.slug, id=card.dataset.eventId, fav=card.querySelector('.fav');\n      const eventData = events.find(e => e.slug === slug);\n      const cachePreview = () => { try { if (eventData) sessionStorage.setItem('beon-event-preview:'+slug, JSON.stringify(eventData)); } catch {} };\n      card.querySelectorAll('a').forEach(a => a.addEventListener('click', cachePreview));"
if needle not in s:
    raise SystemExit('home patch target not found')
home.write_text(s.replace(needle, insert, 1), encoding='utf-8')

key_match = re.search(r"SUPABASE_KEY\s*=\s*'([^']+)'", s)
if not key_match:
    raise SystemExit('supabase key not found')
key = key_match.group(1)

event = Path('event.html')
s = event.read_text(encoding='utf-8')
pattern = re.compile(r"const slug=new URLSearchParams\(location\.search\).*?document\.getElementById\('share'\)\.onclick=.*?;\n", re.S)
replacement = """const requestedSlug = new URLSearchParams(location.search).get('event') || 'the-grid-outworld';\nconst slug = ({'unreal-the-grid':'unreal-x-the-grid'}[requestedSlug] || requestedSlug);\nconst fk='beon-fav',favs=()=>JSON.parse(localStorage.getItem(fk)||'[]'),save=x=>localStorage.setItem(fk,JSON.stringify(x));\nlet ev=null;\nfunction toEvent(data){const x=[data.slug,data.name,data.event_date,data.location,data.artists,data.image_url,data.purchase_url,data.source_url];return Object.assign(x,data,{image:data.image_url,buy:data.purchase_url,maps:data.source_url});}\nfunction renderEvent(e){ev=e;document.getElementById('name').textContent=e.name||e[1]||'';document.getElementById('cover').src=e.image_url||e.image||e[5]||'';document.getElementById('cover').alt=e.name||e[1]||'';document.getElementById('cover').loading='eager';const date=e.event_date||e.date||e[2];document.getElementById('date').textContent=new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});document.getElementById('local').textContent=e.location||e[3]||'';document.getElementById('artists').textContent=e.artists||e[4]||'';document.getElementById('buy').href=e.purchase_url||e.buy||e[6]||'#';document.getElementById('maps').href=e.source_url||e.maps||e[7]||'#';document.title=(e.name||e[1]||'Evento')+' — BE·ON';const fb=document.getElementById('favorite');fb.textContent=favs().includes(slug)?'♥ Favoritado':'♡ Favoritar';fb.onclick=()=>{let x=favs();x=x.includes(slug)?x.filter(v=>v!==slug):[...x,slug];save(x);fb.textContent=x.includes(slug)?'♥ Favoritado':'♡ Favoritar'};document.getElementById('share').onclick=()=>navigator.share?navigator.share({title:e.name||e[1],url:location.href}).catch(()=>{}):navigator.clipboard?.writeText(location.href);}\n(async()=>{let cached=null;try{cached=JSON.parse(sessionStorage.getItem('beon-event-preview:'+slug)||'null')}catch{}if(cached)renderEvent(toEvent(cached));try{const r=await fetch('https://bellpluuhrrluwsgouob.supabase.co/rest/v1/events?select=*&slug=eq.'+encodeURIComponent(slug)+'&published=eq.true',{headers:{apikey:'""" + key + """',Prefer:'return=representation'}});if(r.ok){const rows=await r.json();if(rows[0]){const data=toEvent(rows[0]);renderEvent(data);try{sessionStorage.setItem('beon-event-preview:'+slug,JSON.stringify(rows[0]))}catch{}}}}catch{}if(!ev){document.getElementById('name').textContent='Evento não encontrado';document.getElementById('gallery').style.display='none';}})();\n"""
if not pattern.search(s):
    raise SystemExit('event patch target not found')
event.write_text(pattern.sub(replacement, s, count=1), encoding='utf-8')
