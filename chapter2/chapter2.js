function logout() {
  alert("Αποσυνδεθήκατε επιτυχώς.");
  // Redirect to login page or clear session
  window.location.href = "../login/login.html";
}

function toggleMobileMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("responsive");
}