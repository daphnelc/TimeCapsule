window.addEventListener('load', () => {
  const grid = document.getElementById('capsule-grid');
  const newButton = document.getElementById('new-capsule-button');

  const closedImgs = [
    'links/capsule-close1.png',
    'links/capsule-close2.png',
    'links/capsule-close3.png',
    'links/capsule-close4.png'
  ];

  const openImgs = [
    'links/capsule-open1.png',
    'links/capsule-open2.png',
    'links/capsule-open3.png',
    'links/capsule-open4.png'
  ];

  // Load existing capsules
  fetch('/api/capsules')
    .then(res => res.json())
    .then(data => {
      const capsules = data.capsules || [];

      //Loop over every capsule in the array
      //ChatGPT helped generating this code
      capsules.forEach((cap) => {
        // pick one random capsule
        const randomIndex = Math.floor(Math.random() * closedImgs.length);
        const closed = closedImgs[randomIndex];
        const open = openImgs[randomIndex];

        //Create a new link for the capsule
        const capsules = document.createElement('a');
        capsules.href = `/note/${cap.id}`; //the id for this capsule
        capsules.className = 'capsule-item'; //css class name

        //Capsule's label, using formatted date
        const label = `${formatDate(cap.openAt)}`;

        //Add the capsule link to the html page
        capsules.innerHTML = `
          <img
            class="capsule-img tilt"
            src="${closed}"
            data-closed="${closed}"
            data-open="${open}"
            alt="Time capsule"
          >
          <div class="capsule-item">${label}</div>
        `;

        grid.appendChild(capsules);
      });

      applyTilt();
    })

  // Add new capsule button 
  newButton.addEventListener('click', () => {
    //new id based on timestamp
    const id = Date.now().toString();
    window.location.href = `/note/${id}`;
  });
});

// function to format full date
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(); 
}

// function for the tilt capsule
function applyTilt() {
  document.querySelectorAll('.capsule-img.tilt').forEach(img => {
    const closed = img.dataset.closed;
    const open = img.dataset.open;

    // random angle between -10° and 15°
    const angle = Math.random() * 25 - 10;
    img.dataset.angle = angle;
    img.style.transform = `rotate(${angle}deg)`;

    img.addEventListener('mouseenter', () => {
      img.src = open;
    });

    img.addEventListener('mouseleave', () => {
      img.src = closed;
    });
  });
}
