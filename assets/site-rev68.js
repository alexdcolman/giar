(() => {
  /* Compatibilidad temporal para clientes móviles que conservaron en caché
     el bootstrap intermedio de REV69. Ese bootstrap todavía solicita
     site-rev68.js?v=69. En lugar de dejarlo en 404, reenviamos a la lógica
     vigente con una URL versionada para evitar reutilizar el site.js obsoleto. */
  const current=document.currentScript;
  const base=current?.src || new URL('site-rev68.js',location.href).href;
  const script=document.createElement('script');
  script.src=new URL('site.js?v=70',base).href;
  script.async=false;
  document.head.appendChild(script);
})();
