/* ==========================================
   Theme Editor JavaScript
   Only loaded in Shopify Theme Editor (design_mode)
   ========================================== */

(function () {
  'use strict';

  if (!window.Shopify || !window.Shopify.designMode) return;

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target;
    const sectionId = section.id;

    // Re-initialize any JavaScript components in the loaded section
    if (sectionId && sectionId.includes('product')) {
      initProductSection(section);
    }
    if (sectionId && sectionId.includes('cart')) {
      initCartSection(section);
    }
    if (sectionId && sectionId.includes('accordion')) {
      initAccordionSection(section);
    }
  });

  document.addEventListener('shopify:section:unload', function (event) {
    // Clean up if needed
  });

  document.addEventListener('shopify:section:select', function (event) {
    const section = event.target;
    section.classList.add('section--selected');
  });

  document.addEventListener('shopify:section:deselect', function (event) {
    const section = event.target;
    section.classList.remove('section--selected');
  });

  document.addEventListener('shopify:block:select', function (event) {
    const block = event.target;
    block.classList.add('block--selected');
  });

  document.addEventListener('shopify:block:deselect', function (event) {
    const block = event.target;
    block.classList.remove('block--selected');
  });

  function initProductSection(section) {
    // Re-attach thumbnail click handlers
    const thumbnails = section.querySelectorAll('.product-media-gallery__thumb');
    const mainImage = section.querySelector('#featured-image');

    thumbnails.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbnails.forEach(function (t) { t.classList.remove('product-media-gallery__thumb--active'); });
        this.classList.add('product-media-gallery__thumb--active');
      });
    });

    // Quantity buttons
    const decreaseBtns = section.querySelectorAll('[data-action="decrease-quantity"]');
    const increaseBtns = section.querySelectorAll('[data-action="increase-quantity"]');
    const quantityInput = section.querySelector('[data-action="set-quantity"]');

    decreaseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        let value = parseInt(quantityInput.value);
        if (value > 1) quantityInput.value = value - 1;
      });
    });

    increaseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        let value = parseInt(quantityInput.value);
        const max = parseInt(quantityInput.max);
        if (value < max) quantityInput.value = value + 1;
      });
    });
  }

  function initCartSection(section) {
    // Re-attach cart drawer listeners
    if (window.ShopifyCart && window.ShopifyCart.refresh) {
      window.ShopifyCart.refresh();
    }
  }

  function initAccordionSection(section) {
    // Re-initialize accordion toggles
    const accordions = section.querySelectorAll('.accordion');
    accordions.forEach(function (accordion) {
      const summary = accordion.querySelector('.accordion__summary');
      const content = accordion.querySelector('.accordion__content');
      if (summary && content) {
        summary.addEventListener('click', function (e) {
          e.preventDefault();
          const isOpen = content.classList.contains('visible');
          if (isOpen) {
            content.classList.remove('visible');
            content.classList.add('hidden');
          } else {
            content.classList.remove('hidden');
            content.classList.add('visible');
          }
        });
      }
    });
  }
})();