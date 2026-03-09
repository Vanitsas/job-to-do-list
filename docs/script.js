const body=document.body;
const modeToggleBtn=document.getElementById('modeToggleBtn');
const modeIcon=modeToggleBtn.querySelector('i');
let mode=localStorage.getItem('mode')||'light';
body.className=mode;
modeIcon.className=mode==='light'?'fas fa-sun':'fas fa-moon';
modeToggleBtn.addEventListener('click',()=>{
  mode=body.className==='light'?'dark':'light';
  body.className=mode;
  localStorage.setItem('mode',mode);
  modeIcon.className=mode==='light'?'fas fa-sun':'fas fa-moon';
});

const companyInput=document.getElementById('companyInput');
const roleInput=document.getElementById('roleInput');
const deadlineInput=document.getElementById('deadlineInput');
const categorySelect=document.getElementById('categorySelect');
const prioritySelect=document.getElementById('prioritySelect');
const taskList=document.getElementById('taskList');
const taskCounter=document.getElementById('taskCounter');
const addBtn=document.getElementById('addBtn');
const clearBtn=document.getElementById('clearBtn');

let tasks=JSON.parse(localStorage.getItem('tasks'))||[];
tasks.forEach(t=>createTask(t.company,t.role,t.deadline,t.completed,t.category,t.priority));

function createTask(company,role,deadline,completed=false,category='applied',priority='low'){
  const li=document.createElement('li');
  const span=document.createElement('span');
  span.innerHTML=`<strong>[${priority.toUpperCase()}]</strong> ${company} - ${role} <small>${deadline}</small> | <em>${category}</em>`;
  if(completed){span.style.textDecoration='line-through'; span.style.color='gray';}
  li.appendChild(span);

  const completeBtn=document.createElement('button');
  completeBtn.className=completed?'undo':'complete';
  completeBtn.textContent=completed?'Undo':'Complete';
  completeBtn.addEventListener('click',()=>{
    if(span.style.textDecoration==='line-through'){
      span.style.textDecoration='none';
      span.style.color=body.classList.contains('dark')?'#eee':'#333';
      completeBtn.textContent='Complete';
      completeBtn.className='complete';
    } else {
      span.style.textDecoration='line-through';
      span.style.color='gray';
      completeBtn.textContent='Undo';
      completeBtn.className='undo';
    }
    updateTasks();
  });
  li.appendChild(completeBtn);

  const deleteBtn=document.createElement('button');
  deleteBtn.textContent='Delete';
  deleteBtn.className='delete';
  deleteBtn.addEventListener('click',()=>{taskList.removeChild(li); updateTasks();});
  li.appendChild(deleteBtn);

  taskList.appendChild(li);
  updateTasks();
}

function updateTasks(){
  const taskItems=taskList.querySelectorAll('li');
  const arr=[];
  let completedCount=0;
  taskItems.forEach(li=>{
    const span=li.querySelector('span');
    const completed=span.style.textDecoration==='line-through';
    if(completed) completedCount++;
    const textParts=span.textContent.split(']');
    const priority=textParts[0].replace('[','').toLowerCase();
    const rest=textParts[1].trim();
    const [companyRole, categoryPart] = rest.split('|');
    const [company, role] = companyRole.split('-').map(s=>s.trim());
    const deadlineMatch = companyRole.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
    const deadline = deadlineMatch ? deadlineMatch[0] : new Date().toLocaleDateString();
    const category = categoryPart ? categoryPart.trim() : 'applied';
    arr.push({company,role,deadline,completed,category,priority});
  });
  localStorage.setItem('tasks',JSON.stringify(arr));
  taskCounter.textContent=`Total tasks: ${arr.length} | Completed: ${completedCount} | Pending: ${arr.length-completedCount}`;
}

function addTask(){
  const company=companyInput.value.trim();
  const role=roleInput.value.trim();
  const deadline=deadlineInput.value.trim();
  const category=categorySelect.value;
  const priority=prioritySelect.value;
  if(company!=='' && role!=='' && deadline!==''){
    createTask(company,role,deadline,false,category,priority);
    companyInput.value='';
    roleInput.value='';
    deadlineInput.value='';
  }
}

addBtn.addEventListener('click',addTask);
clearBtn.addEventListener('click',()=>{if(confirm("Are you sure you want to delete all tasks?")){taskList.innerHTML=''; updateTasks();}});
[companyInput,roleInput,deadlineInput].forEach(input=>input.addEventListener('keypress',e=>{if(e.key==='Enter') addTask();}));