/**
 * Customer Dashboard - Quick actions and welcome page
 */

$(document).ready(function() {
  // Add hover effects to action cards
  $('.glass-card[onclick]').hover(
    function() {
      $(this).css('transform', 'translateY(-5px)');
    },
    function() {
      $(this).css('transform', 'translateY(0)');
    }
  );
});

