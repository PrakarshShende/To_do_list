// state to keep track of tasks and active filter
let tasks = [];
let currentFilter = 'all'; // can be 'all', 'pending', or 'completed'

// grab all the elements we need from the DOM
const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priorityInput');
const dueDateInput = document.getElementById('dueDateInput');
const dueTimeInput = document.getElementById('dueTimeInput'); // grab the time input too
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');

const saveBtn = document.getElementById('saveBtn');
const loadFile = document.getElementById('loadFile');
const themeToggle = document.getElementById('themeToggle'); // grab the theme button

// function to add a new task
function addTask() {
    const text = taskInput.value.trim();
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;
    const dueTime = dueTimeInput.value;

    if (text === '') {
        alert('Please enter a task.');
        return;
    }

    const newTask = {
        id: Date.now().toString(), // simple way to get a unique id
        text,
        priority, // store the priority level
        dueDate,  // store the due date
        dueTime,  // store the time
        completed: false // tasks are pending by default
    };

    tasks.push(newTask);
    
    // clear the inputs after adding
    taskInput.value = '';
    priorityInput.value = 'medium';
    dueDateInput.value = '';
    dueTimeInput.value = '';

    // update the ui
    renderTasks();
}

// function to delete a task by id
function deleteTask(id) {
    // just filter it out from the array
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

// toggle a task between completed and pending
function toggleComplete(id) {
    // go through the tasks and flip the completed status for the matching one
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    renderTasks();
}

// switch between all, pending, and completed views
function setFilter(filterType) {
    currentFilter = filterType;
    
    // update the active class on our tab buttons so it looks right
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTasks();
}

// my extra feature: search functionality
function searchTasks() {
    // just call render, it handles the search filtering automatically
    renderTasks();
}

// save everything to a json file so we don't lose it
function saveTasksToFile() {
    // turn our tasks array into a string
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // create a fake link and click it to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-tasks.json';
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // clean up
}

// load our tasks back from a json file
function loadTasksFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // parse the json and update our state
            const loadedTasks = JSON.parse(e.target.result);
            if (Array.isArray(loadedTasks)) {
                tasks = loadedTasks;
                renderTasks();
            } else {
                alert('Invalid file format. Please upload a valid tasks JSON.');
            }
        } catch (error) {
            alert('Error parsing JSON file.');
        }
    };
    reader.readAsText(file);
    
    // reset the input so we can load the same file again if we want
    event.target.value = '';
}

// main function to display the tasks on the screen
function renderTasks() {
    taskList.innerHTML = ''; // clear out the old list
    
    const searchQuery = searchInput.value.toLowerCase(); // for the search feature

    // filter tasks based on the active tab and the search box
    let filteredTasks = tasks.filter(task => {
        // hide tasks based on the pending/completed tabs
        if (currentFilter === 'pending' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;
        
        // hide tasks if they don't match the search text (my extra feature)
        if (searchQuery && !task.text.toLowerCase().includes(searchQuery)) return false;

        return true;
    });

    // build the html for each task
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        // add classes so we can style priority and completed status
        li.className = `priority-${task.priority} ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-info">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="priority-badge">${task.priority}</span>
                    ${task.dueDate ? ` | Due: ${task.dueDate}` : ''}
                    ${task.dueTime ? ` at ${task.dueTime}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <!-- toggle button -->
                <button class="btn-toggle" onclick="toggleComplete('${task.id}')">
                    ${task.completed ? 'Undo' : 'Done'}
                </button>
                <!-- delete button -->
                <button class="btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        
        taskList.appendChild(li);
    });
}

// wire up all the event listeners
addBtn.addEventListener('click', addTask);

// let users add a task by pressing enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// tab clicks
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        setFilter(e.target.dataset.filter);
    });
});

// listen for typing in the search box
searchInput.addEventListener('input', searchTasks);

// file save/load buttons
saveBtn.addEventListener('click', saveTasksToFile);
loadFile.addEventListener('change', loadTasksFromFile);

// show tasks when the page first loads
renderTasks();

// --- Dark/Light Mode Logic ---
// check if user previously chose dark mode
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️ Light Mode';
}

// listen for clicks on the theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // update button text and save preference
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    }
});
