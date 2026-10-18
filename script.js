const t=document.querySelector('.toggle'),l=document.querySelector('.links');
t.addEventListener('click',()=>{const o=l.classList.toggle('open');t.setAttribute('aria-expanded',o)});

// Click any image in <main> to view it full screen
const lightbox = document.createElement('dialog');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<img alt="">';
document.body.appendChild(lightbox);
const bigImg = lightbox.querySelector('img');

function openLightbox(img) {
  bigImg.src = img.currentSrc || img.src;
  bigImg.alt = img.alt;
  lightbox.showModal();
}

document.querySelectorAll('main img:not(#preview)').forEach(img => {
  img.tabIndex = 0; // lets keyboard users focus it
  img.addEventListener('click', () => openLightbox(img));
  img.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
  });
});

lightbox.addEventListener('click', () => lightbox.close());
