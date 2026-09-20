/* A continuous ribbon of light: dispersed channels resolve into one flow.
   Local canvas only, paused offscreen, capped density, no scroll interception. */
(()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const surfaces=[];let frame=0,previous=0;
 for(const selector of ['.focused-one','.closing']){
  const host=document.querySelector(selector);if(!host)continue;
  const canvas=document.createElement('canvas');canvas.className='signal-surface';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  surfaces.push({host,canvas,ctx:canvas.getContext('2d'),visible:false,w:0,h:0,x:.72,y:.3,tx:.72,ty:.3});
 }
 const resize=new ResizeObserver(entries=>{for(const entry of entries){const s=surfaces.find(s=>s.host===entry.target);if(!s)continue;const dpr=Math.min(devicePixelRatio||1,1.5);s.w=s.host.clientWidth;s.h=s.host.clientHeight;s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);}request();});
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){const s=surfaces.find(s=>s.host===entry.target);s.visible=entry.isIntersecting;}request();},{rootMargin:'100px'});
 function draw(s,time){
  const {ctx:c,w,h}=s;if(!w||!h)return;
  const rect=s.host.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+h)));
  s.x+=(s.tx-s.x)*.035;s.y+=(s.ty-s.y)*.035;
  c.clearRect(0,0,w,h);
  const center=w*(.81+(s.x-.5)*.045),phase=motion.matches?0:time*.00013;
  const glow=c.createRadialGradient(center,h*.3,0,center,h*.3,w*.65);glow.addColorStop(0,'rgba(79,131,163,.15)');glow.addColorStop(1,'rgba(13,29,44,0)');c.fillStyle=glow;c.fillRect(0,0,w,h);
  const count=w<600?24:42;
  for(let n=0;n<count;n++){
   const q=n/(count-1),offset=(q-.5)*w*.58;
   c.beginPath();
   for(let k=0;k<=100;k++){
    const t=k/100,y=t*h;
    const neck=.18+.82*Math.pow(Math.abs(t-.42)*1.7,1.5);
    const bend=Math.sin(t*5.1+progress*1.4+phase*.18)*w*.13;
    const x=center+offset*neck+bend+Math.sin(t*8+phase+q*2)*w*.012;
    k?c.lineTo(x,y):c.moveTo(x,y);
   }
   const gradient=c.createLinearGradient(center-w*.2,0,center,h);gradient.addColorStop(0,'rgba(124,157,181,.02)');gradient.addColorStop(.3,`rgba(135,183,210,${.14+Math.sin(q*Math.PI)*.22})`);gradient.addColorStop(.56,`rgba(228,148,96,${n%7===0?.52:.1})`);gradient.addColorStop(1,'rgba(98,142,173,.015)');c.strokeStyle=gradient;c.lineWidth=n%7===0?1.15:.65;c.stroke();
  }
 }
 function tick(time){frame=0;if(time-previous<32&&!motion.matches){request();return;}previous=time;surfaces.filter(s=>s.visible).forEach(s=>draw(s,time));if(!motion.matches&&surfaces.some(s=>s.visible)&&!document.hidden)request();}
 function request(){if(!frame)frame=requestAnimationFrame(tick);}
 for(const s of surfaces){resize.observe(s.host);observer.observe(s.host);s.host.addEventListener('pointermove',e=>{const r=s.host.getBoundingClientRect();s.tx=(e.clientX-r.left)/r.width;s.ty=(e.clientY-r.top)/r.height;if(!motion.matches){s.host.style.setProperty('--light-x',`${s.tx*100}%`);s.host.style.setProperty('--light-y',`${s.ty*100}%`);}},{passive:true});}
 const demo=document.querySelector('.practice-demo'),practice=document.querySelector('.practice-section');
 let scrollFrame=0;
 function scrollEffect(){scrollFrame=0;if(demo){const r=demo.getBoundingClientRect();const tilt=motion.matches?0:Math.max(0,Math.min(5,(r.top/innerHeight)*5));demo.style.setProperty('--demo-tilt',`${tilt}deg`);}request();}
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollEffect);},{passive:true});
 practice?.addEventListener('pointermove',e=>{if(motion.matches)return;const r=practice.getBoundingClientRect();practice.style.setProperty('--light-x',`${(e.clientX-r.left)/r.width*100}%`);practice.style.setProperty('--light-y',`${(e.clientY-r.top)/r.height*100}%`);},{passive:true});
 document.addEventListener('visibilitychange',request);motion.addEventListener('change',scrollEffect);scrollEffect();
})();
