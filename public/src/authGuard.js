/**
 * Auth Guard - Client-side authentication and role checking
 */

const authGuard = {
  /**
   * Check if user is authenticated, redirect to login if not
   * @returns {Promise<boolean>} True if authenticated
   */
  checkAuth: function() {
    // This will be handled server-side via middleware
    // Client-side check can be added if needed
    return true;
  },

  /**
   * Get current user info from session
   * @returns {Promise<Object|null>} User object or null
   */
  getCurrentUser: function() {
    return apiClient.get('/api/v1/user/me')
      .then(response => response)
      .catch(error => {
        console.error('Failed to get current user:', error);
        return null;
      });
  },

  /**
   * Check role and redirect if wrong role
   * @param {string} expectedRole - Expected role ('customer' or 'truckOwner')
   */
  checkRole: function(expectedRole) {
    return this.getCurrentUser()
      .then(user => {
        if (!user) {
          window.location.href = '/';
          return false;
        }
        if (user.role !== expectedRole) {
          // Redirect to correct dashboard
          if (user.role === 'truckOwner') {
            window.location.href = '/ownerDashboard';
          } else {
            window.location.href = '/dashboard';
          }
          return false;
        }
        return true;
      })
      .catch(() => {
        window.location.href = '/';
        return false;
      });
  }
};

