////WORKING AS 0F 21/10/2025
// ===============================
// IFRAME SWITCHER
// ===============================
function changeFrame(type) {
  const iframe = document.getElementById("mainFrame");

  iframe.style.opacity = 0;
  iframe.style.display = "none";

  let newSrc = "";
  switch (type) {
    case "master":
      newSrc = "https://docs.google.com/spreadsheets/d/15ouIKyyo1pfegl7oMxUgNgy_36JPb87Ta4JGxgws5HI/edit?usp=sharing";
      break;
      
    case "search":
      newSrc = "https://tephdy.github.io/WEB-APP/";
      break;

    case "waitlist":
      newSrc = "https://docs.google.com/spreadsheets/d/1S2v43l75aC6EpyCkXNifSfFYvuXE_XJ9HPcr0RDyhtg/edit?usp=sharing";
      break;

    case "bnb":
      newSrc = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing";
      break;

    case "vacancy":
      newSrc = "https://docs.google.com/spreadsheets/d/1Z_3YqO4ve0TvbkV4Lrg6X9utii7EswQiwnczFcAKvsI/edit?usp=sharing";
      break;

    case "calendar":
      newSrc = "https://calendar.google.com/calendar/embed?src=f8939355c05bdafed63e7eb02789566c7ebe844c36005d3ce552d4d2fd6cba16%40group.calendar.google.com&ctz=Asia%2FManila";
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

    case "bnb_dates":
      newSrc = "https://calendar.google.com/calendar/embed?src=00c9b4f66e0573f992bb911bb11ddc608ccb021f2be44fa6cfdc633de1463f82%40group.calendar.google.com&ctz=Asia%2FManila";
      break;
   
    default:
      newSrc = "https://tephdy.github.io/WEB-APP/";
  }

  setTimeout(() => {
    iframe.src = newSrc;
    if (newSrc.trim() !== "") iframe.style.display = "block";

    iframe.onload = () => {
      iframe.style.transition = "opacity 0.4s ease";
      iframe.style.opacity = 1;
    };
  }, 200);
}



// ✅ TASK MANAGER — FIXED FILTER
// ✅ WORKING AS OF 21/10/2025 WITH "Assign To" AND "addRemarks"

const scriptURL = "https://script.google.com/macros/s/AKfycbzPMrL6aWDR03ylZ3kHnB-w0F0MkPUIpAM6bwxdT0wgYrICCY52cc9FThMRpx7-7VNEXQ/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;


// ✅ Create filter UI (NO UI CHANGES)
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


// ✅ FILTER EVENTS
const filterBtn = filterContainer.querySelector("#filterBtn");
const filterMenu = filterContainer.querySelector(".filter-menu");
const statusFilter = filterContainer.querySelector("#statusFilter");
const priorityFilter = filterContainer.querySelector("#priorityFilter");
const assignedByFilter = filterContainer.querySelector("#assignedByFilter");
const applyFilterBtn = filterContainer.querySelector("#applyFilter");
const clearFilterBtn = filterContainer.querySelector("#clearFilter");

filterBtn.addEventListener("click", () => {
  filterMenu.classList.toggle("active");
});

applyFilterBtn.addEventListener("click", () => {
  filterMenu.classList.remove("active");
  renderTasks();
});

clearFilterBtn.addEventListener("click", () => {
  statusFilter.value = "All";
  priorityFilter.value = "All";
  assignedByFilter.value = "All";
  filterMenu.classList.remove("active");
  renderTasks();
});

statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
assignedByFilter.addEventListener("change", renderTasks);


// ✅ Modal UI (unchanged)
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
        <button id="saveEditBtn" style="padding:6px 12px; background:#4CAF50; color:white;">Save</button>
        <button id="cancelEditBtn" style="padding:6px 12px; background:#ccc;">Cancel</button>
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


// ✅ FORM SUBMIT
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

  responseMsg.textContent = "⏳ Saving...";

  await fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: JSON.stringify(task)
  });

  responseMsg.textContent = "✅ Saved!";
  setTimeout(() => (responseMsg.textContent = ""), 3000);

  form.reset();
  setTimeout(fetchTasks, 500);
});


// ✅ FETCH TASKS (with ALL departments in Assigned By)
async function fetchTasks() {
  taskList.innerHTML = "<p>Loading tasks...</p>";

  try {
    const res = await fetch(scriptURL);
    const text = await res.text();
    const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
    allTasks = JSON.parse(jsonMatch[0]);

    // ✅ Default departments ALWAYS included
    const defaultDepartments = [
      "Marketing",
      "Secretary",
      "Property Representative",
      "IT"
    ];

    // ✅ Get departments from sheet
    const sheetDepartments = [
      ...new Set(
        allTasks
          .map(t => (t["ASSIGNED BY"] || "").trim())
          .filter(v => v !== "")
      )
    ];

    // ✅ Merge & remove duplicates
    const mergedList = [...new Set([...defaultDepartments, ...sheetDepartments])];

    // ✅ Sort alphabetically
    mergedList.sort();

    // ✅ Update filter dropdown
    assignedByFilter.innerHTML =
      `<option value="All">All</option>` +
      mergedList.map(d => `<option value="${d}">${d}</option>`).join("");

    renderTasks();

  } catch (err) {
    taskList.innerHTML = `<p>⚠️ Error loading tasks</p>`;
  }
}


// ✅ RENDER TASKS
function renderTasks() {
  let data = allTasks;

  const s = statusFilter.value;
  const p = priorityFilter.value;
  const a = assignedByFilter.value;

  if (s !== "All") data = data.filter(t => (t["STATUS"] || "").trim() === s);
  if (p !== "All") data = data.filter(t => (t["PRIORITY"] || "").trim() === p);
  if (a !== "All") data = data.filter(t => (t["ASSIGNED BY"] || "").trim() === a);

  taskList.innerHTML = "";

  if (!data.length) {
    taskList.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  data.forEach((t, index) => {
    const div = document.createElement("div");
    div.classList.add("task-item");

    const status = (t["STATUS"] || "").trim();
    let color = "#888", bg = "#fff";

    if (status === "Completed") { color = "#4CAF50"; bg = "#e8f5e9"; }
    if (status === "In Progress") { color = "#FFC107"; bg = "#fff9e6"; }
    if (status === "Not Started") { color = "#F44336"; bg = "#fdecea"; }

    div.style.borderLeft = `6px solid ${color}`;
    div.style.background = bg;

    div.innerHTML = `
      <div class="task-header">${t["TASK NAME"] || ""}</div>
      <div class="task-meta">
        <b>Priority:</b> ${t["PRIORITY"]} |
        <b>Assigned By:</b> ${t["ASSIGNED BY"]} |
        <b>Assigned To:</b> ${t["ASSIGNED TO"]} |
        <b>Due:</b> ${t["DUE DATE"]} |
        <b>Status:</b> <span style="color:${color};font-weight:bold">${status}</span>
      </div>
      ${t["NOTES"] ? `<div class="task-notes">🗒 ${t["NOTES"]}</div>` : ""}
      <div class="task-meta">🕒 ${t["TIMESTAMP"]}</div>

      <div class="task-actions">
        <button class="edit-btn" data-index="${index}">✏️ Edit</button>
        <button class="delete-btn" data-index="${index}">🗑️ Delete</button>
      </div>
    `;

    div.querySelector(".edit-btn").addEventListener("click", () => openEditModal(index));
    div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(index));

    taskList.appendChild(div);
  });
}


// ✅ Open edit modal
function openEditModal(index) {
  editIndex = index;
  editStatus.value = allTasks[index]["STATUS"] || "Not Started";
  addRemarks.value = allTasks[index]["NOTES"] || "";
  modalOverlay.style.display = "flex";
}

cancelEditBtn.addEventListener("click", () => modalOverlay.style.display = "none");


// ✅ Save edit
saveEditBtn.addEventListener("click", async () => {
  const status = editStatus.value;
  const remarks = addRemarks.value.trim();

  loadingIndicator.style.display = "block";

  await fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: JSON.stringify({
      action: "update",
      rowIndex: editIndex,
      status,
      notes: remarks
    })
  });

  modalOverlay.style.display = "none";
  loadingIndicator.style.display = "none";

  fetchTasks();
});


// ✅ Delete task
async function deleteTask(index) {
  if (!confirm("Delete task?")) return;

  await fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: JSON.stringify({ action: "delete", rowIndex: index })
  });

  fetchTasks();
}


// ✅ Load tasks on page load
window.addEventListener("load", fetchTasks);



