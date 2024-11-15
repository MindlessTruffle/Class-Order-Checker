const referenceDate = new Date('2024-09-02'); // monday of a known week
const referenceType = 'CD'; // what order that week is
const breaks = {
  spring: { start: new Date('2024-03-25'), end: new Date('2024-04-01') },
  summer: { start: new Date('2024-06-25'), end: new Date('2024-09-03') },
  winter: { start: new Date('2024-12-20'), end: new Date('2025-01-05') }
};

// Events handling functions
async function loadEvents() {
  try {
    const response = await fetch('events.json');
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

function getEventFrequency(dates) {
  const date1 = new Date(dates[0]);
  const date2 = new Date(dates[1]);
  const weeksBetween = Math.round(Math.abs(date2 - date1) / (7 * 24 * 60 * 60 * 1000));
  return weeksBetween === 1 ? 'weekly' : 'biweekly';
}

function shouldShowEvent(event, currentDate) {
  const date1 = new Date(event.referenceDates[0]);
  const dayOfWeek = date1.getDay();

  // Check if it's the same day of the week
  if (currentDate.getDay() !== dayOfWeek) {
    return false;
  }

  const frequency = getEventFrequency(event.referenceDates);
  if (frequency === 'weekly') {
    return true;
  }

  // For biweekly events, check if we're on the correct week
  const weeksSinceRef = Math.floor((currentDate - date1) / (7 * 24 * 60 * 60 * 1000));
  return weeksSinceRef % 2 === 0;
}

async function updateSidebar() {
  const events = await loadEvents();
  const currentDate = new Date(document.getElementById('currentDate').value);

  const types = {
    'before': 'Before School',
    'during': 'During School',
    'after': 'After School'
  };

  Object.entries(types).forEach(([type, title]) => {
    const container = document.getElementById(`${type}SchoolEvents`);
    if (!container) return;

    const relevantEvents = events
      .filter(event => event.type === type && shouldShowEvent(event, currentDate))
      .map(event => `
        <div class="card mb-2">
          <h3 class="h6">${title}</h3>
          <ul class="list-unstyled">
            <li>
              ${event.link ? 
                `<a href="${event.link}" class="fw-bold text-primary">${event.name}</a>` : 
                `<span class="fw-bold">${event.name}</span>`
              }
              <p class="text-muted mb-1">${event.location} - ${event.teacher}</p>
              <small class="text-muted">${event.time}</small>
            </li>
          </ul>
        </div>
      `).join('');

    container.innerHTML = relevantEvents || `
      <div class="card mb-2">
        <h3 class="h6">${title}</h3>
        <ul class="list-unstyled">
          <li class="text-muted">No events scheduled</li>
        </ul>
      </div>
    `;
  });
}

// Original functions
document.addEventListener("DOMContentLoaded", function() {
  fillCurrentDate();
  loadClasses();
  checkWeek();
  updateSidebar();

  document.getElementById('dateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    checkWeek();
    updateSidebar();
  });

  document.getElementById('currentDate').addEventListener('change', function() {
    checkWeek();
    updateSidebar();
  });
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
  return (day === 6 || day === 5); // saturday is 5 and sunday is 6
}

function isBreak(date) {
  return Object.values(breaks).some(breakPeriod => date >= breakPeriod.start && date <= breakPeriod.end);
}

function saveClasses() {
  const cClassName = document.getElementById('cClassName').value;
  const dClassName = document.getElementById('dClassName').value;
  localStorage.setItem('cClassName', cClassName);
  localStorage.setItem('dClassName', dClassName);
  checkWeek();
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