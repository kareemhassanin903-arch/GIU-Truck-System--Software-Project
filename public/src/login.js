/**
 * Login Page - Enhanced with apiClient and role-based redirect
 */

$(document).ready(function () {
  // Handle form submission
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const email = $('#email').val().trim();
    const password = $('#password').val();

    // Validation
    if (!email || !password) {
      UI.showToast('Please enter both email and password', 'error');
      return;
    }

    // Show loading state
    const $submitBtn = $('#submit');
    const originalText = $submitBtn.text();
    $submitBtn.prop('disabled', true).text('Logging in...');

    // Make login request
    apiClient.post('/api/v1/user/login', { email, password })
      .done(function (response) {
        // Success - redirect based on role
        UI.showToast('Login successful!', 'success');

        console.log('response =>', response)

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);


      })
      .fail(function (xhr) {
        // Error handling is done by apiClient, but reset button state
        $submitBtn.prop('disabled', false).text(originalText);
      });
  });
});
