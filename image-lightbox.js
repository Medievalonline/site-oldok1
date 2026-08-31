(() => {
  'use strict';

  const excludedSelector = [
    '[data-lightbox-ignore]',
    '.brand-logo img',
    '.sponsor-card img',
    '.site-logo img',
    'img[aria-hidden="true"]'
  ].join(', ');

  let overlay;
  let lightboxImage;
  let caption;
  let previousButton;
  let nextButton;
  let closeButton;
  let activeIndex = -1;
  let eligibleImages = [];

  function isEligible(image) {
    return image instanceof HTMLImageElement
      && image.getAttribute('src')
      && !image.matches(excludedSelector)
      && !image.closest(excludedSelector);
  }

  function refreshImages() {
    eligibleImages = Array.from(document.querySelectorAll('img')).filter(isEligible);
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'image-lightbox';
    overlay.className = 'image-lightbox';
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'แสดงรูปภาพขนาดใหญ่');
    overlay.innerHTML = `
      <div class="image-lightbox-backdrop" data-lightbox-close></div>
      <div class="image-lightbox-dialog" role="document">
        <button class="image-lightbox-close" type="button" aria-label="ปิดรูปภาพ" data-lightbox-close>&times;</button>
        <button class="image-lightbox-nav image-lightbox-prev" type="button" aria-label="รูปก่อนหน้า">&#10094;</button>
        <figure class="image-lightbox-figure">
          <img class="image-lightbox-image" alt="">
          <figcaption class="image-lightbox-caption"></figcaption>
        </figure>
        <button class="image-lightbox-nav image-lightbox-next" type="button" aria-label="รูปถัดไป">&#10095;</button>
      </div>
    `;
    document.body.appendChild(overlay);

    lightboxImage = overlay.querySelector('.image-lightbox-image');
    caption = overlay.querySelector('.image-lightbox-caption');
    previousButton = overlay.querySelector('.image-lightbox-prev');
    nextButton = overlay.querySelector('.image-lightbox-next');
    closeButton = overlay.querySelector('.image-lightbox-close');

    overlay.addEventListener('click', (event) => {
      if (event.target.matches('[data-lightbox-close]')) closeLightbox();
    });
    previousButton.addEventListener('click', () => showImage(activeIndex - 1));
    nextButton.addEventListener('click', () => showImage(activeIndex + 1));
  }

  function showImage(index) {
    if (!eligibleImages.length) return;
    activeIndex = (index + eligibleImages.length) % eligibleImages.length;
    const source = eligibleImages[activeIndex];
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt || 'รูปภาพขนาดใหญ่';
    caption.textContent = source.alt || '';
    const hasMultipleImages = eligibleImages.length > 1;
    previousButton.hidden = !hasMultipleImages;
    nextButton.hidden = !hasMultipleImages;
  }

  function openLightbox(source) {
    refreshImages();
    activeIndex = eligibleImages.indexOf(source);
    if (activeIndex < 0) return;
    showImage(activeIndex);
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  }

  function closeLightbox() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    document.body.classList.remove('lightbox-open');
  }

  function handleImageClick(event) {
    const image = event.target.closest && event.target.closest('img');
    if (!isEligible(image)) return;
    event.preventDefault();
    event.stopPropagation();
    openLightbox(image);
  }

  function handleKeydown(event) {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  }

  function init() {
    createOverlay();
    document.addEventListener('click', handleImageClick, true);
    document.addEventListener('keydown', handleKeydown);
    document.querySelectorAll('img').forEach((image) => {
      if (isEligible(image)) image.classList.add('lightbox-trigger');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
