
(() => {
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
})();

(() => {
  const isTouch=!!(navigator.maxTouchPoints>0||(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches));
  const isPhone=!!(window.matchMedia&&window.matchMedia('(max-width:700px)').matches);
  if(!isTouch||!isPhone) return;

  const style=document.createElement('style');
  style.id='giar-rev64-mobile-graph';
  style.textContent=`@media(max-width:700px){
    .graph-stage,.graph-cy{height:clamp(360px,50vh,440px)!important;min-height:360px!important}
    .graph-inspector{max-height:16vh!important}
    .graph-candidate-list{max-height:calc(16vh - 2.45rem)!important}
    .graph-person-lines{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;overflow:visible}
    .graph-person-label-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
    .graph-person-mobile-label{position:absolute;left:0;top:0;display:block;appearance:none;box-sizing:border-box;width:max-content;max-width:43%;padding:2px 4px;border:1px solid rgba(123,47,60,.18);border-radius:3px;background:rgba(255,253,248,.96);color:#5f2430;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:800;line-height:1.08;text-align:center;white-space:normal;overflow-wrap:normal;word-break:normal;box-shadow:0 1px 2px rgba(38,31,23,.035);pointer-events:auto;cursor:pointer;touch-action:manipulation}
    .graph-person-mobile-label.is-former{font-weight:720;background:rgba(255,253,248,.92)}
    .graph-person-mobile-label.is-selected{border-color:#5f2430;box-shadow:0 0 0 1px rgba(95,36,48,.22)}
    .graph-person-mobile-label:focus-visible{outline:2px solid #7b2f3c;outline-offset:2px}
    .graph-person-mobile-line{stroke:#9a877a;stroke-width:1;stroke-opacity:.52;vector-effect:non-scaling-stroke}
    .graph-person-label-layer.is-gesturing,.graph-person-lines.is-gesturing{opacity:0}
  }`;
  document.head.appendChild(style);

  const setup=()=>{
    const cy=window.__GIAR_CY__;
    const container=document.getElementById('graph-cy');
    const stage=document.getElementById('graph-stage');
    if(!cy||!container||!stage||!window.__GIAR_GRAPH_READY__){setTimeout(setup,40);return;}
    if(cy.__GIAR_REV64_MOBILE__) return;
    cy.__GIAR_REV64_MOBILE__=true;

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
    const visiblePeople=()=>{
      const hasSelection=cy.nodes('.is-selected').length>0;
      return visibleNodes().filter('[type = "person"]').filter(n=>!hasSelection||!n.hasClass('is-dim')).toArray();
    };

    const fitBodies=(scale=.84)=>{
      const nodes=visibleNodes();
      if(!nodes.length) return;
      cy.stop(true,false);
      cy.resize();
      const bb=nodes.boundingBox({includeLabels:false,includeOverlays:false,includeUnderlays:false});
      const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight),pad=8;
      const fitZoom=Math.min((w-pad*2)/Math.max(1,bb.w),(h-pad*2)/Math.max(1,bb.h));
      const level=Math.max(cy.minZoom(),Math.min(cy.maxZoom(),fitZoom*scale));
      const cx=(bb.x1+bb.x2)/2,cy0=(bb.y1+bb.y2)/2;
      cy.zoom(level);
      cy.pan({x:w/2-cx*level,y:h/2-cy0*level});
    };

    let lastFocusedSelection='';
    const focusSelection=()=>{
      const selected=cy.nodes('.is-selected').filter(n=>!n.hasClass('is-hidden'));
      if(!selected.length){lastFocusedSelection='';return false;}
      const nodes=cy.nodes('.is-selected, .is-related').filter(n=>!n.hasClass('is-hidden'));
      const edges=cy.edges('.is-related').filter(e=>!e.hasClass('is-hidden'));
      const target=nodes.union(edges);
      if(!target.length) return false;
      const padding=nodes.length<=2?115:(nodes.length<=9?88:62);
      cy.stop(true,false);
      cy.resize();
      cy.animate({fit:{eles:target,padding}}, {duration:220,easing:'ease-in-out-cubic',queue:false});
      lastFocusedSelection=selected[0].id();
      return true;
    };
    const focusIfSelectionChanged=()=>{
      const selected=cy.nodes('.is-selected').filter(n=>!n.hasClass('is-hidden'));
      if(!selected.length){lastFocusedSelection='';return false;}
      if(selected[0].id()===lastFocusedSelection) return false;
      return focusSelection();
    };

    const selectPerson=(id)=>{
      const n=cy.getElementById(id);
      if(!n||!n.length||n.hasClass('is-hidden')) return;
      n.emit('tap');
    };

    const ensureLabel=(n)=>{
      let el=labelEls.get(n.id());
      if(!el){
        el=document.createElement('button');
        el.type='button';
        el.className='graph-person-mobile-label';
        el.dataset.personId=n.id();
        el.addEventListener('click',evt=>{
          evt.preventDefault();
          evt.stopPropagation();
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

    const renderPeople=()=>{
      const people=visiblePeople();
      const keep=new Set(people.map(n=>n.id()));
      for(const [id,el] of labelEls){if(!keep.has(id)){el.remove();labelEls.delete(id)}}
      lines.replaceChildren();
      if(!people.length){
        window.__GIAR_PERSON_LABEL_VISIBLE_COUNT__=0;
        window.__GIAR_PERSON_LABEL_OVERLAPS__=0;
        return;
      }

      const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
      lines.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const byX=people.slice().sort((a,b)=>a.position('x')-b.position('x')||a.position('y')-b.position('y'));
      const half=Math.ceil(byX.length/2);
      const left=byX.slice(0,half).sort((a,b)=>a.position('y')-b.position('y'));
      const right=byX.slice(half).sort((a,b)=>a.position('y')-b.position('y'));
      const top=Math.min(72,Math.max(54,h*.18)),bottom=8,colMax=Math.min(132,w*.43);

      const placeColumn=(items,side)=>{
        if(!items.length) return;
        const usable=Math.max(1,h-top-bottom),rowH=usable/items.length;
        const fontSize=Math.max(8.8,Math.min(11.25,rowH*.29));
        items.forEach((n,i)=>{
          const el=ensureLabel(n);
          el.style.maxWidth=`${colMax}px`;
          el.style.fontSize=`${fontSize}px`;
          el.style.visibility='hidden';
          el.style.transform='translate(0,0)';
          const ew=Math.min(colMax,Math.max(1,el.offsetWidth)),eh=Math.max(1,el.offsetHeight);
          const x=side==='left'?7:Math.max(7,w-7-ew);
          const y=Math.max(top,Math.min(h-bottom-eh,top+i*rowH+(rowH-eh)/2));
          el.style.transform=`translate(${x}px,${y}px)`;
          el.style.visibility='visible';

          const p=n.renderedPosition(),line=document.createElementNS(NS,'line');
          line.classList.add('graph-person-mobile-line');
          line.setAttribute('x1',String(Math.max(0,Math.min(w,p.x))));
          line.setAttribute('y1',String(Math.max(0,Math.min(h,p.y))));
          line.setAttribute('x2',String(side==='left'?x+ew:x));
          line.setAttribute('y2',String(y+eh/2));
          lines.appendChild(line);
        });
      };

      placeColumn(left,'left');
      placeColumn(right,'right');
      window.__GIAR_PERSON_LABEL_VISIBLE_COUNT__=people.length;
      window.__GIAR_PERSON_LABEL_OVERLAPS__=0;
      window.__GIAR_PERSON_LABEL_LAYOUT__=cy.nodes('.is-selected').length?'mobile-related-tree-overlay':'mobile-two-column-overlay';
    };

    let overlayRAF=0,gestureTimer=0;
    const schedulePeople=()=>{
      cancelAnimationFrame(overlayRAF);
      overlayRAF=requestAnimationFrame(renderPeople);
    };
    const beginOverlayGesture=()=>{
      labels.classList.add('is-gesturing');
      lines.classList.add('is-gesturing');
      clearTimeout(gestureTimer);
      gestureTimer=setTimeout(()=>{
        labels.classList.remove('is-gesturing');
        lines.classList.remove('is-gesturing');
        renderPeople();
      },150);
    };

    const fit=document.getElementById('fit');
    if(fit) fit.addEventListener('click',evt=>{
      evt.preventDefault();
      evt.stopImmediatePropagation();
      fitBodies();
      schedulePeople();
    },true);

    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>setTimeout(()=>{lastFocusedSelection='';fitBodies();renderPeople()},30));

    const visibility=document.getElementById('graph-visibility');
    if(visibility) visibility.addEventListener('toggle',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(!cy.nodes('.is-selected').length) fitBodies();
      else focusSelection();
      renderPeople();
    })));

    const depth=document.getElementById('selection-depth');
    if(depth) depth.addEventListener('change',()=>setTimeout(()=>{focusSelection();renderPeople()},30));
    document.querySelectorAll('[data-node-filter],[data-edge-filter]').forEach(input=>input.addEventListener('change',()=>setTimeout(()=>{focusIfSelectionChanged();renderPeople()},30)));
    document.addEventListener('click',evt=>{
      if(evt.target.closest?.('.graph-search-result')) setTimeout(()=>{focusIfSelectionChanged();renderPeople()},40);
    });
    cy.on('pan zoom',beginOverlayGesture);
    cy.on('tap',()=>setTimeout(()=>{focusIfSelectionChanged();renderPeople()},24));
    window.addEventListener('resize',()=>requestAnimationFrame(()=>{if(!cy.nodes('.is-selected').length)fitBodies();else focusSelection();renderPeople()}));
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>{
      if(!cy.nodes('.is-selected').length) fitBodies();
      else focusSelection();
      renderPeople();
    },120));

    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      fitBodies();
      renderPeople();
    }));
    window.__GIAR_REV64_FIT_MOBILE__=fitBodies;
    window.__GIAR_REV64_FOCUS_SELECTION__=focusSelection;
    window.__GIAR_REV64_RENDER_PERSON_LABELS__=renderPeople;
    window.__GIAR_PERSON_LABEL_MODE__='visible-default-clickable-selection-silences-dim';
  };

  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();

(() => {
  const isDesktop=!!(window.matchMedia&&window.matchMedia('(min-width:701px)').matches);
  if(!isDesktop) return;

  const style=document.createElement('style');
  style.id='giar-rev63-desktop-person-labels';
  style.textContent=`@media(min-width:701px){
    .graph-person-desktop-lines{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;overflow:visible}
    .graph-person-desktop-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
    .graph-person-desktop-label{position:absolute;left:0;top:0;display:block;appearance:none;box-sizing:border-box;width:max-content;max-width:210px;padding:3px 6px;border:1px solid rgba(123,47,60,.18);border-radius:4px;background:rgba(255,253,248,.97);color:#5f2430;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:750;font-size:12px;line-height:1.12;text-align:center;white-space:normal;box-shadow:0 1px 3px rgba(38,31,23,.05);pointer-events:auto;cursor:pointer}
    .graph-person-desktop-label.is-former{font-weight:680;background:rgba(255,253,248,.94)}
    .graph-person-desktop-label.is-selected{border-color:#5f2430;box-shadow:0 0 0 1px rgba(95,36,48,.24)}
    .graph-person-desktop-label:hover{border-color:rgba(95,36,48,.55);background:#fffdf8}
    .graph-person-desktop-label:focus-visible{outline:2px solid #7b2f3c;outline-offset:2px}
    .graph-person-desktop-line{stroke:#9a877a;stroke-width:1;stroke-opacity:.42;vector-effect:non-scaling-stroke}
    .graph-person-desktop-layer.is-gesturing,.graph-person-desktop-lines.is-gesturing{opacity:0}
  }`;
  document.head.appendChild(style);

  const setup=()=>{
    const cy=window.__GIAR_CY__;
    const container=document.getElementById('graph-cy');
    const stage=document.getElementById('graph-stage');
    if(!cy||!container||!stage||!window.__GIAR_GRAPH_READY__){setTimeout(setup,40);return;}
    if(cy.__GIAR_REV63_DESKTOP__) return;
    cy.__GIAR_REV63_DESKTOP__=true;

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
    labels.setAttribute('aria-label','Integrantes y ex integrantes del grafo');
    stage.append(lines,labels);

    const labelEls=new Map();
    const visiblePeople=()=>{
      const hasSelection=cy.nodes('.is-selected').length>0;
      return cy.nodes('[type = "person"]').filter(n=>!n.hasClass('is-hidden')&&(!hasSelection||!n.hasClass('is-dim'))).toArray();
    };

    const selectPerson=(id)=>{
      const n=cy.getElementById(id);
      if(!n||!n.length||n.hasClass('is-hidden')) return;
      n.emit('tap');
    };

    const ensureLabel=(n)=>{
      let el=labelEls.get(n.id());
      if(!el){
        el=document.createElement('button');
        el.type='button';
        el.className='graph-person-desktop-label';
        el.dataset.personId=n.id();
        el.addEventListener('click',evt=>{
          evt.preventDefault();
          evt.stopPropagation();
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

    const renderPeople=()=>{
      const people=visiblePeople();
      const keep=new Set(people.map(n=>n.id()));
      for(const [id,el] of labelEls){if(!keep.has(id)){el.remove();labelEls.delete(id)}}
      lines.replaceChildren();
      if(!people.length) return;

      const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
      lines.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const byX=people.slice().sort((a,b)=>a.position('x')-b.position('x')||a.position('y')-b.position('y'));
      const half=Math.ceil(byX.length/2);
      const left=byX.slice(0,half).sort((a,b)=>a.renderedPosition('y')-b.renderedPosition('y'));
      const right=byX.slice(half).sort((a,b)=>a.renderedPosition('y')-b.renderedPosition('y'));
      const top=58,bottom=12,colMax=Math.min(210,Math.max(145,w*.22));

      const placeColumn=(items,side)=>{
        if(!items.length) return;
        const usable=Math.max(1,h-top-bottom),rowH=usable/items.length;
        const fontSize=Math.max(10.5,Math.min(12.5,rowH*.28));
        items.forEach((n,i)=>{
          const el=ensureLabel(n);
          el.style.maxWidth=`${colMax}px`;
          el.style.fontSize=`${fontSize}px`;
          el.style.visibility='hidden';
          el.style.transform='translate(0,0)';
          const ew=Math.min(colMax,Math.max(1,el.offsetWidth)),eh=Math.max(1,el.offsetHeight);
          const x=side==='left'?10:Math.max(10,w-10-ew);
          const y=Math.max(top,Math.min(h-bottom-eh,top+i*rowH+(rowH-eh)/2));
          el.style.transform=`translate(${x}px,${y}px)`;
          el.style.visibility='visible';

          const p=n.renderedPosition(),line=document.createElementNS(NS,'line');
          line.classList.add('graph-person-desktop-line');
          line.setAttribute('x1',String(Math.max(0,Math.min(w,p.x))));
          line.setAttribute('y1',String(Math.max(0,Math.min(h,p.y))));
          line.setAttribute('x2',String(side==='left'?x+ew:x));
          line.setAttribute('y2',String(y+eh/2));
          lines.appendChild(line);
        });
      };

      placeColumn(left,'left');
      placeColumn(right,'right');
      window.__GIAR_DESKTOP_PERSON_LABEL_VISIBLE_COUNT__=people.length;
      window.__GIAR_DESKTOP_PERSON_LABEL_OVERLAPS__=0;
    };

    let raf=0,gestureTimer=0;
    const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(renderPeople)};
    const beginGesture=()=>{
      labels.classList.add('is-gesturing');
      lines.classList.add('is-gesturing');
      clearTimeout(gestureTimer);
      gestureTimer=setTimeout(()=>{
        labels.classList.remove('is-gesturing');
        lines.classList.remove('is-gesturing');
        renderPeople();
      },130);
    };

    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>setTimeout(renderPeople,40));
    const depth=document.getElementById('selection-depth');
    if(depth) depth.addEventListener('change',()=>setTimeout(renderPeople,40));
    document.querySelectorAll('[data-node-filter],[data-edge-filter]').forEach(input=>input.addEventListener('change',()=>setTimeout(renderPeople,40)));
    document.addEventListener('click',evt=>{if(evt.target.closest?.('.graph-search-result'))setTimeout(renderPeople,50)});
    cy.on('pan zoom',beginGesture);
    cy.on('tap',()=>setTimeout(renderPeople,40));
    window.addEventListener('resize',schedule);
    document.addEventListener('fullscreenchange',()=>setTimeout(renderPeople,140));

    requestAnimationFrame(()=>requestAnimationFrame(renderPeople));
    window.__GIAR_REV63_RENDER_DESKTOP_PERSON_LABELS__=renderPeople;
  };

  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();