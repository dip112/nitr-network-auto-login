document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const saveButton = document.getElementById('saveBtn');
  const clearButton = document.getElementById('clearBtn');
  const triggerButton = document.getElementById('triggerBtn');
  const statusBox = document.getElementById('status-box');
  const netStatus = document.getElementById('net-status');

  // 1. Live Network Status Check
  if (navigator.onLine) {
    netStatus.textContent = "🟢 Connected to Internet";
    netStatus.style.backgroundColor = "#e6f4ea";
    netStatus.style.color = "#137333";
  } else {
    netStatus.textContent = "🔴 Disconnected / Portal Active";
    netStatus.style.backgroundColor = "#fce8e6";
    netStatus.style.color = "#c5221f";
  }

  // 2. Load saved credentials
  chrome.storage.local.get(['campusUser', 'campusPass'], (data) => {
    if (data.campusUser) usernameInput.value = data.campusUser;
    if (data.campusPass) passwordInput.value = data.campusPass;
  });

  // 3. Password visibility toggle
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
  });

  // 4. Save credentials action
  saveButton.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    chrome.storage.local.set({ campusUser: user, campusPass: pass }, () => {
      statusBox.textContent = "✓ Credentials Saved!";
      statusBox.style.display = "block";
      setTimeout(() => { statusBox.style.display = "none"; }, 2000);
    });
  });

  // 5. Clear credentials action
  clearButton.addEventListener('click', () => {
    chrome.storage.local.remove(['campusUser', 'campusPass'], () => {
      usernameInput.value = "";
      passwordInput.value = "";
      statusBox.textContent = "🗑️ Data Cleared!";
      statusBox.style.display = "block";
      setTimeout(() => { statusBox.style.display = "none"; }, 2000);
    });
  });

  // 6. Manual Trigger Login Action
  triggerButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "manual_trigger" }, (response) => {
        statusBox.textContent = "⚡ Triggering Login Script...";
        statusBox.style.display = "block";
        setTimeout(() => { statusBox.style.display = "none"; }, 2000);
      });
    }
  });
});
