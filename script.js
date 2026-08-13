const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const modal = document.querySelector('#inquiry-modal');
const modalPanel = modal.querySelector('.modal-panel');
const form = document.querySelector('#inquiry-form');
const formIntro = modal.querySelector('.form-intro');
const successState = document.querySelector('#success-state');
const formMessage = document.querySelector('#form-message');
const dateInput = form.elements.eventDate;
let lastFocusedElement = null;

document.querySelector('#year').textContent = new Date().getFullYear();
dateInput.min = new Date().toISOString().split('T')[0];

const setBodyLock = () => {
  const overlayOpen = modal.classList.contains('is-open') || document.querySelector('#lightbox').classList.contains('is-open') || mobileMenu.classList.contains('is-open');
  body.classList.toggle('is-locked', overlayOpen);
};

const closeMenu = () => {
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuToggle.classList.remove('is-active');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  setBodyLock();
};

menuToggle.addEventListener('click', () => {
  const willOpen = !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', willOpen);
  mobileMenu.setAttribute('aria-hidden', String(!willOpen));
  menuToggle.classList.toggle('is-active', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
  setBodyLock();
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const openModal = () => {
  lastFocusedElement = document.activeElement;
  closeMenu();
  form.hidden = false;
  formIntro.hidden = false;
  successState.hidden = true;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  setBodyLock();
  requestAnimationFrame(() => modal.querySelector('.modal-close').focus());
};

const closeModal = () => {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  setBodyLock();
  if (lastFocusedElement) lastFocusedElement.focus();
};

document.querySelectorAll('.open-inquiry').forEach((button) => button.addEventListener('click', openModal));
modal.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));

form.addEventListener('input', (event) => {
  event.target.removeAttribute('aria-invalid');
  if (event.target.name === 'services') document.querySelector('.services-fieldset').classList.remove('is-invalid');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const controls = [...form.querySelectorAll('input:not([type="checkbox"]), select, textarea')];
  const invalid = controls.filter((control) => !control.checkValidity());
  const serviceChecks = [...form.querySelectorAll('input[name="services"]')];
  const hasService = serviceChecks.some((checkbox) => checkbox.checked);

  controls.forEach((control) => control.toggleAttribute('aria-invalid', !control.checkValidity()));
  document.querySelector('.services-fieldset').classList.toggle('is-invalid', !hasService);

  if (invalid.length || !hasService) {
    formMessage.textContent = 'Please complete each required field and select at least one service.';
    formMessage.hidden = false;
    (invalid[0] || serviceChecks[0]).focus();
    return;
  }

  formMessage.hidden = true;
  form.hidden = true;
  formIntro.hidden = true;
  successState.hidden = false;
  modalPanel.scrollTop = 0;
  successState.querySelector('button').focus();
  form.reset();
});

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxCount = document.querySelector('#lightbox-count');
const portfolioButtons = [...document.querySelectorAll('[data-lightbox-index]')];
const gallery = portfolioButtons.map((button) => ({
  src: button.querySelector('img').src,
  alt: button.querySelector('img').alt,
  caption: button.querySelector('span').textContent.replace(/\d+\s*\//, '').trim()
}));
let activeImage = 0;

const renderLightbox = () => {
  const item = gallery[activeImage];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightboxCount.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
};

const openLightbox = (index) => {
  lastFocusedElement = document.activeElement;
  activeImage = index;
  renderLightbox();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  setBodyLock();
  lightbox.querySelector('.lightbox-close').focus();
};

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  setBodyLock();
  if (lastFocusedElement) lastFocusedElement.focus();
};

const moveLightbox = (direction) => {
  activeImage = (activeImage + direction + gallery.length) % gallery.length;
  renderLightbox();
};

portfolioButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
lightbox.querySelectorAll('[data-close-lightbox]').forEach((button) => button.addEventListener('click', closeLightbox));
lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => moveLightbox(-1));
lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => moveLightbox(1));

const trapFocus = (event, container) => {
  const focusable = [...container.querySelectorAll('button:not([hidden]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (lightbox.classList.contains('is-open')) closeLightbox();
    else if (modal.classList.contains('is-open')) closeModal();
    else if (mobileMenu.classList.contains('is-open')) closeMenu();
  }
  if (lightbox.classList.contains('is-open')) {
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
    if (event.key === 'Tab') trapFocus(event, lightbox);
  } else if (modal.classList.contains('is-open') && event.key === 'Tab') {
    trapFocus(event, modal);
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion || !('IntersectionObserver' in window)) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}
