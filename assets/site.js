
(() => {
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}

  if(!document.querySelector('.graph-page')) return;

  const style=document.createElement('style');
  style.id='giar-graph-rev56';
  style.textContent=`
    .graph-inspector{position:relative}
    .graph-inspector-close{display:none;position:absolute;top:.65rem;right:.65rem;width:2rem;height:2rem;border:1px solid #d3cbbf;background:#fffdf8;border-radius:999px;color:#4a433b;font:inherit;font-size:1.1rem;line-height:1;cursor:pointer}
    @media(max-width:1000px){
      .graph-inspector{display:block;position:fixed;z-index:70;top:94px;right:1rem;bottom:1rem;width:min(360px,calc(100vw - 2rem));max-height:calc(100vh - 110px);overflow:auto;padding:1.1rem 3rem 1.2rem 1.1rem;box-shadow:0 22px 60px rgba(38,31,23,.2);transform:translateX(calc(100% + 2rem));opacity:0;pointer-events:none;transition:transform .2s ease,opacity .2s ease}
      .graph-inspector.is-open{transform:translateX(0);opacity:1;pointer-events:auto}
      .graph-inspector-close{display:grid;place-items:center}
    }
    @media(max-width:700px){
      .graph-inspector{top:auto;left:.75rem;right:.75rem;bottom:.75rem;width:auto;max-height:52vh;border-radius:12px;padding:1rem 3rem 1.1rem 1rem;transform:translateY(calc(100% + 2rem))}
      .graph-inspector.is-open{transform:translateY(0)}
      .graph-help{max-width:75%}
    }
  `;
  document.head.appendChild(style);

  const initGraphEnhancements=()=>{
    const cy=window.__GIAR_CY__;
    const inspector=document.querySelector('.graph-inspector');
    const box=document.getElementById('inspector');
    if(!cy||!inspector||!box) return false;
    if(inspector.dataset.rev56==='1') return true;
    inspector.dataset.rev56='1';
    inspector.id='graph-inspector';
    inspector.setAttribute('aria-live','polite');

    let close=inspector.querySelector('.graph-inspector-close');
    if(!close){
      close=document.createElement('button');
      close.className='graph-inspector-close';
      close.type='button';
      close.setAttribute('aria-label','Cerrar información');
      close.textContent='×';
      inspector.insertBefore(close,inspector.firstChild);
    }

    try{
      cy.style().selector('node.is-hovered').style({
        'text-opacity':1,
        'text-background-opacity':.94,
        'text-border-width':1
      }).update();
    }catch(_err){}

    const openPanel=()=>inspector.classList.add('is-open');
    const closePanel=()=>inspector.classList.remove('is-open');

    cy.on('tap','node',openPanel);
    close.addEventListener('click',closePanel);
    document.addEventListener('keydown',evt=>{if(evt.key==='Escape')closePanel();});

    const syncPanel=()=>{
      if(box.querySelector('.inspector-empty')) closePanel();
    };
    new MutationObserver(syncPanel).observe(box,{childList:true,subtree:true});
    syncPanel();
    return true;
  };

  if(!initGraphEnhancements()){
    let attempts=0;
    const timer=setInterval(()=>{
      attempts+=1;
      if(initGraphEnhancements()||attempts>=200) clearInterval(timer);
    },50);
  }
})();