// PATCH WILL BE MADE SOON AFTER YEAR SWITCH

const referenceDate = new Date('2024-09-02'); // monday of a known week
const referenceType = 'CD'; // what order that week is
const breaks = {
  spring: { start: new Date('2024-03-08'), end: new Date('2024-03-14') },
  summer: { start: new Date('2024-06-28'), end: new Date('2024-09-03') },
  winter: { start: new Date('2024-12-21'), end: new Date('2025-01-03') }
};

const specialDays = {
  pdDays: [
    '2024-09-03',  // Tuesday, September 3, 2024
    '2024-10-11',  // Friday, October 11, 2024
    '2024-11-01',  // Friday, November 1, 2024
    '2025-01-31',  // Friday, January 31, 2025
    '2025-03-31',  // Monday, March 31, 2025
    '2025-06-26',  // Thursday, June 26, 2025
    '2025-06-27'   // Friday, June 27, 2025
  ],
  instructionalSupportDays: [
    '2024-11-8',
    '2025-01-27',
    '2025-01-28',
    '2025-01-29',
    '2025-01-30',
    '2025-04-15',
    '2025-06-20',
    '2025-06-23',
    '2025-06-24',
    '2025-06-25'
  ],
  blendedLearningDays: [
    '2024-09-25',  // Wednesday, September 25, 2024
    '2024-12-04',  // Wednesday, December 4, 2024
    '2025-02-26',  // Wednesday, February 26, 2025
    '2025-05-07'   // Wednesday, May 7, 2025
    ],
  holidayDays: [
    '2024-09-02',  // Labour Day
    '2024-10-14',  // Thanksgiving
    '2024-12-23',  // Winter Break Start
    '2025-01-03',  // Winter Break End
    '2025-02-17',  // Family Day
    '2025-03-10',  // March Break Start
    '2025-03-14',  // March Break End
    '2025-04-18',  // Good Friday
    '2025-04-21',  // Easter Monday
    '2025-05-19'   // Victoria Day
    ],
};

function isSpecialDay(date) {
  const dateString = date.toISOString().split('T')[0];

  if (specialDays.pdDays.includes(dateString)) {
    return { isSpecial: true, type: 'PD Day' };
  }
  if (specialDays.instructionalSupportDays.includes(dateString)) {
    return { isSpecial: true, type: 'Instructional Support Day / Exam Day' };
  }
  if (specialDays.blendedLearningDays.includes(dateString)) {
    return { isSpecial: true, type: 'Blended Learning Day' };
  }
  if (specialDays.holidayDays.includes(dateString)) {
    return { isSpecial: true, type: 'Holiday Day' };
  }

  return { isSpecial: false };
}

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

function shouldShowEvent(event, currentDate) {
  const daysToNumber = {
    "Sunday": 6,
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5
  };
  const currentDayNumber = currentDate.getDay();

  const eventDayNumber = daysToNumber[event.day];

  if (currentDayNumber !== eventDayNumber) {
    return false;
  }

  const frequency = event.frequency;
  if (frequency === 'weekly') {
    return true;
  }

  const referenceDate = new Date(event.referenceWeekMonday);
  const weeksSinceRef = Math.floor((currentDate - referenceDate) / (7 * 24 * 60 * 60 * 1000));

  switch(frequency) {
    case 'biweekly':
      return weeksSinceRef % 2 === 0;
    case 'triweekly':
      return weeksSinceRef % 3 === 0;
    case 'monthly':
      // get the week number within the month (0-4)
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const weekInMonth = Math.floor((currentDate.getDate() - firstDayOfMonth.getDate()) / 7);
      // get the reference week number
      const refFirstDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
      const refWeekInMonth = Math.floor((referenceDate.getDate() - refFirstDayOfMonth.getDate()) / 7);
      // show event if it's the same week number as reference date
      return weekInMonth === refWeekInMonth;
    default:
      return false;
  }
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
    const eventsList = document.getElementById(`${type}SchoolEventsList`);
    if (!eventsList) return;

    const relevantEvents = events.filter(event => 
      event.type === type && shouldShowEvent(event, currentDate)
    );

    if (relevantEvents.length > 0) {
      eventsList.innerHTML = relevantEvents.map(event => `
        <li>
          ${event.link ? 
            `<a target="_blank" href="${event.link}" class="fw-bold text-primary">${event.name}</a>` : 
            `<span class="fw-bold">${event.name}</span>`
          }
          <p class="text-muted mb-1">${event.location} - ${event.teacher}</p>
          <small class="text-muted">${event.time}</small>
        </li>
      `).join('');
    } else {
      eventsList.innerHTML = `<li class="text-muted">No events scheduled</li>`;
    }
  });
}

// loader functions
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
  const specialDay = isSpecialDay(currentDate);

  if (specialDay.isSpecial) {
    document.getElementById('cdOrDc').textContent = specialDay.type;
    updateBackground('special');
    updateClassDisplay("");
  } else if (isBreak(currentDate)) {
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
    case 'special':
      resultContainer.className = 'container text-center mt-4 p-3 rounded text-dark';
      resultContainer.style.backgroundColor = '#fd7e14';  // override w orange color
      break;
  }
}

function isWeekend(date) {
  const day = new Date(date);
  return (day === 6 || day === 5); // saturday is 5 and sunday is 6 ionno why
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

  updateUpcomingEvents();
}

function updateUpcomingEvents() {
  const upcomingEventsDiv = document.getElementById('upcomingEvent');
  const selectedDate = document.getElementById('currentDate').value; // use the input to get the day
  const today = new Date(selectedDate); // use the selected date as the starting point, NOT the current day*

  let upcomingText = "No special days for the next week.";
  upcomingEventsDiv.textContent = upcomingText;

  let specialDayFound = false;

  for (let i = 1; i <= 6; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i); // retrieve next days

    // treat without timezone shift
    const adjustedDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());

    const specialDay = isSpecialDay(adjustedDate);
    if (specialDay.isSpecial) {
      const dayOfWeek = adjustedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = adjustedDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      upcomingText = `Upcoming ${specialDay.type} on ${dayOfWeek}, ${formattedDate}.`;
      specialDayFound = true;
      break;
    }
  }

  if (specialDayFound) {
    upcomingEventsDiv.textContent = upcomingText;
  }
}

