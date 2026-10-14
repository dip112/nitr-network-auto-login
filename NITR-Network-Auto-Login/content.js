const SELECTORS = {
    username: "#LoginUserPassword_auth_username",
    password: "#LoginUserPassword_auth_password",
    submitButton: "#UserCheck_Login_Button"
};

// Helper function to simulate a realistic keyboard press event
function simulateTyping(element, value) {
    element.value = value;
    
    // Dispatch standard events so Check Point registers the text input changes
    const eventOptions = { bubbles: true, cancelable: true };
    element.dispatchEvent(new Event('input', eventOptions));
    element.dispatchEvent(new Event('change', eventOptions));
    
    // Simulate keyboard event for validation scripts
    const keyEvent = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        ...eventOptions
    });
    element.dispatchEvent(keyEvent);
}

function performPortalInjection(targetDocument) {
    const userField = targetDocument.querySelector(SELECTORS.username);
    const passField = targetDocument.querySelector(SELECTORS.password);
    const logInButton = targetDocument.querySelector(SELECTORS.submitButton);

    if (userField && passField && logInButton) {
        chrome.storage.local.get(['campusUser', 'campusPass'], (data) => {
            const savedUser = data.campusUser;
            const savedPass = data.campusPass;

            if (!savedUser || !savedPass) return;

            // Simulate natural typing for both inputs
            simulateTyping(userField, savedUser);
            simulateTyping(passField, savedPass);

            console.log("[Auto-Login] Event chain dispatched. Ready to submit...");

            // Small delay to allow the inputs to be safely registered by the portal script
            setTimeout(() => {
                logInButton.click();
                
                // Auto-close tab handler after 15 seconds if online
                setTimeout(() => {
                    if (navigator.onLine) {
                        chrome.runtime.sendMessage({ action: "close_tab" });
                    }
                }, 30000);

            }, 600);
        });
        return true;
    }
    return false;
}

function scanAndExecute() {
    if (performPortalInjection(document)) return;

    // Scan any nested sub-frames safely
    const frames = document.querySelectorAll('iframe');
    for (let i = 0; i < frames.length; i++) {
        try {
            const frameDoc = frames[i].contentDocument || frames[i].contentWindow.document;
            if (frameDoc && performPortalInjection(frameDoc)) return;
        } catch (e) {
            // Suppress cross-origin frame access errors
        }
    }
}

// Keep scanning the page at regular intervals until elements match
const executionInterval = setInterval(scanAndExecute, 1000);
setTimeout(() => clearInterval(executionInterval), 30000);

window.addEventListener('load', scanAndExecute);

// Handle the manual button click from the extension panel interface
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "manual_trigger") {
        scanAndExecute();
        sendResponse({ success: true });
    }
    return true;
});
