/* TOKATLIANN GUIDE — sequential state model; see docs/REQUIREMENTS.md. */
(function(){
 'use strict';
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 function init(){
  var root=document.querySelector('[data-tokatliann-guide]');
  if(!root||root.dataset.guideReady==='true')return;
  var motion=window.TokatliannGuideMotion||{reveal:function(e,open){e.hidden=!open;},swap:function(e,paint){paint();},start:function(){var el=root.querySelector('[data-guide-preloader]');if(el)setTimeout(function(){el.hidden=true;root.dataset.guideMotionReady='true';},400);}};
  var data,json=document.getElementById('tokatliann-guide-data');
  try{data=json?JSON.parse(json.textContent):window.TokatliannGuideData;if(!data||!Array.isArray(data.groups)||!data.groups.length||!Array.isArray(data.conditions)||!Array.isArray(data.factors)||!data.recommendations||!data.products)throw new Error('Invalid guide data');}catch(error){showError();motion.start(root);return;}
  root.dataset.guideReady='true';
  var conditions=new Map(data.conditions.map(function(x){return [x.id,x];})),factors=new Map(data.factors.map(function(x){return [x.id,x];}));
  var selections=new Map(data.groups.map(function(x){return [x.id,null];})),selectedFactors=new Set(),periods=new Map(),signs=new Map(),more=new Set(),order=[],active=null;
  var groupsRoot=root.querySelector('[data-guide-groups]'),factorsRoot=root.querySelector('[data-guide-factors]'),contextsRoot=root.querySelector('[data-guide-contexts]'),resultRoot=root.querySelector('[data-guide-result]'),status=root.querySelector('[data-guide-status]'),progress=root.querySelector('[data-guide-progress]');
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x];});}
  function icon(name,cls){return '<img class="'+(cls||'')+'" src="assets/icons/'+esc(name)+'.svg" width="24" height="24" alt="" aria-hidden="true">';}
  function label(id){var item=conditions.get(id)||factors.get(id);return item?item.label:'Знакомство с уходом';}
  function safeLink(value){if(typeof value!=='string'||!value.trim()||/[\u0000-\u0020\\]/.test(value))return null;return /^https?:\/\//i.test(value)||/^\/(?!\/)/.test(value)?value:null;}
  function safeImage(value){return typeof value==='string'&&/^assets\/images\/[a-z0-9_.-]+$/i.test(value)?value:safeLink(value)||'assets/images/cream-hq.png';}
  function announce(text){status.textContent=text;}
  function groupFor(id){return data.groups.find(function(g){return g.conditions.indexOf(id)!==-1;});}
  function complete(){return data.groups.every(function(g){return !!selections.get(g.id);});}
  function available(index){return data.groups.slice(0,index).every(function(g){return !!selections.get(g.id);});}
  function selectedIds(){return order.filter(function(id){return Array.from(selections.values()).indexOf(id)!==-1||selectedFactors.has(id);});}
  function track(id){order=order.filter(function(x){return x!==id;});order.push(id);}
  function currentView(){
   if(!complete()){
    var rec=data.defaultRecommendation||data.recommendations[data.defaultSelection]||Object.values(data.recommendations)[0];
    return {key:'default',rec:rec,productId:data.settings&&data.settings.defaultProductId||rec.productId||Object.keys(data.products)[0],isDefault:true};
   }
   var id=active&&data.recommendations[active]?active:selectedIds().slice(-1)[0];
   return {key:id,rec:data.recommendations[id],productId:data.recommendations[id].productId,isDefault:false};
  }
  function setExpanded(group,open){
   var index=data.groups.indexOf(group),button=root.querySelector('#guide-heading-'+group.id),panel=root.querySelector('#guide-panel-'+group.id);
   if(open&&!available(index))return;
   button.setAttribute('aria-expanded',String(open));motion.reveal(panel,open);
  }
  function syncAccess(openAfter){
   data.groups.forEach(function(group,index){
    var allowed=available(index),section=root.querySelector('[data-group="'+group.id+'"]'),button=section.querySelector('[data-action="group"]');
    section.dataset.locked=String(!allowed);button.disabled=!allowed;button.setAttribute('aria-disabled',String(!allowed));
    section.querySelector('.tg-guide__group-hint').textContent=allowed?group.hint:'Сначала выберите состояние в разделе «'+data.groups[index-1].title+'»';
    if(!allowed&&button.getAttribute('aria-expanded')==='true')setExpanded(group,false);
    if(!allowed)section.querySelector('.tg-guide__group-body').inert=true;
   });
   var done=complete(),step=data.groups.findIndex(function(g){return !selections.get(g.id);});
   root.dataset.guideComplete=String(done);root.dataset.guideStep=String(done?data.groups.length:step+1);
   progress.textContent=done?'Все три шага пройдены · рекомендации доступны отдельно':'Шаг '+(step+1)+' из '+data.groups.length+' · выберите состояние кожи';
   if(openAfter>=0){var next=data.groups[openAfter+1];if(next&&!selections.get(next.id))setExpanded(next,true);}
  }
  function renderGroups(){
   groupsRoot.innerHTML=data.groups.map(function(group,index){return '<section class="tg-guide__group" data-group="'+esc(group.id)+'" data-locked="'+(index>0)+'"><h2><button class="tg-guide__group-heading" type="button" id="guide-heading-'+esc(group.id)+'" aria-expanded="'+(index===0)+'" aria-controls="guide-panel-'+esc(group.id)+'" aria-disabled="'+(index>0)+'" '+(index?'disabled':'')+' data-action="group" data-id="'+esc(group.id)+'"><span class="tg-guide__number" aria-hidden="true">'+(index+1)+'</span><span class="tg-guide__group-copy"><span class="tg-guide__group-name">'+esc(group.title)+'</span><span class="tg-guide__group-hint">'+esc(group.hint)+'</span></span>'+icon('chevron-down','tg-guide__chevron')+'</button></h2><div class="tg-guide__group-body" id="guide-panel-'+esc(group.id)+'" data-guide-reveal="'+(index?'closed':'open')+'" role="region" aria-labelledby="guide-heading-'+esc(group.id)+'"'+(index?' hidden inert':'')+'><div class="tg-guide__condition-list" role="group" aria-label="'+esc(group.title)+'">'+group.conditions.map(function(id){return '<button class="tg-guide__pill" type="button" data-action="condition" data-id="'+esc(id)+'" aria-pressed="false">'+esc(label(id))+'</button>';}).join('')+'</div><div data-guide-info="'+esc(group.id)+'"></div></div></section>';}).join('');
   data.groups.forEach(function(group){renderGroupInfo(group,true);});
  }
  function renderGroupInfo(group,immediate){
   var area=root.querySelector('[data-guide-info="'+group.id+'"]');
   root.querySelectorAll('[data-group="'+group.id+'"] [data-action="condition"]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.id===selections.get(group.id)));});
   if(immediate)paintGroupInfo(group);else motion.swap(area,function(){paintGroupInfo(group);});
  }
  function paintGroupInfo(group){
   var id=selections.get(group.id),area=root.querySelector('[data-guide-info="'+group.id+'"]');
   if(!id){area.innerHTML='<p class="tg-guide__empty-group">Выберите состояние, чтобы посмотреть проявления и перейти к следующему шагу.</p>';return;}
   var item=conditions.get(id),currentSign=signs.get(id);
   area.innerHTML='<div class="tg-guide__state-info"><img class="tg-guide__state-image" src="'+esc(safeImage(item.image))+'" alt="'+esc(item.imageAlt||'Косметическая текстура')+'" width="1254" height="1254"><div class="tg-guide__state-copy"><p class="tg-guide__state-description">'+esc(item.description)+'</p><button class="tg-guide__more" type="button" data-action="more" data-id="'+esc(id)+'" aria-expanded="'+more.has(id)+'" aria-controls="guide-more-'+esc(id)+'">Узнать больше '+icon('arrow-right')+'</button></div></div><div class="tg-guide__signs" role="group" aria-label="Проявления: '+esc(item.label)+'"><span class="tg-guide__signs-label">Проявления:</span>'+item.signs.map(function(sign,index){return '<button class="tg-guide__sign" type="button" aria-pressed="'+(currentSign===index)+'" aria-controls="guide-sign-'+esc(id)+'" data-action="sign" data-id="'+esc(id)+'" data-index="'+index+'">'+esc(sign.label)+'</button>';}).join('')+'</div><p class="tg-guide__explanation" id="guide-sign-'+esc(id)+'"'+(currentSign===undefined?' hidden':'')+'>'+esc(currentSign===undefined?'':item.signs[currentSign].text)+'</p><p class="tg-guide__explanation" id="guide-more-'+esc(id)+'"'+(more.has(id)?'':' hidden')+'>'+esc(item.more)+'</p>';
  }
  function renderFactors(){factorsRoot.innerHTML=data.factors.map(function(item){return '<button class="tg-guide__factor" type="button" aria-pressed="false" data-action="factor" data-id="'+esc(item.id)+'">'+icon(item.icon)+'<span>'+esc(item.label)+'</span></button>';}).join('');}
  function renderContexts(){
   var focused=document.activeElement&&document.activeElement.dataset.action==='context'?document.activeElement.dataset.id:null,ids=selectedIds();
   contextsRoot.hidden=!complete()||ids.length<2;
   contextsRoot.innerHTML='<span class="tg-guide__contexts-label">Отдельная рекомендация:</span>'+ids.map(function(id){return '<button class="tg-guide__context" type="button" aria-pressed="'+(id===active)+'" data-action="context" data-id="'+esc(id)+'">'+esc(label(id))+'</button>';}).join('');
   if(focused&&!contextsRoot.hidden){var focus=root.querySelector('[data-action="context"][data-id="'+focused+'"]');if(focus)focus.focus({preventScroll:true});}
  }
  function renderResult(immediate){if(immediate)paintResult();else motion.swap(resultRoot,paintResult);}
  function setActive(id){active=id;renderResult();renderContexts();var view=currentView();announce(view.isDefault?'Завершите три шага. Пока показан товар по умолчанию.':'Рекомендация: '+label(id)+'. '+view.rec.title);}
  function routineMarkup(rec,period){return (rec.routines&&rec.routines[period]||rec.routine).map(function(step){return '<li><img class="tg-guide__routine-image" src="'+esc(safeImage(step.image))+'" alt="" width="96" height="96"><span><span class="tg-guide__step-name">'+esc(step.title)+'</span><span class="tg-guide__step-note">'+esc(step.note)+'</span></span></li>';}).join('');}
  function paintResult(){
   var view=currentView(),rec=view.rec,product=data.products[view.productId],period=periods.get(view.key)||'morning';
   var detail=product&&safeLink(product.detailUrl),buy=product&&safeLink(product.buyUrl),name=product?product.name:'Товар ещё не назначен',icons=['droplet','layers','sparkles'];
   resultRoot.innerHTML='<article class="tg-guide__recommendation" data-recommendation="'+esc(view.key)+'" data-product-id="'+esc(view.productId)+'"><img class="tg-guide__product-image" src="'+esc(safeImage(product&&product.image))+'" alt="'+esc(product&&product.imageAlt||'Товар каталога')+'" width="1536" height="1024"><div class="tg-guide__recommendation-copy"><p class="tg-guide__label">'+(view.isDefault?'Выбор TOKATLIANN':'Ваш уход · '+esc(label(view.key)))+'</p><h2 id="guide-recommendation-title">'+esc(rec.title)+'</h2><p class="tg-guide__recommendation-description">'+esc(rec.description)+'</p><div class="tg-guide__benefits">'+rec.benefits.map(function(text,index){return '<span class="tg-guide__benefit"><span class="tg-guide__benefit-icon">'+icon(icons[index%3])+'</span><span>'+esc(text)+'</span></span>';}).join('')+'</div><p class="tg-guide__product-name" title="'+esc(name)+'">'+esc(name)+'</p><p class="tg-guide__product-assignment">'+(view.isDefault?'Товар по умолчанию · демо-настройка':'Товар из каталога · демо-сочетание')+'</p><div class="tg-guide__actions">'+(detail?'<a class="tg-guide__button tg-guide__button--dark" href="'+esc(detail)+'">Подробнее '+icon('arrow-right')+'</a>':'<button class="tg-guide__button tg-guide__button--dark" type="button" data-action="product" aria-expanded="false" aria-controls="guide-product-detail">Подробнее '+icon('arrow-right')+'</button>')+'<a class="tg-guide__button" '+(buy?'href="'+esc(buy)+'"':'role="link" aria-disabled="true" tabindex="-1" aria-describedby="guide-product-note"')+'>Купить '+icon('shopping-bag')+'</a></div><p class="tg-guide__product-note" id="guide-product-note">'+(buy?'Переход к товару в магазине.':'Покупка станет доступна после назначения товара.')+'</p></div></article><aside class="tg-guide__routine" aria-labelledby="guide-routine-title"><h3 id="guide-routine-title">Пример рутины<br>в вашей ситуации</h3><div class="tg-guide__routine-tabs" role="tablist" aria-label="Время ухода">'+['morning','evening'].map(function(id){return '<button class="tg-guide__period" id="guide-'+id+'" role="tab" type="button" aria-controls="guide-steps" aria-selected="'+(period===id)+'" tabindex="'+(period===id?'0':'-1')+'" data-action="period" data-period="'+id+'">'+(id==='morning'?'Утро':'Вечер')+'</button>';}).join('')+'</div><div id="guide-steps" role="tabpanel" aria-labelledby="guide-'+period+'" data-guide-steps><ol>'+routineMarkup(rec,period)+'</ol></div><p class="tg-guide__routine-note">Демонстрационная схема</p></aside><div class="tg-guide__detail" id="guide-product-detail" hidden><h3>'+esc(name)+'</h3><p>'+esc(rec.description)+'</p><button class="tg-guide__detail-close" type="button" data-action="close-product">Свернуть подробности</button></div>';
  }
  root.addEventListener('click',function(event){
   var button=event.target.closest('[data-action]');if(!button||!root.contains(button)||button.disabled)return;
   var action=button.dataset.action,id=button.dataset.id;
   if(action==='group'){var group=groupForHeading(id);setExpanded(group,button.getAttribute('aria-expanded')!=='true');}
   else if(action==='condition'){
    var group=groupFor(id),index=data.groups.indexOf(group);if(!available(index))return;
    var deselect=selections.get(group.id)===id;selections.set(group.id,deselect?null:id);renderGroupInfo(group);
    if(deselect){
     var removed=[id];data.groups.slice(index+1).forEach(function(g){var old=selections.get(g.id);if(old)removed.push(old);selections.set(g.id,null);renderGroupInfo(g,true);});
     removed.forEach(function(x){signs.delete(x);more.delete(x);periods.delete(x);});order=order.filter(function(x){return removed.indexOf(x)===-1;});if(removed.indexOf(active)!==-1)active=selectedIds().slice(-1)[0]||null;
     syncAccess(-1);renderContexts();renderResult();announce('Выбор снят. Последующие шаги сброшены; показан товар по умолчанию.');
    }else{track(id);syncAccess(index);setActive(id);}
   }else if(action==='factor'){
    var was=selectedFactors.has(id);if(was){selectedFactors.delete(id);order=order.filter(function(x){return x!==id;});if(active===id)active=selectedIds().slice(-1)[0]||null;}else{selectedFactors.add(id);track(id);active=id;}
    button.setAttribute('aria-pressed',String(!was));renderResult();renderContexts();announce(complete()?'Фактор: '+label(id):'Фактор сохранён. До завершения трёх шагов показан товар по умолчанию.');
   }else if(action==='context'){if(complete())setActive(id);}
   else if(action==='period'){
    var view=currentView(),period=button.dataset.period;periods.set(view.key,period);
    root.querySelectorAll('[data-action="period"]').forEach(function(tab){var chosen=tab.dataset.period===period;tab.setAttribute('aria-selected',String(chosen));tab.tabIndex=chosen?0:-1;});
    var steps=root.querySelector('[data-guide-steps]');steps.setAttribute('aria-labelledby','guide-'+period);motion.swap(steps,function(){steps.innerHTML='<ol>'+routineMarkup(currentView().rec,period)+'</ol>';});announce((period==='morning'?'Утренняя':'Вечерняя')+' схема ухода');
   }else if(action==='sign'){
    var index=Number(button.dataset.index),same=signs.get(id)===index;if(same)signs.delete(id);else signs.set(id,index);
    var text=root.querySelector('#guide-sign-'+id);if(!same)text.textContent=conditions.get(id).signs[index].text;motion.reveal(text,!same);
    button.parentNode.querySelectorAll('[data-action="sign"]').forEach(function(b){b.setAttribute('aria-pressed',String(!same&&Number(b.dataset.index)===index));});if(!same)announce(text.textContent);
   }else if(action==='more'){var open=!more.has(id);if(open)more.add(id);else more.delete(id);button.setAttribute('aria-expanded',String(open));motion.reveal(root.querySelector('#guide-more-'+id),open);}
   else if(action==='product'){var open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));motion.reveal(root.querySelector('#guide-product-detail'),open);}
   else if(action==='close-product'){motion.reveal(root.querySelector('#guide-product-detail'),false);var opener=root.querySelector('[data-action="product"]');opener.setAttribute('aria-expanded','false');opener.focus();}
  });
  function groupForHeading(id){return data.groups.find(function(g){return g.id===id;});}
  root.addEventListener('keydown',function(event){if(!event.target.matches('[data-action="period"]')||['ArrowLeft','ArrowRight','Home','End'].indexOf(event.key)===-1)return;event.preventDefault();var tabs=Array.from(root.querySelectorAll('[data-action="period"]'));var index=event.key==='Home'?0:event.key==='End'?1:(tabs.indexOf(event.target)+1)%tabs.length;tabs[index].focus();tabs[index].click();});
  renderGroups();syncAccess(-1);renderFactors();renderContexts();renderResult(true);motion.start(root);
  function showError(){var result=root.querySelector('[data-guide-result]');if(result){result.textContent='Не удалось загрузить данные гайда. Проверьте guide-data.js и обновите страницу.';result.setAttribute('role','alert');}}
 }
}());
