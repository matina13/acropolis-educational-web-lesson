function toggleMobileMenu() {
  const nav = document.querySelector('.main-nav');
  nav.classList.toggle('active');
}

function goToSection(sectionId) {
  switch (sectionId) {
    case 'history':
      window.location.href = '../chapter1/chapter1.html';
      break;
    case 'monuments':
      window.location.href = '../chapter2/chapter2.html';
      break;
    case 'architecture':
      window.location.href = '../chapter3/chapter3.html';
      break;
    case 'quiz':
      window.location.href = '../quiz/quiz.html';
      break;
    case 'progress':
      window.location.href = '../progress/progress.html'; 
      break;
    default:
      console.warn('Unknown section:', sectionId);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('Page loaded');

  const userData = JSON.parse(localStorage.getItem('user'));
  const greetingElement = document.querySelector('.user-greeting');

  if (userData && greetingElement) {
    greetingElement.innerHTML = `Καλώς ήρθες, <strong>${userData.username}</strong>`;
  }

  // 🚀 Challenge button logic
  if (userData && userData.id) {
    fetch(`http://localhost:3000/api/progress/${userData.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Αποτυχία φόρτωσης δεδομένων');
        return res.json();
      })
      .then(data => {
        const requiredKeys = ['chapter1', 'chapter2', 'chapter3', 'final'];
        const allAced = requiredKeys.every(key => {
          const entry = data[key];
          return entry && entry.highest === 100;
        });

        if (allAced) {
          const container = document.getElementById('challenge-button-container');
          if (container) {
            container.innerHTML = `
              <div style="text-align:center; margin-top: 20px;">
                <a href="../challenge/facts.html" class="challenge-button" style="
                  padding: 10px 20px;
                  background-color: #d35d47;
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  display: inline-block;
                ">
                  Ξεκινήστε την Πρόκληση!
                </a>
              </div>
            `;
          }
        }
      })
      .catch(err => {
        console.error('Σφάλμα κατά τη φόρτωση της πρόκλησης:', err);
      });
  }
});
