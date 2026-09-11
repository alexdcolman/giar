(() => {
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
})();

(() => {
  const stage=document.getElementById('graph-stage');
  const loading=document.getElementById('graph-loading');
  const isPhone=!!(window.matchMedia&&window.matchMedia('(max-width:700px)').matches);
  if(!stage||!loading) return;
  if(isPhone){
    const s=document.createElement('style');
    s.textContent=`@media(max-width:700px){
      .graph-stage.giar-mobile-bootstrap .graph-cy,
      .graph-stage.giar-mobile-bootstrap .graph-toolbar,
      .graph-stage.giar-mobile-bootstrap .graph-help,
      .graph-stage.giar-mobile-bootstrap .graph-person-label-layer,
      .graph-stage.giar-mobile-bootstrap .graph-person-lines{visibility:hidden!important}
      .graph-stage.giar-mobile-bootstrap .graph-loading{opacity:1!important;background:#f7f4ee!important;z-index:40!important}
    }`;
    document.head.appendChild(s);
    stage.classList.add('giar-mobile-bootstrap');
    loading.style.background='#f7f4ee';
    loading.style.opacity='1';
    loading.style.zIndex='40';
  }
  let holding=true;
  loading.classList.remove('is-hidden');
  const observer=new MutationObserver(()=>{if(holding&&loading.classList.contains('is-hidden'))loading.classList.remove('is-hidden')});
  observer.observe(loading,{attributes:true,attributeFilter:['class']});
  window.__GIAR_RELEASE_LOADING_GATE__=()=>{
    if(!holding)return;
    holding=false;
    observer.disconnect();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      stage.classList.remove('giar-mobile-bootstrap');
      loading.classList.add('is-hidden');
      setTimeout(()=>{loading.style.zIndex='2'},280);
    }));
  };
})();

(() => {
  const isTouch=!!(navigator.maxTouchPoints>0||(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches));
  const isPhone=!!(window.matchMedia&&window.matchMedia('(max-width:700px)').matches);
  if(!isTouch||!isPhone)return;
  const style=document.createElement('style');
  style.textContent=`@media(max-width:700px){
    .graph-stage,.graph-cy{height:clamp(360px,50vh,440px)!important;min-height:360px!important}
    .graph-inspector{max-height:16vh!important}
    .graph-candidate-list{max-height:calc(16vh - 2.45rem)!important}
    .graph-person-lines{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;overflow:visible}
    .graph-person-label-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
    .graph-person-mobile-label{position:absolute;display:block;appearance:none;box-sizing:border-box;width:max-content;max-width:43%;padding:2px 4px;border:1px solid rgba(123,47,60,.18);border-radius:3px;background:rgba(255,253,248,.96);color:#5f2430;font:800 10px/1.08 Inter,system-ui,sans-serif;text-align:center;white-space:normal;pointer-events:auto;cursor:pointer;touch-action:manipulation}
    .graph-person-mobile-label.is-former{font-weight:720}
    .graph-person-mobile-label.is-selected{border-color:#5f2430;box-shadow:0 0 0 1px rgba(95,36,48,.22)}
    .graph-person-mobile-line{stroke:#9a877a;stroke-width:1;stroke-opacity:.52;vector-effect:non-scaling-stroke}
  }`;
  document.head.appendChild(style);

  const setup=()=>{
    const cy=window.__GIAR_CY__,container=document.getElementById('graph-cy'),stage=document.getElementById('graph-stage');
    if(!cy||!container||!stage||!window.__GIAR_GRAPH_READY__){setTimeout(setup,30);return;}
    if(cy.__GIAR_REV70_MOBILE__)return;
    cy.__GIAR_REV70_MOBILE__=true;

    cy.style()
      .selector('node[type = "person"]').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0,'text-events':'yes'})
      .selector('node[type = "person"].label-visible').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node[type = "person"].is-hovered').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node.is-dim').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0}).update();

    const NS='http://www.w3.org/2000/svg';
    const lines=document.createElementNS(NS,'svg');lines.classList.add('graph-person-lines');lines.setAttribute('aria-hidden','true');
    const labels=document.createElement('div');labels.className='graph-person-label-layer';stage.append(lines,labels);
    const labelEls=new Map();
    const visibleNodes=()=>cy.nodes().filter(n=>!n.hasClass('is-hidden'));
    const selectedNode=()=>cy.nodes('.is-selected').filter(n=>!n.hasClass('is-hidden')).first();
    const hasSelection=()=>selectedNode().length>0;
    const activeNodes=()=>visibleNodes().filter(n=>!n.hasClass('is-dim'));
    const visiblePeople=()=>visibleNodes().filter('[type = "person"]').filter(n=>!hasSelection()||!n.hasClass('is-dim')).toArray();
    const syncMode=()=>{const on=hasSelection();stage.classList.toggle('mobile-selection-mode',on);return on};

    let overviewZoom=cy.zoom();
    const fitBodies=()=>{const nodes=visibleNodes();if(!nodes.length)return;cy.stop(true,false);cy.resize();const bb=nodes.boundingBox({includeLabels:false}),w=container.clientWidth,h=container.clientHeight,pad=8,fitZoom=Math.min((w-pad*2)/Math.max(1,bb.w),(h-pad*2)/Math.max(1,bb.h)),z=Math.max(cy.minZoom(),Math.min(cy.maxZoom(),fitZoom*.84)),cx=(bb.x1+bb.x2)/2,cy0=(bb.y1+bb.y2)/2;overviewZoom=z;cy.zoom(z);cy.pan({x:w/2-cx*z,y:h/2-cy0*z})};

    let lastFocused='';
    const focusSelection=()=>{
      const sel=selectedNode();
      if(!sel.length){lastFocused='';return false}
      const nodes=activeNodes();
      if(!nodes.length)return false;
      cy.stop(true,false);cy.resize();
      const bb=nodes.boundingBox({includeLabels:false});
      const vp=cy.getFitViewport?cy.getFitViewport(nodes,52):null;
      if(vp){
        const cap=Math.min(cy.maxZoom(),Math.max(overviewZoom*2.15,overviewZoom+.18));
        const z=Math.max(cy.minZoom(),Math.min(vp.zoom,cap));
        let pan=vp.pan;
        if(z<vp.zoom){const w=container.clientWidth,h=container.clientHeight,cx=(bb.x1+bb.x2)/2,cy0=(bb.y1+bb.y2)/2;pan={x:w/2-cx*z,y:h/2-cy0*z}}
        cy.animate({zoom:z,pan},{duration:220,easing:'ease-in-out-cubic',queue:false});
      }else cy.fit(nodes,52);
      lastFocused=sel.id();
      return true;
    };
    const focusIfChanged=()=>{const sel=selectedNode();if(!sel.length){lastFocused='';return false}if(sel.id()===lastFocused)return false;return focusSelection()};

    const selectPerson=id=>{const n=cy.getElementById(id);if(!n||!n.length||n.hasClass('is-hidden'))return;n.emit('tap');setTimeout(()=>{syncMode();focusIfChanged();renderPeople()},35)};
    const ensureLabel=n=>{let el=labelEls.get(n.id());if(!el){el=document.createElement('button');el.type='button';el.className='graph-person-mobile-label';el.dataset.personId=n.id();el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();selectPerson(el.dataset.personId)});labels.appendChild(el);labelEls.set(n.id(),el)}el.textContent=String(n.data('label')||'');el.classList.toggle('is-former',String(n.data('subtype')||'').toLowerCase().startsWith('ex '));el.classList.toggle('is-selected',n.hasClass('is-selected'));return el};

    function renderPeople(){
      syncMode();
      const people=visiblePeople(),keep=new Set(people.map(n=>n.id()));
      for(const [id,el] of labelEls){if(!keep.has(id)){el.remove();labelEls.delete(id)}}
      lines.replaceChildren();if(!people.length)return;
      const w=container.clientWidth,h=container.clientHeight;lines.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const byX=people.slice().sort((a,b)=>a.position('x')-b.position('x')||a.position('y')-b.position('y')),half=Math.ceil(byX.length/2),left=byX.slice(0,half).sort((a,b)=>a.position('y')-b.position('y')),right=byX.slice(half).sort((a,b)=>a.position('y')-b.position('y')),top=Math.min(72,Math.max(54,h*.18)),bottom=8,colMax=Math.min(132,w*.43);
      const place=(items,side)=>{if(!items.length)return;const usable=Math.max(1,h-top-bottom),rowH=usable/items.length,font=Math.max(8.8,Math.min(11.25,rowH*.29));items.forEach((n,i)=>{const el=ensureLabel(n);el.style.maxWidth=`${colMax}px`;el.style.fontSize=`${font}px`;el.style.visibility='hidden';el.style.transform='translate(0,0)';const ew=Math.min(colMax,Math.max(1,el.offsetWidth)),eh=Math.max(1,el.offsetHeight),x=side==='left'?7:Math.max(7,w-7-ew),y=Math.max(top,Math.min(h-bottom-eh,top+i*rowH+(rowH-eh)/2));el.style.transform=`translate(${x}px,${y}px)`;el.style.visibility='visible';const p=n.renderedPosition(),line=document.createElementNS(NS,'line');line.classList.add('graph-person-mobile-line');line.setAttribute('x1',String(Math.max(0,Math.min(w,p.x))));line.setAttribute('y1',String(Math.max(0,Math.min(h,p.y))));line.setAttribute('x2',String(side==='left'?x+ew:x));line.setAttribute('y2',String(y+eh/2));lines.appendChild(line)})};
      place(left,'left');place(right,'right');
    }

    const fit=document.getElementById('fit');if(fit)fit.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();fitBodies();renderPeople()},true);
    const showAll=document.getElementById('show-all');if(showAll)showAll.addEventListener('click',()=>setTimeout(()=>{lastFocused='';syncMode();fitBodies();renderPeople()},40));
    const depth=document.getElementById('selection-depth');if(depth)depth.addEventListener('change',()=>setTimeout(()=>{syncMode();focusSelection();renderPeople()},40));
    cy.on('tap',evt=>{if(evt.target!==cy&&evt.target.isNode?.())setTimeout(()=>{syncMode();focusIfChanged();renderPeople()},35)});
    cy.on('pan zoom',()=>{clearTimeout(cy.__GIAR_REV70_LABEL_TIMER__);cy.__GIAR_REV70_LABEL_TIMER__=setTimeout(renderPeople,120)});
    window.addEventListener('resize',()=>requestAnimationFrame(()=>{if(hasSelection())focusSelection();else fitBodies();renderPeople()}));
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>{if(hasSelection())focusSelection();else fitBodies();renderPeople()},120));

    requestAnimationFrame(()=>requestAnimationFrame(()=>{fitBodies();renderPeople();window.__GIAR_RELEASE_LOADING_GATE__?.()}));
    window.__GIAR_REV70_FIT_MOBILE__=fitBodies;
    window.__GIAR_REV70_FOCUS_SELECTION__=focusSelection;
    window.__GIAR_REV70_RENDER_PERSON_LABELS__=renderPeople;
  };
  if(document.readyState==='complete')setup();else window.addEventListener('load',setup,{once:true});
})();

(() => {
  const isDesktop=!!(window.matchMedia&&window.matchMedia('(min-width:701px)').matches);if(!isDesktop)return;
  const style=document.createElement('style');style.textContent=`@media(min-width:701px){.graph-person-desktop-lines{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}.graph-person-desktop-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}.graph-person-desktop-label{position:absolute;display:block;max-width:210px;padding:3px 6px;border:1px solid rgba(123,47,60,.18);border-radius:4px;background:rgba(255,253,248,.97);color:#5f2430;font:750 12px/1.12 Inter,system-ui,sans-serif;text-align:center;pointer-events:auto;cursor:pointer}.graph-person-desktop-line{stroke:#9a877a;stroke-width:1;stroke-opacity:.42;vector-effect:non-scaling-stroke}}`;document.head.appendChild(style);
  const setup=()=>{const cy=window.__GIAR_CY__,container=document.getElementById('graph-cy'),stage=document.getElementById('graph-stage');if(!cy||!container||!stage||!window.__GIAR_GRAPH_READY__){setTimeout(setup,30);return}if(cy.__GIAR_REV70_DESKTOP__)return;cy.__GIAR_REV70_DESKTOP__=true;cy.style().selector('node[type = "person"]').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0}).selector('node[type = "person"].label-visible').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0}).update();const NS='http://www.w3.org/2000/svg',lines=document.createElementNS(NS,'svg');lines.classList.add('graph-person-desktop-lines');const labels=document.createElement('div');labels.className='graph-person-desktop-layer';stage.append(lines,labels);const map=new Map();const people=()=>cy.nodes('[type = "person"]').filter(n=>!n.hasClass('is-hidden')&&(!cy.nodes('.is-selected').length||!n.hasClass('is-dim'))).toArray();const ensure=n=>{let el=map.get(n.id());if(!el){el=document.createElement('button');el.type='button';el.className='graph-person-desktop-label';el.addEventListener('click',()=>n.emit('tap'));labels.appendChild(el);map.set(n.id(),el)}el.textContent=n.data('label')||'';return el};const render=()=>{const ps=people(),keep=new Set(ps.map(n=>n.id()));for(const [id,el] of map){if(!keep.has(id)){el.remove();map.delete(id)}}lines.replaceChildren();if(!ps.length)return;const w=container.clientWidth,h=container.clientHeight;lines.setAttribute('viewBox',`0 0 ${w} ${h}`);const bx=ps.slice().sort((a,b)=>a.position('x')-b.position('x')),half=Math.ceil(bx.length/2),left=bx.slice(0,half).sort((a,b)=>a.renderedPosition('y')-b.renderedPosition('y')),right=bx.slice(half).sort((a,b)=>a.renderedPosition('y')-b.renderedPosition('y')),top=58,bottom=12,colMax=Math.min(210,Math.max(145,w*.22));const place=(items,side)=>{const usable=Math.max(1,h-top-bottom),rowH=usable/Math.max(1,items.length);items.forEach((n,i)=>{const el=ensure(n);el.style.maxWidth=`${colMax}px`;el.style.visibility='hidden';el.style.transform='translate(0,0)';const ew=Math.min(colMax,Math.max(1,el.offsetWidth)),eh=Math.max(1,el.offsetHeight),x=side==='left'?10:Math.max(10,w-10-ew),y=Math.max(top,Math.min(h-bottom-eh,top+i*rowH+(rowH-eh)/2));el.style.transform=`translate(${x}px,${y}px)`;el.style.visibility='visible';const p=n.renderedPosition(),line=document.createElementNS(NS,'line');line.classList.add('graph-person-desktop-line');line.setAttribute('x1',String(Math.max(0,Math.min(w,p.x))));line.setAttribute('y1',String(Math.max(0,Math.min(h,p.y))));line.setAttribute('x2',String(side==='left'?x+ew:x));line.setAttribute('y2',String(y+eh/2));lines.appendChild(line)})};place(left,'left');place(right,'right')};cy.on('tap pan zoom',()=>setTimeout(render,40));window.addEventListener('resize',render);requestAnimationFrame(()=>requestAnimationFrame(()=>{render();window.__GIAR_RELEASE_LOADING_GATE__?.()}));};if(document.readyState==='complete')setup();else window.addEventListener('load',setup,{once:true});
})();