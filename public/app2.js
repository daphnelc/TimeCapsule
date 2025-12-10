let pathParts = window.location.pathname.split('/');
let capsuleId = pathParts[pathParts.length - 1] || "";
let content = document.getElementById('note-content');

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Load note state
fetch(`/api/note/${capsuleId}`)
  .then(res => res.json())
  .then(data => {
    let text      = data.text || "";
    let locked    = !!data.locked;
    let openAt    = data.openAt;
    let createdAt = data.createdAt;

    // 1. No note yet -> show editor + duration select
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

      let saveBtn        = document.getElementById('save-note');
      let noteInput      = document.getElementById('note-input');
      let durationSelect = document.getElementById('duration-select');

      saveBtn.addEventListener('click', () => {
        const text = noteInput.value.trim();
        if (!text) return;

        const durationYears = parseInt(durationSelect.value, 10) || 1;

        fetch(`/api/note/${capsuleId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, durationYears })
        })
          .then(res => res.json())
          .then(saved => {
            const openAtStr    = formatDate(saved.openAt);
            const writtenAtStr = formatDate(saved.createdAt);

            content.innerHTML = `
              <div class="note-date">Written on ${writtenAtStr}</div>
              <p>This capsule is sealed.</p>
              <p class="note-readonly">
                It will open on <strong>${openAtStr}</strong>.
              </p>
            `;
          })
          .catch(console.error);
      });

    // 2. Capsule sealed -> show lock message only
    } else if (locked) {
      const openAtStr    = formatDate(openAt);
      const writtenAtStr = formatDate(createdAt);

      content.innerHTML = `
        <div class="note-date">Written on ${writtenAtStr}</div>
        <p class="note-readonly">
          This capsule is sealed.<br>
          It will open on <strong>${openAtStr}</strong>.
        </p>
      `;

    // 3. Capsule unlocked -> show the stored note text
    } else {
      const openAtStr    = formatDate(openAt);
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
  .catch(err => {
    console.error(err);
    content.innerHTML = `<p>Something went wrong loading this capsule.</p>`;
  });

