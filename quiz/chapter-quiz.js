// Utility function to safely get user data
function getAuthenticatedUser() {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.warn('No user data found in localStorage');
      return null;
    }
    
    const user = JSON.parse(userData);
    if (!user?.id) {
      console.warn('User data exists but missing ID:', user);
      return null;
    }
    
    // Verify the user object has required properties
    const requiredProps = ['id', 'username'];
    const missingProps = requiredProps.filter(prop => !(prop in user));
    
    if (missingProps.length > 0) {
      console.warn('User object missing required properties:', missingProps);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

// Main quiz submission handler
async function handleQuizSubmission() {
  // 1. Verify authentication
  const user = getAuthenticatedUser();
  if (!user) {
    alert('Πρέπει να είστε συνδεδεμένοι για να συμμετάσχετε στο κουίζ!');
    window.location.href = '../index.html?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }

  // 2. Calculate results
  const correctAnswers = {
    q1: 'b', q2: 'c', q3: 'b', q4: 'a', q5: 'a'
  };
  
  let score = 0;
  const userAnswers = {};
  
  for (const [question, correctAnswer] of Object.entries(correctAnswers)) {
    const selected = document.querySelector(`input[name="${question}"]:checked`);
    userAnswers[question] = selected?.value || null;
    if (selected?.value === correctAnswer) score++;
  }

  // 3. Submit results
  try {
    const response = await fetch('http://localhost:3000/save-quiz-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT
      },
      body: JSON.stringify({
        userId: user.id,
        chapterId: 1,
        score,
        totalQuestions: Object.keys(correctAnswers).length,
        answers: userAnswers,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Server error');
    }

    // 4. Update UI and local state
    updateQuizUI(score, Object.keys(correctAnswers).length);
    updateLocalUserProgress(user, score, Object.keys(correctAnswers).length);
    
  } catch (error) {
    console.error('Submission failed:', error);
    alert(`Σφάλμα: ${error.message || 'Αποτυχία υποβολής'}`);
  }
}

// UI update function
function updateQuizUI(score, total) {
  const resultSection = document.getElementById('quiz-result');
  const scoreElement = document.getElementById('score-text');
  
  if (resultSection && scoreElement) {
    resultSection.style.display = 'block';
    scoreElement.textContent = `Απαντήσατε σωστά σε ${score} από τις ${total} ερωτήσεις.`;
  }
}

// Local progress tracking
function updateLocalUserProgress(user, score, total) {
  const updatedUser = {
    ...user,
    progress: {
      ...(user.progress || {}),
      chapter1: {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        lastAttempt: new Date().toISOString()
      }
    }
  };
  
  localStorage.setItem('user', JSON.stringify(updatedUser));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Verify auth immediately
  const user = getAuthenticatedUser();
  if (!user) {
    alert('Πρέπει να είστε συνδεδεμένοι για να συμμετάσχετε στο κουίζ!');
    window.location.href = '../index.html?redirect=' + encodeURIComponent(window.location.pathname);
    return;
  }

  // Set up submit button
  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleQuizSubmission);
  } else {
    console.error('Submit button not found');
  }
});