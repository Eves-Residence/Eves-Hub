(function() {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwmZ1-k28KAaQl4h5YMmEKz5NjW-1dmQMGE7VKmCZSKWXQ1Qw1VY2axegPwpDBChVQ/exec";

    function initializeHeader() {
        const department = localStorage.getItem("department");
        const name = localStorage.getItem("name");
        
        // Identity logic
        const pathParts = window.location.pathname.split("/");
        const deptFolder = pathParts.find(p => ["admin", "marketing", "maintenance", "housekeeping", "it", "accounting"].includes(p.toLowerCase()));
        
        const deptMap = {
            admin: "Admin Department", marketing: "Marketing Department", maintenance: "Maintenance Department",
            housekeeping: "Housekeeping Department", accounting: "Accounting Department", it: "IT Department"
        };

        const deptElement = document.getElementById("dept-name");
        if (deptElement) {
            const deptTitle = deptMap[deptFolder?.toLowerCase()] || (department ? department.toUpperCase() + " Department" : "Department");
            deptElement.innerHTML = `${deptTitle} | <span id="user" class="font-normal text-gray-400">${name || "User"}</span>`;
        }

        // Sidebar Controls
        const btn = document.getElementById("notifBtn");
        const overlay = document.getElementById("notifOverlay");
        const sidebar = document.getElementById("notifSidebar");

        if (btn) {
            btn.onclick = () => {
                overlay.classList.remove("hidden");
                // Small delay to trigger CSS transition
                setTimeout(() => {
                    sidebar.classList.remove("sidebar-hidden");
                    sidebar.classList.add("sidebar-visible");
                }, 10);
                loadNotifications();
            };
        }

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) closeNotifSidebar();
        };

        loadNotifications();
    }

    window.loadNotifications = async function() {
        const list = document.getElementById('notif-list');
        const badge = document.getElementById('notifCount');

        try {
            const res = await fetch(`${WEB_APP_URL}?action=getNotifications`);
            const data = await res.json();

            if (badge) {
                badge.textContent = data.length;
                data.length > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
            }

            if (data.length === 0) {
                list.innerHTML = `<p class="p-10 text-center text-gray-400 italic text-sm font-medium">No new notifications</p>`;
            } else {
                list.innerHTML = data.map(n => `
                    <div class="p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer">
                        <strong class="text-blue-600 font-bold text-[10px] uppercase tracking-wider">${n.type || 'Update'}</strong>
                        <p class="text-gray-700 text-sm leading-snug my-1">${n.message}</p>
                        <span class="text-gray-400 text-[10px] font-medium">${new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error("Fetch failed", err);
        }
    };

    window.closeNotifSidebar = function() {
        const overlay = document.getElementById("notifOverlay");
        const sidebar = document.getElementById("notifSidebar");
        
        sidebar.classList.remove("sidebar-visible");
        sidebar.classList.add("sidebar-hidden");
        
        // Hide overlay after animation finishes
        setTimeout(() => {
            overlay.classList.add("hidden");
        }, 300);
    };

    // Watchdog
    const watchdog = setInterval(() => {
        if (document.getElementById("dept-name")) {
            initializeHeader();
            clearInterval(watchdog);
        }
    }, 100);
})();
