document.addEventListener("DOMContentLoaded", function() {
  const claimButtons = document.querySelectorAll('.btn.outline');

  claimButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault(); 
      alert('You have submitted a claim!');
    });
  });
});
