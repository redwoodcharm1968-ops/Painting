/**
 * The Painting Company — Main JavaScript
 * Handles: sticky header, mobile nav, testimonials carousel,
 * gallery filters, before/after slider, contact form, fade-in animations
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Sticky Header
     -------------------------------------------------------------------------- */
  function initStickyHeader() {
    const siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;

    let ticking = false;

    function updateHeader() {
      if (window.scrollY > 20) {
        siteHeader.classList.add('site-header--scrolled');
        document.body.classList.add('header-scrolled');
      } else {
        siteHeader.classList.remove('site-header--scrolled');
        document.body.classList.remove('header-scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader();
  }

  /* --------------------------------------------------------------------------
     Mobile Navigation
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.querySelector('.header__toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!toggle || !mobileNav) return;

    const links = mobileNav.querySelectorAll('a');

    function closeNav() {
      toggle.classList.remove('header__toggle--open');
      mobileNav.classList.remove('mobile-nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function openNav() {
      toggle.classList.add('header__toggle--open');
      mobileNav.classList.add('mobile-nav--open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('mobile-nav--open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    links.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) {
        closeNav();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Testimonials Carousel
     -------------------------------------------------------------------------- */
  function initTestimonials() {
    const track = document.querySelector('.testimonials__track');
    if (!track) return;

    const slides = track.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.testimonials__btn--prev');
    const nextBtn = document.querySelector('.testimonials__btn--next');
    const dotsContainer = document.querySelector('.testimonials__dots');

    let currentIndex = 0;
    let autoplayInterval;
    const totalSlides = slides.length;

    if (totalSlides === 0) return;

    /* Build dots */
    if (dotsContainer) {
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'testimonials__dot' + (i === 0 ? ' testimonials__dot--active' : '');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        dot.addEventListener('click', function () {
          goToSlide(i);
          resetAutoplay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonials__dot') : [];

    function goToSlide(index) {
      currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

      dots.forEach(function (dot, i) {
        dot.classList.toggle('testimonials__dot--active', i === currentIndex);
      });
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 6000);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        resetAutoplay();
      });
    }

    /* Touch swipe support */
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        resetAutoplay();
      }
    }, { passive: true });

    startAutoplay();
  }

  /* --------------------------------------------------------------------------
     Gallery Filters
     -------------------------------------------------------------------------- */
  function initGalleryFilters() {
    const filters = document.querySelectorAll('.gallery-filter');
    const items = document.querySelectorAll('.gallery-item');
    if (filters.length === 0 || items.length === 0) return;

    filters.forEach(function (filter) {
      filter.addEventListener('click', function () {
        const category = filter.getAttribute('data-filter');

        filters.forEach(function (f) {
          f.classList.remove('gallery-filter--active');
        });
        filter.classList.add('gallery-filter--active');

        items.forEach(function (item) {
          const itemCategory = item.getAttribute('data-category');
          if (category === 'all' || itemCategory === category) {
            item.classList.remove('gallery-item--hidden');
          } else {
            item.classList.add('gallery-item--hidden');
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     Before & After Slider
     Drag a handle left/right to reveal before/after transformation.
     -------------------------------------------------------------------------- */
  function initBeforeAfterSlider() {
    document.querySelectorAll('.before-after').forEach(function (container) {
      const beforeLayer = container.querySelector('.before-after__before');
      const handle = container.querySelector('.before-after__handle');
      if (!beforeLayer || !handle) return;

      let isDragging = false;

      function setPosition(clientX) {
        const containerRect = container.getBoundingClientRect();
        let x = clientX - containerRect.left;
        x = Math.max(0, Math.min(x, containerRect.width));
        const percent = (x / containerRect.width) * 100;

        beforeLayer.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
        handle.style.left = percent + '%';
        handle.setAttribute('aria-valuenow', Math.round(percent));
      }

      function onPointerDown(e) {
        isDragging = true;
        container.setPointerCapture(e.pointerId);
        setPosition(e.clientX);
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        setPosition(e.clientX);
      }

      function onPointerUp(e) {
        isDragging = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (_) { /* ignore */ }
      }

      handle.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', onPointerUp);
      container.addEventListener('pointercancel', onPointerUp);

      container.addEventListener('click', function (e) {
        if (e.target === handle || handle.contains(e.target)) return;
        setPosition(e.clientX);
      });

      setPosition(container.getBoundingClientRect().left + container.offsetWidth / 2);
    });
  }

  /* --------------------------------------------------------------------------
     Contact Form
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.querySelector('.contact-form__form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const formWrapper = form.closest('.contact-form');
      const successEl = document.querySelector('.form-success');

      /* Basic validation */
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ef4444';
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      /*
       * Production: Replace with your backend endpoint or form service
       * (Formspree, Netlify Forms, custom API, etc.)
       *
       * Example:
       * fetch('https://formspree.io/f/YOUR_ID', {
       *   method: 'POST',
       *   body: new FormData(form),
       *   headers: { Accept: 'application/json' }
       * });
       */

      form.classList.add('contact-form--hidden');
      if (successEl) {
        successEl.classList.add('form-success--visible');
      }
    });
  }

  /* --------------------------------------------------------------------------
     Fade-in on Scroll (Intersection Observer)
     -------------------------------------------------------------------------- */
  function initFadeIn() {
    /* Scroll-reveal animations removed — content loads immediately */
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('fade-in--visible');
    });
  }

  /* --------------------------------------------------------------------------
     Active Nav Link (current page highlight)
     -------------------------------------------------------------------------- */
  function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isBlogSection = currentPage === 'blog.html' || window.location.pathname.includes('/blog/');
    const navLinks = document.querySelectorAll('.header__nav-link, .mobile-nav__link');

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('header__nav-link--active');
      } else if (isBlogSection && href === 'blog.html') {
        link.classList.add('header__nav-link--active');
      }
    });
  }

  /* --------------------------------------------------------------------------
     Subtle Parallax (smooth, no jank)
     -------------------------------------------------------------------------- */
  function initParallax() {
    const sections = document.querySelectorAll('[data-parallax]');
    if (sections.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function updateParallax() {
      sections.forEach(function (section) {
        const bg = section.querySelector('.parallax-cta__bg');
        if (!bg) return;

        const rect = section.getBoundingClientRect();
        const viewH = window.innerHeight;

        if (rect.bottom > 0 && rect.top < viewH) {
          const progress = (rect.top + rect.height / 2 - viewH / 2) / viewH;
          bg.style.transform = 'translateY(' + (progress * 30) + 'px)';
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  /* --------------------------------------------------------------------------
     Initialize All
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initStickyHeader();
    initMobileNav();
    initTestimonials();
    initGalleryFilters();
    initBeforeAfterSlider();
    initContactForm();
    initFadeIn();
    initActiveNav();
    initParallax();
  });
})();
