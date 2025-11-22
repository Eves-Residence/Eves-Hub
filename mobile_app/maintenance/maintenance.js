// ✅ FULL CODE - Fixed filter options added.

const scriptURL = "https://script.google.com/macros/s/AKfycby37nFYHzcefhlsg-8xu6YiCIFbRtEeWQKbWSEt72Ycd12Q3ETaNA80O0o7EC-JyOWX/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;

// 🧠 Toggle filter menu visibility (Attached to existing HTML elements)
document.getElementById("filterBtn")?.addEventListener("click", () => {
  document.querySelector(".filter-menu").classList.toggle("active");
});

// ✅ Apply filters
document.getElementById("applyFilter")?.addEventListener("click", () => {
  document.querySelector(".filter-menu").classList.remove("active");
  renderTasks(); 
});

// ✅ Clear filters
document.getElementById("clearFilter")?.addEventListener("click", () => {
  document.getElementById("statusFilter").value = "All";
  document.getElementById("priorityFilter").value = "All";
  document.getElementById("assignedByFilter").value = "All";
  document.querySelector(".filter-menu").classList.remove("active");
  renderTasks(); 
});


// ✅ Popup modal (Kept the original structure)
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

// Auto resize remarks box
addRemarks.addEventListener("input", () => {
  addRemarks.style.height = "auto";
  const newHeight = Math.min(addRemarks.scrollHeight, 500);
  addRemarks.style.height = newHeight + "px";
  addRemarks.style.overflowY = addRemarks.scrollHeight > 500 ? "auto" : "hidden";
});

// ✅ Add new task
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
    responseMsg.textContent = "⚠️ Task name is required!";
    return;
  }

  responseMsg.textContent = "⏳ Saving task...";
  try {
    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify(task),
    });
    responseMsg.textContent = "✅ Task saved successfully!";
    setTimeout(() => (responseMsg.textContent = ""), 3000);
    form.reset();
    setTimeout(fetchTasks, 800); // Manually trigger fetch after adding
  } catch (err) {
    responseMsg.textContent = "❌ Error: " + err.message;
  }
});


// ✅ Fetch all tasks
async function fetchTasks() {
  // Only show "Loading..." on the very first load
  if (allTasks.length === 0) {
    taskList.innerHTML = "<p>Loading tasks...</p>";
  }

  let newTasks = [];

  try {
    const res = await fetch(scriptURL);
    const text = await res.text();
    const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
    if (!jsonMatch) throw new Error("Invalid JSON format");
    
    newTasks = JSON.parse(jsonMatch[0]); // Fetch into a temporary array

    // ⭐ Only re-render if the data has actually changed
    if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
      allTasks = newTasks; // Update the main array

      // Define the fixed list requested by the user
      const fixedDepartments = [
        "Secretary",
        "Marketing",
        "Property Representative",
        "Accounting",
        "IT"
      ];

      const assignedByFilter = document.getElementById("assignedByFilter");
      const currentAssignedBy = assignedByFilter.value; // Save current filter
      
      // Get unique assigners from the sheet data
      const dynamicAssigners = allTasks
        .map(t => (t["ASSIGNED BY"] || "").trim())
        .filter(v => v);

      // ✅ Combine fixed departments with dynamic assigners, ensuring uniqueness
      const combinedAssigners = [...new Set([...fixedDepartments, ...dynamicAssigners])];


      assignedByFilter.innerHTML = `<option value="All">All</option>` +
        combinedAssigners.map(v => `<option value="${v}">${v}</option>`).join("");
      
      // Try to restore the old filter value
      if ([...assignedByFilter.options].some(opt => opt.value === currentAssignedBy)) {
        assignedByFilter.value = currentAssignedBy;
      } else {
        assignedByFilter.value = "All";
      }

      renderTasks(); // Render the new content
    }
  } catch (err) {
    // On a failed refresh, log the error but *don't* wipe the screen
    console.error("Task refresh failed:", err.message);
    if (allTasks.length === 0) {
      taskList.innerHTML = `<p>⚠️ Error fetching tasks: ${err.message}</p>`;
    }
  }
}

// ✅ Render tasks with filters
function renderTasks() {
  const statusFilter = document.getElementById("statusFilter").value;
  const priorityFilter = document.getElementById("priorityFilter").value;
  const assignedByFilter = document.getElementById("assignedByFilter").value;

  let tasksToShow = allTasks;

  if (statusFilter !== "All") {
    tasksToShow = tasksToShow.filter(t => (t["STATUS"] || "Not Started") === statusFilter);
  }
  if (priorityFilter !== "All") {
    tasksToShow = tasksToShow.filter(t => (t["PRIORITY"] || "").trim() === priorityFilter);
  }
  if (assignedByFilter !== "All") {
    tasksToShow = tasksToShow.filter(t => (t["ASSIGNED BY"] || "").trim() === assignedByFilter);
  }

  taskList.innerHTML = "";
  if (!tasksToShow.length) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  tasksToShow.forEach((t) => {
    // 🐞 BUG FIX: Find the *original* index from the master 'allTasks' array
    const originalIndex = allTasks.indexOf(t);
    if (originalIndex === -1) return; // Safeguard

    const div = document.createElement("div");
    div.classList.add("task-item");

    const status = (t["STATUS"] || "Not Started").trim();
    let statusColor = "#999", bgColor = "#fff";
    
    // ⭐ COPIED COLOR FUNCTIONALITY: Border and Background color based on Status
    if (status === "Completed") { statusColor = "#4CAF50"; bgColor = "#e8f5e9"; }
    else if (status === "In Progress") { statusColor = "#FFC107"; bgColor = "#fff9e6"; }
    else if (status === "Not Started") { statusColor = "#F44336"; bgColor = "#fdecea"; }

    div.style.borderLeft = `6px solid ${statusColor}`;
    // ✅ Applied Background Color
    div.style.backgroundColor = bgColor; 

    const safe = str => str ? String(str).replace(/[&<>"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    }[c])) : "";

    // ⭐ NEW READ-ONLY LOGIC: Check for self-assignment (Assigned By === Assigned To)
    const assignedBy = (t["ASSIGNED BY"] || "").trim();
    const assignedTo = (t["ASSIGNED TO"] || "").trim();
    const assignedMatch = assignedBy === assignedTo;

    // Task is only editable if it was sourced by Maintenance AND is self-assigned.
    const isMaintenance = (t.source === "Maintenance") && assignedMatch;
    // ⭐ END READ-ONLY LOGIC

    div.innerHTML = `
      <div class="task-header">
        ${safe(t["TASK NAME"])}
        <span style="font-size:12px;color:#777;">(${safe(t.source) || "Unknown"})</span>
      </div>
      <div class="task-meta">
        <b>Priority:</b> ${safe(t["PRIORITY"])} |
        <b>Assigned By:</b> ${safe(t["ASSIGNED BY"]) || "-"} |
        <b>Assigned To:</b> ${safe(t["ASSIGNED TO"]) || "-"} |
        <b>Due:</b> ${safe(t["DUE DATE"]) || "-"} |
        <b>Status:</b> <span style="color:${statusColor}; font-weight:600;">${safe(status)}</span>
      </div>
      ${t["NOTES"] ? `<div class="task-notes">🗒 ${safe(t["NOTES"])}</div>` : ""}
      <div class="task-meta">🕒 ${safe(t["TIMESTAMP"]) || ""}</div>
      <div class="task-actions">
        ${
          isMaintenance
            ? `
              <button class="edit-btn" data-index="${originalIndex}" data-status="${safe(status)}" data-source="${t.source}">Edit</button>
              <button class="delete-btn" data-index="${originalIndex}" data-source="${t.source}">Delete</button>
            `
            : `<button disabled class="readonly-btn" style="background-color:#555; color:#fff; padding:10px;cursor:not-allowed;">Read-Only</button>`
        }
      </div>
    `;

    if (isMaintenance) {
      // 🐞 BUG FIX: Use originalIndex to edit/delete the correct task
      div.querySelector(".edit-btn").addEventListener("click", () => openEditModal(originalIndex, status, t.source));
      div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(originalIndex, t.source));
    }

    taskList.appendChild(div);
  });
}

// ✅ Re-render on filter change
document.getElementById("statusFilter").addEventListener("change", renderTasks);
document.getElementById("priorityFilter").addEventListener("change", renderTasks);
document.getElementById("assignedByFilter").addEventListener("change", renderTasks);

// ✅ Open modal
function openEditModal(index, currentStatus, source) {
  editIndex = index;
  editStatus.value = currentStatus;
  addRemarks.value = allTasks[index]["NOTES"] || "";
  modalOverlay.dataset.source = source;
  modalOverlay.style.display = "flex";
}

// ✅ Close modal
cancelEditBtn.addEventListener("click", () => modalOverlay.style.display = "none");

// ✅ Save edit
saveEditBtn.addEventListener("click", async () => {
  if (editIndex === null) return;
  const newStatus = editStatus.value;
  const newRemarks = addRemarks.value.trim();
  const source = modalOverlay.dataset.source;

  loadingIndicator.style.display = "block";
  saveEditBtn.disabled = true;

  try {
    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        action: "update",
        rowIndex: allTasks[editIndex].rowIndex,
        status: newStatus,
        notes: newRemarks,
        source
      })
    });
    modalOverlay.style.display = "none";
    fetchTasks(); // Manually trigger fetch after saving
  } catch (err) {
    alert("❌ Error updating: " + err.message);
  } finally {
    loadingIndicator.style.display = "none";
    saveEditBtn.disabled = false;
  }
});

// ✅ Delete task
async function deleteTask(index, source) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
        await fetch(scriptURL, {
            method: "POST",
            mode: "cors", 
            headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
            body: JSON.stringify({
                action: "delete",
                rowIndex: allTasks[index].rowIndex, 
                source
            })
        });
        fetchTasks(); // Manually trigger fetch after saving
    } catch (err) {
        alert("❌ Error deleting: " + err.message);
    }
}

// ✅ Load tasks on page load
window.addEventListener("load", fetchTasks);

// ⭐ Auto-refresh every 1 minute
setInterval(fetchTasks, 60000);
