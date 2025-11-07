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
            // Desktop: Redirects to the department's main index file
            redirectPath = `${dept}/index.html`;
        } else if (accessType === "mobile") {
            // Mobile App: Path lookup based on department
            const mobilePaths = {
                "IT": "../mobile_app/it/mobile_it.html",
                "secretary": "../mobile_app/secretary/mobile_secretary.html",
                "marketing": "../mobile_app/marketing/mobile_marketing.html",
                "om": "../mobile_app/om/mobile_om.html",
                "pr": "../mobile_app/pr/mobile_pr.html",
            };
            // Set the path from the map, using the selected department code (e.g., 'om')
            redirectPath = mobilePaths[dept] || ""; 
        }

        // Redirect if a valid path is defined
        if (redirectPath) {
            window.location.href = redirectPath;
        } else if (accessType === "mobile") {
            // Fallback for mobile if a department path is missing
            error.textContent = "Login successful. No specific mobile app path found for this department.";
        }
    } else {
        error.textContent = "Invalid department or password.";
    }
}

