/* ========== State ========== */
let currentYear, currentMonth, selectedDate;
let events = JSON.parse(localStorage.getItem('calendar-events') || '[]');

/* ========== Theme ========== */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('calendar-theme') || 'light';
if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('calendar-theme', isDark ? 'light' : 'dark');
});

/* ========== Calendar Rendering ========== */
const calTitle = document.getElementById('calTitle');
const calendarGrid = document.getElementById('calendarGrid');
const eventsDate = document.getElementById('eventsDate');
const eventsList = document.getElementById('eventsList');
const emptyMsg = document.getElementById('emptyMsg');

function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  selectedDate = formatDate(today);
  renderCalendar();
  renderEvents();
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function displayDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function renderCalendar() {
  calTitle.textContent = `${currentYear}年${currentMonth + 1}月`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

  const todayStr = formatDate(new Date());
  let html = '';

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    const d = new Date(currentYear, currentMonth - 1, day);
    const ds = formatDate(d);
    html += `<div class="cal-day other-month" data-date="${ds}">${day}</div>`;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentYear, currentMonth, day);
    const ds = formatDate(d);
    const isToday = ds === todayStr;
    const isSelected = ds === selectedDate;
    const hasEvents = events.some(e => e.date === ds);

    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';

    html += `<div class="${cls}" data-date="${ds}">${day}${hasEvents ? '<span class="dot"></span>' : ''}</div>`;
  }

  // Next month leading days
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(currentYear, currentMonth + 1, day);
    const ds = formatDate(d);
    html += `<div class="cal-day other-month" data-date="${ds}">${day}</div>`;
  }

  calendarGrid.innerHTML = html;

  // Click handlers
  calendarGrid.querySelectorAll('.cal-day').forEach(el => {
    el.addEventListener('click', () => {
      selectedDate = el.dataset.date;
      const [y, m] = selectedDate.split('-').map(Number);
      currentYear = y;
      currentMonth = m - 1;
      renderCalendar();
      renderEvents();
    });
  });
}

function renderEvents() {
  eventsDate.textContent = displayDate(selectedDate);
  const dayEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (dayEvents.length === 0) {
    eventsList.innerHTML = '<p class="empty-msg">暂无事件</p>';
    return;
  }

  eventsList.innerHTML = dayEvents.map(e => `
    <div class="event-card">
      <div class="event-color-bar"></div>
      <div class="event-info">
        <div class="event-title">${escapeHtml(e.title)}</div>
        <div class="event-time">${e.startTime} - ${e.endTime}</div>
      </div>
      <button class="event-delete" data-id="${e.id}" title="删除">&times;</button>
    </div>
  `).join('');

  // Delete handlers
  eventsList.querySelectorAll('.event-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      events = events.filter(e => e.id !== btn.dataset.id);
      saveEvents();
      renderCalendar();
      renderEvents();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function saveEvents() {
  localStorage.setItem('calendar-events', JSON.stringify(events));
}

/* ========== Navigation ========== */
document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
});

document.getElementById('todayBtn').addEventListener('click', () => {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  selectedDate = formatDate(today);
  renderCalendar();
  renderEvents();
});

/* ========== Modal ========== */
const modalOverlay = document.getElementById('modalOverlay');
const eventForm = document.getElementById('eventForm');

document.getElementById('addBtn').addEventListener('click', () => {
  modalOverlay.classList.add('open');
  document.getElementById('eventTitle').focus();
});

function closeModal() {
  modalOverlay.classList.remove('open');
  eventForm.reset();
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value.trim();
  const startTime = document.getElementById('eventStart').value;
  const endTime = document.getElementById('eventEnd').value;
  const desc = document.getElementById('eventDesc').value.trim();

  if (!title || !startTime || !endTime) return;

  events.push({
    id: Date.now().toString(),
    title,
    description: desc,
    date: selectedDate,
    startTime,
    endTime
  });

  saveEvents();
  closeModal();
  renderCalendar();
  renderEvents();
});

/* ========== Init ========== */
init();
