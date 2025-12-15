/**
 * UI Utilities - Toast notifications, loaders, empty states, formatting
 */

const UI = {
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'info'
   */
  showToast: function(message, type = 'info') {
    // Remove existing alerts
    $('.toast-alert').remove();
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const alertHtml = `
      <div class="toast-alert alert ${alertClass} alert-dismissible" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}:</strong> ${message}
      </div>
    `;
    
    $('body').append(alertHtml);
    
    // Auto-hide after 3 seconds
    setTimeout(function() {
      $('.toast-alert').fadeOut(300, function() {
        $(this).remove();
      });
    }, 3000);
  },

  /**
   * Show loading spinner
   * @param {jQuery|string} element - Element or selector to show loader in
   */
  showLoader: function(element) {
    const $element = typeof element === 'string' ? $(element) : element;
    if ($element.length) {
      $element.append('<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>');
    }
  },

  /**
   * Hide loading spinner
   * @param {jQuery|string} element - Element or selector to hide loader in
   */
  hideLoader: function(element) {
    const $element = typeof element === 'string' ? $(element) : element;
    $element.find('.spinner-border').remove();
  },

  /**
   * Show empty state message
   * @param {jQuery|string} container - Container element
   * @param {string} message - Message to display
   */
  showEmptyState: function(container, message) {
    const $container = typeof container === 'string' ? $(container) : container;
    $container.html(`<div class="text-center py-5"><p class="text-muted">${message}</p></div>`);
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency: function(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate: function(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

