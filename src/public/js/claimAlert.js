document.addEventListener("DOMContentLoaded", function() {
  const claimButtons = document.querySelectorAll('.btn.outline');

  claimButtons.forEach(button => {
    button.addEventListener('click', function() {
      alert('You have submitted a claim!');
    });
  });
});
