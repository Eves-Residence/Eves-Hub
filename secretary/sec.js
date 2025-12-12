// ✅ IT TASK MANAGER - FULL SYSTEM 12/12/2025
// MODIFIED: Horizontal Scroll Dashboard + View Modal + Reply Functionality
// ⭐ MODIFIED: Full 1:1 Logic preservation + Modern Presentable Header
// DO NOT CHANGE THIS FILE NAME OR PATH TO ENSURE PROPER FUNCTIONALITY

const scriptURL = "https://script.google.com/macros/s/AKfycbxHH7p9HmFsx1mUlQ1wsSdkD9yDJmaKCfDS7AlRB9Nmr08C443fZmFyY2I5S9skZwu3FQ/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = []; 
let editIndex = null;
let replyIndex = null; 

// ✅ 1. CSS INJECTION (Dashboard & Presentable Header Layout)
const style = document.createElement('style');
style.innerHTML = `
  .main-dashboard-container { 
    display: flex; 
    gap: 20px; 
    align-items: stretch; 
    height: 500px; 
    margin-top: 20px;
  }
  
  /* Modern Header Styling */
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
    font-size: 12px;
    font-weight: 600;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-group select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #cbd5e0;
    background-color: #f8fafc;
    font-size: 14px;
    color: #2d3748;
    outline: none;
    min-width: 150px;
  }

  .action-buttons { display: flex; gap: 10px; }
  .btn-apply { background: #3182ce; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
  .btn-clear { background: #edf2f7; color: #4a5568; border: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }

  #taskList { 
    flex: 1; display: flex !important; flex-direction: row !important;
    overflow-x: auto !important; overflow-y: hidden !important;
    white-space: nowrap !important; padding: 10px !important;
    gap: 20px !important; align-items: center !important;
    background: #f0f2f5; border-radius: 10px; height: 100% !important;
  }
  #taskList::-webkit-scrollbar { height: 10px; }
  #taskList::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
  .task-item { white-space: normal !important; }
`;
document.head.appendChild(style);

// ✅ 2. PRESENTABLE FILTER UI
const filterContainer = document.createElement("div");
filterContainer.classList.add("filter-container");
filterContainer.innerHTML = `
  <div class="task-header-row">
    <p>All Task Manager</p>
    <div class="action-buttons">
      <button class="btn-apply" id="applyFilter">Apply Filters</button>
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
taskList.parentNode.insertBefore(filterContainer, taskList);

document.getElementById("applyFilter").addEventListener("click", renderTasks);
document.getElementById("clearFilter").addEventListener("click", () => {
  document.getElementById("statusFilter").value = "All";
  document.getElementById("priorityFilter").value = "All";
  document.getElementById("assignedByFilter").value = "All";
  renderTasks();
});

// ✅ 3. MODAL INJECTION (Edit, Reply, View)
const modalHTML = `
  <div id="modalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:500px;">
      <h3>Edit Status</h3>
      <select id="editStatus" style="width:100%; padding:8px; margin-bottom:10px;"><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select>
      <textarea id="addRemarks" style="width:100%; padding:8px; height:80px; resize:none; border-radius:5px; border:1px solid #cbd5e0;"></textarea>
      <div id="loadingIndicator" style="display:none; text-align:center;">⏳ Saving...</div>
      <div style="text-align:right; margin-top:15px;"><button id="saveEditBtn" style="padding:6px 12px; background:#4CAF50; color:#fff; border:none; border-radius:5px;">Save</button><button id="cancelEditBtn" style="padding:6px 12px; background:#ccc; border:none; border-radius:5px; margin-left:10px;">Cancel</button></div>
    </div>
  </div>

  <div id="replyModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1001;">
    <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:500px;">
      <h3>Task Received (Reply)</h3>
      <div id="replyTaskDetails" style="background:#f4f4f4; border:1px solid #ddd; padding:10px; max-height:200px; overflow-y:auto; font-size:13px; margin-bottom:10px; border-radius:5px;"></div>
      <input type="date" id="replyDateReceived" style="width:100%; padding:8px; margin-bottom:10px;">
      <div id="replyLoadingIndicator" style="display:none; text-align:center;">⏳ Saving...</div>
      <div style="text-align:right;"><button id="saveReplyBtn" style="padding:6px 12px; background:#007bff; color:#fff; border:none; border-radius:5px;">Save Reply</button><button id="cancelReplyBtn" style="padding:6px 12px; background:#ccc; border:none; border-radius:5px; margin-left:10px;">Cancel</button></div>
    </div>
  </div>

  <div id="viewModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1002;">
    <div style="background:#fff; padding:25px; border-radius:15px; width:90%; max-width:600px;">
      <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Full Task Details</h3>
      <div id="viewTaskContent" style="max-height:400px; overflow-y:auto; line-height:1.6; font-size:14px;"></div>
      <div style="text-align:right; margin-top:20px;"><button onclick="document.getElementById('viewModalOverlay').style.display='none'" style="padding:8px 20px; background:#333; color:#fff; border:none; border-radius:8px;">Close</button></div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalHTML);

const modalOverlay = document.getElementById("modalOverlay");
const replyModalOverlay = document.getElementById("replyModalOverlay");
const replyTaskDetails = document.getElementById("replyTaskDetails");
const replyDateReceived = document.getElementById("replyDateReceived");
const saveReplyBtn = document.getElementById("saveReplyBtn");
const cancelReplyBtn = document.getElementById("cancelReplyBtn");
const replyLoadingIndicator = document.getElementById("replyLoadingIndicator");

document.getElementById("cancelEditBtn").onclick = () => modalOverlay.style.display = "none";
cancelReplyBtn.onclick = () => replyModalOverlay.style.display = "none";
document.getElementById("saveEditBtn").onclick = saveEdit;
saveReplyBtn.onclick = saveReply;

// ✅ 4. FETCH TASKS (Flicker-Free Logic)
async function fetchTasks() {
  if (allTasks.length === 0) taskList.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(scriptURL);
    const text = await res.text();
    const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
    if (!jsonMatch) throw new Error("Invalid JSON");
    const newTasks = JSON.parse(jsonMatch[0]);

    if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
      allTasks = newTasks;
      const assignedByFilter = document.getElementById("assignedByFilter");
      const currentVal = assignedByFilter.value;
      const combinedDepts = [...new Set(["Secretary","Marketing","Property Representative","Accounting","IT", ...allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v !== "")])];
      assignedByFilter.innerHTML = `<option value="All">All Departments</option>` + combinedDepts.map(v => `<option value="${v}">${v}</option>`).join("");
      assignedByFilter.value = currentVal || "All";
      renderTasks();
    }
  } catch (err) { console.error("Fetch failed", err); }
}

const safe = str => str ? String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) : "";

// ✅ 5. RENDER TASKS (Design Fixes + Permissions)
function renderTasks() {
  const statusFilter = document.getElementById("statusFilter").value;
  const priorityFilter = document.getElementById("priorityFilter").value;
  const assignedByFilter = document.getElementById("assignedByFilter").value;

  let filtered = allTasks;
  if (statusFilter !== "All") filtered = filtered.filter(t => (t["STATUS"] || "Not Started") === statusFilter);
  if (priorityFilter !== "All") filtered = filtered.filter(t => (t["PRIORITY"] || "").trim() === priorityFilter);
  if (assignedByFilter !== "All") filtered = filtered.filter(t => (t["ASSIGNED BY"] || "").trim() === assignedByFilter);

  taskList.innerHTML = "";
  filtered.forEach((t) => {
    const originalIndex = allTasks.indexOf(t);
    const status = (t["STATUS"] || "Not Started").trim();
    let statusColor = status === "Completed" ? "#4CAF50" : (status === "In Progress" ? "#FFC107" : "#F44336");

    const canEdit = String(t["ASSIGNED BY"] || "").trim().toLowerCase() === "secretary";

    const div = document.createElement("div");
    div.style.cssText = `background:#fff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); border-left:8px solid ${statusColor}; display:flex; flex-direction:column; width:300px !important; height:320px !important; flex-shrink:0 !important;`;

    div.innerHTML = `
      <div style="padding:15px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:8px;">
        <div style="font-weight:bold; font-size:16px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${safe(t["TASK NAME"])} <span style="font-size:11px; color:#888;">(${safe(t.source)})</span></div>
        <div style="background:${statusColor}; color:#fff; padding:2px 10px; border-radius:20px; font-size:10px; width:fit-content;">${status}</div>
        <div style="flex:1; overflow-y:auto; font-size:13px; color:#444; background:#fff9e6; padding:10px; border-radius:6px; white-space:normal;">🗒 ${safe(t["NOTES"] || "-")}</div>
      </div>
      <div style="padding:10px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
        <div style="font-size:10px; color:#aaa;">🕒 ${safe(t["TIMESTAMP"])}</div>
        <div style="display:flex; gap:5px;">
           <button onclick="openViewModal(${originalIndex})" style="padding:4px 8px; font-size:11px; background:#666; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">View</button>
           ${canEdit ? `
             <button onclick="openEditModal(${originalIndex}, '${status}', '${t.source}')" style="padding:4px 8px; font-size:11px; background:#007bff; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Edit</button>
             <button onclick="deleteTask(${originalIndex}, '${t.source}')" style="padding:4px 8px; font-size:11px; background:#f44336; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Del</button>
           ` : `
             <button onclick="openReplyModal(${originalIndex})" style="padding:4px 8px; font-size:11px; background:#28a745; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Reply</button>
           `}
        </div>
      </div>
    `;
    taskList.appendChild(div);
  });
}

// ✅ 6. LOGIC HELPERS (Preserved)
function openViewModal(index) {
  const t = allTasks[index];
  document.getElementById("viewTaskContent").innerHTML = `<p><b>Task:</b> ${safe(t["TASK NAME"])}</p><p><b>Status:</b> ${safe(t["STATUS"])}</p><p><b>Assigned By:</b> ${safe(t["ASSIGNED BY"])}</p><p><b>Notes:</b> ${safe(t["NOTES"] || "-")}</p>${t["DATE RECEIVED"] ? `<p style="color:#28a745"><b>Confirmed Received:</b> ${safe(t["DATE RECEIVED"])}</p>`:''}`;
  document.getElementById("viewModalOverlay").style.display = "flex";
}

function openEditModal(index, currentStatus, source) {
  editIndex = index;
  document.getElementById("editStatus").value = currentStatus;
  document.getElementById("addRemarks").value = allTasks[index]["NOTES"] || "";
  modalOverlay.dataset.source = source;
  modalOverlay.style.display = "flex";
}

function openReplyModal(index) {
  replyIndex = index;
  const t = allTasks[index];
  replyTaskDetails.innerHTML = `<p><b>Task:</b> ${safe(t["TASK NAME"])}</p><p><b>By:</b> ${safe(t["ASSIGNED BY"])}</p>`;
  replyDateReceived.value = t["DATE RECEIVED"] || "";
  replyModalOverlay.style.display = "flex";
}

async function saveEdit() {
  if (editIndex === null) return;
  document.getElementById("loadingIndicator").style.display = "block";
  try {
    await fetch(scriptURL, {
      method: "POST", mode: "cors",
      body: JSON.stringify({ action: "update", rowIndex: allTasks[editIndex].rowIndex, status: document.getElementById("editStatus").value, notes: document.getElementById("addRemarks").value.trim(), source: modalOverlay.dataset.source })
    });
    modalOverlay.style.display = "none"; fetchTasks();
  } catch (err) { alert(err.message); }
  document.getElementById("loadingIndicator").style.display = "none";
}

async function saveReply() {
  if (replyIndex === null || !replyDateReceived.value) return alert("Select a date.");
  replyLoadingIndicator.style.display = "block";
  try {
    await fetch(scriptURL, {
      method: "POST", mode: "cors",
      body: JSON.stringify({ action: "reply", rowIndex: allTasks[replyIndex].rowIndex, source: allTasks[replyIndex].source, dateReceived: replyDateReceived.value })
    });
    replyModalOverlay.style.display = "none"; fetchTasks();
  } catch (err) { alert(err.message); }
  replyLoadingIndicator.style.display = "none";
}

async function deleteTask(index, source) {
  if (!confirm("Delete?")) return;
  try {
    await fetch(scriptURL, { method: "POST", mode: "cors", body: JSON.stringify({ action: "delete", rowIndex: allTasks[index].rowIndex, source }) });
    fetchTasks();
  } catch (err) { alert(err.message); }
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
  responseMsg.textContent = "⏳ Saving...";
  try {
    await fetch(scriptURL, { method: "POST", mode: "cors", body: JSON.stringify(task) });
    responseMsg.textContent = "✅ Saved!";
    form.reset();
    setTimeout(fetchTasks, 800);
  } catch (err) { responseMsg.textContent = "❌ Error: " + err.message; }
});

window.onload = fetchTasks;
setInterval(fetchTasks, 60000);
