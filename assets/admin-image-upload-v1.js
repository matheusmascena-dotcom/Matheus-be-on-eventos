(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';

  const slugify = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'novo-evento';

  const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  function ensureStyles() {
    if (document.getElementById('beon-image-upload-style')) return;
    const style = document.createElement('style');
    style.id = 'beon-image-upload-style';
    style.textContent = `
      .beon-cover-tools{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end;padding:12px;border:1px solid #ffffff14;border-radius:12px;background:linear-gradient(135deg,#15101e,#0d0915)}
      .beon-cover-tools .beon-cover-url{min-width:0}
      .beon-cover-tools .beon-cover-file{display:grid;gap:6px}
      .beon-cover-tools .beon-cover-file input{padding:8px}
      .beon-cover-tools .beon-cover-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .beon-cover-tools .beon-cover-status{font-size:11px;color:#a49ab5;min-height:18px;grid-column:1/-1}
      .beon-cover-tools .beon-cover-status.ok{color:#3fe0d0}
      .beon-cover-tools .beon-cover-status.err{color:#ff7cae}
      .beon-cover-preview{display:none;max-width:180px;max-height:120px;object-fit:contain;border-radius:10px;border:1px solid #ffffff18;background:#08060d;margin-top:8px}
      .beon-cover-tools.has-preview .beon-cover-preview{display:block}
      @media(max-width:700px){.beon-cover-tools{grid-template-columns:1fr}.beon-cover-actions{width:100%}.beon-cover-actions button{flex:1}}
    `;
    document.head.appendChild(style);
  }

  function getSupabase() {
    if (window.supabase?.createClient) return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return null;
  }

  function attachCoverTools() {
    const urlInput = document.getElementById('i');
    if (!urlInput || urlInput.dataset.beonCoverEnhanced === '1') return false;
    urlInput.dataset.beonCoverEnhanced = '1';
    ensureStyles();

    const wrap = document.createElement('div');
    wrap.className = 'beon-cover-tools';
    wrap.innerHTML = `
      <div class="beon-cover-url">
        <label style="display:block;font-size:11px;color:#a49ab5;margin-bottom:6px">Capa do evento — URL da imagem</label>
      </div>
      <div class="beon-cover-file">
        <label style="display:block;font-size:11px;color:#a49ab5;margin-bottom:6px">Ou selecione um arquivo</label>
        <input id="beonCoverFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif">
      </div>
      <div class="beon-cover-actions">
        <button id="beonCoverUpload" type="button" class="primary">Carregar imagem</button>
        <button id="beonCoverUseUrl" type="button">Usar URL</button>
      </div>
      <div id="beonCoverStatus" class="beon-cover-status"></div>
      <img id="beonCoverPreview" class="beon-cover-preview" alt="Pré-visualização da capa">
    `;
    wrap.querySelector('.beon-cover-url').prepend(urlInput);
    const formGrid = urlInput.closest('.grid');
    if (formGrid) formGrid.appendChild(wrap);
    else urlInput.parentElement?.appendChild(wrap);

    const fileInput = wrap.querySelector('#beonCoverFile');
    const uploadButton = wrap.querySelector('#beonCoverUpload');
    const useUrlButton = wrap.querySelector('#beonCoverUseUrl');
    const status = wrap.querySelector('#beonCoverStatus');
    const preview = wrap.querySelector('#beonCoverPreview');

    const setStatus = (text, type='') => {
      status.textContent = text;
      status.className = `beon-cover-status ${type}`.trim();
    };

    const updatePreview = (src) => {
      if (!src) {
        wrap.classList.remove('has-preview');
        preview.removeAttribute('src');
        return;
      }
      preview.onload = () => wrap.classList.add('has-preview');
      preview.onerror = () => { wrap.classList.remove('has-preview'); };
      preview.src = src;
    };

    updatePreview(urlInput.value.trim());
    urlInput.addEventListener('change', () => updatePreview(urlInput.value.trim()));
    urlInput.addEventListener('input', () => updatePreview(urlInput.value.trim()));

    useUrlButton.onclick = () => {
      const url = urlInput.value.trim();
      if (!url) return setStatus('Informe uma URL de imagem.', 'err');
      try { new URL(url); } catch { return setStatus('A URL informada não é válida.', 'err'); }
      updatePreview(url);
      setStatus('URL da capa preparada. Clique em Salvar para gravar.', 'ok');
      fileInput.value = '';
    };

    uploadButton.onclick = async () => {
      const file = fileInput.files?.[0];
      if (!file) return setStatus('Selecione um arquivo de imagem primeiro.', 'err');
      if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setStatus('Formato não suportado. Use JPG, PNG, WEBP ou AVIF.', 'err');
      if (file.size > 8 * 1024 * 1024) return setStatus('A imagem deve ter no máximo 8 MB.', 'err');
      const sb = getSupabase();
      if (!sb) return setStatus('Supabase não está disponível nesta página.', 'err');

      uploadButton.disabled = true;
      useUrlButton.disabled = true;
      setStatus('Carregando imagem...', '');

      try {
        const nameInput = document.getElementById('n');
        const slug = slugify(nameInput?.value || 'evento');
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `event-covers/${slug}/${Date.now()}-${safeName}`;
        const result = await sb.storage.from('event-media').upload(path, file, { upsert: false, contentType: file.type });
        if (result.error) throw result.error;
        const publicUrl = sb.storage.from('event-media').getPublicUrl(path).data.publicUrl;
        if (!publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');
        urlInput.value = publicUrl;
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        fileInput.value = '';
        updatePreview(publicUrl);
        setStatus('Imagem carregada. Clique em Salvar para aplicar ao evento.', 'ok');
      } catch (error) {
        setStatus(error?.message || 'Falha ao carregar a imagem.', 'err');
      } finally {
        uploadButton.disabled = false;
        useUrlButton.disabled = false;
      }
    };

    return true;
  }

  function watchForm() {
    attachCoverTools();
    const observer = new MutationObserver(() => attachCoverTools());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchForm, { once: true });
  else watchForm();
})();
