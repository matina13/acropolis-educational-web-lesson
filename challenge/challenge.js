// Utility: Check if user is logged in
function getAuthenticatedUser() {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    if (!user?.id || !user?.username) return null;
    return user;
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
}

function calculateScore(correctAnswers) {
  let score = 0;
  const userAnswers = {};

  for (let key in correctAnswers) {
    const selected = document.querySelector(`input[name="${key}"]:checked`);
    const value = selected?.value || null;
    userAnswers[key] = value;
    if (value === correctAnswers[key]) score++;
  }

  return { score, userAnswers };
}

async function submitChallenge(e) {
  e.preventDefault();

  const user = getAuthenticatedUser();
  if (!user) {
    alert('Πρέπει να είστε συνδεδεμένοι για να συνεχίσετε.');
    window.location.href = '../index.html';
    return;
  }

  const correctAnswers = {
    q1: 'c',
    q2: 'b',
    q3: 'b',
    q4: 'a',
    q5: 'c'
  };

  const { score, userAnswers } = calculateScore(correctAnswers);
  const total = Object.keys(correctAnswers).length;

  try {
    const res = await fetch('http://localhost:3000/save-challenge-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id,
        score,
        totalQuestions: total,
        answers: userAnswers
      })
    });

    const resultDiv = document.getElementById('result');
    resultDiv.innerText = `Αποτέλεσμα: ${score}/${total}. ${score === total ? 'Εξαιρετική δουλειά! 🎉' : 'Δοκιμάστε ξανά!'}`;

    if (!res.ok) {
      console.error('Server error saving results');
      return;
    }

    // Update local progress
    const progress = user.progress || {};
    progress.challenge = {
      score,
      total,
      percentage: Math.round((score / total) * 100),
      lastAttempt: new Date().toISOString()
    };
    user.progress = progress;
    localStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error('Error saving challenge result:', err);
    alert('Σφάλμα κατά την υποβολή των απαντήσεων.');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('challenge-form');
  if (form) {
    form.addEventListener('submit', submitChallenge);
  }
});
