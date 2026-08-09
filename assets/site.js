// Site skin behaviour, ported from the .cc scripts.js without jQuery.
// Runs once per element: the DCMSX admin preview re-executes this script
// after morphing edited blocks into the page, so the IIFE avoids top-level
// redeclarations and the WeakSet stops survivors being double-bound.
(function () {
const bound = (window.__dcmsxBound = window.__dcmsxBound || new WeakSet());

// play preview videos on hover; a touch-only screen has no hover, so there a
// card fades its clip in once it has sat mostly on screen for a moment, and
// fades back to the still when it scrolls away (muted+playsinline keeps
// script-started playback allowed on iOS/Android)
const IN_VIEW_MS = 1500;
const inViewTimers = new WeakMap();
const autoPlays = window.matchMedia('(hover: none)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  'IntersectionObserver' in window;
const watcher = !autoPlays ? null : new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const card = entry.target;
    const video = card.querySelector('video');
    if (entry.isIntersecting) {
      inViewTimers.set(card, setTimeout(() => {
        card.classList.add('playing');
        video.play().catch(() => {});
      }, IN_VIEW_MS));
    } else {
      clearTimeout(inViewTimers.get(card));
      card.classList.remove('playing');
      video.pause();
      video.currentTime = 0;
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.promo-video-hover').forEach((card) => {
  if (bound.has(card)) return;
  bound.add(card);
  const video = card.querySelector('video');
  if (!video) return;
  card.addEventListener('mouseenter', () => {
    card.classList.add('playing');
    video.play().catch(() => {});
  });
  card.addEventListener('mouseleave', () => {
    card.classList.remove('playing');
    video.pause();
    video.currentTime = 0;
  });
  if (watcher) watcher.observe(card);
});

// screenshot carousel (.cc slick-slider-single behaviour):
// slidesToShow 4/3/2/1, slidesToScroll 1/3/2/1 at 1200/767/540, wraps at the
// ends, prev arrow appears after the first next click, swipe on touch.
// Both arrows exist only when there is somewhere to scroll: with every image
// already on screen (e.g. 4 images at desktop width) neither shows — the
// check re-runs on resize, where the per-view count changes.
let swiped = false;
document.querySelectorAll('[data-slider]').forEach((slider) => {
  if (bound.has(slider)) return;
  bound.add(slider);
  const track = slider.querySelector('.slider-track');
  const count = track.children.length;
  const prev = slider.querySelector('.slider-prev');
  const next = slider.querySelector('.slider-next');
  let index = 0;
  const perView = () => (window.innerWidth <= 540 ? 1 : window.innerWidth <= 767 ? 2 : window.innerWidth <= 1200 ? 3 : 4);
  const maxIndex = () => Math.max(0, count - perView());
  // always scroll a single image per click; the left arrow exists only when
  // there is something to scroll back to
  const render = () => {
    track.style.transform = `translateX(-${index * (100 / perView())}%)`;
    prev.hidden = index <= 0;
    next.hidden = maxIndex() === 0;
  };
  render();
  next.addEventListener('click', () => {
    index = index >= maxIndex() ? 0 : index + 1;
    render();
  });
  prev.addEventListener('click', () => {
    index = Math.max(index - 1, 0);
    render();
  });
  window.addEventListener('resize', () => { index = Math.min(index, maxIndex()); render(); });
  let sx = null;
  slider.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    sx = null;
    swiped = Math.abs(dx) > 40;
    if (swiped) (dx < 0 ? next : prev).click();
  }, { passive: true });
});

// gallery lightbox (replaces the .cc openModal image modal)
const galleryImgs = document.querySelectorAll('.gridImage img');
if (galleryImgs.length) {
  // one dialog per page, reused across preview re-runs; data-dcmsx-live
  // marks it as client-created so the preview morph leaves it alone
  let dialog = document.querySelector('dialog.lightbox');
  let big = dialog ? dialog.querySelector('img') : null;
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('data-dcmsx-live', '');
    big = document.createElement('img');
    dialog.appendChild(big);
    const close = document.createElement('button');
    close.className = 'lightbox-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    dialog.appendChild(close);
    document.body.appendChild(dialog);
    dialog.addEventListener('click', () => dialog.close());
  }
  galleryImgs.forEach((img) => {
    if (bound.has(img)) return;
    bound.add(img);
    img.addEventListener('click', () => {
      if (swiped) { swiped = false; return; }
      big.src = img.src;
      dialog.showModal();
    });
  });
}
})();
