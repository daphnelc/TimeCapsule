let pathParts = window.location.pathname.split('/');
let year = pathParts[pathParts.length - 1] || "";
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
fetch(`/api/note/${year}`)
    .then(res => res.json())
    .then(data => {
        let text = data.text || "";
        let locked = !!data.locked;
        let openAt = data.openAt;

        if (!text && !locked) {
            /* 1. No note yet → write + seal */
            content.innerHTML = `
          <div class="note-date">${year}</div>
          <p class="note-label">Write a note to your future self:</p>
          <textarea id="note-input" class="note-textarea" rows="10"></textarea>
          <button id="save-note" class="note-button">Seal this capsule</button>
        `;

            let saveBtn = document.getElementById('save-note');
            let noteInput = document.getElementById('note-input');

            saveBtn.addEventListener('click', () => {
                const text = noteInput.value.trim();
                if (!text) return;

                fetch(`/api/note/${year}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                })
                    .then(res => res.json())
                    .then(saved => {
                        const openAtStr = formatDate(saved.openAt);

                        // After sealing, hide the text and show lock message
                        content.innerHTML = `
              <div class="note-date">${year}</div>
              <p class="note-label">This capsule is sealed.</p>
              <p class="note-readonly">
                It will open on <strong>${openAtStr}</strong>.
              </p>
            `;
                    })
                    .catch(console.error);
            });

        } else if (locked) {
            /* 2. Sealed capsule → show lock message only */
            let openAtStr = formatDate(openAt);
            content.innerHTML = `
          <div class="note-date">${year}</div>
          <p class="note-label">This capsule is sealed.</p>
          <p class="note-readonly">
            It will open on <strong>${openAtStr}</strong>.
          </p>
        `;
        } else {
            /* 3. Capsule unlocked → show the note text */
            content.innerHTML = `
          <div class="note-date">${year}</div>
          <p class="note-label">Sealed note:</p>
          <p class="note-readonly">
            ${text.replace(/\n/g, '<br>')}
          </p>
        `;
        }
    })
