(()=>{
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 // The One seal is lit by a moving, narrow reflection, controlled by scroll.
 const seal=document.querySelector('.one-seal'),offer=document.querySelector('.focused-one');let raf=0;
 function paint(){raf=0;if(reduced.matches)return;const r=offer.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));seal.style.setProperty('--shine',`${p*150-25}%`);seal.style.setProperty('--seal-y',`${(p-.5)*-24}px`);}
 addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(paint)},{passive:true});paint();
 offer.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=offer.getBoundingClientRect();seal.style.setProperty('--light',`${(e.clientX-r.left)/r.width*100}%`);},{passive:true});
})();
