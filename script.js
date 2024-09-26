const referenceDate = new Date('2024-09-02'); // monday of a known week
const referenceType = 'CD'; // what order that week is

const breaks = {
  spring: { start: new Date('2024-03-25'), end: new Date('2024-04-01') },
  summer: { start: new Date('2024-06-25'), end: new Date('2024-09-03') },
  winter: { start: new Date('2024-12-20'), end: new Date('2025-01-05') }
};

document.addEventListener("DOMContentLoaded", function() {
  fillCurrentDate();
  loadClasses();
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
    updateClassDisplay("");
  } else if (isWeekend(currentDate)) {
    document.getElementById('cdOrDc').textContent = "Weekend!";
    updateBackground('weekend');
    updateClassDisplay("");
  } else {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const diffWeeks = Math.floor((currentDate - referenceDate) / oneWeek);

    const isEvenWeek = diffWeeks % 2 === 0;
    const currentWeekType = isEvenWeek ? referenceType : (referenceType === 'CD' ? 'DC' : 'CD');

    document.getElementById('cdOrDc').textContent = `${currentWeekType} Week`;
    updateBackground(currentWeekType);
    updateClassDisplay(currentWeekType);
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
  return (day === 6 || day === 0); // saturday is 5 and sunday is 6 (idk why lol)
}

function isBreak(date) {
  return Object.values(breaks).some(breakPeriod => date >= breakPeriod.start && date <= breakPeriod.end);
}

function saveClasses() {
  const cClassName = document.getElementById('cClassName').value;
  const dClassName = document.getElementById('dClassName').value;

  localStorage.setItem('cClassName', cClassName);
  localStorage.setItem('dClassName', dClassName);

  checkWeek(); // update disp. after saving
}

function loadClasses() {
  const savedCClass = localStorage.getItem('cClassName') || "";
  const savedDClass = localStorage.getItem('dClassName') || "";

  document.getElementById('cClassName').value = savedCClass;
  document.getElementById('dClassName').value = savedDClass;
}

function updateClassDisplay(weekType) {
  const cClassName = localStorage.getItem('cClassName') || "___";
  const dClassName = localStorage.getItem('dClassName') || "___";

  let classText = "";
  if (weekType === 'CD') {
    classText = `First Class: ${cClassName}`;
  } else if (weekType === 'DC') {
    classText = `First Class: ${dClassName}`;
  }

  document.getElementById('classDisplay').textContent = classText;
}
