/* Local GSAP motion layer. No remote runtime dependencies; supports reduced motion. */
(function(){
 'use strict';
 var gs=window.gsap, reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 var tokens=new WeakMap(), started=new WeakSet();
 function animated(){return !!gs&&!reduced.matches;}
 function cleanup(el){if(gs)gs.set(el,{clearProps:'height,opacity,transform,overflow'});else{el.style.height='';el.style.opacity='';el.style.transform='';el.style.overflow='';}}
 function reveal(el,open){
  var ticket={};tokens.set(el,ticket);if(gs)gs.killTweensOf(el);
  el.inert=!open;el.dataset.guideReveal=open?'opening':'closing';
  if(!animated()){el.hidden=!open;cleanup(el);el.dataset.guideReveal=open?'open':'closed';return;}
  var wasHidden=el.hidden;el.hidden=false;
  var current=wasHidden?0:el.getBoundingClientRect().height;
  el.style.height='auto';var target=el.getBoundingClientRect().height;
  gs.set(el,{height:current,overflow:'hidden',opacity:wasHidden?0:gs.getProperty(el,'opacity')});
  gs.to(el,{height:open?target:0,opacity:open?1:0,duration:open?.48:.38,ease:'power2.inOut',overwrite:true,onComplete:function(){if(tokens.get(el)!==ticket)return;el.hidden=!open;cleanup(el);el.dataset.guideReveal=open?'open':'closed';}});
 }
 function swap(el,render){
  if(!el)return;
  el.dataset.guideMotion='swapping';
  var ticket={};tokens.set(el,ticket);if(gs)gs.killTweensOf(el);
  if(!animated()||!el.children.length||el.closest('[hidden]')){render();cleanup(el);el.dataset.guideMotion='idle';return;}
  var before=el.getBoundingClientRect().height;
  gs.to(el,{opacity:.08,y:3,duration:.14,ease:'power1.in',overwrite:true,onComplete:function(){
   if(tokens.get(el)!==ticket)return;
   el.style.height='auto';render();var after=el.getBoundingClientRect().height;
   gs.fromTo(el,{height:before,opacity:.08,y:7,overflow:'hidden'},{height:after,opacity:1,y:0,duration:.42,ease:'power2.out',overwrite:true,onComplete:function(){if(tokens.get(el)===ticket){cleanup(el);el.dataset.guideMotion='idle';}}});
  }});
 }
 function start(root){
  if(started.has(root))return;started.add(root);
  var loader=root.querySelector('[data-guide-preloader]');if(!loader){root.removeAttribute('data-guide-intro');return;}
  var controls=root.querySelector('[data-guide-controls]')||root.querySelector('.tg-guide__workspace');
  var startedAt=performance.now();root.dataset.preloaderStarted=String(startedAt);controls.inert=true;
  var inner=loader.querySelector('.tg-guide__preloader-inner'),bar=loader.querySelector('[data-guide-load-progress]');
  var entrance=root.querySelectorAll('.tg-guide__heading,.tg-guide__intro-note,.tg-guide__group:not([data-locked="true"]),.tg-guide__factors');
  var ticker,prepared=animated();
  if(prepared)gs.set(entrance,{autoAlpha:0,y:9});
  // Release the CSS gate only after GSAP owns the same hidden starting state.
  root.dataset.guideIntro='loading';
  if(prepared){gs.fromTo(inner,{autoAlpha:0,y:8},{autoAlpha:1,y:0,duration:.36,ease:'power2.out'});ticker=gs.fromTo(bar,{scaleX:0},{scaleX:.88,duration:1.1,ease:'power2.out'});}
  var photos=Array.from(root.querySelectorAll('img')).map(function(img){return img.decode?img.decode().catch(function(){}):Promise.resolve();});
  var fontReady=document.fonts?document.fonts.ready:Promise.resolve();
  var ready=Promise.race([Promise.all(photos.concat([fontReady])),new Promise(function(resolve){setTimeout(resolve,2800);})]);
  Promise.all([ready,new Promise(function(resolve){setTimeout(resolve,400);})]).then(function(){
   if(ticker)ticker.kill();root.dataset.preloaderHold=String(Math.round(performance.now()-startedAt));
   function finish(){loader.hidden=true;controls.inert=false;root.dataset.preloaderFinished=String(performance.now());
    function complete(){root.dataset.guideIntro='complete';root.dataset.guideMotionReady='true';}
    if(prepared&&animated()){
     root.dataset.guideIntro='entering';
     gs.to(entrance,{autoAlpha:1,y:0,duration:.65,stagger:.055,ease:'power2.out',clearProps:'opacity,visibility,transform',onComplete:complete});
    }else{if(prepared)gs.set(entrance,{clearProps:'opacity,visibility,transform'});complete();}
   }
   if(animated()){gs.timeline({onComplete:finish}).to(bar,{scaleX:1,duration:.14,ease:'power1.out'}).to(inner,{opacity:0,y:-5,duration:.24,ease:'power1.in'},.1).to(loader,{opacity:0,duration:.42,ease:'power2.inOut'},.18);}else{finish();}
  });
 }
 window.TokatliannGuideMotion={reveal:reveal,swap:swap,start:start};
 function fallback(){var root=document.querySelector('[data-tokatliann-guide]');if(root)setTimeout(function(){start(root);},0);}
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',fallback,{once:true});else fallback();
}());
