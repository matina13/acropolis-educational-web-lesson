// Simple script to handle back to top button and progress tracking
document.addEventListener('DOMContentLoaded', function() {
  // Back to top button functionality
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopButton.classList.add('back-to-top');
  document.body.appendChild(backToTopButton);
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });
  
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

function toggleMobileMenu() {
  const nav = document.querySelector('.main-nav');
  nav.classList.toggle('active');
}

function logout() {
  // Add your logout functionality here
  console.log("User logged out");
  window.location.href = "../index.html"; // Update with your login page
}

// Display username (update with your actual user system)
document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username') || 'Χρήστη';
  document.getElementById('username').textContent = username;
});