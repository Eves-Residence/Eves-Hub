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
        names: ["Teph Dy"] // No restriction (anyone with password can log in)
    },
    maintenance: {
        password: "evesMaintenance2025",
        names: [] // No restriction (anyone with password can log in)
    },
    accounting: {
        password: "evesAccounting2025",
        names: [] // No restriction (anyone with password can log in)
    }
};

// === LOGIN FUNCTION ===
function login() {
    const dept = document.getElementById("dept").value;
    const accessType = document.getElementById("accessType").value;
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
    if (!accessType) {
        error.textContent = "Please select an access type.";
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

        // --- LOGIN SUCCESS ---
        
        // Save info
        localStorage.setItem("department", dept);
        localStorage.setItem("name", name);
        localStorage.setItem("accessType", accessType);

        // Determine the redirection path
        let redirectPath = "";
        
        if (accessType === "desktop") {
            // Desktop: Absolute path from root
            redirectPath = `/${dept}/index.html`; 
        } else if (accessType === "mobile") {
            // Mobile App: FIXING back to Absolute Path from root (most reliable)
            const mobilePaths = {
                "IT": "mobile_app/it/index.html",
                "secretary": "mobile_app/secretary/index.html",
                "marketing": "mobile_app/marketing/index.html",
                "om": "mobile_app/om/index.html",
                "pr": "mobile_app/pr/index.html",
                "maintenance": "mobile_app/maintenance/index.html",
                "accounting": "mobile_app/accounting/index.html"
            };
            redirectPath = mobilePaths[dept] || ""; 
        }

        // Redirect if a valid path is defined
        if (redirectPath) {
            window.location.href = redirectPath;
        } else if (accessType === "mobile") {
            error.textContent = "Login successful. No specific mobile app path found for this department.";
        }
    } else {
        error.textContent = "Invalid department or password.";
    }
}

// 🎯 NEW FUNCTION: Toggle Password Visibility (Needed if this script is used on a page with a password field)
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');

    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = 'visibility'; // Change icon to open eye
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = 'visibility_off'; // Change icon back to closed eye
        }
    }
}


