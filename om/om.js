/* ======= OM FRONT-END (sec.js) =======
   Robust fetch, filters, modal, edit/delete, read-only protection
   Paste/replace your existing sec.js with this file.
*/

const scriptURL = "https://script.google.com/macros/s/AKfycbzxASFS8paaBEjMEsbTyBGy1bgBccXnS5LAooL1PNbcshxzSuiM8LyXYEfwiZkpb1fR/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;

/* ---------- Filter UI (unchanged look) ---------- */
const filterContainer = document.createElement("div");
filterContainer.classList.add("filter-container");
filterContainer.innerHTML = `
  <div class="filter-dropdown">
    <button id="filterBtn">
      <span class="material-symbols-outlined filter">filter_list</span>
      Filter
    </button>
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

      <button id="applyFilter">Apply</button>
      <button id="clearFilter">Clear</button>
    </div>
  </div>
`;
taskList.parentNode.insertBefore(filterContainer, taskList);

// references to filter elements
const filterBtn = filterContainer.querySelector("#filterBtn");
const filterMenu = filterContainer.querySelector(".filter-menu");
const statusFilter = filterContainer.querySelector("#statusFilter");
const priorityFilter = filterContainer.querySelector("#priorityFilter");
const assignedByFilter = filterContainer.querySelector("#assignedByFilter");
const applyFilterBtn = filterContainer.querySelector("#applyFilter");
const clearFilterBtn = filterContainer.querySelector("#clearFilter");

// toggle filter UI
filterBtn.addEventListener("click", () => filterMenu.classList.toggle("active"));
applyFilterBtn.addEventListener("click", () => { filterMenu.classList.remove("active"); renderTasks(); });
clearFilterBtn.addEventListener("click", () => {
  statusFilter.value = "All";
  priorityFilter.value = "All";
  assignedByFilter.value = "All";
  filterMenu.classList.remove("active");
  renderTasks();
});

// also update when selects change
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
assignedByFilter.addEventListener("change", renderTasks);

/* ---------- Modal (unchanged look) ---------- */
const modalHTML = `
  <div id="modalOverlay" style="display:none;
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;">
    <div id="modalBox" style="
      background:#fff; padding:20px; border-radius:10px;
      box-shadow:0 0 20px rgba(0,0,0,0.3); width:100%; max-width:500px; box-sizing:border-box;">
      <div style="display:flex; flex-direction:column; gap:10px;">
        <h3>Edit Task Status</h3>
        <label for="editStatus">Status:</label>
        <select id="editStatus" style="display:block; width:100%; padding:8px; margin-top:5px;
          border:1px solid #ccc; border-radius:5px; font-size:14px;">
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <label for="addRemarks">Remarks:</label>
        <textarea id="addRemarks" style="display:block; width:100%; padding:8px; margin-top:5px;
          border:1px solid #ccc; border-radius:5px; resize:none; overflow:hidden;
          min-height:50px; max-height:500px; line-height:1.4; font-family:inherit; font-size:14px;"></textarea>
        <div id="loadingIndicator" style="display:none; color:#555; text-align:center;">⏳ Saving...</div>
      </div>
      <div style="margin-top:15px; text-align:right;">
        <button id="saveEditBtn" style="padding:6px 12px; background:#4CAF50; color:#fff; border:none; border-radius:5px;">Save</button>
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
const loadingIndicator = document.getElementById("loadingIndicator");

// auto-resize remarks
addRemarks.addEventListener("input", () => {
  addRemarks.style.height = "auto";
  const h = Math.min(addRemarks.scrollHeight, 500);
  addRemarks.style.height = h + "px";
  addRemarks.style.overflowY = addRemarks.scrollHeight > 500 ? "auto" : "hidden";
});

// ---------- Form submit (add task) ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    action: "add",
    taskName: document.getElementById("taskName").value.trim(),
    priority: document.getElementById("priority").value,
    assignedBy: document.getElementById("assignedBy").value.trim(),
    assignTo: document.getElementById("assignTo").value,
    dueDate: document.getElementById("dueDate").value,
    notes: document.getElementById("notes").value.trim()
  };

  if (!payload.taskName) {
    responseMsg.textContent = "⚠️ Task name is required.";
    return;
  }

  responseMsg.textContent = "⏳ Saving...";
  try {
    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(payload)
    });
    responseMsg.textContent = "✅ Saved!";
    setTimeout(() => (responseMsg.textContent = ""), 2500);
    form.reset();
    setTimeout(fetchTasks, 700);
  } catch (err) {
    responseMsg.textContent = "❌ Error: " + err.message;
  }
});

/* ---------- Robust fetchTasks (fixes allTasks.map error) ---------- */
async function fetchTasks() {
  taskList.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(scriptURL, { method: "GET", mode: "cors" });
    const text = await res.text();

    // try direct JSON parse first
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // fallback: extract JSON-like substring (old behavior)
      const m = text.match(/\{.*\}|\[.*\]/s);
      if (m) {
        parsed = JSON.parse(m[0]);
      } else {
        parsed = null;
      }
    }

    // If parsed is an object with error, show and set array empty
    if (!parsed) {
      allTasks = [];
      taskList.innerHTML = "<p>⚠️ No tasks or invalid response.</p>";
      return;
    }

    // If parsed is an object with error property, show message
    if (!Array.isArray(parsed)) {
      if (parsed.error) {
        taskList.innerHTML = `<p style="color:darkred;">Error: ${String(parsed.error)}</p>`;
        allTasks = [];
        return;
      }
      // if parsed is object but not array, try to coerce to array if it holds tasks keyed numerically
      const maybeArray = Object.values(parsed).filter(v => v && typeof v === 'object');
      if (maybeArray.length) {
        allTasks = maybeArray;
      } else {
        allTasks = [];
      }
    } else {
      allTasks = parsed;
    }

    // ---------- Populate Assigned By filter ----------
    // Ensure the dropdown always contains core departments first, then dynamic items
    const coreDepartments = ["Secretary","Marketing","Property Representative","Accounting","IT","Operations"];
    const dynamic = [...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").toString().trim()).filter(v => v))];

    // merge core + dynamic (unique), keep case as in data if dynamic has it
    const merged = [...new Set([...coreDepartments, ...dynamic])];

    assignedByFilter.innerHTML = `<option value="All">All</option>` +
      merged.map(d => `<option value="${d}">${d}</option>`).join("");

    renderTasks();
  } catch (err) {
    allTasks = [];
    taskList.innerHTML = `<p style="color:darkred;">Error fetching tasks: ${err.message}</p>`;
  }
}

/* ---------- Render tasks with filters & read-only logic ---------- */
function renderTasks() {
  const s = statusFilter.value;
  const p = priorityFilter.value;
  const a = assignedByFilter.value;

  let tasksToShow = Array.isArray(allTasks) ? allTasks.slice() : [];

  if (s !== "All") tasksToShow = tasksToShow.filter(t => ((t["STATUS"]||"").toString().trim() === s));
  if (p !== "All") tasksToShow = tasksToShow.filter(t => ((t["PRIORITY"]||"").toString().trim() === p));
  if (a !== "All") tasksToShow = tasksToShow.filter(t => ((t["ASSIGNED BY"]||"").toString().trim() === a));

  taskList.innerHTML = "";

  if (!tasksToShow.length) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  tasksToShow.forEach((t, rawIndex) => {
    // Note: allTasks may be the source array; find its index in allTasks to get edit/delete target
    const indexInAll = allTasks.indexOf(t);
    const div = document.createElement("div");
    div.classList.add("task-item");

    const status = (t["STATUS"] || "Not Started").toString().trim();
    let statusColor = "#999", bgColor = "#fff";
    if (status === "Completed") { statusColor = "#4CAF50"; bgColor = "#e8f5e9"; }
    else if (status === "In Progress") { statusColor = "#FFC107"; bgColor = "#fff9e6"; }
    else if (status === "Not Started") { statusColor = "#F44336"; bgColor = "#fdecea"; }

    div.style.borderLeft = `6px solid ${statusColor}`;
    // div.style.backgroundColor = bgColor;

    const safe = s => s === undefined || s === null ? "" : String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // Edit permission: can edit only if ASSIGNED BY equals "Secretary" (case-insensitive)
    const canEdit = ((t["ASSIGNED BY"] || "").toString().trim().toLowerCase() === "secretary");

    const sourceLabel = safe(t.source || (t["SOURCE"] || "") || "");

    div.innerHTML = `
      <div class="task-header">${safe(t["TASK NAME"])}</div>
      <div class="task-meta">
        <b>Priority:</b> ${safe(t["PRIORY"] || t["PRIORITY"] || "")} |
        <b>Assigned By:</b> ${safe(t["ASSIGNED BY"])} |
        <b>Assigned To:</b> ${safe(t["ASSIGNED TO"])} |
        <b>Due:</b> ${safe(t["DUE DATE"]) || "-"} |
        <b>Status:</b> <span style="color:${statusColor}; font-weight:600;">${safe(status)}</span>
        ${ sourceLabel ? `<span style="margin-left:8px;color:#777;font-size:12px;">(${sourceLabel})</span>` : "" }
      </div>
      ${t["NOTES"] ? `<div class="task-notes">🗒 ${safe(t["NOTES"])}</div>` : ""}
      <div class="task-meta">🕒 ${safe(t["TIMESTAMP"]) || ""}</div>
      <div class="task-actions">
        ${ canEdit
            ? `<button class="edit-btn" data-index="${indexInAll}">✏️ Edit</button>
               <button class="delete-btn" data-index="${indexInAll}">🗑️ Delete</button>`
            : `<button disabled class="readonly-btn" style="background:#555;color:white;padding:8px;border-radius:4px;cursor:not-allowed;">🔒 Read-Only</button>`
        }
      </div>
    `;

    // attach listeners only if possible
    if (canEdit) {
      const editBtn = div.querySelector(".edit-btn");
      const delBtn = div.querySelector(".delete-btn");
      if (editBtn) editBtn.addEventListener("click", () => openEditModal(Number(editBtn.dataset.index)));
      if (delBtn) delBtn.addEventListener("click", () => deleteTask(Number(delBtn.dataset.index)));
    }

    taskList.appendChild(div);
  });
}

/* ---------- Open / Save / Delete ---------- */
function openEditModal(index) {
  if (index === null || index === undefined) return;
  editIndex = index;
  const task = allTasks[index];
  editStatus.value = task["STATUS"] || "Not Started";
  addRemarks.value = task["NOTES"] || "";
  modalOverlay.style.display = "flex";
}

cancelEditBtn.addEventListener("click", () => { modalOverlay.style.display = "none"; });

saveEditBtn.addEventListener("click", async () => {
  if (editIndex === null) return;
  const newStatus = editStatus.value;
  const newRemarks = addRemarks.value.trim();
  const task = allTasks[editIndex];
  if (!task) { alert("Task not found"); modalOverlay.style.display = "none"; return; }

  loadingIndicator.style.display = "block";
  saveEditBtn.disabled = true;

  try {
    const body = {
      action: "update",
      rowIndex: task.rowIndex || task.rowIndex === 0 ? task.rowIndex : undefined,
      status: newStatus,
      remarks: newRemarks,
      source: task.source || task["SOURCE"] || undefined,
      taskName: task["TASK NAME"],
      dueDate: task["DUE DATE"]
    };

    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(body)
    });

    modalOverlay.style.display = "none";
    fetchTasks();
  } catch (err) {
    alert("❌ Error updating: " + err.message);
  } finally {
    loadingIndicator.style.display = "none";
    saveEditBtn.disabled = false;
  }
});

async function deleteTask(index) {
  const task = allTasks[index];
  if (!task) return;
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        action: "delete",
        rowIndex: task.rowIndex,
        source: task.source || task["SOURCE"]
      })
    });
    fetchTasks();
  } catch (err) {
    alert("❌ Error deleting: " + err.message);
  }
}

/* ---------- Initial load ---------- */
window.addEventListener("load", fetchTasks);
