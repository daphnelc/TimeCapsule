console.log('Client is working');

window.addEventListener("load", function () {
  const grid = document.getElementById('capsule-grid');
  const newButton = document.getElementById('new-capsule-button');

  // 1. Load existing capsules from the server
  fetch('/api/capsules')
    .then(res => res.json())
    .then(data => {
      const capsules = data.capsules || [];

      const closedImgs = [
        'links/capsule-close1.png',
        'links/capsule-close2.png',
        'links/capsule-close3.png'
      ];
      const openImgs = [
        'links/capsule-open1.png',
        'links/capsule-open2.png',
        'links/capsule-open3.png'
      ];


      capsules.forEach((cap, index) => {
        const closed = closedImgs[index % closedImgs.length];
        const open = openImgs[index % openImgs.length];

        const a = document.createElement('a');
        a.href = `/note/${cap.id}`;
        a.className = 'capsule-item';

        a.innerHTML = `
          <img class="capsule-img tilt"
               src="${closed}"
               data-closed="${closed}"
               data-open="${open}"
               alt="Time capsule">
          <div class="capsule-openAt">${formatDate(cap.openAt)}</div>
        `;

        grid.appendChild(a);
      });

      tilt();
    })
    .catch(console.error);


  // 2. Add new capsule button: create a fresh id and go to its note page
  newButton.addEventListener('click', () => {
    const id = Date.now().toString();  // simple unique id
    window.location.href = `/note/${id}`;
  });
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }); // e.g. "Dec 10, 2025"
}

function tilt() {
  document.querySelectorAll('.capsule-img.tilt').forEach(img => {
    const closed = img.dataset.closed;
    const open = img.dataset.open;

    // random angle
    const angle = Math.random() * 25 - 10;
    img.dataset.angle = angle;
    img.style.transform = `rotate(${angle}deg)`;

    img.addEventListener('mouseenter', () => {
      img.src = open;
      img.style.transform = `rotate(${angle}deg) scale(1.03)`;
    });

    img.addEventListener('mouseleave', () => {
      img.src = closed;
      img.style.transform = `rotate(${angle}deg)`;
    });
  });
}