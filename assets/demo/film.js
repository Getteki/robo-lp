(()=>{
const video=document.getElementById('gerencia-film'),player=document.getElementById('motion-player');if(!video||!player)return;
const toggle=document.getElementById('motion-toggle'),center=document.getElementById('motion-center'),seek=document.getElementById('motion-seek'),clock=document.getElementById('motion-clock'),fullscreen=document.getElementById('motion-fullscreen');
const buttons=[...document.querySelectorAll('[data-film-time]')],label=document.getElementById('film-label'),caption=document.getElementById('film-caption'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let manualPause=false,visible=false,localMedia=null,seekTicket=0;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
video.controls=false;video.muted=true;document.getElementById('motion-controls').hidden=false;
function sync(){const t=video.currentTime,i=t>=49?-1:Math.min(6,Math.floor(t/7));buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));label.textContent=i<0?'GERENCIA':buttons[i].textContent;caption.textContent='Apresentação animada do gerencIA';seek.value=t;clock.textContent=`${fmt(t)} / ${fmt(video.duration||51)}`;toggle.textContent=video.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',video.paused?'Reproduzir vídeo':'Pausar vídeo');center.hidden=!video.paused;player.classList.toggle('is-playing',!video.paused);}
function play(){video.play().catch(()=>sync());}
function togglePlayback(){manualPause=!video.paused;if(video.paused){if(video.ended)video.currentTime=0;play();}else video.pause();}
toggle.addEventListener('click',togglePlayback);center.addEventListener('click',togglePlayback);video.addEventListener('click',togglePlayback);
async function jump(t){const ticket=++seekTicket;
if(video.seekable.length&&video.seekable.end(0)>=t){video.currentTime=t;sync();return;}
if(!localMedia)localMedia=fetch(video.querySelector('source').src).then(r=>{if(!r.ok)throw new Error('media');return r.blob();}).then(URL.createObjectURL);
player.classList.add('is-loading');const url=await localMedia;if(ticket!==seekTicket)return;
if(video.src!==url){await new Promise(resolve=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.src=url;video.load();});}
video.currentTime=t;player.classList.remove('is-loading');sync();
}
buttons.forEach(b=>b.addEventListener('click',()=>{manualPause=false;jump(Number(b.dataset.filmTime)).then(play).catch(()=>player.classList.remove('is-loading'));}));
seek.addEventListener('input',()=>{clock.textContent=`${fmt(Number(seek.value))} / 0:51`;});seek.addEventListener('change',()=>{const wasPlaying=!video.paused;jump(Number(seek.value)).then(()=>{if(wasPlaying)play();}).catch(()=>player.classList.remove('is-loading'));});
function expandFallback(){const on=player.classList.toggle('is-expanded');fullscreen.setAttribute('aria-label',on?'Sair da tela cheia':'Entrar em tela cheia');}
fullscreen.addEventListener('click',async()=>{if(player.classList.contains('is-expanded')){expandFallback();return;}if(document.fullscreenElement){await document.exitFullscreen();return;}try{if(document.fullscreenEnabled&&player.requestFullscreen)await player.requestFullscreen();else expandFallback();}catch{expandFallback();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&player.classList.contains('is-expanded'))expandFallback();});
document.addEventListener('fullscreenchange',()=>fullscreen.setAttribute('aria-label',document.fullscreenElement?'Sair da tela cheia':'Entrar em tela cheia'));
for(const event of ['timeupdate','play','pause','ended','loadedmetadata'])video.addEventListener(event,sync);
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.4;if(!visible)video.pause();else if(!manualPause&&!reduced.matches&&!document.hidden&&!video.ended)play();},{threshold:[0,.4]}).observe(video);
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(visible&&!manualPause&&!reduced.matches&&!video.ended)play();});reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();});sync();
})();
