/**
 * Menu Items Management - View, edit, and delete menu items
 * APIs:
 *   - GET /api/v1/menuItem/view (list items)
 *   - GET /api/v1/menuItem/view/:itemId (view details)
 *   - PUT /api/v1/menuItem/edit/:itemId (edit)
 *   - DELETE /api/v1/menuItem/delete/:itemId (delete with confirm)
 */

$(document).ready(function () {
  let menuItems = [];

  loadMenuItems();

  // Load menu items
  function loadMenuItems() {
    $('#loadingState').show();
    $('#menuItemsContainer').hide();
    $('#emptyState').hide();

    apiClient.get('/api/v1/menuItem/view')
      .done(function (items) {
        $('#loadingState').hide();
        menuItems = items || [];

        if (!menuItems || menuItems.length === 0) {
          $('#emptyState').show();
          return;
        }

        renderMenuItems();
        $('#menuItemsContainer').show();
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

  // Render menu items table
  function renderMenuItems() {
    const $tbody = $('#menuItemsTableBody');
    $tbody.empty();

    menuItems.forEach(function (item) {
      const row = createMenuItemRow(item);
      $tbody.append(row);
    });
  }

  // Create menu item table row
  function createMenuItemRow(item) {
    const price = UI.formatCurrency(parseFloat(item.price) || 0);
    const description = item.description || 'No description';
    const truncatedDesc = description.length > 50 ? description.substring(0, 50) + '...' : description;
    const status = item.status || 'available';
    const statusBadgeClass = status === 'available' ? 'badge-ready' : 'badge-cancelled';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    return `
      <tr>
        <td>${item.itemId}</td>
        <td>${item.name || 'N/A'}</td>
        <td>${item.category || 'N/A'}</td>
        <td>${price}</td>
        <td><span class="badge ${statusBadgeClass}" style="padding: 5px 10px;">${statusText}</span></td>
        <td>${truncatedDesc}</td>
        <td>
          <button class="btn btn-sm btn-info view-details-btn" data-item-id="${item.itemId}" style="margin-right: 5px;">View</button>
          <button class="btn btn-sm btn-warning edit-item-btn" data-item-id="${item.itemId}" style="margin-right: 5px;">Edit</button>
          <button class="btn btn-sm btn-danger delete-item-btn" data-item-id="${item.itemId}">Delete</button>
        </td>
      </tr>
    `;
  }

  // View details handler
  $(document).on('click', '.view-details-btn', function () {
    const itemId = parseInt($(this).data('item-id'));
    const item = menuItems.find(i => i.itemId === itemId);

    if (!item) {
      UI.showToast('Menu item not found', 'error');
      return;
    }

    // Load full details
    apiClient.get(`/api/v1/menuItem/view/${itemId}`)
      .done(function (itemDetails) {
        const status = itemDetails.status || 'available';
        const statusBadgeClass = status === 'available' ? 'badge-ready' : 'badge-cancelled';
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        $('#modalItemId').text(itemDetails.itemId || 'N/A');
        $('#modalItemName').text(itemDetails.name || 'N/A');
        $('#modalItemCategory').text(itemDetails.category || 'N/A');
        $('#modalItemPrice').text(UI.formatCurrency(parseFloat(itemDetails.price) || 0));
        $('#modalItemDescription').text(itemDetails.description || 'No description');
        $('#modalItemStatus').html(`<span class="badge ${statusBadgeClass}" style="padding: 5px 10px;">${statusText}</span>`);
        $('#viewDetailsModal').modal('show');
      })
      .fail(function () {
        // Fallback to local data
        const status = item.status || 'available';
        const statusBadgeClass = status === 'available' ? 'badge-ready' : 'badge-cancelled';
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        $('#modalItemId').text(item.itemId || 'N/A');
        $('#modalItemName').text(item.name || 'N/A');
        $('#modalItemCategory').text(item.category || 'N/A');
        $('#modalItemPrice').text(UI.formatCurrency(parseFloat(item.price) || 0));
        $('#modalItemDescription').text(item.description || 'No description');
        $('#modalItemStatus').html(`<span class="badge ${statusBadgeClass}" style="padding: 5px 10px;">${statusText}</span>`);
        $('#viewDetailsModal').modal('show');
      });
  });

  // Edit item handler
  $(document).on('click', '.edit-item-btn', function () {
    const itemId = parseInt($(this).data('item-id'));
    const item = menuItems.find(i => i.itemId === itemId);

    if (!item) {
      UI.showToast('Menu item not found', 'error');
      return;
    }

    // Load full details for editing
    apiClient.get(`/api/v1/menuItem/view/${itemId}`)
      .done(function (itemDetails) {
        $('#editItemId').val(itemDetails.itemId);
        $('#editItemName').val(itemDetails.name || '');
        $('#editItemCategory').val(itemDetails.category || '');
        $('#editItemPrice').val(itemDetails.price || '');
        $('#editItemDescription').val(itemDetails.description || '');
        $('#editItemStatus').val(itemDetails.status || 'available');
        $('#editModal').modal('show');
      })
      .fail(function () {
        // Fallback to local data
        $('#editItemId').val(item.itemId);
        $('#editItemName').val(item.name || '');
        $('#editItemCategory').val(item.category || '');
        $('#editItemPrice').val(item.price || '');
        $('#editItemDescription').val(item.description || '');
        $('#editItemStatus').val(item.status || 'available');
        $('#editModal').modal('show');
      });
  });

  // Save edit handler
  $('#saveEditBtn').on('click', function () {
    const itemId = parseInt($('#editItemId').val());
    const name = $('#editItemName').val().trim();
    const category = $('#editItemCategory').val().trim();
    const price = parseFloat($('#editItemPrice').val());
    const description = $('#editItemDescription').val().trim();
    const status = $('#editItemStatus').val();

    if (!name || !category || isNaN(price) || price <= 0) {
      UI.showToast('Please fill in all required fields with valid values', 'error');
      return;
    }

    if (!status || (status !== 'available' && status !== 'unavailable')) {
      UI.showToast('Please select a valid status', 'error');
      return;
    }

    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).text('Saving...');

    apiClient.put(`/api/v1/menuItem/edit/${itemId}`, {
      name,
      category,
      price,
      description,
      status
    })
      .done(function (response) {
        UI.showToast('Menu item updated successfully', 'success');
        $('#editModal').modal('hide');
        loadMenuItems(); // Reload to get updated data
        $btn.prop('disabled', false).text(originalText);
      })
      .fail(function (xhr) {
        $btn.prop('disabled', false).text(originalText);
      });
  });

  // Delete item handler
  $(document).on('click', '.delete-item-btn', function () {
    const itemId = parseInt($(this).data('item-id'));
    const item = menuItems.find(i => i.itemId === itemId);

    if (!item) {
      UI.showToast('Menu item not found', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    const $btn = $(this);
    $btn.prop('disabled', true).text('Deleting...');

    apiClient.delete(`/api/v1/menuItem/delete/${itemId}`)
      .done(function (response) {
        UI.showToast('Menu item deleted successfully', 'success');
        loadMenuItems(); // Reload to remove deleted item
      })
      .fail(function (xhr) {
        $btn.prop('disabled', false).text('Delete');
      });
  });
});

