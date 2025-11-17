// FULL UPDATED script — fixes filter not working and keeps UI unchanged
const scriptURL = "https://script.google.com/macros/s/AKfycbxHH7p9HmFsx1mUlQ1wsSdkD9yDJmaKCfDS7AlRB9Nmr08C443fZmFyY2I5S9skZwu3FQ/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;

// ----- CREATE FILTER UI (unchanged visually) -----
const filterContainer = document.createElement("div");
filterContainer.classList.add("filter-container");
filterContainer.innerHTML = `
  <div class="filter-dropdown">
    <div class="task-subheader">
      <p>All Task</p>
      <button id="filterBtn">
      <span class="material-symbols-outlined filter">filter_list</span>
      Filter
      </button>
    </div>

    <div class="filter-menu">
      <label>Status:</label>
      <select id="statusFilter">
        <option value="All">All</option>
        <option value="Not Started">Not Started</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <label>Priority:</label>
      <select id="priorityFilter">
        <option value="All">All</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <label>Assigned By:</label>
      <select id="assignedByFilter">
        <option value="All">All</option>
      </select>

      <div style="margin-top:8px; display:flex; gap:8px;">
        <button id="applyFilter">Apply</button>
        <button id="clearFilter">Clear</button>
      </div>
    </div>
  </div>
`;
taskList.parentNode.insertBefore(filterContainer, taskList);

// scope frequently-used nodes to avoid global query mistakes
const filterBtn = filterContainer.querySelector("#filterBtn");
const filterMenu = filterContainer.querySelector(".filter-menu");
const statusFilter = filterContainer.querySelector("#statusFilter");
const priorityFilter = filterContainer.querySelector("#priorityFilter");
const assignedByFilter = filterContainer.querySelector("#assignedByFilter");
const applyFilterBtn = filterContainer.querySelector("#applyFilter");
const clearFilterBtn = filterContainer.querySelector("#clearFilter");

// Toggle filter menu visibility (scoped)
filterBtn.addEventListener("click", (e) => {
  filterMenu.classList.toggle("active");
});

// Apply filters (alias so older code calling applyFilters() still works)
function applyFilters() {
  // hide menu and render tasks with current selections
  filterMenu.classList.remove("active");
  renderTasks();
}
applyFilterBtn.addEventListener("click", applyFilters);

// Clear filters and re-render
clearFilterBtn.addEventListener("click", () => {
  statusFilter.value = "All";
  priorityFilter.value = "All";
  assignedByFilter.value = "All";
  filterMenu.classList.remove("active");
  renderTasks();
});

// Allow immediate rerender when selects change (optional convenience)
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
assignedByFilter.addEventListener("change", renderTasks);

// ----- Modal HTML (keeps your original) -----
const modalHTML = `
  <div id="modalOverlay" style="display:none;
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div id="modalBox" style="
      background:#fff; padding:20px; border-radius:10px;
      box-shadow:0 0 20px rgba(0,0,0,0.3); width:100%; max-width:500px; box-sizing:border-box;">
      <div style="display:flex; flex-direction:column; gap:10px;">
        <h3>Edit Task Status</h3>

        <label>Status:</label>
        <select id="editStatus" style="padding:8px; width:100%;">
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <label>Remarks:</label>
        <textarea id="addRemarks" style="
          width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;
          resize:none; min-height:80px; max-height:300px;"></textarea>

        <div id="loadingIndicator" style="display:none; text-align:center;">⏳ Saving...</div>
      </div>

      <div style="margin-top:15px; text-align:right;">
        <button id="saveEditBtn" style="padding:6px 12px; background:#4CAF50; color:white; border:none; border-radius:5px;">Save</button>
        <button id="cancelEditBtn" style="padding:6px 12px; background:#ccc; border:none; border-radius:5px;">Cancel</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalHTML);

const modalOverlay = document.getElementById("modalOverlay");
const editStatus = document.getElementById("editStatus");
const addRemarks = document.getElementById("addRemarks");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Auto resize remarks
addRemarks.addEventListener("input", () => {
  addRemarks.style.height = "auto";
  const newHeight = Math.min(addRemarks.scrollHeight, 300);
  addRemarks.style.height = newHeight + "px";
  addRemarks.style.overflowY = addRemarks.scrollHeight > 300 ? "auto" : "hidden";
});

// ----- Add new task -----
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const task = {
    action: "add",
    taskName: document.getElementById("taskName").value.trim(),
    priority: document.getElementById("priority").value,
    assignedBy: document.getElementById("assignedBy").value.trim(),
    assignTo: document.getElementById("assignTo").value,
    dueDate: document.getElementById("dueDate").value,
    notes: document.getElementById("notes").value.trim(),
  };

  if (!task.taskName) {
    responseMsg.textContent = "⚠️ Task name is required.";
    return;
  }

  responseMsg.textContent = "⏳ Saving...";
  try {
    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(task)
    });

    responseMsg.textContent = "✅ Saved!";
    setTimeout(() => (responseMsg.textContent = ""), 3000);

    form.reset();
    setTimeout(fetchTasks, 800);

  } catch (err) {
    responseMsg.textContent = "❌ Error: " + err.message;
  }
});

// ----- Fetch tasks & populate Assigned By (fixed + dynamic) -----
async function fetchTasks() {
  taskList.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(scriptURL);
    const text = await res.text();
    const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
    if (!jsonMatch) throw new Error("Invalid JSON");

    allTasks = JSON.parse(jsonMatch[0]);

    // fixed departments + dynamic merge
    const fixedDepartments = [
      "Secretary",
      "Marketing",
      "Property Representative",
      "Accounting",
      "IT"
    ];
    const dynamicDepartments = allTasks
      .map(t => (t["ASSIGNED BY"] || "").trim())
      .filter(v => v !== "");
    const combinedDepartments = [...new Set([...fixedDepartments, ...dynamicDepartments])];

    // populate assignedByFilter safely (preserve previously selected if possible)
    const prev = assignedByFilter.value || "All";
    assignedByFilter.innerHTML = `<option value="All">All</option>` +
      combinedDepartments.map(d => `<option value="${d}">${d}</option>`).join("");
    if ([...assignedByFilter.options].some(opt => opt.value === prev)) {
      assignedByFilter.value = prev;
    } else {
      assignedByFilter.value = "All";
    }

    renderTasks();
  } catch (err) {
    taskList.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// ----- Render tasks with filters -----
// Note: Secretary can edit tasks that have ASSIGNED BY = "Secretary" (case-insensitive)
function renderTasks() {
  const sFilter = statusFilter.value;
  const pFilter = priorityFilter.value;
  const aFilter = assignedByFilter.value;

  let tasksToShow = allTasks.slice();

  if (sFilter !== "All") tasksToShow = tasksToShow.filter(t => ((t["STATUS"]||"").trim() === sFilter));
  if (pFilter !== "All") tasksToShow = tasksToShow.filter(t => ((t["PRIORITY"]||"").trim() === pFilter));
  if (aFilter !== "All") tasksToShow = tasksToShow.filter(t => ((t["ASSIGNED BY"]||"").trim() === aFilter));

  taskList.innerHTML = "";

  if (!tasksToShow.length) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  tasksToShow.forEach((t, index) => {
    const div = document.createElement("div");
    div.classList.add("task-item");

    const status = (t["STATUS"] || "Not Started").trim();
    let color = "#999", bg = "#fff";
    if (status === "Completed") { color = "#4CAF50"; bg = "#e8f5e9"; }
    if (status === "In Progress") { color = "#FFC107"; bg = "#fff9e6"; }
    if (status === "Not Started") { color = "#F44336"; bg = "#fdecea"; }

    div.style.borderLeft = `6px solid ${color}`;
    // div.style.backgroundColor = bg;

    const safe = s => s ? String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])) : "";

    const canEdit = String(t["ASSIGNED BY"] || "").trim().toLowerCase() === "secretary";

    div.innerHTML = `
      <div class="task-header">${safe(t["TASK NAME"])}</div>
      <div class="task-meta">
        <b>Priority:</b> ${safe(t["PRIORITY"])} |
        <b>Assigned By:</b> ${safe(t["ASSIGNED BY"])} |
        <b>Assigned To:</b> ${safe(t["ASSIGNED TO"])} |
        <b>Due:</b> ${safe(t["DUE DATE"])} |
        <b>Status:</b> <span style="color:${color}; font-weight:bold;">${safe(status)}</span>
      </div>
      ${t["NOTES"] ? `<div class="task-notes">🗒 ${safe(t["NOTES"])}</div>` : ""}
      <div class="task-meta">🕒 ${safe(t["TIMESTAMP"])}</div>
      <div class="task-actions">
        ${
          canEdit
            ? `<button class="edit-btn" data-index="${index}">✏️ Edit</button>
               <button class="delete-btn" data-index="${index}">🗑️ Delete</button>`
            : `<button class="readonly-btn" disabled style="background:#555;color:white;">🔒 Read-Only</button>`
        }
      </div>
    `;

    if (canEdit) {
      div.querySelector(".edit-btn").addEventListener("click", () => openEditModal(index));
      div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(index));
    }

    taskList.appendChild(div);
  });
}

// ----- Open / Save / Delete handlers -----
function openEditModal(index) {
  editIndex = index;
  editStatus.value = allTasks[index]["STATUS"] || "Not Started";
  addRemarks.value = allTasks[index]["NOTES"] || "";
  modalOverlay.style.display = "flex";
}
cancelEditBtn.onclick = () => modalOverlay.style.display = "none";

saveEditBtn.onclick = async () => {
  if (editIndex === null) return;
  const newStatus = editStatus.value;
  const newRemarks = addRemarks.value.trim();

  document.getElementById("loadingIndicator").style.display = "block";
  saveEditBtn.disabled = true;

  try {
    await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        action: "update",
        rowIndex: allTasks[editIndex].rowIndex,
        status: newStatus,
        notes: newRemarks
      })
    });

    modalOverlay.style.display = "none";
    fetchTasks();
  } catch (err) {
    alert("Error updating: " + err.message);
  }

  document.getElementById("loadingIndicator").style.display = "none";
  saveEditBtn.disabled = false;
};

async function deleteTask(index) {
  if (!confirm("Delete this task?")) return;
  try {
    await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        action: "delete",
        rowIndex: allTasks[index].rowIndex
      })
    });
    fetchTasks();
  } catch (err) {
    alert("Error deleting: " + err.message);
  }
}

// load
window.addEventListener("load", fetchTasks);
