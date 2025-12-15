/**
 * API Client - Wrapper around $.ajax with automatic error handling
 * and loading state management
 */

const apiClient = {
  /**
   * Make an AJAX request with automatic error handling
   * @param {Object} options - jQuery AJAX options
   * @returns {Promise} jQuery AJAX promise
   */
  request: function(options) {
    const defaults = {
      xhrFields: {
        withCredentials: true
      },
      error: function(xhr, status, error) {
        const errorMessage = xhr.responseText || error || 'An error occurred';
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast(errorMessage, 'error');
        } else {
          console.error('API Error:', errorMessage);
        }
      }
    };

    const config = $.extend(true, {}, defaults, options);
    return $.ajax(config);
  },

  /**
   * GET request
   */
  get: function(url, options = {}) {
    return this.request($.extend({ url, method: 'GET' }, options));
  },

  /**
   * POST request
   */
  post: function(url, data, options = {}) {
    return this.request($.extend({ url, method: 'POST', data }, options));
  },

  /**
   * PUT request
   */
  put: function(url, data, options = {}) {
    return this.request($.extend({ url, method: 'PUT', data }, options));
  },

  /**
   * DELETE request
   */
  delete: function(url, options = {}) {
    return this.request($.extend({ url, method: 'DELETE' }, options));
  }
};

