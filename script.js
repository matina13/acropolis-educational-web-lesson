const API_URL = 'http://localhost:3000';

function showTab(tab) {
  document.getElementById('login-form').style.display = (tab === 'login') ? 'block' : 'none';
  document.getElementById('register-form').style.display = (tab === 'register') ? 'block' : 'none';

  document.getElementById('login-tab').classList.toggle('active', tab === 'login');
  document.getElementById('register-tab').classList.toggle('active', tab === 'register');
}

// Handle login
async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Αποτυχία εισόδου');
    if (!data.user || !data.user.id) throw new Error('Σφάλμα: τα δεδομένα χρήστη δεν είναι έγκυρα.');

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    
    alert(`Καλωσήρθες, ${data.user.username}!`);
    window.location.href = 'home/home.html'; // Redirect to home page
    // Redirect or show next content
  } catch (err) {
    errorDiv.textContent = err.message;
  }
}

// Handle register
async function register() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const errorDiv = document.getElementById('register-error');
  const successDiv = document.getElementById('register-success');
  errorDiv.textContent = '';
  successDiv.textContent = '';

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Αποτυχία εγγραφής');

    successDiv.textContent = data.message;
    setTimeout(() => {
      showTab('login');
    }, 1500);
  } catch (err) {
    errorDiv.textContent = err.message;
  }
}
