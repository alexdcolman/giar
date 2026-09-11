(() => {
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){
    toggle.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',String(open));
    });
  }
})();

/* Oculta solamente la construcción visual del grafo. El loader nativo sigue siendo
   el único dueño del estado de carga y no se toca desde este archivo. */
(() => {
  const stage=document.getElementById('graph-stage');
  if(!stage) return;
  const style=document.createElement('style');
  style.id='giar-rev71-visual-hold';
  style.textContent=`
    .graph-stage.giar-enhancing .graph-cy,
    .graph-stage.giar-enhancing .graph-person-label-layer,
    .graph-stage.giar-enhancing .graph-person-lines,
    .graph-stage.giar-enhancing .graph-person-desktop-layer,
    .graph-stage.giar-enhancing .graph-person-desktop-lines{visibility:hidden!important}
  `;
  document.head.appendChild(style);
  stage.classList.add('giar-enhancing');
  let revealed=false;
  const reveal=()=>{
    if(revealed) return;
    revealed=true;
    stage.classList.remove('giar-enhancing');
  };
  window.__GIAR_REVEAL_ENHANCED_GRAPH__=reveal;
  setTimeout(reveal,1800);
})();

(() => {
  const isTouch=!!(navigator.maxTouchPoints>0||(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches));
  const isPhone=!!(window.matchMedia&&window.matchMedia('(max-width:700px)').matches);
  if(!isTouch||!isPhone) return;

  const style=document.createElement('style');
  style.id='giar-rev71-mobile-graph';
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
    .graph-person-label-layer.is-gesturing,.graph-person-lines.is-gesturing{opacity:0}
    .graph-stage.mobile-selection-mode .graph-person-label-layer,
    .graph-stage.mobile-selection-mode .graph-person-lines{display:none!important}
  }`;
  document.head.appendChild(style);

  const setup=()=>{
    const cy=window.__GIAR_CY__;
    const container=document.getElementById('graph-cy');
    const stage=document.getElementById('graph-stage');
    if(!cy||!container||!stage||!window.__GIAR_GRAPH_READY__){setTimeout(setup,30);return;}
    if(cy.__GIAR_REV71_MOBILE__) return;
    cy.__GIAR_REV71_MOBILE__=true;

    cy.style()
      .selector('node.label-visible')
      .style({'z-index':100,'text-background-opacity':1,'text-background-padding':4,'text-border-width':1,'text-opacity':1})
      .selector('node.label-visible.is-selected')
      .style({'z-index':120,'text-background-opacity':1,'text-background-padding':4,'text-border-width':1,'text-opacity':1})
      .selector('node[type = "person"]')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0,'text-events':'yes'})
      .selector('node[type = "person"].label-visible')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node[type = "person"].is-hovered')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node[type = "person"].mobile-selection-native.label-visible.is-related')
      .style({'z-index':100,'text-opacity':1,'text-background-opacity':1,'text-background-padding':4,'text-border-width':1})
      .selector('node[type = "person"].mobile-selection-native.label-visible.is-selected')
      .style({'z-index':120,'text-opacity':1,'text-background-opacity':1,'text-background-padding':4,'text-border-width':1})
      .selector('node.is-dim')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .update();

    const NS='http://www.w3.org/2000/svg';
    const lines=document.createElementNS(NS,'svg');
    lines.classList.add('graph-person-lines');
    lines.setAttribute('aria-hidden','true');
    const labels=document.createElement('div');
    labels.className='graph-person-label-layer';
    labels.setAttribute('aria-label','Integrantes y ex integrantes del grafo');
    stage.append(lines,labels);

    const labelEls=new Map();
    const visibleNodes=()=>cy.nodes().filter(n=>!n.hasClass('is-hidden'));
    const selectedNode=()=>cy.nodes('.is-selected').filter(n=>!n.hasClass('is-hidden')).first();
    const hasSelection=()=>selectedNode().length>0;
    const visiblePeople=()=>visibleNodes().filter('[type = "person"]').toArray();

    const clearOverlay=()=>{
      for(const [,el] of labelEls) el.remove();
      labelEls.clear();
      lines.replaceChildren();
    };

    const syncPersonMode=()=>{
      const selected=hasSelection();
      stage.classList.toggle('mobile-selection-mode',selected);
      cy.nodes('[type = "person"]').toggleClass('mobile-selection-native',selected);
      if(selected) clearOverlay();
      return selected;
    };

    const fitBodies=()=>{
      const nodes=visibleNodes();
      if(!nodes.length) return;
      cy.stop(true,false);
      cy.resize();
      cy.fit(nodes,24);
    };

    let lastFocused='';
    const focusSelection=()=>{
      const selected=selectedNode();
      if(!selected.length){lastFocused='';return false;}
      const nodes=cy.nodes('.is-selected, .is-related').filter(n=>!n.hasClass('is-hidden'));
      if(!nodes.length) return false;
      cy.stop(true,false);
      cy.resize();
      const viewport=cy.getFitViewport?cy.getFitViewport(nodes,36):null;
      if(viewport){
        cy.animate({zoom:viewport.zoom,pan:viewport.pan},{duration:220,easing:'ease-in-out-cubic',queue:false});
      }else{
        cy.fit(nodes,36);
      }
      lastFocused=selected.id();
      return true;
    };

    const focusIfChanged=()=>{
      const selected=selectedNode();
      if(!selected.length){lastFocused='';return false;}
      if(selected.id()===lastFocused) return false;
      return focusSelection();
    };

    const afterSelectionChange=()=>{
      syncPersonMode();
      focusIfChanged();
      renderPeople();
    };

    const selectPerson=id=>{
      const n=cy.getElementById(id);
      if(!n||!n.length||n.hasClass('is-hidden')) return;
      n.emit('tap');
      setTimeout(afterSelectionChange,35);
    };

    const ensureLabel=n=>{
      let el=labelEls.get(n.id());
      if(!el){
        el=document.createElement('button');
        el.type='button';
        el.className='graph-person-mobile-label';
        el.dataset.personId=n.id();
        el.addEventListener('click',event=>{
          event.preventDefault();
          event.stopPropagation();
          selectPerson(el.dataset.personId);
        });
        labels.appendChild(el);
        labelEls.set(n.id(),el);
      }
      el.textContent=String(n.data('label')||'');
      el.setAttribute('aria-label',`Seleccionar ${String(n.data('label')||'integrante')}`);
      el.classList.toggle('is-former',String(n.data('subtype')||'').toLocaleLowerCase('es').startsWith('ex '));
      el.classList.toggle('is-selected',n.hasClass('is-selected'));
      return el;
    };

    function renderPeople(){
      if(syncPersonMode()) return;
      const people=visiblePeople();
      const keep=new Set(people.map(n=>n.id()));
      for(const [id,el] of labelEls){
        if(!keep.has(id)){el.remove();labelEls.delete(id);}
      }
      lines.replaceChildren();
      if(!people.length) return;

      const w=Math.max(1,container.clientWidth);
      const h=Math.max(1,container.clientHeight);
      lines.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const byX=people.slice().sort((a,b)=>a.position('x')-b.position('x')||a.position('y')-b.position('y'));
      const half=Math.ceil(byX.length/2);
      const left=byX.slice(0,half).sort((a,b)=>a.position('y')-b.position('y'));
      const right=byX.slice(half).sort((a,b)=>a.position('y')-b.position('y'));
      const top=Math.min(72,Math.max(54,h*.18));
      const bottom=8;
      const colMax=Math.min(132,w*.43);

      const place=(items,side)=>{
        if(!items.length) return;
        const usable=Math.max(1,h-top-bottom);
        const rowH=usable/items.length;
        const font=Math.max(8.8,Math.min(11.25,rowH*.29));
        items.forEach((n,i)=>{
          const el=ensureLabel(n);
          el.style.maxWidth=`${colMax}px`;
          el.style.fontSize=`${font}px`;
          el.style.visibility='hidden';
          el.style.transform='translate(0,0)';
          const ew=Math.min(colMax,Math.max(1,el.offsetWidth));
          const eh=Math.max(1,el.offsetHeight);
          const x=side==='left'?7:Math.max(7,w-7-ew);
          const y=Math.max(top,Math.min(h-bottom-eh,top+i*rowH+(rowH-eh)/2));
          el.style.transform=`translate(${x}px,${y}px)`;
          el.style.visibility='visible';
          const p=n.renderedPosition();
          const line=document.createElementNS(NS,'line');
          line.classList.add('graph-person-mobile-line');
          line.setAttribute('x1',String(Math.max(0,Math.min(w,p.x))));
          line.setAttribute('y1',String(Math.max(0,Math.min(h,p.y))));
          line.setAttribute('x2',String(side==='left'?x+ew:x));
          line.setAttribute('y2',String(y+eh/2));
          lines.appendChild(line);
        });
      };

      place(left,'left');
      place(right,'right');
    }

    let gestureTimer=0;
    const beginOverlayGesture=()=>{
      if(hasSelection()) return;
      labels.classList.add('is-gesturing');
      lines.classList.add('is-gesturing');
      clearTimeout(gestureTimer);
      gestureTimer=setTimeout(()=>{
        labels.classList.remove('is-gesturing');
        lines.classList.remove('is-gesturing');
        renderPeople();
      },140);
    };

    const fit=document.getElementById('fit');
    if(fit) fit.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      fitBodies();
      renderPeople();
    },true);

    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>setTimeout(()=>{
      lastFocused='';
      syncPersonMode();
      fitBodies();
      renderPeople();
    },40));

    const visibility=document.getElementById('graph-visibility');
    if(visibility) visibility.addEventListener('toggle',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      syncPersonMode();
      if(hasSelection()) focusSelection(); else fitBodies();
      renderPeople();
    })));

    const depth=document.getElementById('selection-depth');
    if(depth) depth.addEventListener('change',()=>setTimeout(()=>{
      syncPersonMode();
      focusSelection();
      renderPeople();
    },35));

    document.querySelectorAll('[data-node-filter],[data-edge-filter]').forEach(input=>{
      input.addEventListener('change',()=>setTimeout(afterSelectionChange,35));
    });
    document.addEventListener('click',event=>{
      if(event.target.closest?.('.graph-search-result')) setTimeout(afterSelectionChange,45);
    });

    cy.on('tap',()=>setTimeout(afterSelectionChange,35));
    cy.on('pan zoom',beginOverlayGesture);
    window.addEventListener('resize',()=>requestAnimationFrame(()=>{
      if(hasSelection()) focusSelection(); else fitBodies();
      renderPeople();
    }));
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>{
      if(hasSelection()) focusSelection(); else fitBodies();
      renderPeople();
    },120));

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      renderPeople();
      window.__GIAR_REVEAL_ENHANCED_GRAPH__?.();
    }));

    window.__GIAR_REV71_FIT_MOBILE__=fitBodies;
    window.__GIAR_REV71_FOCUS_SELECTION__=focusSelection;
    window.__GIAR_REV71_RENDER_PERSON_LABELS__=renderPeople;
  };

  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();

(() => {
  const isDesktop=!!(window.matchMedia&&window.matchMedia('(min-width:701px)').matches);
  if(!isDesktop) return;

  const style=document.createElement('style');
  style.id='giar-rev71-desktop-person-labels';
  style.textContent=`@media(min-width:701px){
    .graph-person-desktop-lines{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;overflow:visible}
    .graph-person-desktop-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
    .graph-person-desktop-label{position:absolute;display:block;max-width:210px;padding:3px 6px;border:1px solid rgba(123,47,60,.18);border-radius:4px;background:rgba(255,253,248,.97);color:#5f2430;font:750 12px/1.12 Inter,system-ui,sans-serif;text-align:center;pointer-events:auto;cursor:pointer}
    .graph-person-desktop-label.is-former{font-weight:680;background:rgba(255,253,248,.94)}
    .graph-person-desktop-label.is-selected{border-color:#5f2430;box-shadow:0 0 0 1px rgba(95,36,48,.24)}
    .graph-person-desktop-line{stroke:#9a877a;stroke-width:1;stroke-opacity:.42;vector-effect:non-scaling-stroke}
    .graph-person-desktop-layer.is-gesturing,.graph-person-desktop-lines.is-gesturing{opacity:0}
  }`;
  document.head.appendChild(style);

  const setup=()=>{
    const cy=window.__GIAR_CY__;
    const container=document.getElementById('graph-cy');
    const stage=document.getElementById('graph-stage');
    if(!cy||!container||!stage||!window.__GIAR_GRAPH_READY__){setTimeout(setup,30);return;}
    if(cy.__GIAR_REV71_DESKTOP__) return;
    cy.__GIAR_REV71_DESKTOP__=true;

    cy.style()
      .selector('node[type = "person"]')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node[type = "person"].label-visible')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node[type = "person"].is-hovered')
      .style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .update();

    const NS='http://www.w3.org/2000/svg';
    const lines=document.createElementNS(NS,'svg');
    lines.classList.add('graph-person-desktop-lines');
    lines.setAttribute('aria-hidden','true');
    const labels=document.createElement('div');
    labels.className='graph-person-desktop-layer';
    stage.append(lines,labels);
    const labelEls=new Map();

    const people=()=>{
      const hasSelection=cy.nodes('.is-selected').length>0;
      return cy.nodes('[type = "person"]').filter(n=>!n.hasClass('is-hidden')&&(!hasSelection||!n.hasClass('is-dim'))).toArray();
    };

    const ensure=n=>{
      let el=labelEls.get(n.id());
      if(!el){
        el=document.createElement('button');
        el.type='button';
        el.className='graph-person-desktop-label';
        el.addEventListener('click',()=>n.emit('tap'));
        labels.appendChild(el);
        labelEls.set(n.id(),el);
      }
      el.textContent=String(n.data('label')||'');
      el.classList.toggle('is-former',String(n.data('subtype')||'').toLocaleLowerCase('es').startsWith('ex '));
      el.classList.toggle('is-selected',n.hasClass('is-selected'));
      return el;
    };

    const render=()=>{
      const ps=people();
      const keep=new Set(ps.map(n=>n.id()));
      for(const [id,el] of labelEls){
        if(!keep.has(id)){el.remove();labelEls.delete(id);}
      }
      lines.replaceChildren();
      if(!ps.length) return;
      const w=Math.max(1,container.clientWidth);
      const h=Math.max(1,container.clientHeight);
      lines.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const byX=ps.slice().sort((a,b)=>a.position('x')-b.position('x'));
      const half=Math.ceil(byX.length/2);
      const left=byX.slice(0,half).sort((a,b)=>a.renderedPosition('y')-b.renderedPosition('y'));
      const right=byX.slice(half).sort((a,b)=>a.renderedPosition('y')-b.renderedPosition('y'));
      const top=58,bottom=12,colMax=Math.min(210,Math.max(145,w*.22));
      const place=(items,side)=>{
        if(!items.length) return;
        const usable=Math.max(1,h-top-bottom);
        const rowH=usable/items.length;
        items.forEach((n,i)=>{
          const el=ensure(n);
          el.style.maxWidth=`${colMax}px`;
          el.style.visibility='hidden';
          el.style.transform='translate(0,0)';
          const ew=Math.min(colMax,Math.max(1,el.offsetWidth));
          const eh=Math.max(1,el.offsetHeight);
          const x=side==='left'?10:Math.max(10,w-10-ew);
          const y=Math.max(top,Math.min(h-bottom-eh,top+i*rowH+(rowH-eh)/2));
          el.style.transform=`translate(${x}px,${y}px)`;
          el.style.visibility='visible';
          const p=n.renderedPosition();
          const line=document.createElementNS(NS,'line');
          line.classList.add('graph-person-desktop-line');
          line.setAttribute('x1',String(Math.max(0,Math.min(w,p.x))));
          line.setAttribute('y1',String(Math.max(0,Math.min(h,p.y))));
          line.setAttribute('x2',String(side==='left'?x+ew:x));
          line.setAttribute('y2',String(y+eh/2));
          lines.appendChild(line);
        });
      };
      place(left,'left');
      place(right,'right');
    };

    let gestureTimer=0;
    const beginGesture=()=>{
      labels.classList.add('is-gesturing');
      lines.classList.add('is-gesturing');
      clearTimeout(gestureTimer);
      gestureTimer=setTimeout(()=>{
        labels.classList.remove('is-gesturing');
        lines.classList.remove('is-gesturing');
        render();
      },130);
    };

    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>setTimeout(render,40));
    const depth=document.getElementById('selection-depth');
    if(depth) depth.addEventListener('change',()=>setTimeout(render,40));
    document.querySelectorAll('[data-node-filter],[data-edge-filter]').forEach(input=>input.addEventListener('change',()=>setTimeout(render,40)));
    document.addEventListener('click',event=>{if(event.target.closest?.('.graph-search-result')) setTimeout(render,50);});
    cy.on('tap',()=>setTimeout(render,40));
    cy.on('pan zoom',beginGesture);
    window.addEventListener('resize',render);
    document.addEventListener('fullscreenchange',()=>setTimeout(render,140));

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      render();
      window.__GIAR_REVEAL_ENHANCED_GRAPH__?.();
    }));
    window.__GIAR_REV71_RENDER_DESKTOP_PERSON_LABELS__=render;
  };

  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();