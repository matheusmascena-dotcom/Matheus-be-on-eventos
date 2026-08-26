(() => {
  const fields = [
    ['n', 'Nome do evento'],
    ['d', 'Data do evento'],
    ['l', 'Localização'],
    ['a', 'Line-up / Artistas'],
    ['b', 'Link de compra'],
    ['i', 'Capa do card (URL da imagem)'],
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
    `;
    document.head.appendChild(style);
  }

  function applyLabels() {
    const formGrid = document.querySelector('#form .grid');
    if (!formGrid) return;
    ensureStyles();

    fields.forEach(([id, labelText]) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.beonLabeled === '1') return;
      if (el.id === 'desc') {
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
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'beon-labeled-field';
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(label);
        wrap.appendChild(el);
      }
      el.dataset.beonLabeled = '1';
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
