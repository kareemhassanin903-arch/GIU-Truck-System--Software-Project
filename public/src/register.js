/**
 * Register Page - Enhanced with apiClient and validation
 */

$(document).ready(function() {
  // Handle form submission
  $('#registerForm').on('submit', function(e) {
    e.preventDefault();
    
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const birthDate = $('#birthDate').val();
    const password = $('#password').val();

    // Validation
    if (!name || !email || !birthDate || !password) {
      UI.showToast('Please fill in all fields', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      UI.showToast('Please enter a valid email address', 'error');
      return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      UI.showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    // Show loading state
    const $registerBtn = $('#register');
    const originalText = $registerBtn.text();
    $registerBtn.prop('disabled', true).text('Registering...');

    // Prepare data
    const data = {
      name,
      email,
      birthDate,
      password
    };

    // Make registration request
    apiClient.post('/api/v1/user', data)
      .done(function(response) {
        // Success
        UI.showToast('Successfully registered! Redirecting to login...', 'success');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      })
      .fail(function(xhr) {
        // Error handling is done by apiClient, but reset button state
        $registerBtn.prop('disabled', false).text(originalText);
      });
  });
});
