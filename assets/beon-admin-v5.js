(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';
  const BUCKET = 'event-media';
  const sb = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  if (!sb) return;

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slugify = value => String(value || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'evento';

  const DRAFT_KEY = 'beon-admin-event-drafts-v2';
  const UI_KEY = 'beon-admin-ui-v2';
  let tab = 'events';
  let editing = null;
  let dirty = false;
  let currentDraftTimer = null;

  function setMsg(text, err = false) {
    $('msg').textContent = text;
    $('msg').className = err ? 'error' : 'muted';
  }
  function setLoginError(text = '') { $('loginError').textContent = text; }

  function readDrafts() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; }
  }
  function writeDrafts(value) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); } catch {}
  }
  function draftId(id) { return id || '__new__'; }
  function clearDraft(id) {
    const all = readDrafts(); delete all[draftId(id)]; writeDrafts(all);
  }
  function getDraft(id) { return readDrafts()[draftId(id)] || null; }
  function saveDraft(id, payload) {
    const all = readDrafts(); all[draftId(id)] = { ...payload, savedAt: Date.now() }; writeDrafts(all);
  }
  function uiState() {
    try { return JSON.parse(localStorage.getItem(UI_KEY) || '{}'); } catch { return {}; }
  }
  function saveUiState(patch) {
    try { localStorage.setItem(UI_KEY, JSON.stringify({ ...uiState(), ...patch })); } catch {}
  }

  function getEventFormPayload() {
    return {
      name: $('n')?.value.trim() || '', event_date: $('d')?.value || '',
      location: $('l')?.value.trim() || '', artists: $('a')?.value.trim() || '',
      purchase_url: $('b')?.value.trim() || '', image_url: $('i')?.value.trim() || '',
      source_url: $('m')?.value.trim() || '', published: $('p')?.value === 'true',
      description: $('desc')?.value || ''
    };
  }
  function formHasChanges() {
    const v = getEventFormPayload();
    const meaningful = Object.entries(v).some(([k, value]) => k === 'published' ? false : value !== '');
    return meaningful || dirty || !!getDraft(editing);
  }
  function persistCurrentForm() {
    if (!$('form') || !$('n')) return;
    const payload = getEventFormPayload();
    const meaningful = Object.entries(payload).some(([k, value]) => k === 'published' ? false : value !== '');
    if (!meaningful) { clearDraft(editing); return; }
    saveDraft(editing, { id: editing, ...payload });
  }
  function attachDraftPersistence() {
    ['n','d','l','a','b','i','m','desc'].forEach(id => $(id)?.addEventListener('input', markDirty));
    $('p')?.addEventListener('change', markDirty);
    clearTimeout(currentDraftTimer);
    currentDraftTimer = setInterval(() => { if (dirty) persistCurrentForm(); }, 1000);
  }
  function markDirty() {
    dirty = true; persistCurrentForm();
    const hint = $('formStatus'); if (hint) hint.textContent = 'Rascunho salvo automaticamente.';
  }
  function stopDraftTimer() { clearInterval(currentDraftTimer); currentDraftTimer = null; }
  function restoreDraft(base) {
    const draft = getDraft(base.id || null);
    return draft ? { ...base, ...draft, __draft: true } : base;
  }

  function coverUploadBlock() {
    return `<div class="cover-wrap">
      <div class="cover-title">Escolha uma opção para a capa</div>
      <label class="field"><span>URL da imagem</span><input id="i" placeholder="URL da capa"></label>
      <div class="cover-help">Ou carregue um arquivo (JPG, JPEG, PNG, WEBP ou AVIF)</div>
      <div class="cover-row"><input id="coverFile" type="file" accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"><button type="button" id="coverUpload" class="primary">Carregar</button></div>
      <div id="coverStatus" class="help"></div>
    </div>`;
  }
  async function uploadCover(file, eventName) {
    if (!file) throw new Error('Selecione uma imagem.');
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error('Formato não suportado. Use JPG, JPEG, PNG, WEBP ou AVIF.');
    if (file.size > 8 * 1024 * 1024) throw new Error('A imagem da capa deve ter no máximo 8 MB.');
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `event-covers/${slugify(eventName)}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
    const res = await sb.storage.from(BUCKET).upload(path, file, { upsert:false, cacheControl:'31536000', contentType:file.type });
    if (res.error) throw res.error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  function attachCoverUpload() {
    $('coverUpload')?.addEventListener('click', async () => {
      const status = $('coverStatus'); const file = $('coverFile')?.files?.[0];
      try {
        $('coverUpload').disabled = true; if (status) status.textContent = 'Enviando imagem…';
        const url = await uploadCover(file, $('n')?.value.trim() || 'evento');
        $('i').value = url; markDirty();
        if (status) { status.textContent = 'Imagem carregada. Clique em Salvar para aplicar.'; status.className='help ok'; }
      } catch (err) {
        if (status) { status.textContent = err?.message || 'Falha no upload.'; status.className='help error'; }
      } finally { $('coverUpload').disabled = false; }
    });
    $('i')?.addEventListener('input', () => { if ($('coverFile')) $('coverFile').value=''; });
  }

  async function syncStatus() {
    try {
      const {data,error} = await sb.from('events').select('updated_at').order('updated_at',{ascending:false}).limit(1);
      if (error) throw error;
      const latest=data?.[0]?.updated_at;
      $('syncSite').textContent=latest?`Banco atualizado em ${new Date(latest).toLocaleString('pt-BR')}`:'Banco conectado — nenhuma atualização registrada';
      $('syncDb').textContent=latest?`Última alteração: ${new Date(latest).toLocaleString('pt-BR')}`:'Conectado';
    } catch (err) { $('syncSite').textContent='Falha ao consultar o banco'; $('syncDb').textContent=err?.message||'Erro de conexão'; }
  }

  async function hasAdminAccess() {
    const {data:{user},error}=await sb.auth.getUser();
    if (error || !user) return false;
    const r=await sb.from('admin_users').select('user_id,role,is_active').eq('user_id',user.id).maybeSingle();
    if (r.error) { setLoginError(r.error.message || 'Não foi possível verificar o acesso administrativo.'); return false; }
    return !!r.data?.is_active;
  }
  async function enterApp() {
    const allowed=await hasAdminAccess();
    if (!allowed) {
      $('accessBadge').textContent=''; $('login').classList.remove('hidden'); $('app').classList.add('hidden'); $('logoutTop').classList.add('hidden');
      setLoginError('Sua conta está autenticada, mas não possui acesso de administrador.'); return;
    }
    $('accessBadge').textContent='✓ Administrador autorizado'; $('login').classList.add('hidden'); $('app').classList.remove('hidden'); $('logoutTop').classList.remove('hidden');
    setMsg('Login ativo.'); renderTab(); syncStatus();
  }
  async function init() {
    const {data,error}=await sb.auth.getSession();
    if (error) { setLoginError(error.message); return; }
    if (data.session) await enterApp(); else syncStatus();
  }

  $('loginForm').addEventListener('submit',async e=>{
    e.preventDefault(); setLoginError(''); const button=$('enter'); button.disabled=true; button.textContent='Entrando…';
    try { const r=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('pass').value}); if(r.error) throw r.error; await enterApp(); }
    catch(err){ setLoginError(err?.message||'Falha ao autenticar.'); }
    finally{ button.disabled=false; button.textContent='Entrar'; }
  });
  $('logoutTop').onclick=async()=>{ if(formHasChanges()&&!confirm('Há alterações em andamento. Sair e manter o rascunho salvo?'))return; persistCurrentForm(); stopDraftTimer(); await sb.auth.signOut(); location.reload(); };
  sb.auth.onAuthStateChange(async(_event,session)=>{if(session)await enterApp();});

  async function loadEvents(){const r=await sb.from('events').select('*').order('event_date');if(r.error){setMsg(r.error.message,true);return []}return r.data||[];}
  function eventRow(e){return `<div class="item"><div><b>${esc(e.name)}</b><div class="muted">${esc(e.event_date||'')} · ${esc(e.location||'')} · ${e.published?'Publicado':'Oculto'}${getDraft(e.id)?' · <span style="color:#3fe0d0">rascunho</span>':''}</div></div><button data-edit="${esc(e.id)}">Editar</button><button data-pub="${esc(e.id)}">${e.published?'Ocultar':'Publicar'}</button><button data-del="${esc(e.id)}">Excluir</button></div>`;}

  async function showEvents(){
    stopDraftTimer(); const data=await loadEvents();
    $('panel').innerHTML=`<div class="row" style="justify-content:space-between"><h2>Eventos</h2><button id="new" class="primary">+ Novo evento</button></div><div id="eventlist" class="cards" style="margin-top:12px"></div><div id="form"></div>`;
    $('eventlist').innerHTML=data.map(eventRow).join('');
    $('eventlist').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEventForm(data.find(e=>e.id===b.dataset.edit)));
    $('eventlist').querySelectorAll('[data-pub]').forEach(b=>b.onclick=async()=>{const e=data.find(x=>x.id===b.dataset.pub);const r=await sb.from('events').update({published:!e.published,updated_at:new Date().toISOString()}).eq('id',e.id);if(r.error){setMsg(r.error.message,true);return}await showEvents();syncStatus();});
    $('eventlist').querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(!confirm('Excluir este evento?'))return;clearDraft(b.dataset.del);const r=await sb.from('events').delete().eq('id',b.dataset.del);if(r.error){setMsg(r.error.message,true);return}await showEvents();syncStatus();});
    $('new').onclick=()=>openEventForm({});
    const last=uiState().eventEditor;
    if(last?.open){const base=data.find(e=>e.id===last.id);if(base||last.id===null)setTimeout(()=>openEventForm(base||{}),0);}
  }

  async function getExistingSlug(id){if(!id)return null;const r=await sb.from('events').select('slug').eq('id',id).maybeSingle();return r.data?.slug||null;}

  function openEventForm(e){
    editing=e.id||null; dirty=!!getDraft(editing); const v=restoreDraft(e); const published=v.published!==false;
    $('form').innerHTML=`<div class="box" id="eventEditorBox"><div class="grid">
      <label class="field"><span>Nome do evento</span><input id="n" placeholder="Nome" value="${esc(v.name)}"></label>
      <label class="field"><span>Data do evento</span><input id="d" type="date" value="${esc(v.event_date)}"></label>
      <label class="field"><span>Localização</span><input id="l" placeholder="Local" value="${esc(v.location)}"></label>
      <label class="field"><span>Line-up / Artistas</span><input id="a" placeholder="Artistas" value="${esc(v.artists)}"></label>
      <label class="field"><span>Link de compra</span><input id="b" placeholder="Link de compra" value="${esc(v.purchase_url)}"></label>
      <div>${coverUploadBlock()}</div>
      <label class="field"><span>Link do Google Maps</span><input id="m" placeholder="https://www.google.com/maps/..." value="${esc(v.source_url)}"></label>
      <label class="field"><span>Status do evento</span><select id="p"><option value="true" ${published?'selected':''}>Publicado</option><option value="false" ${!published?'selected':''}>Oculto</option></select></label>
      </div><label class="field description"><span>Descrição do evento</span><textarea id="desc" placeholder="Descrição">${esc(v.description)}</textarea></label>
      <div id="formStatus" class="help">${v.__draft?'Rascunho restaurado automaticamente.':'As alterações são salvas como rascunho enquanto você edita.'}</div>
      <div class="row" style="margin-top:10px"><button id="save" class="primary">Salvar</button><button id="cancel" type="button">Cancelar</button></div></div>`;
    $('i').value=v.image_url||'';
    $('cancel').onclick=()=>{if(formHasChanges()&&!confirm('Descartar o rascunho desta edição?'))return;clearDraft(editing);dirty=false;stopDraftTimer();saveUiState({eventEditor:{open:false}});showEvents();};
    $('save').onclick=saveCurrentEvent; attachDraftPersistence(); attachCoverUpload(); saveUiState({eventEditor:{open:true,id:editing});
    if(v.__draft)setMsg('Rascunho restaurado. Você pode continuar a edição.');
  }

  async function saveCurrentEvent(){
    const name=$('n').value.trim(),date=$('d').value,purchaseUrl=$('b').value.trim();
    if(!name||!date||!purchaseUrl){setMsg('Preencha nome, data e link de compra antes de salvar.',true);return;}
    const slug=editing?(await getExistingSlug(editing))||slugify(name):slugify(name);
    const row={name,event_date:date,location:$('l').value.trim(),artists:$('a').value.trim(),purchase_url:purchaseUrl,image_url:$('i').value.trim(),source_url:$('m').value.trim(),description:$('desc').value,published:$('p').value==='true',slug,updated_at:new Date().toISOString()};
    const button=$('save');button.disabled=true;button.textContent='Salvando…';
    try{
      const r=editing?await sb.from('events').update(row).eq('id',editing):await sb.from('events').insert(row).select('id').single();
      if(r.error)throw r.error;
      const savedId=editing||r.data?.id||null;clearDraft(savedId);dirty=false;stopDraftTimer();saveUiState({eventEditor:{open:false}});setMsg('Evento salvo com sucesso.');await showEvents();syncStatus();
    }catch(err){setMsg(err?.message||'Falha ao salvar o evento.',true);button.disabled=false;button.textContent='Salvar';}
  }

  async function showGallery(){
    const stateKey='beon_gallery_state_v3';let saved={};try{saved=JSON.parse(localStorage.getItem(stateKey)||'{}')}catch{}
    const evr=await sb.from('events').select('id,name').order('event_date');if(evr.error){setMsg(evr.error.message,true);return;}const events=evr.data||[];
    const preferred=saved.eventId&&events.some(e=>e.id===saved.eventId)?saved.eventId:(events[0]?.id||'');
    $('panel').innerHTML=`<div class="row" style="justify-content:space-between;gap:10px"><div><h2 style="margin:0">Galerias</h2><div class="muted">Fonte única: Supabase. As fotos são lidas e gravadas em event_gallery_photos.</div></div><span id="galleryCount" class="status"></span></div><select id="ge" style="margin-top:12px"></select><div class="grid" style="margin-top:10px"><div><input id="gf" type="file" accept="image/*" multiple><div id="fileHint" class="help">Selecione várias fotos. Upload em lotes de 4.</div></div><input id="cr" placeholder="Crédito / fotógrafo" value="${esc(saved.credit||'')}"><input id="cu" placeholder="Instagram do fotógrafo" value="${esc(saved.creditUrl||'')}"></div><div class="row" style="margin-top:10px"><button id="up" class="primary">Enviar fotos</button><button id="clearGalleryFields" type="button">Limpar dados</button><span id="galleryStatus" class="muted"></span></div><div id="photos" class="thumbs" style="margin-top:12px"></div>`;
    const ge=$('ge'),gf=$('gf'),cr=$('cr'),cu=$('cu'),up=$('up'),status=$('galleryStatus'),hint=$('fileHint'),photos=$('photos'),count=$('galleryCount');
    ge.innerHTML=events.map(e=>`<option value="${esc(e.id)}" ${e.id===preferred?'selected':''}>${esc(e.name)}</option>`).join('');
    const saveGalleryState=()=>{try{localStorage.setItem(stateKey,JSON.stringify({eventId:ge.value,credit:cr.value,creditUrl:cu.value}));}catch{}};
    ge.onchange=()=>{saveGalleryState();refresh();};cr.oninput=saveGalleryState;cu.oninput=saveGalleryState;
    $('clearGalleryFields').onclick=()=>{cr.value='';cu.value='';saveGalleryState();status.textContent='Dados de crédito limpos.';};
    gf.onchange=()=>{const n=gf.files?.length||0;hint.textContent=n?`${n} foto${n===1?'':'s'} selecionada${n===1?'':'s'}.`:'Selecione várias fotos. Upload em lotes de 4.';};
    async function refresh(){
      const eventId=ge.value;if(!eventId){photos.innerHTML='';count.textContent='';return;}photos.innerHTML='<div class="muted">Carregando galeria…</div>';
      const r=await sb.from('event_gallery_photos').select('*').eq('event_id',eventId).order('position');if(r.error){photos.innerHTML=`<div class="error">${esc(r.error.message)}</div>`;return;}
      const data=r.data||[];count.textContent=`${data.length} foto${data.length===1?'':'s'}`;
      photos.innerHTML=data.map(p=>`<div class="thumb"><img src="${esc(p.src_url)}" loading="lazy" decoding="async"><div class="muted">#${(p.position??0)+1}${p.is_featured?' · destaque':''}</div><button data-x="${esc(p.id)}" data-src="${esc(p.src_url)}" style="width:100%;margin-top:6px">Excluir</button></div>`).join('')||'<div class="muted">Nenhuma foto cadastrada para este evento.</div>';
      photos.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{if(!confirm('Excluir esta foto?'))return;b.disabled=true;const src=b.dataset.src||'',marker='/storage/v1/object/public/event-media/',storagePath=src.includes(marker)?decodeURIComponent(src.split(marker)[1]):null;if(storagePath){const rr=await sb.storage.from(BUCKET).remove([storagePath]);if(rr.error){setMsg(rr.error.message,true);b.disabled=false;return;}}const rr=await sb.from('event_gallery_photos').delete().eq('id',b.dataset.x);if(rr.error){setMsg(rr.error.message,true);b.disabled=false;return;}refresh();});
    }
    up.onclick=async()=>{
      const eventId=ge.value,files=[...(gf.files||[])];if(!eventId||!files.length){status.textContent='Selecione pelo menos uma foto.';return;}up.disabled=true;gf.disabled=true;status.textContent=`Preparando ${files.length} foto${files.length===1?'':'s'}…`;
      try{const q=await sb.from('event_gallery_photos').select('position').eq('event_id',eventId).order('position',{ascending:false}).limit(1);if(q.error)throw q.error;let pos=(q.data?.[0]?.position??-1)+1;let ok=0,failed=[];
        for(let start=0;start<files.length;start+=4){const batch=files.slice(start,start+4);const results=await Promise.all(batch.map(async(file,idx)=>{const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${eventId}/${Date.now()}-${crypto.randomUUID()}-${idx}-${safe}`;const u=await sb.storage.from(BUCKET).upload(path,file,{upsert:false,cacheControl:'31536000',contentType:file.type||undefined});if(u.error)return{ok:false,name:file.name,error:u.error};const url=sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,p=pos+idx;const ins=await sb.from('event_gallery_photos').insert({event_id:eventId,src_url:url,photo_name:file.name,credit_label:cr.value.trim(),credit_url:cu.value.trim(),position:p,is_featured:p<8});if(ins.error){await sb.storage.from(BUCKET).remove([path]);return{ok:false,name:file.name,error:ins.error};}return{ok:true,name:file.name};}));results.forEach(r=>r.ok?ok++:failed.push(r));pos+=batch.length;status.textContent=`Enviadas ${Math.min(start+batch.length,files.length)} de ${files.length}…`;}
        gf.value='';hint.textContent='Selecione várias fotos. Upload em lotes de 4.';status.textContent=failed.length?`${ok} enviada${ok===1?'':'s'}; ${failed.length} com erro.`:`${ok} foto${ok===1?'':'s'} enviada${ok===1?'':'s'} com sucesso.`;refresh();
      }catch(err){status.textContent=err?.message||'Falha no envio.';setMsg(err?.message||'Falha no envio.',true);}finally{up.disabled=false;gf.disabled=false;}
    };
    refresh();
  }

  let pendingSheet=null;
  async function parseSpreadsheetFile(file){
    if(!window.XLSX)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});
    const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),sn=wb.SheetNames.find(x=>x.toLowerCase().includes('página1'))||wb.SheetNames[0],rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:''}),cn=wb.SheetNames.find(x=>x.toLowerCase().includes('configura')),cr=cn?XLSX.utils.sheet_to_json(wb.Sheets[cn],{defval:''}):[],config={};
    cr.forEach(r=>{const k=r['Configuração']??r['configuração'],v=r['Valor']??r['valor'];if(k)config[k]=v;});
    const events=rows.filter(r=>r['Evento']&&r['Data']).map(r=>({name:r['Evento'],event_date:String(r['Data']).slice(0,10),location:r['Local']||'',artists:r['Artistas']||'',image_url:r['Imagem']||'',purchase_url:r['Link de compra']&&r['Link de compra']!=='Tickets com desconto'?r['Link de compra']:'',source_url:r['Endereço']||'',published:true}));
    return{events,config,sheetName:sn};
  }
  async function showSheet(){
    pendingSheet=null;$('panel').innerHTML='<h2>Sincronizar planilha</h2><p class="muted">Selecione o arquivo primeiro. Nada é alterado até clicar em <b>Carregar arquivo</b>.</p><div class="sheet-box"><input id="sheet" type="file" accept=".xlsx,.xls"><div id="sheetInfo" class="sheet-preview">Nenhum arquivo selecionado.</div><div class="sheet-actions"><button id="loadSheet" class="primary" disabled>Carregar arquivo</button><button id="clearSheet" type="button">Limpar seleção</button></div><div id="sheetStatus" class="status" style="margin-top:10px"></div></div>';
    $('sheet').onchange=async()=>{const f=$('sheet').files[0];if(!f){pendingSheet=null;$('loadSheet').disabled=true;$('sheetInfo').textContent='Nenhum arquivo selecionado.';return;}$('sheetInfo').textContent=`Lendo ${f.name}…`;$('loadSheet').disabled=true;try{pendingSheet=await parseSpreadsheetFile(f);$('sheetInfo').innerHTML=`<span class="sheet-file">${esc(f.name)}</span> · ${pendingSheet.events.length} eventos · ${Object.keys(pendingSheet.config).length} configurações · aba <b>${esc(pendingSheet.sheetName)}</b>`;$('loadSheet').disabled=false;$('sheetStatus').textContent='Arquivo lido. Clique em “Carregar arquivo” para atualizar o Supabase.';}catch(e){pendingSheet=null;$('sheetInfo').textContent='Não foi possível ler o arquivo.';$('sheetStatus').textContent=e?.message||'Erro ao ler o arquivo.';}};
    $('clearSheet').onclick=()=>{pendingSheet=null;$('sheet').value='';$('loadSheet').disabled=true;$('sheetInfo').textContent='Nenhum arquivo selecionado.';$('sheetStatus').textContent='';};
    $('loadSheet').onclick=async()=>{if(!pendingSheet)return;const b=$('loadSheet');b.disabled=true;b.textContent='Carregando…';$('sheetStatus').textContent='Enviando dados para o Supabase…';try{const r=await sb.functions.invoke('admin-sync-spreadsheet',{body:{events:pendingSheet.events,config:pendingSheet.config}});if(r.error)throw r.error;$('sheetStatus').textContent=`Sincronização concluída: ${r.data?.importedEvents??pendingSheet.events.length} eventos e ${r.data?.configKeys??Object.keys(pendingSheet.config).length} configurações atualizados no Supabase.`;$('sheetInfo').textContent='Arquivo carregado com sucesso. Você pode selecionar outra planilha.';pendingSheet=null;$('sheet').value='';syncStatus();}catch(e){$('sheetStatus').textContent=e?.message||'Erro na sincronização.';}finally{b.disabled=false;b.textContent='Carregar arquivo';}};
  }

  async function showMetrics(){const r=await sb.from('site_metrics').select('metric_type').order('created_at',{ascending:false}).limit(5000);if(r.error){setMsg(r.error.message,true);return;}const d=r.data||[],c=t=>d.filter(x=>x.metric_type===t).length;$('panel').innerHTML=`<h2>Métricas</h2><div class="kpis"><div class="kpi"><b>${c('page_view')}</b><div class="muted">Visitas</div></div><div class="kpi"><b>${c('event_view')}</b><div class="muted">Eventos vistos</div></div><div class="kpi"><b>${c('ticket_click')}</b><div class="muted">Cliques em ingresso</div></div><div class="kpi"><b>${c('favorite_toggle')}</b><div class="muted">Favoritos</div></div></div>`;}

  function renderTab(){stopDraftTimer();const fn={events:showEvents,gallery:showGallery,sheet:showSheet,metrics:showMetrics}[tab];if(fn)fn();document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));}
  document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{
    if(tab==='events'&&document.querySelector('#eventEditorBox')&&formHasChanges()){
      const ok=confirm('Você está editando um evento. O rascunho ficará salvo e será restaurado quando voltar. Continuar para outra aba?');
      if(!ok)return;persistCurrentForm();saveUiState({eventEditor:{open:true,id:editing}});
    }
    tab=b.dataset.tab;saveUiState({tab});renderTab();
  });

  const siteLink=document.querySelector('a[href="index.html"]');
  if(siteLink){siteLink.setAttribute('target','_blank');siteLink.setAttribute('rel','noopener');}
  window.addEventListener('beforeunload',e=>{if(!formHasChanges())return;persistCurrentForm();e.preventDefault();e.returnValue='';});

  const initialTab=uiState().tab;if(initialTab&&['events','gallery','sheet','metrics'].includes(initialTab))tab=initialTab;
  init();
})();
