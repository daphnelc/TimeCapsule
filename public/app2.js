const pathParts = window.location.pathname.split('/');
const capsuleId = pathParts[pathParts.length - 1] || '';
const content = document.getElementById('note-content');

//function to formate the data
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

// Load note state for this capsule
fetch(`/api/note/${capsuleId}`)
  .then(res => res.json())
  .then(data => {
    const text = data.text || '';
    const locked = !!data.locked;
    const openAt = data.openAt;
    const createdAt = data.createdAt;

    // 1. No note yet → show editor + duration select
    if (!text && !locked) {
      content.innerHTML = `
        <div class="note-date">New capsule</div>
        <p>Write a note to your future self:</p>
        <textarea id="note-input" class="note-textarea" rows="10"></textarea>

        <p style="margin-top:10px;">
          Seal this capsule for…
        </p>
        <select id="duration-select" class="note-select">
          <option value="1">1 year</option>
          <option value="2">2 years</option>
          <option value="3">3 years</option>
          <option value="4">4 years</option>
          <option value="5">5 years</option>
          <option value="6">6 years</option>
          <option value="7">7 years</option>
          <option value="8">8 years</option>
          <option value="9">9 years</option>
          <option value="10">10 years</option>
        </select>

        <button id="save-note" class="note-button">Seal this capsule</button>
      `;

      const saveBtn = document.getElementById('save-note');
      const noteInput = document.getElementById('note-input');
      const durationSelect = document.getElementById('duration-select');

      saveBtn.addEventListener('click', () => {
        const bodyText = noteInput.value.trim();
        if (!bodyText) return;

        const durationYears = parseInt(durationSelect.value, 10) || 1;

        fetch(`/api/note/${capsuleId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: bodyText, durationYears })
        })
          .then(res => res.json())
          .then(saved => {
            const openAtStr = formatDate(saved.openAt);
            const writtenAtStr = formatDate(saved.createdAt);

            content.innerHTML = `
              <div class="note-date">Written on ${writtenAtStr}</div>
              <p>This capsule is sealed.</p>
              <p class="note-readonly">
                It will open on <strong>${openAtStr}</strong>.
              </p>
            `;
          })
      });

      // ChatGPT helped generating this code
      // 2. Capsule sealed → show lock message only
    } else if (locked) {
      const openAtStr = formatDate(openAt);
      const writtenAtStr = formatDate(createdAt);

      content.innerHTML = `
        <div class="note-date">Written on ${writtenAtStr}</div>
        <p class="note-readonly">
          This capsule is sealed.<br>
          It will open on <strong>${openAtStr}</strong>.
        </p>
      `;

      // 3. Capsule unlocked → show stored note
    } else {
      const openAtStr = formatDate(openAt);
      const writtenAtStr = formatDate(createdAt);

      content.innerHTML = `
        <div class="note-date">
          Written on ${writtenAtStr}<br>
          Opened on ${openAtStr}
        </div>
        <p class="note-label">Sealed note:</p>
        <p class="note-readonly">
          ${text.replace(/\n/g, '<br>')}
        </p>
      `;
    }
  })



