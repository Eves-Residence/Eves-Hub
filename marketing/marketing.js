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

    [sectionIframe, sectionCalendar, sectionTask].forEach(sec => {
        if (sec) sec.classList.add('hidden');
    });

    iframe.style.display = "none";
    iframe.style.opacity = 0;

    let newSrc = "";
    switch (type) {
        case "calendar": if (sectionCalendar) sectionCalendar.classList.remove('hidden'); break;

        case "task": if (sectionTask) sectionTask.classList.remove('hidden'); fetchTasks(); break;

        case "master": newSrc = "https://docs.google.com/spreadsheets/d/15ouIKyyo1pfegl7oMxUgNgy_36JPb87Ta4JGxgws5HI/edit?usp=sharing"; break;

        case "search": newSrc = "https://tephdy.github.io/WEB-APP/"; break;

        case "waitlist": newSrc = "https://docs.google.com/spreadsheets/d/1S2v43l75aC6EpyCkXNifSfFYvuXE_XJ9HPcr0RDyhtg/edit?usp=sharing"; break;

        case "bnb": newSrc = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing"; break;

        case "bnb_dates": newSrc = "https://calendar.google.com/calendar/embed?src=00c9b4f66e0573f992bb911bb11ddc608ccb021f2be44fa6cfdc633de1463f82%40group.calendar.google.com&ctz=Asia%2FManila"; break;

        case "vacancy": newSrc = "https://docs.google.com/spreadsheets/d/1Z_3YqO4ve0TvbkV4Lrg6X9utii7EswQiwnczFcAKvsI/edit?usp=sharing"; break;

        case "attendance": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfXacHkUdWuQNvv1Pwcyx--NDFqFwjITTYL7672ZL6BG4-SgA/viewform?embedded=true"; break;

        case "off": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSdgQKxcuAsomlhDX6yDsPI1s5O-x-u36-YPtHGGu-33QMMMCQ/viewform?embedded=true"; break;

        case "ca": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfhw4VyYKI9fc05UGtkvpRx0kIo98QRTKQsH_3NTpZAdzxi4w/viewform?embedded=true"; break;

        default: newSrc = "https://tephdy.github.io/WEB-APP/";
    }

    if (newSrc) {
        if (loader) loader.style.display = "flex";
        if (sectionIframe) sectionIframe.classList.remove('hidden');
        iframe.style.display = "block";
        iframe.src = newSrc;
        iframe.onload = () => {
            if (loader) loader.style.display = "none";
            iframe.style.transition = "opacity 0.4s ease";
            iframe.style.opacity = 1;
        };
    }
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    if (element) element.classList.add('active');
}

// ==========================================
// 2. TASK MANAGER CORE LOGIC
// ==========================================
const scriptURL = "https://script.google.com/macros/s/AKfycbw9xkKWD-C6xrupiZePXpQFYb8DKFk4wyxX-rU9wMK145h08VyI4l0hQHSB24a3tyw4pQ/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;

// ✅ INJECT MODERN FILTER HEADER
const filterContainer = document.createElement("div");
filterContainer.className = "filter-container";
filterContainer.style.cssText = "background:#fff; padding:15px; border-radius:12px; margin-bottom:20px; box-shadow:0 2px 10px rgba(0,0,0,0.05); border:1px solid #eee;";
filterContainer.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f0f2f5; padding-bottom:10px; margin-bottom:15px;">
    <p style="margin:0; font-weight:700; font-size:18px; color:#1a202c;">📋 All Task Manager</p>
    <div style="display:flex; gap:10px;">
      <button id="applyFilter" style="background:#3182ce; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:600;">Apply</button>
      <button id="clearFilter" style="background:#edf2f7; color:#4a5568; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:600;">Clear</button>
    </div>
  </div>
  <div style="display:flex; flex-wrap:wrap; gap:15px;">
    <div style="display:flex; flex-direction:column; gap:4px;">
      <label style="font-size:11px; font-weight:700; color:#718096; text-transform:uppercase;">Status</label>
      <select id="statusFilter" style="padding:6px; border-radius:6px; border:1px solid #cbd5e0; min-width:130px;">
        <option value="All">All Statuses</option>
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
    </div>
    <div style="display:flex; flex-direction:column; gap:4px;">
      <label style="font-size:11px; font-weight:700; color:#718096; text-transform:uppercase;">Priority</label>
      <select id="priorityFilter" style="padding:6px; border-radius:6px; border:1px solid #cbd5e0; min-width:130px;">
        <option value="All">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
    <div style="display:flex; flex-direction:column; gap:4px;">
      <label style="font-size:11px; font-weight:700; color:#718096; text-transform:uppercase;">Assigned By</label>
      <select id="assignedByFilter" style="padding:6px; border-radius:6px; border:1px solid #cbd5e0; min-width:150px;">
        <option value="All">All Departments</option>
      </select>
    </div>
  </div>
`;
taskList.parentNode.insertBefore(filterContainer, taskList);

// Filter Event Listeners
document.getElementById("applyFilter").onclick = () => renderTasks();
document.getElementById("clearFilter").onclick = () => {
    document.getElementById("statusFilter").value = "All";
    document.getElementById("priorityFilter").value = "All";
    document.getElementById("assignedByFilter").value = "All";
    renderTasks();
};

// Modal Injection (Edit, Reply, View)
const modalHTML = `
  <div id="modalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:450px;">
      <h3>Edit Status</h3>
      <select id="editStatus" style="width:100%; padding:8px; margin-bottom:10px;"><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select>
      <textarea id="addRemarks" style="width:100%; padding:8px; height:80px; resize:none; border:1px solid #ddd;"></textarea>
      <div id="loadingIndicator" style="display:none; text-align:center;">⏳ Saving...</div>
      <div style="text-align:right; margin-top:15px;"><button id="saveEditBtn" style="padding:6px 12px; background:#4CAF50; color:#fff; border:none; border-radius:5px;">Save</button><button id="cancelEditBtn" style="padding:6px 12px; background:#ccc; border:none; border-radius:5px; margin-left:10px;">Cancel</button></div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalHTML);

// Fetch Tasks (Flicker-Free)
async function fetchTasks() {
    if (allTasks.length === 0) taskList.innerHTML = "<p>Loading tasks...</p>";
    try {
        const res = await fetch(scriptURL);
        const text = await res.text();
        const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
        const newTasks = JSON.parse(jsonMatch[0]);

        if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
            allTasks = newTasks;
            
            // Dynamic Assigned By List Update
            const filterSelect = document.getElementById("assignedByFilter");
            const currentVal = filterSelect.value;
            const uniqueDepts = [...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v))];
            filterSelect.innerHTML = `<option value="All">All Departments</option>` + uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join("");
            filterSelect.value = [...filterSelect.options].some(o => o.value === currentVal) ? currentVal : "All";

            renderTasks();
        }
    } catch (err) { console.error("Refresh failed:", err); }
}

const safe = s => s ? String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : "";

// Render Tasks (Fixed with Filtering Logic)
function renderTasks() {
    const sFilter = document.getElementById("statusFilter").value;
    const pFilter = document.getElementById("priorityFilter").value;
    const aFilter = document.getElementById("assignedByFilter").value;

    let filtered = allTasks.filter(t => {
        return (sFilter === "All" || (t["STATUS"] || "Not Started") === sFilter) &&
               (pFilter === "All" || (t["PRIORITY"] || "").trim() === pFilter) &&
               (aFilter === "All" || (t["ASSIGNED BY"] || "").trim() === aFilter);
    });

    taskList.innerHTML = "";
    taskList.style.cssText = "display:flex !important; flex-direction:row !important; overflow-x:auto !important; gap:20px !important; padding:10px !important; align-items:center !important;";

    if (filtered.length === 0) {
        taskList.innerHTML = "<p style='padding:20px; color:#666;'>No tasks match your filters.</p>";
        return;
    }

    filtered.forEach((t) => {
        const originalIndex = allTasks.indexOf(t);
        const status = (t["STATUS"] || "Not Started").trim();
        let color = status === "Completed" ? "#4CAF50" : (status === "In Progress" ? "#FFC107" : "#F44336");
        const canEdit = String(t["ASSIGNED BY"] || "").trim().toLowerCase() === "secretary";

        const div = document.createElement("div");
        div.style.cssText = `background:#fff; border-radius:10px; border-left:8px solid ${color}; width:300px; height:320px; flex-shrink:0; display:flex; flex-direction:column; box-shadow:0 4px 10px rgba(0,0,0,0.05); white-space:normal;`;

        div.innerHTML = `
          <div style="padding:15px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:8px;">
            <div style="font-weight:bold; font-size:15px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${safe(t["TASK NAME"])}</div>
            <div style="background:${color}; color:#fff; padding:2px 10px; border-radius:20px; font-size:10px; width:fit-content;">${status}</div>
            <div style="flex:1; overflow-y:auto; font-size:13px; background:#fff9e6; padding:10px; border-radius:6px; line-height:1.4;">
                🗒 ${safe(t["NOTES"] || "-")}
            </div>
          </div>
          <div style="padding:10px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
             <span style="font-size:10px; color:#aaa;">🕒 ${safe(t["TIMESTAMP"])}</span>
             <div style="display:flex; gap:5px;">
                ${canEdit ? `
                  <button onclick="openEditModal(${originalIndex})" style="padding:4px 8px; font-size:11px; background:#007bff; color:#fff; border:none; border-radius:4px; cursor:pointer;">Edit</button>
                  <button onclick="deleteTask(${originalIndex})" style="padding:4px 8px; font-size:11px; background:#dc3545; color:#fff; border:none; border-radius:4px; cursor:pointer;">Del</button>
                ` : `
                  <button style="padding:4px 8px; font-size:11px; background:#6c757d; color:#fff; border:none; border-radius:4px; cursor:not-allowed;">View Only</button>
                `}
             </div>
          </div>
        `;
        taskList.appendChild(div);
    });
}

// ... Keep existing saveEditBtn.onclick, deleteTask, and form.addEventListener ...

document.getElementById("cancelEditBtn").onclick = () => document.getElementById("modalOverlay").style.display = "none";

document.getElementById("saveEditBtn").onclick = async () => {
    const status = document.getElementById("editStatus").value;
    const notes = document.getElementById("addRemarks").value.trim();
    document.getElementById("loadingIndicator").style.display = "block";
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "update", rowIndex: allTasks[editIndex].rowIndex, status, notes })
        });
        document.getElementById("modalOverlay").style.display = "none";
        fetchTasks();
    } catch (e) { alert("Error updating"); }
    document.getElementById("loadingIndicator").style.display = "none";
};

async function deleteTask(index) {
    if (!confirm("Delete?")) return;
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", rowIndex: allTasks[index].rowIndex })
        });
        fetchTasks();
    } catch (e) { alert("Error deleting"); }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    responseMsg.textContent = "⏳ Saving...";
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
        responseMsg.textContent = "✅ Saved!";
        form.reset();
        setTimeout(fetchTasks, 800);
    } catch (e) { responseMsg.textContent = "❌ Error"; }
});

window.addEventListener("load", fetchTasks);
setInterval(fetchTasks, 60000);
