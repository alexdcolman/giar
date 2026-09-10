
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
      .graph-inspector{max-height:24vh;border-radius:10px;padding:.62rem 2.55rem .72rem .8rem;overscroll-behavior:contain}
      .graph-inspector .inspector-type{font-size:.6rem}
      .graph-inspector .inspector-title{font-size:1rem;line-height:1.16;margin:.18rem 0 .32rem}
      .graph-inspector .inspector-description{font-size:.72rem;line-height:1.35;margin:.08rem 0 .24rem}
      .graph-inspector .inspector-link{margin-top:.2rem;font-size:.76rem}
      .graph-inspector-close{top:.38rem;right:.42rem;width:1.75rem;height:1.75rem}
      .graph-candidate-list{max-height:calc(24vh - 3.1rem);overflow:auto}
      .graph-candidate-list .graph-search-result{min-height:38px;padding:.32rem .2rem}
      .graph-candidate-list .graph-search-result strong{font-size:.86rem}
      .graph-candidate-list .graph-search-result span{font-size:.62rem}
    }`;
    document.head.appendChild(style);
  }
  const setup=()=>{
    const cy=window.__GIAR_CY__,container=document.getElementById('graph-cy');
    if(!cy||!container||!window.__GIAR_GRAPH_READY__){window.setTimeout(setup,60);return}
    if(cy.__GIAR_REV58_MOBILE__) return;
    cy.__GIAR_REV58_MOBILE__=true;
    const fitMobile=()=>{
      const nodes=cy.nodes().filter(n=>!n.hasClass('is-hidden'));
      if(!nodes.length) return;
      const bb=nodes.boundingBox({includeLabels:false,includeOverlays:false,includeNodes:true,includeEdges:false});
      const pad=26,w=Math.max(1,container.clientWidth-pad*2),h=Math.max(1,container.clientHeight-pad*2);
      const level=Math.min(cy.maxZoom(),Math.max(cy.minZoom(),Math.min(w/Math.max(1,bb.w),h/Math.max(1,bb.h))));
      const cx=(bb.x1+bb.x2)/2,cy0=(bb.y1+bb.y2)/2;
      cy.stop(true,false);
      cy.viewport({zoom:level,pan:{x:container.clientWidth/2-cx*level,y:container.clientHeight/2-cy0*level}});
    };
    const nativeAnimate=cy.animate.bind(cy);
    cy.animate=(properties,params)=>{
      if(properties?.fit && cy.nodes('.is-selected').length) return cy;
      return nativeAnimate(properties,params);
    };
    const fitButton=document.getElementById('fit');
    if(fitButton) fitButton.addEventListener('click',evt=>{evt.preventDefault();evt.stopImmediatePropagation();fitMobile()},true);
    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>requestAnimationFrame(fitMobile));
    const visibility=document.getElementById('graph-visibility');
    if(visibility) visibility.addEventListener('toggle',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!cy.nodes('.is-selected').length)fitMobile()})));
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>{if(!cy.nodes('.is-selected').length)fitMobile()},120));
    fitMobile();
    window.__GIAR_REV58_FIT_MOBILE__=fitMobile;
  };
  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();
