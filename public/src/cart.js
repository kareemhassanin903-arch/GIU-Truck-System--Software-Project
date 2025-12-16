/**
 * Cart Page - Display cart items, update quantities, remove items, and place orders
 * APIs:
 *   - GET /api/v1/cart/view (load cart)
 *   - PUT /api/v1/cart/edit/:cartId (update quantity)
 *   - DELETE /api/v1/cart/delete/:cartId (remove item)
 *   - POST /api/v1/order/new (place order)
 */

$(document).ready(function () {
  let cartItems = [];

  loadCart();

  // Load cart items
  function loadCart() {
    $('#loadingState').show();
    $('#cartContainer').empty();
    $('#emptyState').hide();
    $('#cartSummary').hide();

    apiClient.get('/api/v1/cart/view')
      .done(function (items) {
        $('#loadingState').hide();
        cartItems = items || [];

        if (!cartItems || cartItems.length === 0) {
          $('#emptyState').show();
          return;
        }

        renderCartItems();
        updateTotal();
        $('#cartSummary').show();
      })
      .fail(function (xhr) {
        $('#loadingState').hide();
        if (xhr.status === 401 || xhr.status === 403) {
          window.location.href = '/';
        } else {
          $('#emptyState').show();
        }
      });
  }

  // Render cart items
  function renderCartItems() {
    const $container = $('#cartContainer');
    $container.empty();

    cartItems.forEach(function (item) {
      const itemCard = createCartItemCard(item);
      $container.append(itemCard);
    });
  }

  // Create cart item card
  function createCartItemCard(item) {
    const subtotal = parseFloat(item.price) * parseInt(item.quantity);
    return `
      <div class="glass-card" style="margin-bottom: 20px; background: rgba(255, 255, 255, 0.05);" data-cart-id="${item.cartId}">
        <div class="row">
          <div class="col-md-6">
            <h4 style="margin-top: 0; color: #fff;">${item.itemName}</h4>
            <p class="text-muted" style="margin-bottom: 10px;">Price: ${UI.formatCurrency(parseFloat(item.price))}</p>
          </div>
          <div class="col-md-3">
            <label style="color: rgba(255, 255, 255, 0.9);">Quantity:</label>
            <div class="form-inline" style="display: flex; align-items: center; gap: 10px;">
              <button class="btn btn-secondary quantity-decrease" data-cart-id="${item.cartId}" style="min-width: 40px;">-</button>
              <input type="number" class="form-control quantity-input" data-cart-id="${item.cartId}" 
                     value="${item.quantity}" min="1" style="width: 80px; text-align: center;">
              <button class="btn btn-secondary quantity-increase" data-cart-id="${item.cartId}" style="min-width: 40px;">+</button>
            </div>
          </div>
          <div class="col-md-2 text-right">
            <h4 style="color: #ffa500; margin-top: 0;">${UI.formatCurrency(subtotal)}</h4>
          </div>
          <div class="col-md-1 text-right">
            <button class="btn btn-danger remove-item-btn" data-cart-id="${item.cartId}" 
                    style="background: #dc3545; border: none; padding: 8px 12px;">
              <span class="glyphicon glyphicon-trash"></span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Update total price
  function updateTotal() {
    let total = 0;
    cartItems.forEach(function (item) {
      total += parseFloat(item.price) * parseInt(item.quantity);
    });
    $('#totalPrice').text(UI.formatCurrency(total));
  }

  // Quantity decrease handler
  $(document).on('click', '.quantity-decrease', function () {
    const cartId = parseInt($(this).data('cart-id'));
    const $input = $(this).siblings('.quantity-input');
    let quantity = parseInt($input.val()) || 1;

    if (quantity > 1) {
      quantity--;
      updateCartItemQuantity(cartId, quantity);
    }
  });

  // Quantity increase handler
  $(document).on('click', '.quantity-increase', function () {
    const cartId = parseInt($(this).data('cart-id'));
    const $input = $(this).siblings('.quantity-input');
    let quantity = parseInt($input.val()) || 1;
    quantity++;
    updateCartItemQuantity(cartId, quantity);
  });

  // Quantity input change handler
  $(document).on('change', '.quantity-input', function () {
    const cartId = parseInt($(this).data('cart-id'));
    let quantity = parseInt($(this).val()) || 1;

    if (quantity < 1) {
      quantity = 1;
      $(this).val(1);
    }

    updateCartItemQuantity(cartId, quantity);
  });

  // Update cart item quantity
  function updateCartItemQuantity(cartId, quantity) {
    if (quantity < 1) {
      UI.showToast('Quantity must be at least 1', 'error');
      return;
    }

    const $input = $(`.quantity-input[data-cart-id="${cartId}"]`);
    $input.prop('disabled', true);

    apiClient.put(`/api/v1/cart/edit/${cartId}`, { quantity })
      .done(function (response) {
        // Update local cart items
        const item = cartItems.find(i => i.cartId === cartId);
        if (item) {
          item.quantity = quantity;
        }
        // Update the input field value
        $input.val(quantity);
        // Re-render cart items to update subtotals
        renderCartItems();
        updateTotal();
        $input.prop('disabled', false);
        UI.showToast('Quantity updated', 'success');
      })
      .fail(function (xhr) {
        $input.prop('disabled', false);
        // Reload cart to sync with server
        loadCart();
      });
  }

  // Remove item handler
  $(document).on('click', '.remove-item-btn', function () {
    const cartId = parseInt($(this).data('cart-id'));
    const itemName = cartItems.find(i => i.cartId === cartId)?.itemName || 'item';

    if (!confirm(`Are you sure you want to remove "${itemName}" from your cart?`)) {
      return;
    }

    const $btn = $(this);
    $btn.prop('disabled', true);

    apiClient.delete(`/api/v1/cart/delete/${cartId}`)
      .done(function (response) {
        UI.showToast('Item removed from cart', 'success');
        // Remove from local array
        cartItems = cartItems.filter(i => i.cartId !== cartId);

        if (cartItems.length === 0) {
          $('#emptyState').show();
          $('#cartSummary').hide();
        } else {
          renderCartItems();
          updateTotal();
        }
      })
      .fail(function (xhr) {
        $btn.prop('disabled', false);
        // Reload cart to sync with server
        loadCart();
      });
  });

  // Place order handler
  $('#placeOrderBtn').on('click', function () {
    const pickupTime = $('#pickupTime').val();

    if (!pickupTime) {
      UI.showToast('Please select a pickup time', 'error');
      return;
    }

    // Validate pickup time is in the future
    const selectedTime = new Date(pickupTime);
    const now = new Date();
    if (selectedTime <= now) {
      UI.showToast('Pickup time must be in the future', 'error');
      return;
    }

    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).text('Placing Order...');

    apiClient.post('/api/v1/order/new', { scheduledPickupTime: pickupTime })
      .done(function (response) {
        UI.showToast('Order placed successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/myOrders';
        }, 1500);
      })
      .fail(function (xhr) {
        $btn.prop('disabled', false).text(originalText);
      });
  });

  // Set minimum datetime to now
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  $('#pickupTime').attr('min', minDateTime);
});

