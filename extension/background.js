chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == 'startImplement') {
        chrome.action.setBadgeText({ text: '...' });
    } else if (message.type == 'receivedImplement') {
        chrome.action.setBadgeText({ text: '' });
    }
});
