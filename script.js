document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const counter = document.getElementById('counter');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.getElementById('clearCompletedBtn');
    // Добавляем поиск кнопок тем
    const themeButtons = document.querySelectorAll('.theme-btn'); 

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    function updateCounter() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        counter.textContent = `Выполнено: ${completed} из ${total}`;
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const contentDiv = document.createElement('div');
            contentDiv.style.flex = '1';
            contentDiv.style.display = 'flex';
            contentDiv.style.justifyContent = 'space-between';
            contentDiv.style.alignItems = 'center';

            const span = document.createElement('span');
            span.textContent = task.text;
            span.addEventListener('click', () => toggleTask(task.id)); 
            span.addEventListener('dblclick', () => editTask(task.id));
            
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('task-date');
            if (task.date) {
                dateSpan.textContent = `📅 ${formatDate(task.date)}`;
            }

            contentDiv.appendChild(span);
            contentDiv.appendChild(dateSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(contentDiv);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });

        updateCounter();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        tasks.push({
            id: Date.now(),
            text,
            completed: false,
            date: new Date().toISOString()
        });
        taskInput.value = '';
        saveAndRender();
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveAndRender();
        }
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Редактировать задачу:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                saveAndRender();
            }
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }

    function clearCompleted() {
        tasks = tasks.filter(t => !t.completed);
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ТЕМ ---
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Подсвечиваем активную кнопку темы
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeValue === theme);
        });
    }

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.themeValue));
    });

    // Восстанавливаем тему при загрузке (по умолчанию 'dark', так как у вас сейчас тёмная)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    // --------------------------------

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearBtn.addEventListener('click', clearCompleted);

    // Первый рендер
    renderTasks();
});