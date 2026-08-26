from pathlib import Path
import re

path = Path('assets/beon-v4.js')
source = path.read_text(encoding='utf-8')

new_cards = '''  function renderCards(events, opts={}) {
    const grid = opts.grid || qs('#grid');
    if (!grid) return;
    const realized = !!opts.realized;
    const favs = getFavs();
    const cardUrl = e => realized ? `eventos/${encodeURIComponent(e.slug)}.html` : `event.html?event=${encodeURIComponent(e.slug)}`;
    grid.innerHTML = events.map((e,i) => {
      const dateLabel = new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR');
      const shortDate = new Date(e.event_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');
      const statusRibbon = realized ? '<span class="realized-ribbon">✓ REALIZADO</span>' : '';
      const offer = realized ? '' : '<span class="off">5% OFF</span>';
      const action = realized
        ? `<a class="act buy" href="${cardUrl(e)}">Ver detalhes ↗</a>`
        : `<a class="act buy" href="${cardUrl(e)}">Ver evento ↗</a>`;
      return `<article class="card ${realized?'card-realized':''}" data-slug="${esc(e.slug)}" data-event-id="${esc(e.id)}" data-search="${esc([e.name,e.location,e.artists,e.event_date].join(' '))}" style="animation:cardIn .55s ${i*.06}s both"><div class="pic"><img src="${esc(e.image)}" alt="${esc(e.name)}" ${i<3&&!realized?'fetchpriority="high"':'loading="lazy"'} decoding="async">${statusRibbon}<span class="tag">${shortDate}</span>${offer}<button class="fav ${favs.includes(e.slug)?'on':''}" aria-label="Favoritar">${favs.includes(e.slug)?'♥':'♡'}</button></div><div class="card-body"><h3 class="card-title">${esc(e.name)}</h3><div class="meta"><span>📅 ${dateLabel}</span><span>📍 ${esc(e.location)}</span><span>🎧 ${esc(e.artists)}</span>${realized?'<span class="realized-label">✓ Evento realizado</span>':''}</div><div class="actions"><a class="act maps" href="${esc(e.source_url || '#')}" target="_blank" rel="noopener">📍 Maps</a>${action}</div></div></article>`;
    }).join('');

    grid.querySelectorAll('.card').forEach(card => {
      const slug=card.dataset.slug, id=card.dataset.eventId, fav=card.querySelector('.fav');
      fav.onclick = ev => { ev.stopPropagation(); let a=getFavs(); a=a.includes(slug)?a.filter(x=>x!==slug):[...a,slug]; saveFavs(a); fav.classList.toggle('on'); fav.textContent=a.includes(slug)?'♥':'♡'; metric('favorite_toggle', id); };
      card.onclick = ev => { if (ev.target.closest('a,button')) return; location.href=realized ? `eventos/${encodeURIComponent(slug)}.html` : 'event.html?event='+encodeURIComponent(slug); };
    });
  }

  function renderRealizedSection(events) {
    const mainGrid = qs('#grid');
    if (!mainGrid) return;
    let section = qs('#realized-events-section');
    if (!events.length) {
      if (section) section.style.display='none';
      return;
    }
    if (!section) {
      section = document.createElement('section');
      section.id='realized-events-section';
      section.className='section realized-events-section';
      section.innerHTML = `<div class="wrap"><div class="head"><h2>Eventos realizados</h2><p>Reviva os eventos que já passaram e confira os detalhes históricos.</p></div><div id="realizedGrid" class="grid"></div></div>`;
      const currentSection = mainGrid.closest('.section');
      if (currentSection) currentSection.after(section); else mainGrid.parentNode.appendChild(section);
    }
    section.style.display='block';
    renderCards(events, {grid:qs('#realizedGrid'), realized:true});
  }
'''

pattern = r"  function renderCards\(events\) \{.*?\n  \}\n\n  function renderFeatured"
source, count = re.subn(pattern, new_cards + "\n  function renderFeatured", source, count=1, flags=re.S)
if count != 1:
    raise SystemExit('renderCards block not found')

old = """      const events=await loadEvents();
      renderCards(events); renderFeatured(events); enhanceSearch(events); metric('page_view');"""
new = """      const events=await loadEvents();
      const now=Date.now();
      const upcoming=events.filter(e=>new Date(e.event_date+'T00:00:00-03:00').getTime()>=now);
      const realized=events.filter(e=>new Date(e.event_date+'T00:00:00-03:00').getTime()<now).sort((a,b)=>new Date(b.event_date)-new Date(a.event_date));
      renderCards(upcoming);
      renderFeatured(upcoming);
      renderRealizedSection(realized);
      enhanceSearch([...upcoming,...realized]);
      metric('page_view');"""
if old not in source:
    raise SystemExit('publicHome block not found')
source = source.replace(old, new, 1)

marker = "      .card-title{letter-spacing:.005em;}"
css = """      .card-title{letter-spacing:.005em;}
      .realized-events-section{padding-top:20px;}
      .card-realized{opacity:.96;}
      .card-realized .pic{background:#08070d;}
      .card-realized .pic img{filter:grayscale(.52) saturate(.55) brightness(.74)!important;transition:filter .35s ease,transform .45s ease;}
      .card-realized:hover .pic img{filter:grayscale(.30) saturate(.70) brightness(.82)!important;}
      .card-realized .off{display:none!important;}
      .realized-ribbon{position:absolute;left:10px;top:50%;transform:translateY(-50%) rotate(-8deg);z-index:5;padding:8px 14px;border:1px solid rgba(255,255,255,.24);border-radius:8px;background:rgba(124,92,255,.92);color:#fff;font-size:11px;font-weight:800;letter-spacing:.14em;box-shadow:0 8px 24px rgba(0,0,0,.42),0 0 28px rgba(124,92,255,.22);text-transform:uppercase;pointer-events:none;}
      .realized-label{color:#b9a9df!important;font-weight:700;}
      .card-realized .buy{background:#d8d0e0;color:#100c16;}
      @media(max-width:700px){.realized-ribbon{left:50%;top:50%;transform:translate(-50%,-50%) rotate(-7deg);font-size:10px;padding:7px 12px;}}"""
if marker not in source:
    raise SystemExit('CSS marker not found')
source = source.replace(marker, css, 1)
path.write_text(source, encoding='utf-8')
print('patched', path)
