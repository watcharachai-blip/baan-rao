// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Fail', err));
    });
}

// State
let tasks = JSON.parse(localStorage.getItem('TASKFORCE_DATA')) || [];
let currentFilter = 'pending';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDate = document.getElementById('task-date');
const taskList = document.getElementById('task-list');
const stats = document.getElementById('stats');
const filterBtns = document.querySelectorAll('.filter-btn');

// Event Listeners
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const date = taskDate.value;
    
    if (!title) return;

    const newTask = {
        id: Date.now(),
        title: title,
        dueDate: date || null,
        completed: false
    };

    tasks.unshift(newTask);
    saveAndRender();
    
    taskTitle.value = '';
    taskDate.value = '';
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

// Functions
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('TASKFORCE_DATA', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';

    // Filter
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    // Render List
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<div style="text-align:center; color: var(--text-muted); padding: 20px; font-size:12px; letter-spacing: 1px;">NO TASKS FOUND</div>`;
    } else {
        filteredTasks.forEach(task => {
            const el = document.createElement('div');
            el.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const dateDisplay = task.dueDate ? `กำหนดส่ง: ${task.dueDate}` : 'ไม่มีกำหนดส่ง';

            el.innerHTML = `
                <div class="task-content" onclick="toggleTask(${task.id})">
                    <div class="checkbox-custom"></div>
                    <div class="task-info">
                        <span class="task-title">${escapeHtml(task.title)}</span>
                        <span class="task-date">${dateDisplay}</span>
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteTask(${task.id})">✕</button>
            `;
            taskList.appendChild(el);
        });
    }

    // Render Stats
    const completedCount = tasks.filter(t => t.completed).length;
    stats.textContent = `${completedCount} / ${tasks.length} TASK COMPLETE`;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Initial Render
renderTasks();