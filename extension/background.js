chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == 'startComplement') {
        chrome.action.setBadgeText({ text: '...' });
    } else if (message.type == 'receivedComplement') {
        chrome.action.setBadgeText({ text: '' });
    }
});
