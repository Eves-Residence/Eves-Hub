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

// 🎯 FIX: Calculate the base repository path dynamically for GitHub Pages deployments.
function getBasePath() {
    // Get the path part of the URL (e.g., '/repository-name/index.html')
    const path = window.location.pathname;
    
    // Split the path and filter out empty strings (like the leading '/')
    const segments = path.split('/').filter(Boolean);
    
    // If hosted at the root domain (e.g., user.github.io), segments is empty.
    if (segments.length === 0 || path.endsWith('/')) {
        return '/'; 
    }
    
    // If hosted as a project page (e.g., user.github.io/repo-name/index.html)
    // The first segment is the repository name. We return it with surrounding slashes.
    // Example: path='/repo-name/index.html' -> segments=['repo-name', 'index.html']
    // We only need '/repo-name/'
    if (segments.length > 0) {
        // Return '/repo-name/'
        return '/' + segments[0] + '/';
    }

    return '/'; // Default to root
}

const BASE_REPO_PATH = getBasePath();
// Example BASE_REPO_PATH might be '/' or '/Eves-Residence/'

// --- LOGIN FUNCTION ---
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

        // Determine the redirection path (Relative path from deployment root)
        let finalSegmentPath = "";
        
        if (accessType === "desktop") {
            // Path: dept/index.html
            finalSegmentPath = `${dept}/index.html`; 
        } else if (accessType === "mobile") {
            // Mobile App: Path lookup based on department (mobile_app/dept/index.html)
            const mobilePaths = {
                "IT": "mobile_app/it/index.html",
                "secretary": "mobile_app/secretary/index.html",
                "marketing": "mobile_app/marketing/index.html",
                "om": "mobile_app/om/index.html",
                "pr": "mobile_app/pr/index.html",
            };
            finalSegmentPath = mobilePaths[dept] || ""; 
        }

        // 🎯 FINAL REDIRECT: Use the calculated base path + the final segment path.
        if (finalSegmentPath) {
            // Construct full path, ensuring no double slashes if the base path ends in one.
            const redirectPath = BASE_REPO_PATH + finalSegmentPath.replace(/^\//, '');
            window.location.href = redirectPath;
        } else if (accessType === "mobile") {
            error.textContent = "Login successful. No specific mobile app path found for this department.";
        }
    } else {
        error.textContent = "Invalid department or password.";
    }
}
