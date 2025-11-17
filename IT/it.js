// ✅ MODIFIED 14/11/2025: Replaced "Read-Only" with "Reply" functionality.
// ⭐ MODIFIED: Added 1-minute flicker-free auto-refresh.
// DO NOT CHANGE THIS FILE NAME OR PATH TO ENSURE PROPER FUNCTIONALITY

const scriptURL = "https://script.google.com/macros/s/AKfycbwmZ1-k28KAaQl4h5YMmEKz5NjW-1dmQMGE7VKmCZSKWXQ1Qw1VY2axegPwpDBChVQ/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = []; // Master list
let editIndex = null;
let replyIndex = null; // NEW: To track which task is being replied to

// ✅ Create single unified filter dropdown
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
        <option value="Marketing">Marketing</option>
        <option value="Property Representative">Property Representative</option>
        <option value="Accounting">Accounting</option>
        <option value="IT">IT</option>
      </select>

      <button id="applyFilter">Apply</button>
      <button id="clearFilter">Clear</button>
    </div>
  </div>
`;

taskList.parentNode.insertBefore(filterContainer, taskList);

// 🧠 Toggle filter menu visibility
document.getElementById("filterBtn")?.addEventListener("click", () => {
  document.querySelector(".filter-menu").classList.toggle("active");
});

// ✅ Apply filters
document.getElementById("applyFilter")?.addEventListener("click", () => {
  document.querySelector(".filter-menu").classList.remove("active");
  renderTasks(); // CORRECTED: Was calling undefined applyFilters()
});

// ✅ Clear filters
document.getElementById("clearFilter")?.addEventListener("click", () => {
  document.getElementById("statusFilter").value = "All";
  document.getElementById("priorityFilter").value = "All";
  document.getElementById("assignedByFilter").value = "All";
  document.querySelector(".filter-menu").classList.remove("active");
  renderTasks(); // CORRECTED: Was calling undefined applyFilters()
});



// ✅ Popup modal (for Editing tasks *by* IT)
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


// ⭐ NEW: Popup modal (for Replying to tasks *from* others)
const replyModalHTML = `
  <div id="replyModalOverlay" style="display:none;
    position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1001;">
    <div id="replyModalBox" style="
      background:#fff; padding:20px; border-radius:10px;
      box-shadow:0 0 20px rgba(0,0,0,0.3); width:100%; max-width:500px; box-sizing:border-box;">
      <div style="display:flex; flex-direction:column; gap:10px;">
        <h3>Task Received (Read-Only)</h3>
        <div id="replyTaskDetails" style="background:#f4f4f4; border:1px solid #ddd; border-radius:5px; padding:10px; max-height:200px; overflow-y:auto;">
          </div>
        <label for="replyDateReceived" style="font-weight:bold; margin-top:10px;">Date Received:</label>
        <input type="date" id="replyDateReceived" style="display:block; width:100%; padding:8px;
          border:1px solid #ccc; border-radius:5px; font-size:14px;">
        <div id="replyLoadingIndicator" style="display:none; color:#555; text-align:center;">⏳ Saving...</div>
      </div>
      <div style="margin-top:15px; text-align:right;">
        <button id="saveReplyBtn" style="padding:6px 12px; background:#007bff; color:#fff; border:none; border-radius:5px;">Save Reply</button>
        <button id="cancelReplyBtn" style="padding:6px 12px; background:#ccc; border:none; border-radius:5px;">Cancel</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", replyModalHTML);

// ⭐ NEW: Get references for Reply Modal
const replyModalOverlay = document.getElementById("replyModalOverlay");
const replyTaskDetails = document.getElementById("replyTaskDetails");
const replyDateReceived = document.getElementById("replyDateReceived");
const saveReplyBtn = document.getElementById("saveReplyBtn");
const cancelReplyBtn = document.getElementById("cancelReplyBtn");
const replyLoadingIndicator = document.getElementById("replyLoadingIndicator");

// ⭐ NEW: Add listeners for Reply Modal
cancelReplyBtn.addEventListener("click", () => { replyModalOverlay.style.display = "none"; });
saveReplyBtn.addEventListener("click", saveReply); // New function, see below


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
    setTimeout(fetchTasks, 800); // Manually fetch after adding
  } catch (err) {
    responseMsg.textContent = "❌ Error: " + err.message;
  }
});


// ✅ Fetch all tasks
// ⭐ MODIFIED for non-flicker refresh
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

      // 🧩 Populate "Assigned By" filter dynamically
      const assignedByFilter = document.getElementById("assignedByFilter");
      const currentAssignedBy = assignedByFilter.value; // Save current filter
      const uniqueAssigners = [
        ...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v))
      ];
      
      assignedByFilter.innerHTML = `<option value="All">All</option>` +
        uniqueAssigners.map(v => `<option value="${v}">${v}</option>`).join("");
      
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

// Utility to safely escape HTML
const safe = str => str ? String(str).replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c])) : "";


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

  tasksToShow.forEach((t) => { // 'index' here is from the *filtered* list and is wrong
    
    // 🐞 BUG FIX: Find the *original* index from the master 'allTasks' array
    // This prevents editing/deleting the wrong item when filters are active.
    const originalIndex = allTasks.indexOf(t);
    if (originalIndex === -1) return; // Should not happen, but safe guard

    const div = document.createElement("div");
    div.classList.add("task-item");

    const status = (t["STATUS"] || "Not Started").trim();
    let statusColor = "#999", bgColor = "#fff";
    if (status === "Completed") { statusColor = "#4CAF50"; bgColor = "#e8f5e9"; }
    else if (status === "In Progress") { statusColor = "#FFC107"; bgColor = "#fff9e6"; }
    else if (status === "Not Started") { statusColor = "#F44336"; bgColor = "#fdecea"; }

    div.style.borderLeft = `6px solid ${statusColor}`;
    //       

    const isIT = t.source === "IT";

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
        ${t["DATE RECEIVED"] ? `<span style="margin-left:8px;font-size:12px;color:#007bff;font-weight:bold;">(Received: ${safe(t["DATE RECEIVED"])})</span>` : ""}
      </div>
      ${t["NOTES"] ? `<div class="task-notes">🗒 ${safe(t["NOTES"])}</div>` : ""}
      <div class="task-meta">🕒 ${safe(t["TIMESTAMP"]) || ""}</div>
      <div class="task-actions">
        ${
          isIT
            ? `
              <button class="edit-btn" data-index="${originalIndex}" style="background:#007bff; color:white; padding:8px; border-radius:4px; border:none;">✏️ Edit</button>
              <button class="delete-btn" data-index="${originalIndex}" style="background:#f44336; color:white; padding:8px; border-radius:4px; border:none;">🗑️ Delete</button>
            `
            : `<button class="reply-btn" data-index="${originalIndex}" style="background:#28a745; color:white; padding:8px; border-radius:4px; border:none;">↩️ Reply</button>`
        }
      </div>
    `;

    // ⭐ MODIFIED: Attaching listeners based on new logic
    if (isIT) {
      div.querySelector(".edit-btn").addEventListener("click", (e) => {
        const index = e.target.dataset.index; // This is now the originalIndex
        openEditModal(index, allTasks[index]["STATUS"] || "Not Started", allTasks[index].source);
      });
      div.querySelector(".delete-btn").addEventListener("click", (e) => {
        const index = e.target.dataset.index; // This is now the originalIndex
        deleteTask(index, allTasks[index].source);
      });
    } else {
      // ⭐ NEW: Add listener for the reply button
      div.querySelector(".reply-btn").addEventListener("click", (e) => {
        const index = e.target.dataset.index; // This is now the originalIndex
        openReplyModal(index);
      });
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
  editIndex = index; // index is now the originalIndex
  editStatus.value = currentStatus;
  addRemarks.value = allTasks[index]["NOTES"] || "";
  modalOverlay.dataset.source = source;
  modalOverlay.style.display = "flex";
}

// ⭐ NEW: Open Reply Modal
function openReplyModal(index) {
  replyIndex = index; // index is the originalIndex
  const task = allTasks[index];
  
  // Populate read-only details
  replyTaskDetails.innerHTML = `
    <p><strong>Task:</strong> ${safe(task["TASK NAME"])}</p>
    <p><strong>Assigned By:</strong> ${safe(task["ASSIGNED BY"])}</p>
    <p><strong>Assigned To:</strong> ${safe(task["ASSIGNED TO"])}</p>
    <p><strong>Priority:</strong> ${safe(task["PRIORITY"])}</p>
    <p><strong>Due Date:</strong> ${safe(task["DUE DATE"])}</p>
    <p><strong>Notes:</strong> ${safe(task["NOTES"] || "-")}</p>
  `;
  
  // Set date input to existing value if it exists, or clear it
  replyDateReceived.value = task["DATE RECEIVED"] || "";
  
  replyModalOverlay.style.display = "flex";
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
        rowIndex: allTasks[editIndex].rowIndex, // editIndex is the correct originalIndex
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
    editIndex = null; // Clear index
  }
});

// ⭐ NEW: Save Reply (Date Received)
async function saveReply() {
  if (replyIndex === null) return;
  
  const dateReceived = replyDateReceived.value;
  if (!dateReceived) {
    alert("Please select a 'Date Received'.");
    return;
  }
  
  const task = allTasks[replyIndex];

  replyLoadingIndicator.style.display = "block";
  saveReplyBtn.disabled = true;

  try {
    // Send the "reply" action to the backend
    await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        action: "reply", // <-- NEW ACTION
        rowIndex: task.rowIndex,
        source: task.source, // e.g., "Marketing"
        dateReceived: dateReceived // Send the new date
      })
    });
    replyModalOverlay.style.display = "none";
    fetchTasks(); // Refresh the list to show the new date
  } catch (err) {
    alert("❌ Error saving reply: " + err.message);
  } finally {
    replyLoadingIndicator.style.display = "none";
    saveReplyBtn.disabled = false;
    replyIndex = null; // Clear index
  }
}


// ✅ Delete task
async function deleteTask(index, source) { // index is the originalIndex
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

// ✅ Filters (Listeners are now in renderTasks, but these are for the dropdowns themselves)
document.getElementById("statusFilter").addEventListener("change", renderTasks);
document.getElementById("priorityFilter").addEventListener("change", renderTasks);

// ✅ Load tasks on page load
window.addEventListener("load", fetchTasks);

// ⭐ NEW: Auto-refresh every 1 minute
setInterval(fetchTasks, 60000); // 60,000 milliseconds = 1 minute
