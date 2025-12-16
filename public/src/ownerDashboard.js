/**
 * Owner Dashboard - Display truck info, stats, and recent orders
 * APIs:
 *   - GET /api/v1/trucks/myTruck (truck info)
 *   - GET /api/v1/order/truckOrders (recent orders summary)
 *   - PUT /api/v1/trucks/updateOrderStatus (availability toggle)
 */

$(document).ready(function () {
  let truckInfo = null;
  let orders = [];

  loadDashboard();

  // Load dashboard data
  function loadDashboard() {
    $('#loadingState').show();
    $('#truckInfoSection').hide();

    // Load truck info first
    apiClient.get('/api/v1/trucks/myTruck')
      .done(function (truckData) {
        truckInfo = truckData;
        renderTruckInfo();
        // Show truck info section immediately after truck data loads
        $('#truckInfoSection').show();
        
        // Load orders after truck info
        apiClient.get('/api/v1/order/truckOrders')
          .done(function (ordersData) {
            $('#loadingState').hide();
            orders = Array.isArray(ordersData) ? ordersData : [];
            calculateStats();
            renderRecentOrders();
          })
          .fail(function (xhr) {
            $('#loadingState').hide();
            // Show truck info even if orders fail
            orders = [];
            calculateStats();
            renderRecentOrders();
            if (xhr.status === 401 || xhr.status === 403) {
              window.location.href = '/';
            }
          });
      })
      .fail(function (xhr) {
        $('#loadingState').hide();
        if (xhr.status === 401 || xhr.status === 403) {
          window.location.href = '/';
        } else {
          UI.showToast('Failed to load truck information', 'error');
        }
      });
  }

  // Render truck information
  function renderTruckInfo() {
    if (!truckInfo) return;

    const truckName = truckInfo.truckName || 'N/A';
    const orderStatus = truckInfo.orderStatus || 'unavailable';
    
    // Display truck name prominently
    $('#truckName').text(truckName);
    
    // Display current status with badge
    const statusText = orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1);
    const statusBadgeClass = orderStatus === 'available' ? 'badge-ready' : 'badge-cancelled';
    $('#orderStatus').text(statusText).removeClass().addClass('badge ' + statusBadgeClass);

    // Set toggle switch based on current status
    const isAvailable = orderStatus === 'available';
    $('#availabilityToggle').prop('checked', isAvailable);
    $('#toggleLabel').text(isAvailable ? 'Available' : 'Unavailable');
  }

  // Calculate and display stats
  function calculateStats() {
    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      orders = [];
    }
    
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === 'pending').length;
    const preparing = orders.filter(o => o.orderStatus === 'preparing').length;
    const ready = orders.filter(o => o.orderStatus === 'ready').length;

    $('#totalOrders').text(total);
    $('#pendingOrders').text(pending);
    $('#preparingOrders').text(preparing);
    $('#readyOrders').text(ready);
  }

  // Render recent orders (last 5)
  function renderRecentOrders() {
    const $container = $('#recentOrdersContainer');
    $container.empty();

    if (!orders || orders.length === 0) {
      $('#noOrdersMessage').show();
      return;
    }

    $('#noOrdersMessage').hide();

    // Show last 5 orders
    const recentOrders = orders.slice(0, 5);

    recentOrders.forEach(function (order) {
      const orderCard = createOrderCard(order);
      $container.append(orderCard);
    });
  }

  // Create order card
  function createOrderCard(order) {
    const statusClass = getStatusBadgeClass(order.orderStatus);
    const formattedDate = order.createdAt ? UI.formatDate(order.createdAt) : 'N/A';
    const formattedPrice = UI.formatCurrency(parseFloat(order.totalPrice) || 0);

    return `
      <div class="glass-card" style="margin-bottom: 15px; background: rgba(255, 255, 255, 0.05);">
        <div class="row">
          <div class="col-md-3">
            <strong>Order #${order.orderId}</strong>
          </div>
          <div class="col-md-3">
            <p style="margin: 0;"><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
          </div>
          <div class="col-md-2">
            <span class="badge ${statusClass}" style="padding: 5px 10px;">${order.orderStatus || 'N/A'}</span>
          </div>
          <div class="col-md-2">
            <p style="margin: 0;"><strong>Total:</strong> ${formattedPrice}</p>
          </div>
          <div class="col-md-2 text-right">
            <a href="/truckOrders" class="btn btn-sm btn-primary">View Details</a>
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

  // Update availability handler - triggered when toggle is changed
  $('#availabilityToggle').on('change', function () {
    const isChecked = $(this).is(':checked');
    const newStatus = isChecked ? 'available' : 'unavailable';
    
    // Disable toggle during update
    const $toggle = $(this);
    $toggle.prop('disabled', true);

    apiClient.put('/api/v1/trucks/updateOrderStatus', { orderStatus: newStatus })
      .done(function (response) {
        UI.showToast(`Order availability set to ${newStatus}`, 'success');
        // Update local truck info
        if (truckInfo) {
          truckInfo.orderStatus = newStatus;
        }
        renderTruckInfo();
        $toggle.prop('disabled', false);
      })
      .fail(function (xhr) {
        // Revert toggle on error
        $toggle.prop('checked', !isChecked);
        $toggle.prop('disabled', false);
      });
  });
});

