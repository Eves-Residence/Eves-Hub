// === login.js ===

// 🔐 Department access credentials
const access = {
  PR: "ecorep2025",
  Marketing: "market456",
  Secretary: "secret",
  IT: "hackerboi2499",
};

// === LOGIN FUNCTION ===
function login() {
  const dept = document.getElementById("dept").value;
  const name = document.getElementById("name").value.trim();
  const pass = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  // Reset error
  error.textContent = "";

  // Validation
  if (!dept) {
    error.textContent = "Please select a department.";
    return;
  }
  if (!pass) {
    error.textContent = "Please enter a password.";
    return;
  }

  // ✅ Validate department + password
  if (access[dept] && access[dept] === pass) {
    // Save name and department to localStorage
    localStorage.setItem("department", dept);
    localStorage.setItem("name", name || "User");

    // Redirect to department folder
    window.location.href = `${dept}/index.html`;
  } else {
    error.textContent = "Invalid department name or password.";
  }
}
