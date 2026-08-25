/* ==========================================
   Premium Dark Theme - JavaScript
   ========================================== */

(function () {
  'use strict';

  // Theme state
  const state = {
    mobileMenuOpen: false,
    cartDrawerOpen: false,
    announcementCountdownTimer: null,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', function () {
    initAnnouncementCountdown();
    initMobileMenu();
    initCartDrawer();
    initSmoothScroll();
    initReducedMotion();
  });

  /* ============ Announcement Countdown ============ */
  function initAnnouncementCountdown() {
    const countdownEl = document.querySelector('.announcement-bar__countdown');
    if (!countdownEl) return;

    const endDate = countdownEl.dataset.endDate;
    if (!endDate) return;

    function updateCountdown() {
      const now = new Date();
      const target = new Date(endDate);
      const diff = target - now;

      if (diff <= 0) {
        countdownEl.innerHTML = '<span>Offer ended</span>';
        if (state.announcementCountdownTimer) clearInterval(state.announcementCountdownTimer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `
        <span>${days}d</span>
        <span>${hours}h</span>
        <span>${minutes}m</span>
        <span>${seconds}s</span>
      `;
    }

    updateCountdown();
    state.announcementCountdownTimer = setInterval(updateCountdown, 1000);
  }

  /* ============ Mobile Menu ============ */
  function initMobileMenu() {
    const menuBtn = document.querySelector('.header__menu-btn');
    const nav = document.querySelector('.header__nav');
    const body = document.body;

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', function () {
      state.mobileMenuOpen = !state.mobileMenuOpen;
      
      if (state.mobileMenuOpen) {
        nav.classList.add('nav--open');
        body.style.overflow = 'hidden';
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Close menu');
      } else {
        nav.classList.remove('nav--open');
        body.style.overflow = '';
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      }
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        state.mobileMenuOpen = false;
        nav.classList.remove('nav--open');
        body.style.overflow = '';
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.mobileMenuOpen) {
        state.mobileMenuOpen = false;
        nav.classList.remove('nav--open');
        body.style.overflow = '';
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  /* ============ Cart Drawer ============ */
  function initCartDrawer() {
    const cartBtn = document.querySelector('.header__cart-btn');
    const drawer = document.querySelector('.cart-drawer');
    const drawerClose = drawer ? drawer.querySelector('.cart-drawer__close') : null;
    const body = document.body;

    if (!cartBtn || !drawer) return;

    function openDrawer() {
      state.cartDrawerOpen = true;
      drawer.classList.add('cart-drawer--open');
      body.style.overflow = 'hidden';
      drawer.setAttribute('aria-hidden', 'false');
      drawer.querySelector('[aria-label="Close drawer"]').focus();
    }

    function closeDrawer() {
      state.cartDrawerOpen = false;
      drawer.classList.remove('cart-drawer--open');
      body.style.overflow = '';
      drawer.setAttribute('aria-hidden', 'true');
    }

    cartBtn.addEventListener('click', openDrawer);

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    // Close on overlay click
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) closeDrawer();
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.cartDrawerOpen) closeDrawer();
    });
  }

  /* ============ Smooth Scroll ============ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        // Reduce motion respect
        if (state.reducedMotion) {
          targetElement.scrollIntoView({ behavior: 'instant' });
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ============ Reduced Motion ============ */
  function initReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (mq.matches) {
      // Disable transitions/animations
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
    }
  }

  /* ============ Image Zoom ============ */
  function initImageZoom() {
    const productMedia = document.querySelectorAll('.product-media');
    productMedia.forEach(function (media) {
      const img = media.querySelector('img');
      if (!img) return;

      media.addEventListener('mouseenter', function () {
        if (state.reducedMotion) return;
        img.style.transition = 'transform var(--transition-base) ease';
        img.style.transform = 'scale(1.05)';
      });

      media.addEventListener('mouseleave', function () {
        img.style.transform = '';
      });

      // Touch devices: show enlarged on tap
      let touchStartX = 0;
      let touchStartY = 0;

      media.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      }, { passive: true });

      media.addEventListener('touchend', function (e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = Math.abs(touchEndX - touchStartX);
        const diffY = Math.abs(touchEndY - touchStartY);

        // If mostly vertical movement, don't zoom
        if (diffY > diffX * 2) return;

        // Prevent default link scrolling
        e.preventDefault();
      });
    });
  }

  /* ============ Initialize Image Zoom ============ */
  // Call after DOM content loaded in production, but here we attach on load
  window.addEventListener('load', initImageZoom);

  /* ============ Toggle Visibility Classes ============ */
  function toggleVisibility(element, show) {
    if (show) {
      element.classList.add('visible');
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
      element.classList.remove('visible');
    }
  }

  /* ============ Format Currency ============ */
  function formatCurrency(amount, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /* ============ Add to Cart Animation ============ */
  function initAddToCartAnimation() {
    document.querySelectorAll('.product-form__submit').forEach(function (button) {
      button.addEventListener('click', function (e) {
        const form = this.closest('form');
        if (!form) return;

        const productId = form.dataset.productId;
        const variantId = form.dataset.variantId || null;

        // Create notification
        const notification = document.getElementById('cart-notification');
        if (!notification) return;

        notification.classList.remove('hidden');
        setTimeout(function () {
          notification.classList.add('hidden');
        }, 3000);
      });
    });
  }

  /* ============ Expose Theme Methods ============ */
  window.ShopifyTheme = {
    formatCurrency: formatCurrency,
    toggleSection: function (sectionId, show) {
      const section = document.getElementById(sectionId);
      if (!section) return;
      toggleVisibility(section, show);
    }
  };
})();