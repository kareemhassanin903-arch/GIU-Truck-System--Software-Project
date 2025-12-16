/**
 * Truck Orders Management - View and update order statuses
 * APIs:
 *   - GET /api/v1/order/truckOrders (list orders)
 *   - GET /api/v1/order/truckOwner/:orderId (order details)
 *   - PUT /api/v1/order/updateStatus/:orderId (update status)
 */

$(document).ready(function () {
  let allOrders = [];
  let currentFilter = 'all';

  loadOrders();

  // Load orders
  function loadOrders() {
    $('#loadingState').show();
    $('#ordersContainer').empty();
    $('#emptyState').hide();

    apiClient.get('/api/v1/order/truckOrders')
      .done(function (orders) {
        $('#loadingState').hide();
        allOrders = orders || [];
        applyFilter();
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

  // Apply filter
  function applyFilter() {
    let filteredOrders = allOrders;

    if (currentFilter !== 'all') {
      filteredOrders = allOrders.filter(order => order.orderStatus === currentFilter);
    }

    if (!filteredOrders || filteredOrders.length === 0) {
      $('#ordersContainer').empty();
      $('#emptyState').show();
      return;
    }

    $('#emptyState').hide();
    renderOrders(filteredOrders);
  }

  // Render orders
  function renderOrders(orders) {
    const $container = $('#ordersContainer');
    $container.empty();

    orders.forEach(function (order) {
      const orderCard = createOrderCard(order);
      $container.append(orderCard);
    });
  }

  // Create order card
  function createOrderCard(order) {
    const statusClass = getStatusBadgeClass(order.orderStatus);
    const formattedDate = order.createdAt ? UI.formatDate(order.createdAt) : 'N/A';
    const formattedPrice = UI.formatCurrency(parseFloat(order.totalPrice) || 0);
    const scheduledTime = order.scheduledPickupTime ? UI.formatDate(order.scheduledPickupTime) : 'Not scheduled';
    const estimatedTime = order.estimatedEarliestPickup ? UI.formatDate(order.estimatedEarliestPickup) : 'Not set';

    return `
      <div class="glass-card" style="margin-bottom: 20px; background: rgba(255, 255, 255, 0.05);" data-order-id="${order.orderId}">
        <div class="row">
          <div class="col-md-2">
            <strong>Order #${order.orderId}</strong>
          </div>
          <div class="col-md-3">
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> ${formattedPrice}</p>
          </div>
          <div class="col-md-2">
            <span class="badge ${statusClass}" style="padding: 5px 10px; font-size: 0.9rem;">${order.orderStatus || 'N/A'}</span>
          </div>
          <div class="col-md-3">
            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Scheduled:</strong> ${scheduledTime}</p>
            <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Estimated:</strong> ${estimatedTime}</p>
          </div>
          <div class="col-md-2 text-right">
            <button class="btn btn-sm btn-info view-details-btn" data-order-id="${order.orderId}" style="margin-bottom: 5px; display: block; width: 100%;">View Details</button>
            <button class="btn btn-sm btn-primary update-status-btn" data-order-id="${order.orderId}" style="display: block; width: 100%;">Update Status</button>
          </div>
        </div>
        <div class="row" style="margin-top: 10px;">
          <div class="col-md-12">
            <small class="text-muted">Created: ${formattedDate}</small>
          </div>
        </div>
      </div>
    `;
  }

  // Get status badge class
  function getStatusBadgeClass(status) {
    const statusMap = {
      'pending': 'badge-pending',
      'preparing': 'badge-preparing',
      'ready': 'badge-ready',
      'completed': 'badge-completed',
      'cancelled': 'badge-cancelled'
    };
    return statusMap[status] || 'badge-secondary';
  }

  // Filter tab handler
  $('#orderFilterTabs a').on('click', function (e) {
    e.preventDefault();
    const filter = $(this).data('filter');
    currentFilter = filter;

    // Update active tab
    $('#orderFilterTabs li').removeClass('active');
    $(this).parent().addClass('active');

    applyFilter();
  });

  // View details handler
  $(document).on('click', '.view-details-btn', function () {
    const orderId = parseInt($(this).data('order-id'));

    $('#orderDetailsContent').html('<p>Loading...</p>');
    $('#orderDetailsModal').modal('show');

    apiClient.get(`/api/v1/order/truckOwner/${orderId}`)
      .done(function (orderDetails) {
        renderOrderDetails(orderDetails);
      })
      .fail(function () {
        $('#orderDetailsContent').html('<p class="text-danger">Failed to load order details</p>');
      });
  });

  // Render order details
  function renderOrderDetails(order) {
    const statusClass = getStatusBadgeClass(order.orderStatus);
    const formattedPrice = UI.formatCurrency(parseFloat(order.totalPrice) || 0);
    const scheduledTime = order.scheduledPickupTime ? UI.formatDate(order.scheduledPickupTime) : 'Not scheduled';
    const estimatedTime = order.estimatedEarliestPickup ? UI.formatDate(order.estimatedEarliestPickup) : 'Not set';
    const createdTime = order.createdAt ? UI.formatDate(order.createdAt) : 'N/A';

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = '<table class="table" style="background: rgba(255, 255, 255, 0.05); margin-top: 15px;"><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>';
      order.items.forEach(function (item) {
        const subtotal = parseFloat(item.price) * parseInt(item.quantity);
        itemsHtml += `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>${UI.formatCurrency(parseFloat(item.price))}</td><td>${UI.formatCurrency(subtotal)}</td></tr>`;
      });
      itemsHtml += '</tbody></table>';
    } else {
      itemsHtml = '<p class="text-muted">No items found</p>';
    }

    const detailsHtml = `
      <div>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Truck Name:</strong> ${order.truckName || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="badge ${statusClass}">${order.orderStatus || 'N/A'}</span></p>
        <p><strong>Total Price:</strong> ${formattedPrice}</p>
        <p><strong>Scheduled Pickup Time:</strong> ${scheduledTime}</p>
        <p><strong>Estimated Earliest Pickup:</strong> ${estimatedTime}</p>
        <p><strong>Created At:</strong> ${createdTime}</p>
        <hr style="border-color: rgba(255, 255, 255, 0.2);">
        <h5>Order Items:</h5>
        ${itemsHtml}
      </div>
    `;

    $('#orderDetailsContent').html(detailsHtml);
  }

  // Update status handler
  $(document).on('click', '.update-status-btn', function () {
    const orderId = parseInt($(this).data('order-id'));
    const order = allOrders.find(o => o.orderId === orderId);

    if (!order) {
      UI.showToast('Order not found', 'error');
      return;
    }

    $('#updateOrderId').val(orderId);
    $('#updateOrderStatus').val(order.orderStatus || 'pending');
    $('#estimatedPickupTime').val('');

    // Set minimum datetime to now
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    $('#estimatedPickupTime').attr('min', minDateTime);

    $('#updateStatusModal').modal('show');
  });

  // Save status update handler
  $('#saveStatusBtn').on('click', function () {
    const orderId = parseInt($('#updateOrderId').val());
    const orderStatus = $('#updateOrderStatus').val();
    const estimatedPickupTime = $('#estimatedPickupTime').val();

    if (!orderStatus) {
      UI.showToast('Please select a status', 'error');
      return;
    }

    const $btn = $(this);
    const originalText = $btn.text();
    $btn.prop('disabled', true).text('Updating...');

    const updateData = { orderStatus };
    if (estimatedPickupTime) {
      updateData.estimatedEarliestPickup = estimatedPickupTime;
    }

    apiClient.put(`/api/v1/order/updateStatus/${orderId}`, updateData)
      .done(function (response) {
        UI.showToast('Order status updated successfully', 'success');
        $('#updateStatusModal').modal('hide');
        loadOrders(); // Reload to get updated data
        $btn.prop('disabled', false).text(originalText);
      })
      .fail(function (xhr) {
        $btn.prop('disabled', false).text(originalText);
      });
  });
});

