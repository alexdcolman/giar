
(() => {
  const toggle=document.querySelector('.nav-toggle');
  const nav=document.querySelector('.main-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
})();

(() => {
  const isTouch=!!(navigator.maxTouchPoints>0||(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches));
  if(!isTouch) return;

  const style=document.createElement('style');
  style.id='giar-rev59-mobile-graph';
  style.textContent=`@media(max-width:700px){
    .graph-stage,.graph-cy{height:clamp(360px,50vh,440px)!important;min-height:360px!important}
    .graph-inspector{max-height:16vh!important}
    .graph-candidate-list{max-height:calc(16vh - 2.45rem)!important}
  }`;
  document.head.appendChild(style);

  const setup=()=>{
    const cy=window.__GIAR_CY__;
    const container=document.getElementById('graph-cy');
    if(!cy||!container||!window.__GIAR_GRAPH_READY__){setTimeout(setup,40);return;}
    if(cy.__GIAR_REV59_MOBILE__) return;
    cy.__GIAR_REV59_MOBILE__=true;

    const visibleNodes=()=>cy.nodes().filter(n=>!n.hasClass('is-hidden'));
    const fitTouch=()=>{
      const nodes=visibleNodes();
      if(!nodes.length) return;
      cy.stop(true,false);
      cy.resize();
      cy.fit(nodes,14);
    };

    const nativeAnimate=cy.animate.bind(cy);
    cy.animate=(properties,params)=>{
      if(properties?.fit&&cy.nodes('.is-selected').length) return cy;
      return nativeAnimate(properties,params);
    };

    const fit=document.getElementById('fit');
    if(fit) fit.addEventListener('click',evt=>{
      evt.preventDefault();
      evt.stopImmediatePropagation();
      fitTouch();
    },true);

    const showAll=document.getElementById('show-all');
    if(showAll) showAll.addEventListener('click',()=>setTimeout(fitTouch,20));

    const visibility=document.getElementById('graph-visibility');
    if(visibility) visibility.addEventListener('toggle',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(!cy.nodes('.is-selected').length) fitTouch();
    })));

    document.addEventListener('fullscreenchange',()=>setTimeout(()=>{
      if(!cy.nodes('.is-selected').length) fitTouch();
    },120));

    requestAnimationFrame(()=>requestAnimationFrame(fitTouch));
    window.__GIAR_REV59_FIT_MOBILE__=fitTouch;
  };

  if(document.readyState==='complete') setup();
  else window.addEventListener('load',setup,{once:true});
})();
