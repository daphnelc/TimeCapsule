console.log('Client is working');

window.addEventListener("load", function () {

  document.querySelectorAll('.capsule-img.tilt').forEach(img => {
    const closed = img.dataset.closed;
    const open = img.dataset.open;

    // random angle between -18 and 18
    const baseAngle = Math.random() * 36 - 18;
    img.dataset.baseAngle = baseAngle;
    img.style.transform = `rotate(${baseAngle}deg)`;

    img.addEventListener('mouseenter', () => {
      img.src = open;
      img.style.transform = `rotate(${baseAngle}deg) scale(1.03)`;
    });

    img.addEventListener('mouseleave', () => {
      img.src = closed;
      img.style.transform = `rotate(${baseAngle}deg)`;
    });
  });

});