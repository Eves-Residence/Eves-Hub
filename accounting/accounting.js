//// WORKING AS OF 12/13/2025
// ==========================================
// 1. IFRAME SWITCHER WITH LOADING SCREEN
// ==========================================
function changeFrame(type, element) {
    const iframe = document.getElementById("mainFrame");
    const loader = document.getElementById("loading-overlay");
    const sectionIframe = document.getElementById("section-iframe");
    const sectionCalendar = document.getElementById("section-calendar");
    const sectionTask = document.getElementById("section-task");

    // Unified "Single Function" Toggle
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
// 2. ACCOUNTING TASK MANAGER LOGIC
// ==========================================
const scriptURL = "https://script.google.com/macros/s/AKfycbxnXQyBpfnesmJvFBs0vWvRnIZIvXrGpP1D3Nc5TWM4VWJSdd32kQGNeVTiV5IHwTIi/exec";
const form = document.getElementById("todo-form");
const taskList = document.getElementById("taskList");
const responseMsg = document.getElementById("response");

let allTasks = [];
let editIndex = null;

// ✅ INJECT DYNAMIC FILTER HEADER
const filterContainer = document.createElement("div");
filterContainer.className = "filter-container";
filterContainer.style.cssText = "background:#fff; padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid #eee;";
filterContainer.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
    <p style="margin:0; font-weight:700; color:#1a202c;">Filter Dashboard</p>
    <div style="display:flex; gap:8px;">
      <button id="applyFilter" style="background:#3182ce; color:white; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:12px;">Apply</button>
      <button id="clearFilter" style="background:#edf2f7; color:#4a5568; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:12px;">Clear</button>
    </div>
  </div>
  <div style="display:flex; gap:10px; flex-wrap:wrap;">
    <select id="statusFilter" style="padding:5px; border-radius:6px; border:1px solid #cbd5e0; font-size:12px;"><option value="All">All Status</option><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select>
    <select id="priorityFilter" style="padding:5px; border-radius:6px; border:1px solid #cbd5e0; font-size:12px;"><option value="All">All Priority</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
    <select id="assignedByFilter" style="padding:5px; border-radius:6px; border:1px solid #cbd5e0; font-size:12px;"><option value="All">All Departments</option></select>
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

// Fetch Tasks (30s Flicker-Free)
async function fetchTasks() {
    if (allTasks.length === 0) taskList.innerHTML = "<p>Loading tasks...</p>";
    try {
        const res = await fetch(scriptURL);
        const text = await res.text();
        const jsonMatch = text.match(/\{.*\}|\[.*\]/s);
        const newTasks = JSON.parse(jsonMatch[0]);

        if (JSON.stringify(allTasks) !== JSON.stringify(newTasks)) {
            allTasks = newTasks;
            
            // Populate Dynamic Assigned By List
            const aFilter = document.getElementById("assignedByFilter");
            const current = aFilter.value;
            const depts = [...new Set(allTasks.map(t => (t["ASSIGNED BY"] || "").trim()).filter(v => v))];
            aFilter.innerHTML = `<option value="All">All Departments</option>` + depts.map(d => `<option value="${d}">${d}</option>`).join("");
            aFilter.value = [...aFilter.options].some(o => o.value === current) ? current : "All";

            renderTasks();
        }
    } catch (err) { console.error("Refresh failed:", err); }
}

// Render Tasks (Horizontal Scroll Cards)
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

        // ✅ PERMISSION LOCK: Only edit if source is Accounting
        const canEdit = String(t.source || "").trim().toLowerCase() === "accounting";

        const div = document.createElement("div");
        div.style.cssText = `background:#fff; border-radius:12px; border-left:8px solid ${color}; width:300px; height:330px; flex-shrink:0; display:flex; flex-direction:column; box-shadow:0 4px 12px rgba(0,0,0,0.06); white-space:normal;`;

        div.innerHTML = `
          <div style="padding:15px; flex:1; overflow:hidden; display:flex; flex-direction:column; gap:8px;">
            <div style="font-weight:700; color:#2d3748;">${safe(t["TASK NAME"])}</div>
            <div style="background:${color}; color:#fff; padding:2px 10px; border-radius:20px; font-size:10px; font-weight:bold; width:fit-content;">${status}</div>
            <div style="flex:1; overflow-y:auto; font-size:13px; background:#f7fafc; padding:10px; border-radius:6px; color:#4a5568;">
               🗒 ${safe(t["NOTES"] || "-")}
            </div>
            <div style="font-size:11px; color:#a0aec0;">Source: ${safe(t.source || "Unknown")}</div>
          </div>
          <div style="padding:10px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#fafafa; border-radius:0 0 12px 0;">
             <span style="font-size:10px; color:#aaa;">🕒 ${safe(t["TIMESTAMP"])}</span>
             <div style="display:flex; gap:5px;">
                ${canEdit ? `
                  <button onclick="openEditModal(${originalIndex})" style="padding:4px 8px; font-size:11px; background:#3182ce; color:#fff; border:none; border-radius:4px; cursor:pointer;">Edit</button>
                  <button onclick="deleteTask(${originalIndex})" style="padding:4px 8px; font-size:11px; background:#e53e3e; color:#fff; border:none; border-radius:4px; cursor:pointer;">Del</button>
                ` : `
                  <button style="padding:4px 8px; font-size:11px; background:#cbd5e0; color:#4a5568; border:none; border-radius:4px; cursor:not-allowed;">Read-Only</button>
                `}
             </div>
          </div>
        `;
        taskList.appendChild(div);
    });
}

// ... Modal & Form Handlers (Save/Delete/Submit) using rowIndex ...
function openEditModal(index) {
    editIndex = index;
    document.getElementById("editStatus").value = allTasks[index]["STATUS"] || "Not Started";
    document.getElementById("addRemarks").value = allTasks[index]["NOTES"] || "";
    document.getElementById("modalOverlay").style.display = "flex";
}

document.getElementById("saveEditBtn").onclick = async () => {
    const status = document.getElementById("editStatus").value;
    const notes = document.getElementById("addRemarks").value.trim();
    document.getElementById("loadingIndicator").style.display = "block";
    try {
        await fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({ action: "update", rowIndex: allTasks[editIndex].rowIndex, status, notes, source: allTasks[editIndex].source })
        });
        document.getElementById("modalOverlay").style.display = "none";
        fetchTasks();
    } catch (e) { alert("Error updating"); }
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
setInterval(fetchTasks, 30000); // 30s Auto-Refresh
