/**
 * Truck Menu Page - Display menu items for a specific truck with category filter
 * APIs: 
 *   - GET /api/v1/menuItem/truck/:truckId (all items)
 *   - GET /api/v1/menuItem/truck/:truckId/category/:category (filtered)
 *   - POST /api/v1/cart/new (add to cart)
 */

$(document).ready(function() {
  // Get truckId from URL
  const pathParts = window.location.pathname.split('/');
  const truckId = pathParts[pathParts.length - 1];
  
  if (!truckId || isNaN(truckId)) {
    UI.showToast('Invalid truck ID', 'error');
    setTimeout(() => window.location.href = '/trucks', 2000);
    return;
  }

  let allMenuItems = [];
  let currentCategory = 'all';

  loadMenuItems(truckId);

  // Category filter click handler
  $(document).on('click', '.category-filter', function() {
    $('.category-filter').removeClass('active');
    $(this).addClass('active');
    currentCategory = $(this).data('category');
    filterMenuItems();
  });

  function loadMenuItems(truckId) {
    $('#loadingState').show();
    $('#menuItemsContainer').empty();
    $('#emptyState').hide();

    apiClient.get(`/api/v1/menuItem/truck/${truckId}`)
      .done(function(items) {
        $('#loadingState').hide();
        allMenuItems = items || [];

        if (allMenuItems.length === 0) {
          $('#emptyState').show();
          return;
        }

        // Extract unique categories
        const categories = [...new Set(allMenuItems.map(item => item.category))].sort();
        
        // Create category filter buttons
        categories.forEach(function(category) {
          const filterBtn = $(`
            <button class="btn btn-secondary category-filter" data-category="${category}" style="margin: 5px;">
              ${category}
            </button>
          `);
          $('#categoryFilters').append(filterBtn);
        });

        // Display all items initially
        filterMenuItems();
      })
      .fail(function(xhr) {
        $('#loadingState').hide();
        if (xhr.status === 401 || xhr.status === 403) {
          window.location.href = '/';
        } else {
          $('#emptyState').show();
        }
      });
  }

  function filterMenuItems() {
    $('#menuItemsContainer').empty();

    let filteredItems = allMenuItems;
    if (currentCategory !== 'all') {
      filteredItems = allMenuItems.filter(item => item.category === currentCategory);
    }

    if (filteredItems.length === 0) {
      $('#emptyState').show();
      return;
    }

    $('#emptyState').hide();
    filteredItems.forEach(function(item) {
      const itemCard = createMenuItemCard(item);
      $('#menuItemsContainer').append(itemCard);
    });
  }

  function createMenuItemCard(item) {
    const description = item.description || 'No description available';
    const price = UI.formatCurrency(parseFloat(item.price));

    return `
      <div class="col-md-4 col-sm-6" style="margin-bottom: 30px;">
        <div class="glass-card" style="padding: 25px; height: 100%;">
          <h4 style="margin-top: 0; color: #ffa500; margin-bottom: 10px;">${item.name}</h4>
          <p class="text-muted" style="margin-bottom: 15px; min-height: 40px;">${description}</p>
          <div style="margin-bottom: 15px;">
            <span class="badge" style="background: rgba(255, 255, 255, 0.2); color: #fff;">${item.category}</span>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #ffa500; margin: 0;">${price}</h3>
          </div>
          <div class="form-inline" style="margin-bottom: 15px;">
            <label style="margin-right: 10px; color: #fff;">Quantity:</label>
            <input type="number" class="form-control quantity-input" 
                   data-item-id="${item.itemId}" 
                   data-price="${item.price}"
                   min="1" 
                   value="1" 
                   style="width: 80px; margin-right: 10px;" />
          </div>
          <button class="btn btn-primary btn-block add-to-cart-btn" 
                  data-item-id="${item.itemId}" 
                  data-price="${item.price}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }

  // Add to cart handler
  $(document).on('click', '.add-to-cart-btn', function() {
    const itemId = $(this).data('item-id');
    const price = parseFloat($(this).data('price'));
    const quantityInput = $(this).siblings('.form-inline').find('.quantity-input');
    const quantity = parseInt(quantityInput.val()) || 1;

    if (quantity < 1) {
      UI.showToast('Quantity must be at least 1', 'error');
      return;
    }

    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).text('Adding...');

    apiClient.post('/api/v1/cart/new', {
      itemId: itemId,
      quantity: quantity,
      price: price
    })
    .done(function(response) {
      UI.showToast(response.message || 'Item added to cart successfully!', 'success');
      $btn.prop('disabled', false).text(originalText);
      quantityInput.val(1); // Reset quantity
    })
    .fail(function(xhr) {
      $btn.prop('disabled', false).text(originalText);
      // Error is handled by apiClient
    });
  });
});

