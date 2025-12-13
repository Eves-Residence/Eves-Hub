// ✅ IT TASK MANAGER - FULL SYSTEM 12/13/2025
// MODIFIED: Standard View/Edit/Del Logic + Horizontal Kanban Dashboard
// ⭐ UPDATED: Bigger Filter Buttons + Due Date Integration + Permission Logic

const scriptURL = "https://script.google.com/macros/s/AKfycbxHH7p9HmFsx1mUlQ1wsSdkD9yDJmaKCfDS7AlRB9Nmr08C443fZmFyY2I5S9skZwu3FQ/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = []; 
let editIndex = null;

// ==========================================
// 1. CSS & UI INJECTION
// ==========================================
const style = document.createElement('style');
style.innerHTML = `
  .filter-container {
    background: #ffffff;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    margin-bottom: 20px;
    border: 1px solid #eaedf2;
  }
  
  .task-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #f0f2f5;
    padding-bottom: 10px;
  }
  
  .task-header-row p {
    font-size: 20px;
    font-weight: 700;
    color: #1a202c;
    margin: 0;
  }

  .filter-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: flex-end;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .filter-group label {
    font-size: 11px;
    font-weight: 700;
    color: #718096;
    text-transform: uppercase;
  }

  .filter-group select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #cbd5e0;
    font-size: 13px;
    min-width: 150px;
  }

  #taskList { 
    display: flex !important; flex-direction: row !important;
    overflow-x: auto !important; overflow-y: hidden !important;
    padding: 10px !important; gap: 20px !important;
    align-items: flex-start !important;
    background: #f1f5f9; border-radius: 15px; min-height: 350px;
  }
  
  #taskList::-webkit-scrollbar { height: 8px; }
  #taskList::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }

  /* ✅ BIGGER FILTER BUTTONS */
  .btn-apply { background: #3182ce; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; min-width: 110px; font-size: 14px; }
  .btn-clear { background: #edf2f7; color: #4a5568; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; min-width: 110px; font-size: 14px; }
`;
document.head.appendChild(style);

const filterUI = document.createElement("div");
filterUI.classList.add("filter-container");
filterUI.innerHTML = `
  <div class="task-header-row">
    <p>Secretary</p>
    <div style="display:flex; gap:12px;">
      <button class="btn-apply" id="applyFilter">Apply</button>
      <button class="btn-clear" id="clearFilter">Clear</button>
    </div>
  </div>
  <div class="filter-toolbar">
    <div class="filter-group">
      <label>Status</label>
      <select id="statusFilter">
        <option value="All">All Statuses</option>
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Priority</label>
      <select id="priorityFilter">
        <option value="All">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
    <div class="filter-group">
      <label>Assigned By</label>
      <select id="assignedByFilter">
        <option value="All">All Departments</option>
      </select>
    </div>
  </div>
`;
taskList.parentNode.insertBefore(filterUI, taskList);

// ==========================================
// 2. MODAL INJECTION (Edit & View)
// ==========================================
const modalsHTML = `
  <div id="modalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:20px; border-radius:12px; width:90%; max-width:450px;">
      <h3>Update IT Task</h3>
      <select id="editStatus" style="width:100%; padding:10px; margin-bottom:15px; border-radius:6px; border:1px solid #ddd;">
        <option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
      </select>
      <textarea id="addRemarks" style="width:100%; padding:10px; height:100px; resize:none; border:1px solid #ddd; border-radius:6px;"></textarea>
      <div id="loadingIndicator" style="display:none; text-align:center;">⏳ Syncing...</div>
      <div style="text-align:right; margin-top:20px;">
        <button id="saveEditBtn" style="padding:10px 20px; background:#4CAF50; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Save Changes</button>
        <button onclick="document.getElementById('modalOverlay').style.display='none'" style="padding:10px 20px; background:#ccc; border:none; border-radius:6px; margin-left:10px; cursor:pointer;">Cancel</button>
      </div>
    </div>
  </div>

  <div id="viewModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1002;">
    <div style="background:#fff; padding:25px; border-radius:15px; width:90%; max-width:550px; max-height:85vh; overflow-y:auto;">
      <h2 id="viewTaskName" style="margin-top:0; color:#2d3748;"></h2>
      <div id="viewBadges" style="display:flex; gap:10px; margin-bottom:15px;"></div>
      <div id="viewTaskContent" style="background:#f7fafc; padding:20px; border-radius:10px; border:1px solid #edf2f7; line-height:1.6; color:#4a5568; white-space:pre-wrap;"></div>
      <div id="viewMetadata" style="margin-top:20px; font-size:12px; color:#a0aec0;" id="viewMetadata"></div>
      <div style="text-align:right; margin-top:25px;">
        <button onclick="document.getElementById('viewModalOverlay').style.display='none'" style="padding:10px 25px; background:#2d3748; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Close</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalsHTML);

// ==========================================
// 3. LOGIC & DATA HANDLING
// ==========================================

async function fetchTasks() {
  if (allTasks.length === 0) taskList.innerHTML = "<p style='padding:20px;'>Syncing IT database...</p>";
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
      deptFilter.innerHTML = `<option value="All">All Departments</option>` + 
                             uniqueDepts.map(d => `<option value="${d}">${d}</option>`).join("");
      deptFilter.value = currentVal || "All";
      renderTasks();
    }
  } catch (err) { console.error("Sync Error", err); }
}

const safe = str => str ? String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : "";

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
  filtered.forEach((t) => {
    const originalIndex = allTasks.indexOf(t);
    const status = (t["STATUS"] || "Not Started").trim();
    let statusColor = status === "Completed" ? "#4CAF50" : (status === "In Progress" ? "#FFC107" : "#F44336");

    // ✅ IT PERMISSION LOGIC
    const sourceDept = String(t.source || "").trim().toLowerCase();
    const targetDept = String(t["ASSIGNED TO"] || "").trim().toLowerCase();
    const canEdit = sourceDept === "secretary" || targetDept === "secretary" || "IT" || "property representative" || "accounting" || "marketing" || "maintenance";

    const div = document.createElement("div");
    div.style.cssText = `background:#fff; border-radius:12px; border-left:8px solid ${statusColor}; width:300px; height:340px; flex-shrink:0; display:flex; flex-direction:column; box-shadow:0 4px 15px rgba(0,0,0,0.06);`;

    div.innerHTML = `
      <div style="padding:18px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:10px;">
        <div style="font-weight:700; font-size:15px; color:#2d3748; white-space:normal;">${safe(t["TASK NAME"])}</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="background:${statusColor}; color:#fff; padding:3px 12px; border-radius:20px; font-size:10px; font-weight:bold; text-transform:uppercase;">${status}</div>
          <div style="font-size:11px; color:#1a202c; font-weight:700;">📅 ${safe(t["DUE DATE"])}</div>
        </div>
        <div style="flex:1; overflow-y:auto; font-size:13px; color:#4a5568; background:#f7fafc; padding:12px; border-radius:8px; line-height:1.5;">🗒 ${safe(t["NOTES"] || "-")}</div>
      </div>
      <div style="padding:12px 18px; border-top:1px solid #edf2f7; display:flex; flex-direction:column; gap:10px; background:#fdfdfd; border-radius: 0 0 12px 0;">
        <div style="font-size:10px; color:#a0aec0; font-weight:600;">🕒 ${safe(t["TIMESTAMP"])}</div>
        <div style="display:flex; gap:8px;">
           <button onclick="openViewModal(${originalIndex})" style="flex:1; padding:10px; font-size:12px; background:#edf2f7; color:#4a5568; border:none; border-radius:6px; font-weight:700; cursor:pointer;">View</button>
           ${canEdit ? `
             <button onclick="openEditModal(${originalIndex}, '${status}', '${t.source}')" style="flex:1; padding:10px; font-size:12px; background:#3182ce; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Edit</button>
             <button onclick="deleteTask(${originalIndex}, '${t.source}')" style="flex:1; padding:10px; font-size:12px; background:#e53e3e; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Del</button>
           ` : `
             <button style="flex:2; padding:10px; font-size:12px; background:#cbd5e0; color:#4a5568; border:none; border-radius:6px; cursor:not-allowed; font-weight:700;">Locked (Read-Only)</button>
           `}
        </div>
      </div>
    `;
    taskList.appendChild(div);
  });
}

// ==========================================
// 4. ACTION HANDLERS
// ==========================================

function openViewModal(index) {
  const t = allTasks[index];
  document.getElementById("viewTaskName").textContent = t["TASK NAME"];
  document.getElementById("viewTaskContent").textContent = t["NOTES"] || "No additional notes provided.";
  document.getElementById("viewBadges").innerHTML = `
      <span style="background:#edf2f7; padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold;">${t["PRIORITY"]} Priority</span>
      <span style="background:#ebf8ff; padding:5px 12px; border-radius:20px; font-size:11px; font-weight:bold; color:#3182ce;">${t["STATUS"]}</span>
  `;
  document.getElementById("viewMetadata").innerHTML = `
      <b style="color:black;">From: ${t["ASSIGNED BY"]}</b> <br>
      <b style="color:black;">To: ${t["ASSIGNED TO"]}</b><br>
      <b style="color:black;">Due Date: ${t["DUE DATE"]}</b> <br>
      <b style="color:black;">Created: ${t["TIMESTAMP"]}</b> 
  `;
  document.getElementById("viewModalOverlay").style.display = "flex";
}

function openEditModal(index, currentStatus, source) {
  editIndex = index;
  document.getElementById("editStatus").value = currentStatus;
  document.getElementById("addRemarks").value = allTasks[index]["NOTES"] || "";
  document.getElementById("modalOverlay").dataset.source = source;
  document.getElementById("modalOverlay").style.display = "flex";
}

async function saveEdit() {
  if (editIndex === null) return;
  const source = document.getElementById("modalOverlay").dataset.source;
  document.getElementById("loadingIndicator").style.display = "block";
  try {
    await fetch(scriptURL, {
      method: "POST", mode: "cors",
      body: JSON.stringify({ action: "update", rowIndex: allTasks[editIndex].rowIndex, status: document.getElementById("editStatus").value, notes: document.getElementById("addRemarks").value.trim(), source })
    });
    document.getElementById("modalOverlay").style.display = "none"; 
    fetchTasks();
  } catch (err) { alert("Sync Error: " + err.message); }
  document.getElementById("loadingIndicator").style.display = "none";
}

async function deleteTask(index, source) {
  if (!confirm("Are you sure you want to delete this IT record?")) return;
  try {
    await fetch(scriptURL, { method: "POST", mode: "cors", body: JSON.stringify({ action: "delete", rowIndex: allTasks[index].rowIndex, source }) });
    fetchTasks();
  } catch (err) { alert("Delete Error: " + err.message); }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const task = {
    action: "add",
    taskName: document.getElementById("taskName").value,
    priority: document.getElementById("priority").value,
    assignedBy: document.getElementById("assignedBy").value,
    assignTo: document.getElementById("assignTo").value,
    dueDate: document.getElementById("dueDate").value,
    notes: document.getElementById("notes").value,
  };
  responseMsg.textContent = "⏳ Uploading to IT Database...";
  try {
    await fetch(scriptURL, { method: "POST", mode: "cors", body: JSON.stringify(task) });
    responseMsg.textContent = "✅ Task Synced!";
    form.reset();
    setTimeout(fetchTasks, 800);
  } catch (err) { responseMsg.textContent = "❌ Upload Failed: " + err.message; }
});

// ==========================================
// 5. INITIALIZATION
// ==========================================

document.getElementById("applyFilter").onclick = () => renderTasks();
document.getElementById("clearFilter").onclick = () => {
    document.getElementById("statusFilter").value = "All";
    document.getElementById("priorityFilter").value = "All";
    document.getElementById("assignedByFilter").value = "All";
    renderTasks();
};

document.getElementById("saveEditBtn").onclick = saveEdit;

window.onload = fetchTasks;
setInterval(fetchTasks, 30000); // 30s auto-refresh
