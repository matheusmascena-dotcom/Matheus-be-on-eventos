(() => {
  const q = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const todayKey = () => {
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get = type => parts.find(x => x.type === type)?.value || '';
    return get('year') + '-' + get('month') + '-' + get('day');
  };
  const addDays = (date, offset) => {
    const bits = String(date).slice(0,10).split('-').map(Number);
    return new Date(Date.UTC(bits[0],bits[1]-1,bits[2]+offset)).toISOString().slice(0,10);
  };
  const dateLabel = value => new Date(value+'T12:00:00-03:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const slugify = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'evento';
  const say = (message, error=false) => {
    const el=q('promoCalendarStatus');
    if(el){el.textContent=message;el.className=error?'error':'muted';}
    else {
      const msg=document.getElementById('msg');
      if(msg){msg.textContent=message;msg.className=error?'error':'muted';}
    }
  };
  const db = () => window.beonAdminClient;
  let activeTaskForUtm = null;

  const planFor = event => {
    const date=String(event.event_date).slice(0,10);
    const plans=[
      {task_type:'announcement',offset:-21,title:'Anúncio do evento',channel:'Instagram Feed + Stories',source:'instagram',medium:'feed',text:'O próximo rolê já tem data! '+event.name+'. '+dateLabel(date)+'. '+(event.location||'Confira o local no site')+'. Veja os detalhes e garanta seu ingresso pelo link.'},
      {task_type:'artist_spotlight',offset:-14,title:'Destaque de artistas / line-up',channel:'Instagram Reel + Stories',source:'instagram',medium:'reel',text:(event.artists?'Line-up em destaque: '+event.artists+'. ':'Conheça os detalhes de '+event.name+'. ')+'Salve esta publicação e envie para quem vai curtir esse rolê com você.'},
      {task_type:'ticket_reminder',offset:-7,title:'Lembrete de ingressos',channel:'WhatsApp Status + Instagram Stories',source:'whatsapp',medium:'messaging',text:'Já escolheu seu próximo rolê? '+event.name+' acontece em '+dateLabel(date)+'. Confira os ingressos e use o cupom MATHEUSMASCENA para 5% de desconto, quando aplicável.'},
      {task_type:'countdown',offset:-2,title:'Contagem regressiva',channel:'Instagram Stories',source:'instagram',medium:'story',text:'Faltam 2 dias para '+event.name+'! Marque a companhia e confira as informações e ingressos no link.'},
      {task_type:'event_day',offset:0,title:'Cobertura no dia do evento',channel:'Instagram Stories',source:'instagram',medium:'story',text:'É hoje! '+event.name+'. Acompanhe os Stories para ver os registros e a energia do evento.'},
      {task_type:'recap',offset:1,title:'Pós-evento / agradecimento',channel:'Instagram Reel + Stories',source:'instagram',medium:'reel',text:'Que noite! Obrigado a todos que fizeram parte de '+event.name+'. Compartilhe seus registros e marque o perfil.'}
    ];
    return plans.map(p=>({
      event_id:event.id,task_type:p.task_type,title:p.title,channel:p.channel,
      scheduled_for:addDays(date,p.offset),copy_text:p.text,status:'planned',
      utm_source:p.source,utm_medium:p.medium,utm_campaign:'beon-'+slugify(event.slug||event.name),utm_content:p.task_type
    })).filter(p=>p.scheduled_for>=todayKey());
  };

  async function showCalendar() {
    const client=db();
    if(!client){say('Conecte-se ao CMS para acessar o calendário.',true);return;}
    const result=await client.from('events').select('id,name,event_date,slug,location,artists,published,sold_out').eq('published',true).order('event_date',{ascending:true});
    if(result.error){say(result.error.message,true);return;}
    const events=(result.data||[]).filter(e=>e.event_date && String(e.event_date).slice(0,10)>=todayKey());
    const host=q('panel');
    if(!events.length){
      host.innerHTML='<h2>Calendário de divulgação</h2><p class="muted">Não há eventos publicados com data futura. Publique ou atualize um evento para montar o calendário.</p>';
      return;
    }
    host.innerHTML=[
      '<div class="row" style="justify-content:space-between;gap:10px"><div><h2 style="margin:0">Calendário de divulgação</h2><div class="muted">Planejamento por evento. As ações são sugestões: nada é publicado automaticamente.</div></div><span class="status">Instagram · WhatsApp · parceiros</span></div>',
      '<div class="grid" style="margin-top:12px"><label class="field"><span>Evento</span><select id="promoCalendarEvent"></select></label><div class="field"><span>Como funciona</span><div class="help">As datas são calculadas a partir do dia do evento. Edite textos, datas e status antes de compartilhar.</div></div></div>',
      '<section class="box" style="margin-top:14px"><div class="row" style="justify-content:space-between"><div><b>Gerador de links rastreáveis</b><div class="muted">Identifique origem, canal, campanha e peça de divulgação.</div></div><span class="pill">UTM</span></div>',
      '<div class="grid" style="margin-top:10px">',
      '<label class="field"><span>Origem</span><select id="promoUtmSource"><option value="instagram">Instagram</option><option value="whatsapp">WhatsApp</option><option value="facebook">Facebook</option><option value="partner">Parceiro</option><option value="direct">Compartilhamento direto</option></select></label>',
      '<label class="field"><span>Meio</span><select id="promoUtmMedium"><option value="story">Story</option><option value="feed">Feed</option><option value="reel">Reel</option><option value="bio">Bio</option><option value="messaging">Mensagem</option><option value="referral">Indicação</option></select></label>',
      '<label class="field"><span>Campanha</span><input id="promoUtmCampaign" placeholder="beon-nome-do-evento"></label>',
      '<label class="field"><span>Conteúdo / peça</span><input id="promoUtmContent" placeholder="countdown_d-2"></label>',
      '</div><div class="row" style="margin-top:10px"><button id="promoGenerateUtm" class="primary">Gerar link</button><button id="promoCopyUtm" disabled>Copiar link</button><span id="promoUtmStatus" class="muted"></span></div><div id="promoUtmResult" class="help" style="overflow-wrap:anywhere;margin-top:8px">Escolha os parâmetros e gere um link para esta campanha.</div></section>',
      '<div id="promoCalendarTasks" class="cards" style="margin-top:14px"></div>',
      '<div id="promoCalendarStatus" class="muted" style="margin-top:10px"></div>'
    ].join('');
    const eventSelect=q('promoCalendarEvent');
    eventSelect.innerHTML=events.map(e=>'<option value="'+escapeHtml(e.id)+'">'+escapeHtml(e.name)+' · '+escapeHtml(e.event_date)+'</option>').join('');
    const savedEvent=(()=>{try{return localStorage.getItem('beon-promo-calendar-event')||'';}catch{return '';}})();
    if(events.some(e=>e.id===savedEvent))eventSelect.value=savedEvent;
    let currentEvent=events.find(e=>e.id===eventSelect.value)||events[0];
    let currentTasks=[];
    let lastLink='';
    const linkUrl=()=>{
      const url=new URL('event.html',location.href);
      url.searchParams.set('event',currentEvent.slug||slugify(currentEvent.name));
      url.searchParams.set('utm_source',q('promoUtmSource').value);
      url.searchParams.set('utm_medium',q('promoUtmMedium').value);
      url.searchParams.set('utm_campaign',q('promoUtmCampaign').value.trim()||('beon-'+slugify(currentEvent.slug||currentEvent.name)));
      url.searchParams.set('utm_content',q('promoUtmContent').value.trim()||'divulgacao');
      return url.toString();
    };
    q('promoGenerateUtm').onclick=async()=>{
      lastLink=linkUrl();
      q('promoUtmResult').textContent=lastLink;
      q('promoCopyUtm').disabled=false;
      const task=currentTasks.find(t=>t.id===activeTaskForUtm);
      if(task){
        const update=await client.from('event_promotion_tasks').update({
          utm_source:q('promoUtmSource').value,utm_medium:q('promoUtmMedium').value,
          utm_campaign:q('promoUtmCampaign').value.trim()||('beon-'+slugify(currentEvent.slug||currentEvent.name)),
          utm_content:q('promoUtmContent').value.trim()||'divulgacao',updated_at:new Date().toISOString()
        }).eq('id',task.id);
        q('promoUtmStatus').textContent=update.error?'Link gerado; não foi possível salvar os UTMs na ação.':'Link gerado e UTMs associados à ação selecionada.';
      }else q('promoUtmStatus').textContent='Link pronto para compartilhar.';
    };
    q('promoCopyUtm').onclick=async()=>{
      if(!lastLink)return;
      try{await navigator.clipboard.writeText(lastLink);q('promoUtmStatus').textContent='Link copiado.';}
      catch{q('promoUtmStatus').textContent='Selecione e copie o link exibido acima.';}
    };

    async function loadTasks(){
      currentEvent=events.find(e=>e.id===eventSelect.value)||events[0];
      try{localStorage.setItem('beon-promo-calendar-event',currentEvent.id);}catch{}
      q('promoUtmCampaign').value='beon-'+slugify(currentEvent.slug||currentEvent.name);
      q('promoUtmContent').value='';
      q('promoUtmResult').textContent='Escolha os parâmetros e gere um link para esta campanha.';
      q('promoUtmCopy').disabled=true;
      q('promoUtmStatus').textContent='';
      lastLink='';activeTaskForUtm=null;
      const taskHost=q('promoCalendarTasks');
      taskHost.innerHTML='<div class="muted">Carregando ações sugeridas…</div>';
      let res=await client.from('event_promotion_tasks').select('*').eq('event_id',currentEvent.id).order('scheduled_for',{ascending:true});
      if(res.error){taskHost.innerHTML='<div class="error">'+escapeHtml(res.error.message)+'</div>';return;}
      if(!(res.data||[]).length){
        const generated=planFor(currentEvent);
        if(generated.length){
          const insert=await client.from('event_promotion_tasks').upsert(generated,{onConflict:'event_id,task_type',ignoreDuplicates:true});
          if(insert.error){taskHost.innerHTML='<div class="error">Não foi possível gerar as ações: '+escapeHtml(insert.error.message)+'</div>';return;}
          res=await client.from('event_promotion_tasks').select('*').eq('event_id',currentEvent.id).order('scheduled_for',{ascending:true});
          if(res.error){taskHost.innerHTML='<div class="error">'+escapeHtml(res.error.message)+'</div>';return;}
        }
      }
      currentTasks=res.data||[];
      renderTasks();
    }

    function renderTasks(){
      const taskHost=q('promoCalendarTasks');
      if(!currentTasks.length){
        taskHost.innerHTML='<div class="box"><b>Não há ações futuras sugeridas para este evento.</b><p class="muted">O evento está muito próximo ou não há etapas futuras disponíveis no calendário automático.</p></div>';
        return;
      }
      const statusLabels={planned:'Planejado',in_progress:'Em andamento',completed:'Concluído',skipped:'Pulado'};
      const cards=currentTasks.map(t=>{
        return '<article class="item" style="display:block;padding:14px;margin-top:8px">'+
          '<div class="row" style="justify-content:space-between"><div><b>'+escapeHtml(t.title)+'</b><div class="muted">'+escapeHtml(t.channel)+' · '+escapeHtml(dateLabel(t.scheduled_for))+'</div></div><span class="pill">'+escapeHtml(statusLabels[t.status]||t.status)+'</span></div>'+
          '<label class="field" style="display:block;margin-top:10px"><span>Texto sugerido (edite antes de publicar)</span><textarea data-promo-copy="'+escapeHtml(t.id)+'" rows="3">'+escapeHtml(t.copy_text||'')+'</textarea></label>'+
          '<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:8px">'+
          '<label class="field"><span>Data da publicação</span><input data-promo-date="'+escapeHtml(t.id)+'" type="date" value="'+escapeHtml(t.scheduled_for)+'"></label>'+
          '<label class="field"><span>Status</span><select data-promo-status="'+escapeHtml(t.id)+'">'+['planned','in_progress','completed','skipped'].map(x=>'<option value="'+x+'" '+(t.status===x?'selected':'')+'>'+statusLabels[x]+'</option>').join('')+'</select></label>'+
          '</div><div class="row" style="margin-top:8px;justify-content:flex-end">'+
          '<button type="button" data-promo-use="'+escapeHtml(t.id)+'">Usar no link UTM</button>'+
          '<button type="button" data-promo-copybtn="'+escapeHtml(t.id)+'">Copiar texto</button>'+
          '<button type="button" class="primary" data-promo-save="'+escapeHtml(t.id)+'">Salvar ação</button></div></article>';
      });
      taskHost.innerHTML='<div class="row" style="justify-content:space-between"><h3 style="margin:0">Plano de divulgação</h3><span class="muted">'+currentTasks.length+' ações</span></div>'+cards.join('');
      taskHost.querySelectorAll('[data-promo-save]').forEach(button=>button.onclick=async()=>{
        const id=button.dataset.promoSave;
        const copy=taskHost.querySelector('[data-promo-copy="'+CSS.escape(id)+'"]')?.value||'';
        const date=taskHost.querySelector('[data-promo-date="'+CSS.escape(id)+'"]')?.value;
        const status=taskHost.querySelector('[data-promo-status="'+CSS.escape(id)+'"]')?.value||'planned';
        if(!date){say('Informe a data desta ação.',true);return;}
        button.disabled=true;
        const updated=await client.from('event_promotion_tasks').update({copy_text:copy,scheduled_for:date,status,updated_at:new Date().toISOString()}).eq('id',id);
        button.disabled=false;
        if(updated.error){say(updated.error.message,true);return;}
        say('Ação do calendário salva.');
        loadTasks();
      });
      taskHost.querySelectorAll('[data-promo-copybtn]').forEach(button=>button.onclick=async()=>{
        const id=button.dataset.promoCopybtn;
        const textValue=taskHost.querySelector('[data-promo-copy="'+CSS.escape(id)+'"]')?.value||'';
        try{await navigator.clipboard.writeText(textValue);say('Texto copiado.');}
        catch{say('Não foi possível copiar automaticamente.',true);}
      });
      taskHost.querySelectorAll('[data-promo-use]').forEach(button=>button.onclick=()=>{
        const id=button.dataset.promoUse;
        const task=currentTasks.find(t=>t.id===id);
        if(!task)return;
        activeTaskForUtm=id;
        q('promoUtmContent').value=task.task_type;
        q('promoUtmSource').value=task.utm_source||'instagram';
        q('promoUtmMedium').value=task.utm_medium||'story';
        q('promoUtmCampaign').value=task.utm_campaign||('beon-'+slugify(currentEvent.slug||currentEvent.name));
        q('promoGenerateUtm').click();
        q('promoUtmResult').scrollIntoView({behavior:'smooth',block:'center'});
      });
    }
    eventSelect.onchange=loadTasks;
    loadTasks();
  }

  const calendarTab=document.querySelector('.tabs button[data-tab="calendar"]');
  if(calendarTab){
    calendarTab.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      document.querySelectorAll('.tabs button').forEach(button=>button.classList.toggle('active',button===calendarTab));
      try{
        const state=JSON.parse(localStorage.getItem('beon-admin-ui-v2')||'{}');
        localStorage.setItem('beon-admin-ui-v2',JSON.stringify({...state,tab:'calendar',eventEditor:{open:false}}));
      }catch{}
      showCalendar();
    },true);
    let lastActive=false;
    const observer=new MutationObserver(()=>{
      const active=calendarTab.classList.contains('active');
      if(active&&!lastActive)showCalendar();
      lastActive=active;
    });
    observer.observe(calendarTab,{attributes:true,attributeFilter:['class']});
  }
})();