const body = document.body;
const modeToggleBtn = document.getElementById('modeToggleBtn');
const modeIcon = modeToggleBtn.querySelector('i');
let mode = localStorage.getItem('mode') || 'light';
body.className = mode;
modeIcon.className = mode === 'light' ? 'fas fa-sun' : 'fas fa-moon';
modeToggleBtn.addEventListener('click', () => {
  mode = body.className === 'light' ? 'dark' : 'light';
  body.className = mode;
  localStorage.setItem('mode', mode);
  modeIcon.className = mode === 'light' ? 'fas fa-sun' : 'fas fa-moon';
});

const companyInput = document.getElementById('companyInput');
const roleInput = document.getElementById('roleInput');
const deadlineInput = document.getElementById('deadlineInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const sortSelect = document.getElementById('sortSelect');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activeFilter = 'all';

const priorityOrder = { high: 1, medium: 2, low: 3 };

renderAll();

function renderAll() {
  taskList.innerHTML = '';

  let sorted = [...tasks];
  const sortVal = sortSelect ? sortSelect.value : 'none';

  if (sortVal === 'priority') {
    sorted.sort(function(a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  } else if (sortVal === 'deadline') {
    sorted.sort(function(a, b) {
      return parseDeadline(a.deadline) - parseDeadline(b.deadline);
    });
  }

  sorted.forEach(function(t) {
    createTaskElement(t.company, t.role, t.deadline, t.completed, t.category, t.priority);
  });

  updateCounter();
  applyFilter();
}

function parseDeadline(str) {
  const parts = str.split('/');
  if (parts.length !== 3) return new Date(0);
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function createTaskElement(company, role, deadline, completed = false, category = 'applied', priority = 'low') {
  const li = document.createElement('li');

  const bar = document.createElement('div');
  bar.className = 'priority-bar';
  if (priority === 'high')        bar.style.background = '#ff5f5f';
  else if (priority === 'medium') bar.style.background = '#ff9f43';
  else                            bar.style.background = '#26de81';
  li.appendChild(bar);

  const content = document.createElement('div');
  content.className = 'card-content';

  const company_el = document.createElement('div');
  company_el.className = 'card-company';
  company_el.textContent = company;
  if (completed) {
    company_el.style.textDecoration = 'line-through';
    company_el.style.opacity = '0.4';
  }

  const role_el = document.createElement('div');
  role_el.className = 'card-role';
  role_el.textContent = role;

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const catBadge = document.createElement('span');
  catBadge.className = `badge badge-${category.toLowerCase()}`;
  catBadge.textContent = category;

  const prioBadge = document.createElement('span');
  prioBadge.className = `badge badge-${priority.toLowerCase()}`;
  prioBadge.textContent = priority;

  const deadlineBadge = document.createElement('span');
  deadlineBadge.className = 'badge badge-deadline';
  deadlineBadge.textContent = deadline;

  meta.appendChild(catBadge);
  meta.appendChild(prioBadge);
  meta.appendChild(deadlineBadge);

  content.appendChild(company_el);
  content.appendChild(role_el);
  content.appendChild(meta);
  li.appendChild(content);

  const completeBtn = document.createElement('button');
  completeBtn.className = completed ? 'undo' : 'complete';
  completeBtn.textContent = completed ? 'Undo' : '✓';
  completeBtn.addEventListener('click', () => {
    const isCompleted = company_el.style.textDecoration === 'line-through';
    if (isCompleted) {
      company_el.style.textDecoration = 'none';
      company_el.style.opacity = '1';
      completeBtn.textContent = '✓';
      completeBtn.className = 'complete';
    } else {
      company_el.style.textDecoration = 'line-through';
      company_el.style.opacity = '0.4';
      completeBtn.textContent = 'Undo';
      completeBtn.className = 'undo';
    }
    syncTasksFromDOM();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '✕';
  deleteBtn.className = 'delete';
  deleteBtn.addEventListener('click', () => {
    const index = getTaskIndex(li);
    if (index !== -1) tasks.splice(index, 1);
    taskList.removeChild(li);
    saveTasks();
    updateCounter();
  });

  const btnGroup = document.createElement('div');
  btnGroup.className = 'card-btns';
  btnGroup.appendChild(completeBtn);
  btnGroup.appendChild(deleteBtn);
  li.appendChild(btnGroup);

  taskList.appendChild(li);
}

function getTaskIndex(li) {
  const items = taskList.querySelectorAll('li');
  for (let i = 0; i < items.length; i++) {
    if (items[i] === li) return i;
  }
  return -1;
}

function syncTasksFromDOM() {
  const items = taskList.querySelectorAll('li');
  items.forEach(function(li, i) {
    const companyEl = li.querySelector('.card-company');
    if (tasks[i]) {
      tasks[i].completed = companyEl.style.textDecoration === 'line-through';
    }
  });
  saveTasks();
  updateCounter();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateCounter() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  taskCounter.textContent = `Total tasks: ${total} | Completed: ${completed} | Pending: ${total - completed}`;
}

function applyFilter() {
  const items = taskList.querySelectorAll('li');
  items.forEach(function(li) {
    const catBadge = li.querySelector('.card-meta .badge');
    if (activeFilter === 'all') {
      li.style.display = 'flex';
      return;
    }
    if (catBadge && catBadge.textContent.toLowerCase() === activeFilter) {
      li.style.display = 'flex';
    } else {
      li.style.display = 'none';
    }
  });
}

function addTask() {
  const company = companyInput.value.trim();
  const role = roleInput.value.trim();
  const rawDate = deadlineInput.value;
  const category = categorySelect.value;
  const priority = prioritySelect.value;

  if (company !== '' && role !== '' && rawDate !== '') {
    const [year, month, day] = rawDate.split('-');
    const deadline = `${day}/${month}/${year}`;
    const newTask = { company, role, deadline, completed: false, category, priority };
    tasks.push(newTask);
    saveTasks();
    renderAll();
    companyInput.value = '';
    roleInput.value = '';
    deadlineInput.value = '';
  }
}

addBtn.addEventListener('click', addTask);

clearBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    saveTasks();
    taskList.innerHTML = '';
    updateCounter();
  }
});

[companyInput, roleInput, deadlineInput].forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
  });
});

sortSelect.addEventListener('change', function() {
  renderAll();
});

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    filterBtns.forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    activeFilter = btn.getAttribute('data-filter');
    applyFilter();
  });
});