/**
 * Add Menu Item - Form to create new menu items
 * API: POST /api/v1/menuItem/new
 */

$(document).ready(function () {
  // Form submission handler
  $('#addMenuItemForm').on('submit', function (e) {
    e.preventDefault();

    const name = $('#itemName').val().trim();
    const category = $('#itemCategory').val().trim();
    const price = parseFloat($('#itemPrice').val());
    const description = $('#itemDescription').val().trim();
    const status = $('#itemStatus').val();

    // Validation
    if (!name) {
      UI.showToast('Please enter an item name', 'error');
      return;
    }

    if (!category) {
      UI.showToast('Please enter a category', 'error');
      return;
    }

    if (isNaN(price) || price <= 0) {
      UI.showToast('Please enter a valid price greater than 0', 'error');
      return;
    }

    if (!status || (status !== 'available' && status !== 'unavailable')) {
      UI.showToast('Please select a valid status', 'error');
      return;
    }

    const $btn = $('#submitBtn');
    const originalText = $btn.text();
    $btn.prop('disabled', true).text('Adding...');

    apiClient.post('/api/v1/menuItem/new', {
      name,
      category,
      price,
      description: description || null,
      status
    })
      .done(function (response) {
        UI.showToast('Menu item added successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/menuItems';
        }, 1500);
      })
      .fail(function (xhr) {
        $btn.prop('disabled', false).text(originalText);
      });
  });
});

