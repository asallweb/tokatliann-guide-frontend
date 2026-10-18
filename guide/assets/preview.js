/* Controls the captured site shell in the file:// preview only. */
(function () {
 'use strict';
 var button=document.querySelector('.preview-shell .icon-menu');
 if(!button) return;
 function close(){document.documentElement.classList.remove('menu-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Открыть меню');}
 button.addEventListener('click',function(){var open=document.documentElement.classList.toggle('menu-open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
 document.addEventListener('keydown',function(event){if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
 document.querySelectorAll('.preview-shell .menu__body a').forEach(function(link){link.addEventListener('click',close);});
}());
