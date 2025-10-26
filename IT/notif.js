const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwthD5GNWum_mbuLOKPZdjTogdRx5kowT_p4HFCeCV4QOStMuDoyNscebyxFwsymbav/exec";

async function loadNotifications() {
  try {
    const res = await fetch(`${WEB_APP_URL}?action=getNotifications`);
    const data = await res.json();

    const unreadCount = data.length || 0;
    const notifContainer = document.querySelector('.notification-container');
    const notifCount = notifContainer.querySelector('.notification-count');
    const notifList = document.getElementById('notif-list');

    notifContainer.setAttribute('data-count', unreadCount);
    notifCount.textContent = unreadCount;

    if (data.length === 0) {
      notifList.innerHTML = `<p class="empty">No new notifications</p>`;
    } else {
      notifList.innerHTML = data.map(n => `
        <div class="notif-item">
          <strong>${n.type}</strong>
          <p>${n.message}</p>
          <span class="notif-time">${new Date(n.timestamp).toLocaleString()}</span>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error("Notification fetch failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadNotifications);