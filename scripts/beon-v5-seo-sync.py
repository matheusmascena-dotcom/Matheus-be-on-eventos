#!/usr/bin/env python3
import json
import os
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_URL = "https://matheusmascena-dotcom.github.io/Matheus-be-on-eventos"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://bellpluuhrrluwsgouob.supabase.co").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX")
EVENTS_DIR = Path("eventos")
MARKER = "<!-- BEON-V5-GENERATED -->"


def esc(value):
    s = "" if value is None else str(value)
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#39;"))


def jsonld(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), default=str)


def slug_ok(slug):
    return bool(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", str(slug or "")))


def fetch_events():
    query = urllib.parse.urlencode({
        "select": "id,name,slug,event_date,location,artists,purchase_url,image_url,source_url,published,description,updated_at",
        "order": "event_date.asc",
        "limit": "1000",
    })
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/events?{query}",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def event_page(event):
    slug = event["slug"]
    name = event.get("name") or "Evento"
    description = (event.get("description") or "").strip()
    if not description:
        description = f"{name} na Be-On Eventos. Informações, ingressos e desconto MATHEUSMASCENA."
    else:
        description = f"{name} na Be-On Eventos. {description}"
    description = re.sub(r"\s+", " ", description).strip()[:300]
    location = event.get("location") or "São Paulo, SP"
    artists = event.get("artists") or ""
    date = event.get("event_date")
    image = event.get("image_url") or ""
    purchase = event.get("purchase_url") or ""
    canonical = f"{BASE_URL}/eventos/{slug}.html"
    dynamic = f"{BASE_URL}/event.html?event={slug}"
    schema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": name,
        "description": description,
        "url": canonical,
        "location": {
            "@type": "Place",
            "name": location,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "São Paulo",
                "addressRegion": "SP",
                "addressCountry": "BR",
            },
        },
        "organizer": {"@type": "Organization", "name": "Be-On Eventos", "url": BASE_URL + "/"},
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    }
    if date:
        schema["startDate"] = f"{date}T00:00:00-03:00"
    if artists:
        schema["performer"] = {"@type": "PerformingGroup", "name": artists}
    if image:
        schema["image"] = [image]
    if purchase:
        schema["offers"] = {"@type": "Offer", "url": purchase, "availability": "https://schema.org/InStock", "priceCurrency": "BRL"}

    robots = "index,follow,max-image-preview:large" if event.get("published", False) else "noindex,nofollow"
    status = "Publicado" if event.get("published", False) else "Oculto"
    safe_name = esc(name)
    safe_desc = esc(description)
    safe_location = esc(location)
    safe_artists = esc(artists)
    safe_status = esc(status)
    image_html = f'<meta property="og:image" content="{esc(image)}">' if image else ""
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{safe_name} | Be-On Eventos</title>
<meta name="description" content="{safe_desc}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{safe_name} | Be-On Eventos">
<meta property="og:description" content="{safe_desc}">
<meta property="og:url" content="{canonical}">
{image_html}
<meta property="og:site_name" content="Be-On Eventos">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{safe_name} | Be-On Eventos">
<meta name="twitter:description" content="{safe_desc}">
{('<meta name="twitter:image" content="'+esc(image)+'">') if image else ''}
<script type="application/ld+json">{jsonld(schema)}</script>
<style>body{{background:#08060d;color:#fff;font-family:Arial,sans-serif;margin:0;padding:30px}}a{{color:#3fe0d0}}main{{max-width:900px;margin:auto}}h1{{font-size:42px}}section{{background:#120e1b;padding:25px;border-radius:18px}}.meta{{color:#b8adca}}.cta{{display:inline-block;margin-top:12px;padding:12px 16px;border-radius:10px;background:#f5f0fa;color:#090711;text-decoration:none;font-weight:700}}</style>
</head>
<body>
<main>
<section>
<h1>{safe_name}</h1>
<p>{safe_desc}</p>
<p class="meta">📅 {esc(date or 'Data a confirmar')} · 📍 {safe_location}</p>
<p class="meta">🎧 {safe_artists or 'Line-up a confirmar'} · Estado: {safe_status}</p>
<a class="cta" href="{dynamic}">Ver página completa do evento</a>
</section>
</main>
</body>
</html>
{MARKER}
'''


def write_text(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if old != content:
        path.write_text(content, encoding="utf-8")
        return True
    return False


def is_generated(path):
    try:
        return MARKER in path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return False


def sitemap(events):
    urls = [f"{BASE_URL}/"]
    urls.extend(f"{BASE_URL}/eventos/{e['slug']}.html" for e in events if e.get("published") and slug_ok(e.get("slug")))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        lines.append(f"  <url><loc>{esc(url)}</loc></url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main():
    events = fetch_events()
    if not isinstance(events, list):
        raise SystemExit("Resposta inválida do Supabase.")
    valid = []
    seen = set()
    for e in events:
        slug = str(e.get("slug") or "").strip()
        if not slug_ok(slug):
            print(f"IGNORADO: evento {e.get('name','')} possui slug inválido: {slug!r}")
            continue
        if slug in seen:
            raise SystemExit(f"Slug duplicado no Supabase: {slug}")
        seen.add(slug)
        valid.append(e)
        path = EVENTS_DIR / f"{slug}.html"
        write_text(path, event_page(e))
    expected = {f"{e['slug']}.html" for e in valid}
    for path in EVENTS_DIR.glob("*.html"):
        if is_generated(path) and path.name not in expected:
            path.unlink()
            print(f"REMOVIDO: {path}")
    write_text(Path("sitemap.xml"), sitemap(valid))
    print(f"Sincronizados {len(valid)} eventos. Sitemap com {1 + sum(1 for e in valid if e.get('published'))} URLs.")


if __name__ == "__main__":
    main()
