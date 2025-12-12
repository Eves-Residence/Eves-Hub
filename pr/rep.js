//// WORKING AS OF 12/12/2025
// ==========================================
// 1. IFRAME SWITCHER WITH LOADING SCREEN
// ==========================================
function changeFrame(type, element) {
    const iframe = document.getElementById("mainFrame");
    const loader = document.getElementById("loading-overlay");
    const sectionIframe = document.getElementById("section-iframe");
    const sectionCalendar = document.getElementById("section-calendar");
    const sectionTask = document.getElementById("section-task");

    // Hide all sections initially
    [sectionIframe, sectionCalendar, sectionTask].forEach(sec => {
        if (sec) sec.classList.add('hidden');
    });

    iframe.style.display = "none";
    iframe.style.opacity = 0;

    let newSrc = "";
    switch (type) {
        case "calendar":
            if (sectionCalendar) sectionCalendar.classList.remove('hidden');
            break;
        case "task":
            if (sectionTask) sectionTask.classList.remove('hidden');
            fetchTasks(); 
            break;
        case "master":
            newSrc = "https://docs.google.com/spreadsheets/d/15ouIKyyo1pfegl7oMxUgNgy_36JPb87Ta4JGxgws5HI/edit?usp=sharing";
            break;
        case "bnb":
            newSrc = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing";
            break;
        case "jo":
            newSrc = "https://eves-residence.github.io/JOB-ORDER";
            break;
        case "actSys":
            newSrc = "https://docs.google.com/spreadsheets/d/1czVE-Z4POL6xd5WdgCY47a0NikL9H3V3N7eK-jvQQUY/edit?usp=sharing";
            break;
            
        case "attendance":
            newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfXacHkUdWuQNvv1Pwcyx--NDFqFwjITTYL7672ZL6BG4-SgA/viewform?embedded=true";
            break;
        case "off":
            newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSdgQKxcuAsomlhDX6yDsPI1s5O-x-u36-YPtHGGu-33QMMMCQ/viewform?embedded=true";
            break;
        case "ca":
            newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfhw4VyYKI9fc05UGtkvpRx0kIo98QRTKQsH_3NTpZAdzxi4w/viewform?embedded=true";
            break;
        default:
            newSrc = "https://tephdy.github.io/WEB-APP/";
    }

    if (newSrc) {
        if (loader) loader.style.display = "flex"; // Show Blur Spinner
        if (sectionIframe) sectionIframe.classList.remove('hidden');
        iframe.style.display = "block";
        
        iframe.src = newSrc;
        iframe.onload = () => {
            if (loader) loader.style.display = "none"; // Hide Spinner
            iframe.style.transition = "opacity 0.4s ease";
            iframe.style.opacity = 1;
        };
    }

    // Update Sidebar Active Class
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    if (element) element.classList.add('active');
}

// ==========================================
// 2. TASK MANAGER CORE LOGIC
// ==========================================
const scriptURL = "https://script.google.com/macros/s/AKfycbyK_kQUGwRuhvTfxvsjVrcyoBSZ8lbFPA0tXVmY9lttde7glR71Wv7SDXf6DiSV871i8w/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;

// ✅ CREATE DYNAMIC FILTER HEADER
const filterContainer = document.createElement("div");
filterContainer.className = "filter-container";
filterContainer.style.cssText = "background:#fff; padding:15px; border-radius:12px; margin-bottom:20px; box-shadow:0 2px 10px rgba(0,0,0,0.05); border:1px solid #eee;";
filterContainer.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0f2f5; padding-bottom:10px; margin-bottom:15px;">
    <p style="margin:0; font-weight:700; font-size:16px; color:#1a202c;">Filter & Sort Tasks</p>
    <div style="display:flex; gap:10px;">
      <button id="applyFilter" style="background:#3182ce; color:white; border:none; padding:6px 15px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">Apply</button>
      <button id="clearFilter" style="background:#edf2f7; color:#4a5568; border:none; padding:6px 15px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">Clear</button>
    </div>
  </div>
  <div style="display:flex; flex-wrap:wrap; gap:15px;">
    <select id="statusFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:140px;">
        <option value="All">All Status</option>
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
    </select>
    <select id="priorityFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:140px;">
        <option value="All">All Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
    </select>
    <select id="assignedByFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:160px;">
        <option value="All">All Departments</option>
    </select>
  </div>
`;
taskList.parentNode.insertBefore(filterContainer, taskList);

// Filter Button Actions
document.getElementById("applyFilter").onclick = () => renderTasks();
document.getElementById("clearFilter").onclick = () => {
    document.getElementById("statusFilter").value = "All";
    document.getElementById("priorityFilter").value = "All";
    document.getElementById("assignedByFilter").value = "All";
    renderTasks();
};

// Modal UI Injection
const modalHTML = `
  <div id="modalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:450px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
      <h3 style="margin-top:0;">Edit Task Info</h3>
      <label style="font-size:12px; font-weight:bold; color:#666;">Status</label>
      <select id="editStatus" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ddd;">
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      <label style="font-size:12px; font-weight:bold; color:#666;">Update Details/Remarks</label>
      <textarea id="addRemarks" style="width:100%; padding:10px; height:100px; resize:none; border:1px solid #ddd; border-radius:5px;"></textarea>
      <div id="loadingIndicator" style="display:none; text-align:center; margin-top:10px;">⏳ Saving Changes...</div>
      <div style="text-align:right; margin-top:20px;">
        <button id="saveEditBtn" style="padding:8px 16px; background:#4CAF50; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Save</button>
        <button id="cancelEditBtn" style="padding:8px 16px; background:#ccc; border:none; border-radius:5px; margin-left:10px; cursor:pointer;">Cancel</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalHTML);

const safe = s => s ? String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : "";

// Fetch Tasks from Google Sheets
async function fetchTasks() {
    if (allTasks.length === 0) taskList.innerHTML = "<p style='padding:20px; color:#666;'>Loading tasks...</p>";
    try {
        const res = await fetch(scriptURL);
        const text = await res.text();
        const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
        const newTasks = JSON.parse(jsonMatch[0]);

        if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
            allTasks = newTasks;
            
            // Auto-populate Departments in Filter
            const deptFilter = document.getElementById("assignedByFilter");
            const currentDept = deptFilter.value;
            const uniqueDepts = [...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v))];
            deptFilter.innerHTML = `<option value="All">All Departments</option>` + 
                uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join("");
            deptFilter.value = [...deptFilter.options].some(o => o.value === currentDept) ? currentDept : "All";
            
            renderTasks();
        }
    } catch (err) { console.error("Data fetch error:", err); }
}

// Render Tasks (Horizontal Kanban Cards)
function renderTasks() {
    const sF = document.getElementById("statusFilter").value;
    const pF = document.getElementById("priorityFilter").value;
    const aF = document.getElementById("assignedByFilter").value;

    taskList.innerHTML = "";
    // Apply layout styles to the list container
    taskList.style.cssText = "display:flex !important; flex-direction:row !important; overflow-x:auto !important; gap:20px !important; padding:10px !important; align-items:flex-start !important;";

    const filtered = allTasks.filter(t => {
        return (sF === "All" || (t["STATUS"] || "Not Started") === sF) &&
               (pF === "All" || (t["PRIORITY"] || "") === pF) &&
               (aF === "All" || (t["ASSIGNED BY"] || "") === aF);
    });

    if (filtered.length === 0) {
        taskList.innerHTML = "<p style='padding:20px; color:#999;'>No tasks found for current filter.</p>";
        return;
    }

    filtered.forEach((t) => {
        const originalIndex = allTasks.indexOf(t);
        const status = (t["STATUS"] || "Not Started").trim();
        let color = status === "Completed" ? "#4CAF50" : (status === "In Progress" ? "#FFC107" : "#F44336");

        // Permission: Property Rep can edit their own entries
        const assignedByValue = String(t["ASSIGNED BY"] || "").trim().toLowerCase();
        const canEdit = ["property representative", "property rep", "pr"].includes(assignedByValue);

        const div = document.createElement("div");
        div.style.cssText = `background:#fff; border-radius:12px; border-left:8px solid ${color}; width:300px; height:340px; flex-shrink:0; display:flex; flex-direction:column; box-shadow:0 4px 15px rgba(0,0,0,0.06); white-space:normal; transition: transform 0.2s;`;

        div.innerHTML = `
          <div style="padding:18px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:10px;">
            <div style="font-weight:700; font-size:15px; color:#2d3748;">${safe(t["TASK NAME"])}</div>
            <div style="background:${color}; color:#fff; padding:3px 12px; border-radius:20px; font-size:10px; font-weight:bold; width:fit-content; text-transform:uppercase;">${status}</div>
            <div style="flex:1; overflow-y:auto; font-size:13px; background:#f7fafc; padding:12px; border-radius:8px; line-height:1.5; color:#4a5568; border:1px solid #edf2f7;">
               ${safe(t["NOTES"] || "No additional details provided.")}
            </div>
            <div style="font-size:11px; color:#718096; font-style:italic;">
                <b>By:</b> ${safe(t["ASSIGNED BY"])} ⮕ <b>To:</b> ${safe(t["ASSIGNED TO"])}
            </div>
          </div>
          <div style="padding:12px 18px; border-top:1px solid #edf2f7; display:flex; justify-content:space-between; align-items:center; background:#fdfdfd; border-radius: 0 0 12px 0;">
             <span style="font-size:10px; color:#a0aec0; font-weight:600;">🕒 ${safe(t["TIMESTAMP"])}</span>
             <div style="display:flex; gap:8px;">
                ${canEdit ? `
                  <button onclick="openEditModal(${originalIndex})" style="padding:5px 10px; font-size:11px; background:#3182ce; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:700;">Edit</button>
                  <button onclick="deleteTask(${originalIndex})" style="padding:5px 10px; font-size:11px; background:#e53e3e; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:700;">Del</button>
                ` : `
                  <button style="padding:5px 10px; font-size:11px; background:#cbd5e0; color:#4a5568; border:none; border-radius:5px; cursor:not-allowed; font-weight:700;">Locked</button>
                `}
             </div>
          </div>
        `;
        taskList.appendChild(div);
    });
}

// Open Edit Modal
function openEditModal(index) {
    editIndex = index;
    document.getElementById("editStatus").value = allTasks[index]["STATUS"] || "Not Started";
    document.getElementById("addRemarks").value = allTasks[index]["NOTES"] || "";
    document.getElementById("modalOverlay").style.display = "flex";
}

// Close Modal
document.getElementById("cancelEditBtn").onclick = () => {
    document.getElementById("modalOverlay").style.display = "none";
};

// Save Task Edit
document.getElementById("saveEditBtn").onclick = async () => {
    const status = document.getElementById("editStatus").value;
    const notes = document.getElementById("addRemarks").value.trim();
    const indicator = document.getElementById("loadingIndicator");
    
    indicator.style.display = "block";
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ 
                action: "update", 
                rowIndex: allTasks[editIndex].rowIndex, 
                status, 
                notes 
            })
        });
        document.getElementById("modalOverlay").style.display = "none";
        fetchTasks();
    } catch (e) { alert("Server error. Please try again."); }
    indicator.style.display = "none";
};

// Delete Task
async function deleteTask(index) {
    if (!confirm("Are you sure you want to permanently delete this task?")) return;
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ 
                action: "delete", 
                rowIndex: allTasks[index].rowIndex 
            })
        });
        fetchTasks();
    } catch (e) { alert("Deletion failed. Check connection."); }
}

// Form Submission (Add New Task)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    responseMsg.textContent = "⏳ Saving to cloud...";
    const task = {
        action: "add",
        taskName: document.getElementById("taskName").value.trim(),
        priority: document.getElementById("priority").value,
        assignedBy: document.getElementById("assignedBy").value.trim(),
        assignTo: document.getElementById("assignTo").value,
        dueDate: document.getElementById("dueDate").value,
        notes: document.getElementById("notes").value.trim(),
    };
    try {
        await fetch(scriptURL, { method: "POST", body: JSON.stringify(task) });
        responseMsg.textContent = "✅ Task successfully saved!";
        form.reset();
        setTimeout(() => { responseMsg.textContent = ""; }, 3000);
        setTimeout(fetchTasks, 800);
    } catch (e) { responseMsg.textContent = "❌ Error occurred."; }
});

// Initialization
window.addEventListener("load", fetchTasks);
setInterval(fetchTasks, 60000); // Auto-refresh every 60 seconds
