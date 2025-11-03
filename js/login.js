// === login.js ===

// 🔐 Department access credentials
const access = {
  om: {
    password: "superUser",
    names: ["Harry", "Juan", "Teph dy"]
  },
  
  pr: {
    password: "ecorep2025",
    names: ["Marla", "Avy", "Teph dy"]
  },
  marketing: {
    password: "market456",
    names: ["Ever", "Teph dy"]
  },
  secretary: {
    password: "secret",
    names: ["Riza", "Teph dy"]
  },
  IT: {
    password: "hackerboi2499",
    names: [] // No restriction (anyone with password can log in)
  }
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
  if (!name) {
    error.textContent = "Please enter your name.";
    return;
  }
  if (!pass) {
    error.textContent = "Please enter a password.";
    return;
  }

  const deptAccess = access[dept];

  // ✅ Verify department + password + name (case-insensitive)
  if (deptAccess && pass === deptAccess.password) {
    if (
      deptAccess.names.length > 0 &&
      !deptAccess.names.some(
        n => n.toLowerCase() === name.toLowerCase()
      )
    ) {
      error.textContent = "You are not authorized under this department.";
      return;
    }

    // Save info
    localStorage.setItem("department", dept);
    localStorage.setItem("name", name);

    // Redirect to department folder
    window.location.href = `${dept}/index.html`;
  } else {
    error.textContent = "Invalid department or password.";
  }
}
