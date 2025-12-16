/**
 * My Orders Page - Display customer orders with status badges and order details
 * APIs:
 *   - GET /api/v1/order/myOrders (list orders)
 *   - GET /api/v1/order/details/:orderId (order details)
 */

$(document).ready(function() {
  loadOrders();

  // Load orders
  function loadOrders() {
    $('#loadingState').show();
    $('#ordersContainer').empty();
    $('#emptyState').hide();

    apiClient.get('/api/v1/order/myOrders')
      .done(function(orders) {
        $('#loadingState').hide();

        if (!orders || orders.length === 0) {
          $('#emptyState').show();
          return;
        }

        renderOrders(orders);
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

  // Render orders
  function renderOrders(orders) {
    const $container = $('#ordersContainer');
    $container.empty();

    // Sort orders by orderId descending (newest first)
    orders.sort((a, b) => b.orderId - a.orderId);

    orders.forEach(function(order) {
      const orderCard = createOrderCard(order);
      $container.append(orderCard);
    });
  }

  // Create order card
  function createOrderCard(order) {
    const statusClass = getStatusBadgeClass(order.orderStatus);
    const statusText = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
    const createdAt = UI.formatDate(order.createdAt);
    const scheduledPickup = order.scheduledPickupTime ? UI.formatDate(order.scheduledPickupTime) : 'Not specified';
    const estimatedPickup = order.estimatedEarliestPickup ? UI.formatDate(order.estimatedEarliestPickup) : 'Not available';

    return `
      <div class="glass-card" style="margin-bottom: 20px; background: rgba(255, 255, 255, 0.05);" data-order-id="${order.orderId}">
        <div class="row">
          <div class="col-md-8">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
              <h3 style="margin: 0; color: #fff;">Order #${order.orderId}</h3>
              <span class="badge ${statusClass}" style="font-size: 0.9rem; padding: 8px 12px;">${statusText}</span>
            </div>
            <p style="margin-bottom: 5px;"><strong>Truck:</strong> ${order.truckName}</p>
            <p style="margin-bottom: 5px;"><strong>Total:</strong> <span style="color: #ffa500; font-size: 1.2rem; font-weight: bold;">${UI.formatCurrency(parseFloat(order.totalPrice))}</span></p>
            <p style="margin-bottom: 5px;"><strong>Order Date:</strong> ${createdAt}</p>
            <p style="margin-bottom: 5px;"><strong>Scheduled Pickup:</strong> ${scheduledPickup}</p>
            ${order.estimatedEarliestPickup ? `<p style="margin-bottom: 5px;"><strong>Estimated Pickup:</strong> ${estimatedPickup}</p>` : ''}
          </div>
          <div class="col-md-4 text-right" style="display: flex; align-items: center; justify-content: flex-end;">
            <button class="btn btn-primary view-details-btn" data-order-id="${order.orderId}" 
                    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;">
              View Details
            </button>
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

  // View details handler
  $(document).on('click', '.view-details-btn', function() {
    const orderId = parseInt($(this).data('order-id'));
    loadOrderDetails(orderId);
  });

  // Load order details
  function loadOrderDetails(orderId) {
    const $modal = $('#orderDetailsModal');
    const $content = $('#orderDetailsContent');
    
    $content.html(`
      <div class="text-center" style="padding: 40px;">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="text-muted" style="margin-top: 15px;">Loading order details...</p>
      </div>
    `);
    
    $modal.modal('show');

    apiClient.get(`/api/v1/order/details/${orderId}`)
      .done(function(order) {
        renderOrderDetails(order);
      })
      .fail(function(xhr) {
        $content.html(`
          <div class="alert alert-danger">
            <strong>Error:</strong> Failed to load order details. Please try again.
          </div>
        `);
      });
  }

  // Render order details
  function renderOrderDetails(order) {
    const statusClass = getStatusBadgeClass(order.orderStatus);
    const statusText = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
    const createdAt = UI.formatDate(order.createdAt);
    const scheduledPickup = order.scheduledPickupTime ? UI.formatDate(order.scheduledPickupTime) : 'Not specified';
    const estimatedPickup = order.estimatedEarliestPickup ? UI.formatDate(order.estimatedEarliestPickup) : 'Not available';

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = `
        <table class="table" style="background: rgba(255, 255, 255, 0.05); color: #fff; margin-top: 20px;">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      order.items.forEach(function(item) {
        const subtotal = parseFloat(item.price) * parseInt(item.quantity);
        itemsHtml += `
          <tr>
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>${UI.formatCurrency(parseFloat(item.price))}</td>
            <td>${UI.formatCurrency(subtotal)}</td>
          </tr>
        `;
      });
      
      itemsHtml += `
          </tbody>
        </table>
      `;
    }

    const detailsHtml = `
      <div>
        <div style="margin-bottom: 20px;">
          <h4>Order Information</h4>
          <p><strong>Order ID:</strong> #${order.orderId}</p>
          <p><strong>Truck:</strong> ${order.truckName}</p>
          <p><strong>Status:</strong> <span class="badge ${statusClass}">${statusText}</span></p>
          <p><strong>Order Date:</strong> ${createdAt}</p>
          <p><strong>Scheduled Pickup:</strong> ${scheduledPickup}</p>
          ${order.estimatedEarliestPickup ? `<p><strong>Estimated Pickup:</strong> ${estimatedPickup}</p>` : ''}
        </div>
        
        <div style="margin-top: 30px;">
          <h4>Order Items</h4>
          ${itemsHtml || '<p class="text-muted">No items found.</p>'}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">Total:</h3>
            <h3 style="margin: 0; color: #ffa500;">${UI.formatCurrency(parseFloat(order.totalPrice))}</h3>
          </div>
        </div>
      </div>
    `;

    $('#orderDetailsContent').html(detailsHtml);
  }
});

