
(() => {
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
})();

(() => {
  const coarse=window.matchMedia?.('(pointer: coarse)').matches || ('ontouchstart' in window);
  if(!coarse) return;
  if(!document.getElementById('giar-rev58-mobile-style')){
    const style=document.createElement('style');
    style.id='giar-rev58-mobile-style';
    style.textContent=`@media(max-width:700px){
      .graph-inspector{max-height:18vh;border-radius:10px;padding:.58rem 2.45rem .62rem .72rem;overscroll-behavior:contain}
      .graph-inspector h3{font-size:.62rem;margin:.05rem 0 .3rem}
      .graph-inspector .inspector-type{font-size:.58rem}
      .graph-inspector .inspector-title{font-size:.98rem;line-height:1.12;margin:.12rem 0 .24rem}
      .graph-inspector .inspector-description{font-size:.7rem;line-height:1.32;margin:.06rem 0 .18rem}
      .graph-inspector .inspector-link{margin-top:.16rem;font-size:.72rem}
      .graph-inspector-close{top:.3rem;right:.34rem;width:1.65rem;height:1.65rem}
      .graph-candidate-list{max-height:calc(18vh - 2.45rem);overflow:auto}
      .graph-candidate-list .graph-search-result{min-height:34px;padding:.24rem .15rem}
      .graph-candidate-list .graph-search-result strong{font-size:.82rem}
      .graph-candidate-list .graph-search-result span{font-size:.58rem}
    }`;
    document.head.appendChild(style);
  }
  const setup=()=>{
    const cy=window.__GIAR_CY__,container=document.getElementById('graph-cy');
    if(!cy||!container||!window.__GIAR_GRAPH_READY__){window.setTimeout(setup,60);return}
    if(cy.__GIAR_REV58_MOBILE__) return;
    cy.__GIAR_REV58_MOBILE__=true;

    cy.style()
      .selector('node.mobile-label-suppressed').style({'text-opacity':0,'text-background-opacity':0,'text-border-width':0})
      .selector('node.mobile-label-suppressed.is-selected').style({'text-opacity':1,'text-background-opacity':.94,'text-border-width':1})
      .update();

    const overlaps=(a,b)=>!(a.r+4<b.l||b.r+4<a.l||a.b+4<b.t||b.b+4<a.t);
    const declutterLabels=()=>{
      const ids=window.__GIAR_LABEL_VISIBLE_IDS__||[],boxes=window.__GIAR_LABEL_BOXES__||[];
      cy.nodes('.mobile-label-suppressed').removeClass('mobile-label-suppressed');
      if(ids.length!==boxes.length) return;
      const accepted=[];
      for(let i=0;i<ids.length;i++){
        const n=cy.getElementById(ids[i]),box=boxes[i];
        if(!n.length||!box) continue;
        const collision=accepted.some(x=>overlaps(box,x));
        if(n.data('type')==='person'&&collision&&!n.hasClass('is-selected')) n.addClass('mobile-label-suppressed');
        else accepted.push(box);
      }
    };
    let declutterTimer=0;
    const scheduleDeclutter=(delay=190)=>{clearTimeout(declutterTimer);declutterTimer=setTimeout(declutterLabels,delay)};

    const fitMobile=()=>{
      const nodes=cy.nodes().filter(n=>!n.hasClass('is-hidden'));
      if(!nodes.length) return;
      const bb=nodes.boundingBox({includeLabels:false,includeOverlays:false,includeNodes:true,includeEdges:false});
      const pad=24,w=Math.max(1,container.clientWidth-pad*2),h=Math.max(1,container.clientHeight-pad*2);
      const level=Math.min(cy.maxZoom(),Math.max(cy.minZoom(),Math.min(w/Math.max(1,bb.w),h/Math.max(1,bb.h))));
      const cx=(bb.x1+bb.x2)/2,cy0=(bb.y1+bb.y2)/2;
      cy.stop(true,false);
      cy.viewport({zoom:level,pan:{x:container.clientWidth/2-cx*level,y:container.clientHeight/2-cy0*level}});
      scheduleDeclutter();
    };

    const nativeAnimate=cy.animate.bind(cy);
    cy.animate=(properties,params)=>{
      if(properties?.fit && cy.nodes('.is-selected').length) return cy;
      return nativeAnimate(properties,params);
    };

    cy.on('zoom pan',()=>scheduleDeclutter());
    cy.on('tap',()=>scheduleDeclutter(210));
    document.addEventListener('click',evt=>{if(evt.target.closest?.('.graph-search-result'))scheduleDeclutter(210)},true);

    const fitButton=document.getElementById('fit');
    if(fitButton) fitButton.addEventListener('click',evt=>{evt.preventDefault();evt.stopImmediatePropagation();fitMobile()},true);
    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>requestAnimationFrame(fitMobile));
    const visibility=document.getElementById('graph-visibility');
    if(visibility) visibility.addEventListener('toggle',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!cy.nodes('.is-selected').length)fitMobile()})));
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>{if(!cy.nodes('.is-selected').length)fitMobile()},120));

    fitMobile();
    scheduleDeclutter(260);
    window.__GIAR_REV58_FIT_MOBILE__=fitMobile;
    window.__GIAR_REV58_DECLUTTER_LABELS__=declutterLabels;
  };
  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();
