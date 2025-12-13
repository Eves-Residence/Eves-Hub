//// WORKING AS OF 12/13/2025
// ==========================================
// 1. SINGLE-FUNCTION IFRAME CONTROLLER
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
        case "bnb": newSrc = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing"; break;
        case "bnb_dates": newSrc = "https://calendar.google.com/calendar/embed?src=00c9b4f66e0573f992bb911bb11ddc608ccb021f2be44fa6cfdc633de1463f82%40group.calendar.google.com&ctz=Asia%2FManila"; break;
        case "attendance": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfXacHkUdWuQNvv1Pwcyx--NDFqFwjITTYL7672ZL6BG4-SgA/viewform?embedded=true"; break;
        case "off": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSdgQKxcuAsomlhDX6yDsPI1s5O-x-u36-YPtHGGu-33QMMMCQ/viewform?embedded=true"; break;
        case "ca": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfhw4VyYKI9fc05UGtkvpRx0kIo98QRTKQsH_3NTpZAdzxi4w/viewform?embedded=true"; break;
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
// 2. ACCOUNTING TASK MANAGER CORE LOGIC
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
    <p style="margin:0; font-weight:700; font-size:16px; color:#1a202c;">Filter Options</p>
    <div style="display:flex; gap:12px;">
      <button id="applyFilter" style="background:#3182ce; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:700; min-width:100px;">Apply</button>
      <button id="clearFilter" style="background:#edf2f7; color:#4a5568; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:700; min-width:100px;">Clear</button>
    </div>
  </div>
  <div style="display:flex; flex-wrap:wrap; gap:15px;">
    <select id="statusFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:140px;">
        <option value="All">All Status</option><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
    </select>
    <select id="priorityFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:140px;">
        <option value="All">All Priority</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
    </select>
    <select id="assignedByFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:160px;">
        <option value="All">All Departments</option>
    </select>
  </div>
`;
taskList.parentNode.insertBefore(filterContainer, taskList);

document.getElementById("applyFilter").onclick = () => renderTasks();
document.getElementById("clearFilter").onclick = () => {
    document.getElementById("statusFilter").value = "All";
    document.getElementById("priorityFilter").value = "All";
    document.getElementById("assignedByFilter").value = "All";
    renderTasks();
};

const safe = s => s ? String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : "";

async function fetchTasks() {
    if (allTasks.length === 0) taskList.innerHTML = "<p style='padding:20px; color:#666;'>Loading tasks...</p>";
    try {
        const res = await fetch(scriptURL);
        const text = await res.text();
        const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
        const newTasks = JSON.parse(jsonMatch[0]);
        if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
            allTasks = newTasks;
            const deptFilter = document.getElementById("assignedByFilter");
            const currentVal = deptFilter.value;
            const uniqueDepts = [...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v))];
            deptFilter.innerHTML = `<option value="All">All Departments</option>` + uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join("");
            deptFilter.value = [...deptFilter.options].some(o => o.value === currentVal) ? currentVal : "All";
            renderTasks();
        }
    } catch (err) { console.error("Sync Error:", err); }
}

function renderTasks() {
    const sF = document.getElementById("statusFilter").value;
    const pF = document.getElementById("priorityFilter").value;
    const aF = document.getElementById("assignedByFilter").value;

    taskList.innerHTML = "";
    taskList.style.cssText = "display:flex !important; flex-direction:row !important; overflow-x:auto !important; gap:20px !important; padding:10px !important; align-items:flex-start !important;";

    const filtered = allTasks.filter(t => {
        return (sF === "All" || (t["STATUS"] || "Not Started") === sF) &&
               (pF === "All" || (t["PRIORITY"] || "") === pF) &&
               (aF === "All" || (t["ASSIGNED BY"] || "") === aF);
    });

    filtered.forEach((t) => {
        const originalIndex = allTasks.indexOf(t);
        const status = (t["STATUS"] || "Not Started").trim();
        let color = status === "Completed" ? "#4CAF50" : (status === "In Progress" ? "#FFC107" : "#F44336");
        const sourceDept = String(t.source || "").trim().toLowerCase();
        const targetDept = String(t["ASSIGNED TO"] || "").trim().toLowerCase();
        const canEdit = sourceDept === "property representative" || "pr";

        const div = document.createElement("div");
        div.style.cssText = `background:#fff; border-radius:12px; border-left:8px solid ${color}; width:300px; height:340px; flex-shrink:0; display:flex; flex-direction:column; box-shadow:0 4px 15px rgba(0,0,0,0.06); white-space:normal;`;

        div.innerHTML = `
          <div style="padding:18px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:10px;">
            <div style="font-weight:700; font-size:15px; color:#2d3748;">${safe(t["TASK NAME"])}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="background:${color}; color:#fff; padding:3px 12px; border-radius:20px; font-size:10px; font-weight:bold; text-transform:uppercase;">${status}</div>
                <div style="font-size:11px; color:black; font-weight:600;">📅 ${safe(t["DUE DATE"])}</div>
            </div>
            <div style="flex:1; overflow-y:auto; font-size:13px; background:#f7fafc; padding:12px; border-radius:8px; line-height:1.5; color:#4a5568;">
               ${safe(t["NOTES"] || "-")}
            </div>
          </div>
          <div style="padding:15px 18px; border-top:1px     solid #edf2f7; display:flex;    flex-direction:column; gap:10px; background:#fafafa; border-radius: 0 0 12px 0;">
             <span style="font-size:10px; color:#a0aec0; font-weight:600;">🕒 ${safe(t["TIMESTAMP"])}</span>
             <div style="display:flex; gap:8px;">
                <button onclick="openViewModal(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#edf2f7; color:#4a5568; border:none; border-radius:6px; cursor:pointer; font-weight:700;">View</button>
                ${canEdit ? `
                  <button onclick="openEditModal(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#3182ce; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:700;">Edit</button>
                  <button onclick="deleteTask(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#e53e3e; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:700;">Del</button>
                ` : `
                  <button style="flex:2; padding:10px; font-size:12px; background:#cbd5e0; color:#4a5568; border:none; border-radius:6px; cursor:not-allowed; font-weight:700;">Locked (Read-Only)</button>
                `}
             </div>
          </div>
        `;
        taskList.appendChild(div);
    });
}

// ✅ MODAL INJECTION
const modalsHTML = `
  <div id="modalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:450px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
      <h3 style="margin-top:0;">Update Accounting Task</h3>
      <select id="editStatus" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ddd;">
        <option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
      </select>
      <textarea id="addRemarks" style="width:100%; padding:10px; height:100px; resize:none; border:1px solid #ddd; border-radius:5px;" placeholder="Remarks..."></textarea>
      <div id="loadingIndicator" style="display:none; text-align:center; margin-top:10px;">⏳ Syncing...</div>
      <div style="text-align:right; margin-top:20px;">
        <button id="saveEditBtn" style="padding:8px 16px; background:#4CAF50; color:#fff; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">Save</button>
        <button onclick="closeModal('modalOverlay')" style="padding:8px 16px; background:#ccc; color:#333; border:none; border-radius:5px; margin-left:10px; cursor:pointer;">Cancel</button>
      </div>
    </div>
  </div>

  <div id="viewModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:25px; border-radius:15px; width:90%; max-width:500px; max-height:80vh; overflow-y:auto;">
      <h2 id="viewTaskName" style="margin-top:0; color:#2d3748;"></h2>
      <div style="display:flex; gap:10px; margin-bottom:15px;" id="viewBadges"></div>
      <div style="background:#f7fafc; padding:15px; border-radius:10px; border:1px solid #edf2f7; color:#4a5568; line-height:1.6; white-space:pre-wrap;" id="viewNotes"></div>
      <div style="margin-top:20px; font-size:12px; color:#a0aec0;" id="viewDetails"></div>
      <div style="text-align:right; margin-top:25px;">
        <button onclick="closeModal('viewModalOverlay')" style="padding:10px 20px; background:#3182ce; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Close</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalsHTML);

function openViewModal(index) {
    const t = allTasks[index];
    document.getElementById("viewTaskName").textContent = t["TASK NAME"];
    document.getElementById("viewNotes").textContent = t["NOTES"] || "No additional notes.";
    document.getElementById("viewBadges").innerHTML = `
        <span style="background:#edf2f7; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold;">${t["PRIORITY"]} Priority</span>
        <span style="background:#ebf8ff; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; color:#3182ce;">${t["STATUS"]}</span>
    `;
    document.getElementById("viewDetails").innerHTML = `
        <b style="color:black;">From: ${t["ASSIGNED BY"]}</b> <br>
        <b style="color:black;">To: ${t["ASSIGNED TO"]}</b><br>
        <b style="color:black;">Due Date: ${t["DUE DATE"]}</b> <br>
        <b style="color:black;">Created: ${t["TIMESTAMP"]}</b> 
    `;
    document.getElementById("viewModalOverlay").style.display = "flex";
}

function openEditModal(index) {
    editIndex = index;
    document.getElementById("editStatus").value = allTasks[index]["STATUS"] || "Not Started";
    document.getElementById("addRemarks").value = allTasks[index]["NOTES"] || "";
    document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

document.getElementById("saveEditBtn").onclick = async () => {
    const status = document.getElementById("editStatus").value;
    const notes = document.getElementById("addRemarks").value.trim();
    document.getElementById("loadingIndicator").style.display = "block";
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "update", rowIndex: allTasks[editIndex].rowIndex, status, notes, source: allTasks[editIndex].source })
        });
        closeModal('modalOverlay');
        fetchTasks();
    } catch (e) { alert("Update failed."); }
    document.getElementById("loadingIndicator").style.display = "none";
};

async function deleteTask(index) {
    if (!confirm("Delete task?")) return;
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", rowIndex: allTasks[index].rowIndex, source: allTasks[index].source })
        });
        fetchTasks();
    } catch (e) { alert("Deletion failed."); }
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
setInterval(fetchTasks, 30000);//// WORKING AS OF 12/13/2025
// ==========================================
// 1. SINGLE-FUNCTION IFRAME CONTROLLER
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
        case "bnb": newSrc = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing"; break;
        case "bnb_dates": newSrc = "https://calendar.google.com/calendar/embed?src=00c9b4f66e0573f992bb911bb11ddc608ccb021f2be44fa6cfdc633de1463f82%40group.calendar.google.com&ctz=Asia%2FManila"; break;
        case "attendance": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfXacHkUdWuQNvv1Pwcyx--NDFqFwjITTYL7672ZL6BG4-SgA/viewform?embedded=true"; break;
        case "off": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSdgQKxcuAsomlhDX6yDsPI1s5O-x-u36-YPtHGGu-33QMMMCQ/viewform?embedded=true"; break;
        case "ca": newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfhw4VyYKI9fc05UGtkvpRx0kIo98QRTKQsH_3NTpZAdzxi4w/viewform?embedded=true"; break;
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
// 2. ACCOUNTING TASK MANAGER CORE LOGIC
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
    <p style="margin:0; font-weight:700; font-size:16px; color:#1a202c;">Filter Options</p>
    <div style="display:flex; gap:12px;">
      <button id="applyFilter" style="background:#3182ce; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:700; min-width:100px;">Apply</button>
      <button id="clearFilter" style="background:#edf2f7; color:#4a5568; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:700; min-width:100px;">Clear</button>
    </div>
  </div>
  <div style="display:flex; flex-wrap:wrap; gap:15px;">
    <select id="statusFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:140px;">
        <option value="All">All Status</option><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
    </select>
    <select id="priorityFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:140px;">
        <option value="All">All Priority</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
    </select>
    <select id="assignedByFilter" style="padding:8px; border-radius:6px; border:1px solid #cbd5e0; font-size:13px; min-width:160px;">
        <option value="All">All Departments</option>
    </select>
  </div>
`;
taskList.parentNode.insertBefore(filterContainer, taskList);

document.getElementById("applyFilter").onclick = () => renderTasks();
document.getElementById("clearFilter").onclick = () => {
    document.getElementById("statusFilter").value = "All";
    document.getElementById("priorityFilter").value = "All";
    document.getElementById("assignedByFilter").value = "All";
    renderTasks();
};

const safe = s => s ? String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : "";

async function fetchTasks() {
    if (allTasks.length === 0) taskList.innerHTML = "<p style='padding:20px; color:#666;'>Loading tasks...</p>";
    try {
        const res = await fetch(scriptURL);
        const text = await res.text();
        const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
        const newTasks = JSON.parse(jsonMatch[0]);
        if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
            allTasks = newTasks;
            const deptFilter = document.getElementById("assignedByFilter");
            const currentVal = deptFilter.value;
            const uniqueDepts = [...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v))];
            deptFilter.innerHTML = `<option value="All">All Departments</option>` + uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join("");
            deptFilter.value = [...deptFilter.options].some(o => o.value === currentVal) ? currentVal : "All";
            renderTasks();
        }
    } catch (err) { console.error("Sync Error:", err); }
}

function renderTasks() {
    const sF = document.getElementById("statusFilter").value;
    const pF = document.getElementById("priorityFilter").value;
    const aF = document.getElementById("assignedByFilter").value;

    taskList.innerHTML = "";
    taskList.style.cssText = "display:flex !important; flex-direction:row !important; overflow-x:auto !important; gap:20px !important; padding:10px !important; align-items:flex-start !important;";

    const filtered = allTasks.filter(t => {
        return (sF === "All" || (t["STATUS"] || "Not Started") === sF) &&
               (pF === "All" || (t["PRIORITY"] || "") === pF) &&
               (aF === "All" || (t["ASSIGNED BY"] || "") === aF);
    });

    filtered.forEach((t) => {
        const originalIndex = allTasks.indexOf(t);
        const status = (t["STATUS"] || "Not Started").trim();
        let color = status === "Completed" ? "#4CAF50" : (status === "In Progress" ? "#FFC107" : "#F44336");
        const sourceDept = String(t.source || "").trim().toLowerCase();
        const targetDept = String(t["ASSIGNED TO"] || "").trim().toLowerCase();
        const canEdit = sourceDept === "property representative" || "pr";

        const div = document.createElement("div");
        div.style.cssText = `background:#fff; border-radius:12px; border-left:8px solid ${color}; width:300px; height:340px; flex-shrink:0; display:flex; flex-direction:column; box-shadow:0 4px 15px rgba(0,0,0,0.06); white-space:normal;`;

        div.innerHTML = `
          <div style="padding:18px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:10px;">
            <div style="font-weight:700; font-size:15px; color:#2d3748;">${safe(t["TASK NAME"])}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="background:${color}; color:#fff; padding:3px 12px; border-radius:20px; font-size:10px; font-weight:bold; text-transform:uppercase;">${status}</div>
                <div style="font-size:11px; color:black; font-weight:600;">📅 ${safe(t["DUE DATE"])}</div>
            </div>
            <div style="flex:1; overflow-y:auto; font-size:13px; background:#f7fafc; padding:12px; border-radius:8px; line-height:1.5; color:#4a5568;">
               ${safe(t["NOTES"] || "-")}
            </div>
          </div>
          <div style="padding:15px 18px; border-top:1px     solid #edf2f7; display:flex;    flex-direction:column; gap:10px; background:#fafafa; border-radius: 0 0 12px 0;">
             <span style="font-size:10px; color:#a0aec0; font-weight:600;">🕒 ${safe(t["TIMESTAMP"])}</span>
             <div style="display:flex; gap:8px;">
                <button onclick="openViewModal(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#edf2f7; color:#4a5568; border:none; border-radius:6px; cursor:pointer; font-weight:700;">View</button>
                ${canEdit ? `
                  <button onclick="openEditModal(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#3182ce; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:700;">Edit</button>
                  <button onclick="deleteTask(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#e53e3e; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:700;">Del</button>
                ` : `
                  <button style="flex:2; padding:10px; font-size:12px; background:#cbd5e0; color:#4a5568; border:none; border-radius:6px; cursor:not-allowed; font-weight:700;">Locked (Read-Only)</button>
                `}
             </div>
          </div>
        `;
        taskList.appendChild(div);
    });
}

// ✅ MODAL INJECTION
const modalsHTML = `
  <div id="modalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:450px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
      <h3 style="margin-top:0;">Update Accounting Task</h3>
      <select id="editStatus" style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px; border:1px solid #ddd;">
        <option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
      </select>
      <textarea id="addRemarks" style="width:100%; padding:10px; height:100px; resize:none; border:1px solid #ddd; border-radius:5px;" placeholder="Remarks..."></textarea>
      <div id="loadingIndicator" style="display:none; text-align:center; margin-top:10px;">⏳ Syncing...</div>
      <div style="text-align:right; margin-top:20px;">
        <button id="saveEditBtn" style="padding:8px 16px; background:#4CAF50; color:#fff; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">Save</button>
        <button onclick="closeModal('modalOverlay')" style="padding:8px 16px; background:#ccc; color:#333; border:none; border-radius:5px; margin-left:10px; cursor:pointer;">Cancel</button>
      </div>
    </div>
  </div>

  <div id="viewModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:25px; border-radius:15px; width:90%; max-width:500px; max-height:80vh; overflow-y:auto;">
      <h2 id="viewTaskName" style="margin-top:0; color:#2d3748;"></h2>
      <div style="display:flex; gap:10px; margin-bottom:15px;" id="viewBadges"></div>
      <div style="background:#f7fafc; padding:15px; border-radius:10px; border:1px solid #edf2f7; color:#4a5568; line-height:1.6; white-space:pre-wrap;" id="viewNotes"></div>
      <div style="margin-top:20px; font-size:12px; color:#a0aec0;" id="viewDetails"></div>
      <div style="text-align:right; margin-top:25px;">
        <button onclick="closeModal('viewModalOverlay')" style="padding:10px 20px; background:#3182ce; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Close</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalsHTML);

function openViewModal(index) {
    const t = allTasks[index];
    document.getElementById("viewTaskName").textContent = t["TASK NAME"];
    document.getElementById("viewNotes").textContent = t["NOTES"] || "No additional notes.";
    document.getElementById("viewBadges").innerHTML = `
        <span style="background:#edf2f7; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold;">${t["PRIORITY"]} Priority</span>
        <span style="background:#ebf8ff; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; color:#3182ce;">${t["STATUS"]}</span>
    `;
    document.getElementById("viewDetails").innerHTML = `
        <b style="color:black;">From: ${t["ASSIGNED BY"]}</b> <br>
        <b style="color:black;">To: ${t["ASSIGNED TO"]}</b><br>
        <b style="color:black;">Due Date: ${t["DUE DATE"]}</b> <br>
        <b style="color:black;">Created: ${t["TIMESTAMP"]}</b> 
    `;
    document.getElementById("viewModalOverlay").style.display = "flex";
}

function openEditModal(index) {
    editIndex = index;
    document.getElementById("editStatus").value = allTasks[index]["STATUS"] || "Not Started";
    document.getElementById("addRemarks").value = allTasks[index]["NOTES"] || "";
    document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

document.getElementById("saveEditBtn").onclick = async () => {
    const status = document.getElementById("editStatus").value;
    const notes = document.getElementById("addRemarks").value.trim();
    document.getElementById("loadingIndicator").style.display = "block";
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "update", rowIndex: allTasks[editIndex].rowIndex, status, notes, source: allTasks[editIndex].source })
        });
        closeModal('modalOverlay');
        fetchTasks();
    } catch (e) { alert("Update failed."); }
    document.getElementById("loadingIndicator").style.display = "none";
};

async function deleteTask(index) {
    if (!confirm("Delete task?")) return;
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", rowIndex: allTasks[index].rowIndex, source: allTasks[index].source })
        });
        fetchTasks();
    } catch (e) { alert("Deletion failed."); }
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
setInterval(fetchTasks, 30000);
