const t=document.querySelector('.toggle'),l=document.querySelector('.links');
t.addEventListener('click',()=>{const o=l.classList.toggle('open');t.setAttribute('aria-expanded',o)});
