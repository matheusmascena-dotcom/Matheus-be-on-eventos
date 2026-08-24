(() => {
  const install = () => {
    const input = document.querySelector('#sheet');
    if (!input || input.dataset.beonLoadButton) return;
    const originalChange = input.onchange;
    input.onchange = null;
    input.dataset.beonLoadButton = '1';
    const wrap = document.createElement('div');
    wrap.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px';
    const btn=document.createElement('button'); btn.type='button'; btn.className='primary'; btn.textContent='Carregar informações no site';
    const note=document.createElement('span'); note.className='muted'; note.textContent='Selecione o XLSX e depois clique para sincronizar.';
    input.parentNode.insertBefore(wrap,input.nextSibling); wrap.append(btn,note);
    input.addEventListener('change',()=>{note.textContent=input.files?.[0]?`Arquivo selecionado: ${input.files[0].name}`:'Nenhum arquivo selecionado';});
    btn.onclick=()=>{ if(!input.files?.length){ input.click(); return; } note.textContent='Enviando dados para o Supabase...'; originalChange?.call(input,{target:input,currentTarget:input}); };
  };
  const obs=new MutationObserver(install); obs.observe(document.body,{childList:true,subtree:true}); install();
})();
