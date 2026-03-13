document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    alert('Πρέπει να είστε συνδεδεμένοι για να δείτε την πρόοδο σας.');
    window.location.href = '../index.html';
    return;
  }

  fetch(`http://localhost:3000/api/progress/${user.id}`)
    .then(res => {
      if (!res.ok) throw new Error('Αποτυχία φόρτωσης δεδομένων');
      return res.json();
    })
    .then(data => renderProgress(data))
    .catch(err => {
      console.error('Σφάλμα φόρτωσης προόδου:', err);
      document.getElementById('user-progress').innerHTML = '<p>Αποτυχία φόρτωσης προόδου.</p>';
    });
});

function renderProgress(data) {
  const container = document.getElementById('user-progress');
  const progressItems = [];

  const sections = [
    { label: 'Κεφάλαιο 1', key: 'chapter1' },
    { label: 'Κεφάλαιο 2', key: 'chapter2' },
    { label: 'Κεφάλαιο 3', key: 'chapter3' },
    { label: 'Τελικό Κουίζ', key: 'final' },
    { label: 'Πρόκληση', key: 'challenge' }
  ];

  const requiredKeys = ['chapter1', 'chapter2', 'chapter3', 'final'];
  const allAced = requiredKeys.every(key => {
    const entry = data[key];
    return entry && entry.highest === 100;
  });

  for (const { label, key } of sections) {
    const entry = data[key];
    if (entry && entry.attempts > 0) {
      progressItems.push(`
        <div class="progress-card">
          <h3>${label}</h3>
          <p>Τελευταία επίδοση: ${entry.percentage}%</p>
          <p>Μέσος Όρος: ${entry.average}%</p>
          <p>Υψηλότερη Επίδοση: ${entry.highest}%</p>
          <p>Προσπάθειες: ${entry.attempts}</p>
        </div>
      `);
    } else {
      progressItems.push(`
        <div class="progress-card empty">
          <h3>${label}</h3>
          <p>Δεν υπάρχει καταγεγραμμένη πρόοδος.</p>
        </div>
      `);
    }
  }

  let challengeMessage = '';
  if (allAced) {
    challengeMessage = `
      <div class="unlock-message" style="text-align:center; margin-top: 20px; font-weight: bold; color: #0066cc;">
        Η Πρόκληση έχει ξεκλειδωθεί! Μπορείτε να την βρείτε στην αρχική σελίδα.
      </div>
    `;
  }

  container.innerHTML = `
    <div class="progress-grid">
      ${progressItems.join('')}
    </div>
    ${challengeMessage}
  `;
}
