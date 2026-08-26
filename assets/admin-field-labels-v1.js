(() => {
  const SUPABASE_URL = 'https://bellpluuhrrluwsgouob.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oQq38KO1A-4mZttQVL6O-g__RZKKIGX';

  const fields = [
    ['n', 'Nome do evento'],
    ['d', 'Data do evento'],
    ['l', 'Localização'],
    ['a', 'Line-up / Artistas'],
    ['b', 'Link de compra'],
    ['i', 'Capa do card'],
    ['m', 'Link do Google Maps'],
    ['p', 'Status do evento'],
    ['desc', 'Descrição do evento']
  ];

  function ensureStyles() {
    if (document.getElementById('beon-field-labels-style')) return;
    const style = document.createElement('style');
    style.id = 'beon-field-labels-style';
    style.textContent = `
      .beon-labeled-field{min-width:0;display:grid;gap:5px}
      .beon-labeled-field>label{display:block;color:#a49ab5;font-size:11px;line-height:1.2;padding-left:2px}
      .beon-labeled-field>input,.beon-labeled-field>select,.beon-labeled-field>textarea{width:100%;box-sizing:border-box}
      .beon-labeled-field.beon-field-description{grid-column:1/-1;margin-top:0}
      .beon-cover-options{display:grid;gap:8px;margin-top:0;padding:10px 11px;border:1px solid #ffffff12;border-radius:10px;background:#0b0812}
      .beon-cover-option-title{font-size:11px;color:#c8bfd4;line-height:1.25}
      .beon-cover-url-row,.beon-cover-file-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}
      .beon-cover-url-row input{margin:0}
      .beon-cover-file-row input[type=file]{min-width:0;padding:8px}
      .beon-cover-btn{padding:9px 11px;white-space:nowrap}
      .beon-cover-status{min-height:17px;font-size:11px;color:#8f859d}
      .beon-cover-status.ok{color:#3fe0d0}
      .beon-cover-status.err{color:#ff7cae}
      @media(max-width:700px){.beon-cover-url-row,.beon-cover-file-row{grid-template-columns:1fr}.beon-cover-btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function getSupabase() {
    if (window.supabase?.createClient) {
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return null;
  }

  const slugify = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'evento';

  function addCoverOptions(urlInput, wrapper) {
    if (!urlInput || !wrapper || urlInput.dataset.beonCoverOptions === '1') return;
    urlInput.dataset.beonCoverOptions = '1';
    ensureStyles();

    const box = document.createElement('div');
    box.className = 'beon-cover-options';
    box.innerHTML = `
      <div class="beon-cover-option-title">Escolha uma opção para a capa</div>
      <div>
        <div class="beon-cover-option-title">URL da imagem</div>
        <div class="beon-cover-url-row" data-role="url-row"></div>
      </div>
      <div>
        <div class="beon-cover-option-title">Ou carregue um arquivo (JPG, JPEG, PNG, WEBP ou AVIF)</div>
        <div class="beon-cover-file-row">
          <input type="file" data-role="file" accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif">
          <button type="button" class="beon-cover-btn primary" data-role="upload">Carregar</button>
        </div>
      </div>
      <div class="beon-cover-status" data-role="status"></div>
    `;

    const urlRow = box.querySelector('[data-role="url-row"]');
    urlRow.appendChild(urlInput);

    const fileInput = box.querySelector('[data-role="file"]');
    const uploadButton = box.querySelector('[data-role="upload"]');
    const status = box.querySelector('[data-role="status"]');

    const setStatus = (text, type = '') => {
      status.textContent = text;
      status.className = `beon-cover-status ${type}`.trim();
    };

    if (urlInput.value.trim()) {
      setStatus('Usando a URL atual. Para trocar, substitua a URL ou carregue um arquivo.', '');
    }

    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim()) {
        fileInput.value = '';
        setStatus('URL selecionada. Clique em Salvar para aplicar.', 'ok');
      } else {
        setStatus('');
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
        fileInput.value = '';
        return setStatus('Formato não suportado. Use JPG, JPEG, PNG, WEBP ou AVIF.', 'err');
      }
      if (file.size > 8 * 1024 * 1024) {
        fileInput.value = '';
        return setStatus('A imagem deve ter no máximo 8 MB.', 'err');
      }
      urlInput.value = '';
      setStatus('Arquivo selecionado. Clique em Carregar para enviar.', '');
    });

    uploadButton.addEventListener('click', async () => {
      const file = fileInput.files?.[0];
      if (!file) return setStatus('Selecione uma imagem primeiro.', 'err');
      if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setStatus('Formato não suportado. Use JPG, JPEG, PNG, WEBP ou AVIF.', 'err');
      if (file.size > 8 * 1024 * 1024) return setStatus('A imagem deve ter no máximo 8 MB.', 'err');

      const sb = getSupabase();
      if (!sb) return setStatus('Não foi possível inicializar o Supabase nesta página.', 'err');

      uploadButton.disabled = true;
      fileInput.disabled = true;
      setStatus('Carregando imagem...', '');

      try {
        const { data: sessionData } = await sb.auth.getSession();
        if (!sessionData?.session) throw new Error('Faça login novamente no Admin para carregar imagens.');

        const nameInput = document.getElementById('n');
        const slug = slugify(nameInput?.value || 'evento');
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `event-covers/${slug}/${Date.now()}-${safeName}`;
        const result = await sb.storage.from('event-media').upload(path, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: '3600'
        });
        if (result.error) throw result.error;

        const publicUrl = sb.storage.from('event-media').getPublicUrl(path).data.publicUrl;
        if (!publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');

        urlInput.value = publicUrl;
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        fileInput.value = '';
        setStatus('Imagem carregada. A URL foi preenchida automaticamente; clique em Salvar para aplicar.', 'ok');
      } catch (error) {
        setStatus(error?.message || 'Falha ao carregar a imagem.', 'err');
      } finally {
        uploadButton.disabled = false;
        fileInput.disabled = false;
      }
    });

    wrapper.appendChild(box);
  }

  function applyLabels() {
    const formGrid = document.querySelector('#form .grid');
    if (!formGrid) return;
    ensureStyles();

    fields.forEach(([id, labelText]) => {
      const el = document.getElementById(id);
      if (!el) return;

      if (el.id === 'desc') {
        if (el.dataset.beonLabeled !== '1') {
          const box = el.closest('.box');
          if (!box) return;
          const wrap = document.createElement('div');
          wrap.className = 'beon-labeled-field beon-field-description';
          const label = document.createElement('label');
          label.htmlFor = id;
          label.textContent = labelText;
          el.parentNode.insertBefore(wrap, el);
          wrap.appendChild(label);
          wrap.appendChild(el);
          el.dataset.beonLabeled = '1';
        }
        return;
      }

      let wrapper = el.closest('.beon-labeled-field');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'beon-labeled-field';
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(label);
        wrapper.appendChild(el);
      }

      if (el.dataset.beonLabeled !== '1') el.dataset.beonLabeled = '1';
      if (id === 'i') addCoverOptions(el, wrapper);
    });
  }

  function start() {
    applyLabels();
    const observer = new MutationObserver(applyLabels);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
