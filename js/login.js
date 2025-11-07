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

// 🎯 CRITICAL FIX: Robustly determine the GitHub Pages repository path.
function getBasePath() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // 1. If hosted on a root domain (like user.github.io or a custom domain)
    if (hostname.endsWith('.github.io') && pathname.length <= 1) {
        return '/';
    }
    
    // 2. If hosted as a project page (e.g., user.github.io/repository-name)
    // The first path segment is the repository name.
    const pathSegments = pathname.split('/').filter(s => s.length > 0);
    
    if (pathSegments.length > 0) {
        // Return /repository-name/
        return '/' + pathSegments[0] + '/';
    }

    return '/';
}

const BASE_REPO_PATH = getBasePath();

// --- LOGIN FUNCTION ---
function login() {
    const dept = document.getElementById("dept").value;
    const accessType = document.getElementById("accessType").value;
    const name = document.getElementById("name").value.trim();
    const pass = document.getElementById("password").value.trim();
    const error = document.getElementById("error");

    // Reset error
    error.textContent = "";

    // Validation checks remain the same...

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
        let redirectRelativePath = "";
        
        if (accessType === "desktop") {
            // Path: dept/index.html
            redirectRelativePath = `${dept}/index.html`; 
        } else if (accessType === "mobile") {
            // Mobile App: Path lookup (mobile_app/dept/index.html)
            const mobilePaths = {
                "IT": "mobile_app/it/index.html",
                "secretary": "mobile_app/secretary/index.html",
                "marketing": "mobile_app/marketing/index.html",
                "om": "mobile_app/om/index.html",
                "pr": "mobile_app/pr/index.html",
            };
            redirectRelativePath = mobilePaths[dept] || ""; 
        }

        // 🎯 FINAL REDIRECT: Prepend the calculated Base Repository Path.
        if (redirectRelativePath) {
            // Ensure no double slashes (e.g., //) if the base path is just '/'
            let pathSegment = redirectRelativePath;
            if (pathSegment.startsWith('/')) {
                pathSegment = pathSegment.substring(1);
            }
            
            const finalRedirectUrl = BASE_REPO_PATH + pathSegment;

            window.location.href = finalRedirectUrl;
        } else if (accessType === "mobile") {
            error.textContent = "Login successful. No specific mobile app path found for this department.";
        }
    } else {
        error.textContent = "Invalid department or password.";
    }
}
