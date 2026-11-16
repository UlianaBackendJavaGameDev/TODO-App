document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const counter = document.getElementById('counter');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.getElementById('clearCompletedBtn');
    const themeButtons = document.querySelectorAll('.theme-btn'); 
    
    // Новые элементы для дедлайна, приоритета и категории
    const taskDeadline = document.getElementById('taskDeadline');
    const taskPriority = document.getElementById('taskPriority');
    const taskCategory = document.getElementById('taskCategory');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    function formatDate(isoString) {
        if (!isoString) return '';
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

        // 1. Фильтрация
        let filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        // 2. Сортировка (сначала невыполненные, потом по приоритету: высокий -> низкий)
        const priorityWeight = { high: 1, medium: 2, low: 3 };
        filteredTasks.sort((a, b) => {
            // Сначала те, что не выполнены
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            // Потом по приоритету
            return (priorityWeight[a.priority] || 2) - (priorityWeight[b.priority] || 2);
        });

        // 3. Отрисовка
        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const contentDiv = document.createElement('div');
            contentDiv.style.flex = '1';
            contentDiv.style.display = 'flex';
            contentDiv.style.alignItems = 'center';
            contentDiv.style.flexWrap = 'wrap'; // Чтобы на мобилке бейджи переносились

            // Текст задачи
            const span = document.createElement('span');
            span.textContent = task.text;
            span.addEventListener('click', () => toggleTask(task.id)); 
            span.addEventListener('dblclick', () => editTask(task.id));
            contentDiv.appendChild(span);

            // Бейджики (категория и приоритет)
            const badgesDiv = document.createElement('div');
            badgesDiv.classList.add('task-badges');

            // Категория
            const catBadge = document.createElement('span');
            const catNames = { work: 'Работа', study: 'Учёба', course: 'Курс', rest: 'Отдых' };
            catBadge.classList.add('badge', `badge--${task.category || 'work'}`);
            catBadge.textContent = catNames[task.category] || 'Работа';
            badgesDiv.appendChild(catBadge);

            // Приоритет
            const prioBadge = document.createElement('span');
            const prioNames = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
            prioBadge.classList.add('badge', `badge--${task.priority || 'medium'}`);
            prioBadge.textContent = prioNames[task.priority] || 'Средний';
            badgesDiv.appendChild(prioBadge);

            contentDiv.appendChild(badgesDiv);

            // Дедлайн
            if (task.deadline) {
                const deadlineSpan = document.createElement('span');
                deadlineSpan.classList.add('task-deadline');
                
                // Проверка на просрочку
                const today = new Date().toISOString().split('T')[0];
                if (task.deadline < today && !task.completed) {
                    deadlineSpan.classList.add('overdue');
                }
                
                deadlineSpan.textContent = `⏳ ${formatDate(task.deadline)}`;
                contentDiv.appendChild(deadlineSpan);
            }

            // Кнопка удаления
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

        // Собираем все данные из формы
        tasks.push({
            id: Date.now(),
            text: text,
            completed: false,
            date: new Date().toISOString(),
            deadline: taskDeadline.value || null, // Если дата не выбрана, будет null
            priority: taskPriority.value,
            category: taskCategory.value
        });
        
        // Очищаем поля после добавления
        taskInput.value = '';
        taskDeadline.value = ''; 
        
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
        
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeValue === theme);
        });
    }

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.themeValue));
    });

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