const referenceDate = new Date('2024-09-02'); // This reference date is the MONDAY of a schoolweek
const referenceType = 'CD';

// Gotta do these manually
const breaks = {
  spring: { start: new Date('2024-03-25'), end: new Date('2024-04-01') },
  summer: { start: new Date('2024-06-25'), end: new Date('2024-09-01') },
  winter: { start: new Date('2024-12-20'), end: new Date('2025-01-05') }
};

document.addEventListener("DOMContentLoaded", function() {
  fillCurrentDate();
  checkWeek();

  document.getElementById('dateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    checkWeek();
  });

  document.getElementById('currentDate').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkWeek();
    }
  });

  document.getElementById('currentDate').addEventListener('change', checkWeek);
});

function checkWeek() {
  const currentDate = new Date(document.getElementById('currentDate').value);

  if (isBreak(currentDate)) {
    document.getElementById('cdOrDc').textContent = "Break!";
    updateBackground('break');
  } else if (isWeekend(currentDate)) {
    document.getElementById('cdOrDc').textContent = "Weekend!";
    updateBackground('weekend');
  } else {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const diffWeeks = Math.floor((currentDate - referenceDate) / oneWeek);

    const isEvenWeek = diffWeeks % 2 === 0;
    const currentWeekType = isEvenWeek ? referenceType : (referenceType === 'CD' ? 'DC' : 'CD');

    document.getElementById('cdOrDc').textContent = `${currentWeekType} Week`;
    updateBackground(currentWeekType);
  }
}

function fillCurrentDate() {
  const today = new Date();
  const formattedDate = today.toISOString().substr(0, 10);
  document.getElementById('currentDate').value = formattedDate;
  checkWeek();
}

function updateBackground(type) {
  const resultContainer = document.getElementById('resultContainer');

  switch(type) {
    case 'CD':
      resultContainer.className = 'container text-center mt-4 p-3 rounded bg-primary text-white';
      break;
    case 'DC':
      resultContainer.className = 'container text-center mt-4 p-3 rounded bg-danger text-white';
      break;
    case 'weekend':
      resultContainer.className = 'container text-center mt-4 p-3 rounded bg-warning text-dark';
      break;
    case 'break':
      resultContainer.className = 'container text-center mt-4 p-3 rounded bg-success text-white';
      break;
  }
}

function isWeekend(date) {
  const day = date.getDay();
  return (day === 6 || day === 0); // saturday is 6 and sunday is 0
}

function isBreak(date) {
  return Object.values(breaks).some(breakPeriod => date >= breakPeriod.start && date <= breakPeriod.end);
}
