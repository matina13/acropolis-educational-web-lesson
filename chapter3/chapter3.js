function logout() {
  alert("Αποσυνδεθήκατε επιτυχώς.");
  window.location.href = "../login/login.html";
}

function toggleMobileMenu() {
  const nav = document.querySelector(".main-nav");
  nav.classList.toggle("responsive");
}
