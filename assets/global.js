/* ==========================================
   Global JavaScript - Cart, Navigation, etc.
   ========================================== */

(function () {
  'use strict';

  // Cart state
  let cartState = {
    items: [],
    total: 0,
    count: 0
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    initCartDrawer();
    initQuantitySelectors();
    initAddToCartForms();
  });

  /* ============ Cart Drawer ============ */
  function initCartDrawer() {
    const openBtns = document.querySelectorAll('[data-cart-action="open"]');
    const closeBtns = document.querySelectorAll('[data-cart-drawer-close]');
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.querySelector('.cart-drawer__overlay');

    if (!drawer) return;

    function openDrawer() {
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      updateCartDrawer();
    }

    function closeDrawer() {
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', openDrawer);
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', closeDrawer);
    });

    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
        closeDrawer();
      }
    });
  }

  /* ============ Update Cart Drawer Content ============ */
  function updateCartDrawer() {
    const content = document.getElementById('cart-drawer-content');
    if (!content) return;

    fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        cartState = cart;
        renderCartDrawer(cart);
        updateCartCount(cart.item_count);
        dispatchCartUpdate(cart);
      })
      .catch(function (err) { console.error('Cart fetch failed:', err); });
  }

  function renderCartDrawer(cart) {
    const content = document.getElementById('cart-drawer-content');
    if (!content) return;

    if (cart.items.length === 0) {
      content.innerHTML = `
        <div class="cart-drawer__empty text-center">
          <div class="icon icon--xl text-secondary">{% render 'icon-cart' %}</div>
          <p class="text-secondary">{{ 'cart.empty' | t }}</p>
          <a href="/collections/all" class="btn btn--primary mt-2">{{ 'cart.continue_shopping' | t }}</a>
        </div>
      `;
      return;
    }

    let itemsHtml = '';
    cart.items.forEach(function (item, index) {
      itemsHtml += `
        <li class="cart-drawer__item flex flex--start gap-md">
          <a href="${item.url}" class="cart-drawer__item-image ratio ratio--square" style="width: 80px;">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          </a>
          <div class="cart-drawer__item-details flex-1">
            <a href="${item.url}" class="cart-drawer__item-title">${item.title}</a>
            ${item.variant_title !== 'Default Title' ? `<p class="cart-drawer__item-variant text-secondary small">${item.variant_title}</p>` : ''}
            <div class="cart-drawer__item-price font-heading">${Shopify.formatMoney(item.final_price, '${{ amount }}')}</div>
            <div class="cart-drawer__item-quantity flex gap-sm mt-1">
              <button class="btn btn--icon btn--sm cart-drawer__qty-btn" data-line="${index + 1}" data-action="decrease" aria-label="{{ 'cart.decrease_quantity' | t }}">{% render 'icon-minus' %}</button>
              <span class="cart-drawer__qty-value">${item.quantity}</span>
              <button class="btn btn--icon btn--sm cart-drawer__qty-btn" data-line="${index + 1}" data-action="increase" aria-label="{{ 'cart.increase_quantity' | t }}">{% render 'icon-plus' %}</button>
            </div>
          </div>
          <button class="cart-drawer__item-remove" data-line="${index + 1}" aria-label="{{ 'cart.remove' | t }}">{% render 'icon-close' %}</button>
        </li>
      `;
    });

    content.innerHTML = `
      <ul class="cart-drawer__items">${itemsHtml}</ul>
      <div class="cart-drawer__summary">
        <div class="cart-drawer__subtotal flex--between">
          <span>{{ 'cart.subtotal' | t }}</span>
          <span class="font-heading">${Shopify.formatMoney(cart.total_price, '${{ amount }}')}</span>
        </div>
        ${Shopify.settings.cart_show_notes ? `
        <div class="cart-drawer__notes mt-2">
          <label for="cart-notes" class="text-secondary small">{{ 'cart.notes' | t }}</label>
          <textarea id="cart-notes" name="notes" class="field__input" rows="3">${cart.note || ''}</textarea>
        </div>
        ` : ''}
      </div>
      <div class="cart-drawer__actions mt-2">
        <a href="/cart" class="btn btn--outline btn--full">{{ 'cart.view_cart' | t }}</a>
        <button type="submit" name="checkout" class="btn btn--primary btn--full" form="cart-form">{{ 'cart.checkout' | t }}</button>
      </div>
      <form action="/cart" method="post" id="cart-form" class="hidden"><input type="hidden" name="checkout" value="1"></form>
    `;

    // Re-attach quantity button listeners
    attachCartDrawerListeners();
  }

  function attachCartDrawerListeners() {
    document.querySelectorAll('.cart-drawer__qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const line = parseInt(this.dataset.line);
        const action = this.dataset.action;
        updateCartItem(line, action);
      });
    });

    document.querySelectorAll('.cart-drawer__item-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const line = parseInt(this.dataset.line);
        removeCartItem(line);
      });
    });
  }

  function updateCartItem(line, action) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line: line,
        quantity: action === 'increase' ? cartState.items[line - 1].quantity + 1 : cartState.items[line - 1].quantity - 1
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (cart) { updateCartDrawer(); })
      .catch(function (err) { console.error('Cart update failed:', err); });
  }

  function removeCartItem(line) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: 0 })
    })
      .then(function (res) { return res.json(); })
      .then(function (cart) { updateCartDrawer(); })
      .catch(function (err) { console.error('Cart remove failed:', err); });
  }

  /* ============ Cart Count ============ */
  function updateCartCount(count) {
    const countEls = document.querySelectorAll('.header__cart-count, #header-cart-count');
    countEls.forEach(function (el) {
      if (count > 0) {
        el.textContent = count;
        el.classList.remove('hidden');
      } else {
        el.textContent = '';
        el.classList.add('hidden');
      }
    });
  }

  function dispatchCartUpdate(cart) {
    document.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  }

  /* ============ Quantity Selectors (Product Page) ============ */
  function initQuantitySelectors() {
    document.querySelectorAll('[data-action="decrease-quantity"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const input = this.parentElement.querySelector('[data-action="set-quantity"]');
        if (input && parseInt(input.value) > 1) {
          input.value = parseInt(input.value) - 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    });

    document.querySelectorAll('[data-action="increase-quantity"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const input = this.parentElement.querySelector('[data-action="set-quantity"]');
        const max = parseInt(input.max) || 99;
        if (input && parseInt(input.value) < max) {
          input.value = parseInt(input.value) + 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  /* ============ Add to Cart Forms ============ */
  function initAddToCartForms() {
    document.querySelectorAll('form[action="/cart/add"]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '{{ 'cart.adding' | t }}';
        }
      });
    });
  }

  /* ============ Expose Cart Methods ============ */
  window.ShopifyCart = {
    openDrawer: function () {
      const drawer = document.getElementById('cart-drawer');
      if (drawer) {
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        updateCartDrawer();
      }
    },
    closeDrawer: function () {
      const drawer = document.getElementById('cart-drawer');
      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    },
    updateCount: updateCartCount,
    refresh: updateCartDrawer
  };
})();