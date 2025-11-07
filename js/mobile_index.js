// Function to handle switching to the iframe view (no changes needed)
function showIframe(url) {
    const taskContentContainer = document.querySelector('.task');
    const iframeContainer = document.querySelector('.frames');
    const mainFrame = document.getElementById('mainFrame');
    const mainMenu = document.getElementById('main-menu');

    if (taskContentContainer && iframeContainer && mainFrame && mainMenu) {
        taskContentContainer.style.display = 'none';
        iframeContainer.style.display = 'block';
        mainFrame.src = url;
        mainMenu.classList.add('hidden-menu');
    }
}

// Function to handle showing the Task Manager view (no changes needed)
function showTaskManager() {
    const taskContentContainer = document.querySelector('.task');
    const iframeContainer = document.querySelector('.frames');
    const mainFrame = document.getElementById('mainFrame');
    const mainMenu = document.getElementById('main-menu');

    if (taskContentContainer && iframeContainer && mainFrame && mainMenu) {
        iframeContainer.style.display = 'none';
        mainFrame.src = ''; 
        taskContentContainer.style.display = 'block';
        mainMenu.classList.add('hidden-menu');
        
        const taskFormContainer = document.querySelector('.task-content .hide');
        const taskListContainer = document.querySelector('.task-list-container');
        if (taskFormContainer && taskListContainer) {
            taskFormContainer.classList.add('is-hidden');
            taskListContainer.classList.remove('is-hidden');
        }
    }
}

// Function to handle the Task Form visibility logic (no changes needed)
function setupTaskFormToggle() {
    const showFormBtn = document.getElementById('show-form');
    const taskFormContainer = document.querySelector('.task-content .hide'); 
    const taskListContainer = document.querySelector('.task-list-container');
    const todoForm = document.getElementById('todo-form');
    
    // --- 1. Initial State: Hide the form container ---
    if (taskFormContainer) {
        taskFormContainer.classList.add('is-hidden'); 
    }

    // --- 2. Show/Hide when "Add Task" button is clicked (Toggles both form and list) ---
    if (showFormBtn && taskFormContainer && taskListContainer) {
        showFormBtn.addEventListener('click', () => {
            taskFormContainer.classList.toggle('is-hidden'); 
            taskListContainer.classList.toggle('is-hidden'); 
        });
    }

    // --- 3. Close form and show list if Cancel button is clicked ---
    const cancelButton = document.getElementById('cancel-task-btn');
    if (cancelButton && taskFormContainer && todoForm && taskListContainer) {
        cancelButton.addEventListener('click', () => {
            taskFormContainer.classList.add('is-hidden'); 
            taskListContainer.classList.remove('is-hidden'); 
            todoForm.reset();
        });
    }
}


// --- Main Application Fetch Chain (Streamlined for hardcoded Task HTML) ---

// Load shared header
fetch("../..//header/mobile_header.html")
.then(res => {
    if (!res.ok) throw new Error(`Header fetch failed: ${res.status}`);
    return res.text();
})
.then(data => {
    // 1. Insert the Header HTML (adds #menu-icon and #main-menu)
    document.getElementById("header").innerHTML = data;
    
    // --- Dependent Logic (Runs ONLY after the Header HTML is in the DOM) ---
    
    // 🔹 Update Department/Login Logic
    const department = localStorage.getItem("department");
    const name = localStorage.getItem("name");

    if (department && name) {
        const deptName = document.getElementById("dept-name");
        if (deptName) {
            const deptFormatted = department + " Department";
            deptName.textContent = `${deptFormatted} | ${name}`;
        }
    }

    // 🎯 Menu Toggle Logic
    const menuIcon = document.getElementById('menu-icon');
    const mainMenu = document.getElementById('main-menu');
    
    if (menuIcon && mainMenu) {
        menuIcon.addEventListener('click', () => {
            mainMenu.classList.toggle('hidden-menu');
        });
    }

    // 🟢 CRITICAL: Attach listeners to the Menu Links (using global form URLs)
    document.querySelectorAll('#main-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const linkText = link.textContent.trim();
            const href = link.getAttribute('href');

            // Define the Google Forms URLs based on your provided links
            const formUrls = {
                'Attendance': 'https://docs.google.com/forms/d/e/1FAIpQLSfXacHkUdWuQNvv1Pwcyx--NDFqFwjITTYL7672ZL6BG4-SgA/viewform?embedded=true',
                'Off / Absent': 'https://docs.google.com/forms/d/e/1FAIpQLSdgQKxcuAsomlhDX6yDsPI1s5O-x-u36-YPtHGGu-33QMMMCQ/viewform?embedded=true',
                'Cash Advance/Loan': 'https://docs.google.com/forms/d/e/1FAIpQLSfhw4VyYKI9fc05UGtkvpRx0kIo98QRTKQsH_3NTpZAdzxi4w/viewform?embedded=true'
            };
            
            if (linkText.includes('Attendance')) {
                showIframe(formUrls['Attendance']);
            } else if (linkText.includes('Off')) {
                showIframe(formUrls['Off / Absent']);
            } else if (linkText.includes('Cash Advance')) {
                showIframe(formUrls['Cash Advance/Loan']);
            } else if (linkText.includes('Task Manager')) {
                showTaskManager();
            } else {
                window.location.href = href;
            }
        });
    });
    
    // 🟢 Setup Task Form Toggle (Preserves functionality)
    if (typeof setupTaskFormToggle === 'function') {
        setupTaskFormToggle();
    }
    
    // 🟢 Load task data only after setting up the views
    // This is the CRITICAL line that retrieves your tasks.
    if (typeof fetchTasks === 'function') {
        fetchTasks();
    }
    
    // 🟢 INITIAL VIEW: Hide iframe and show Task Manager on load
    showTaskManager(); 

})

.catch(err => console.error("Error loading header component:", err.message));
