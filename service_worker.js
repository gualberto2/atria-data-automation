chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "startInjection") {
    // Perform any necessary background tasks
    // You can also forward the message to other scripts if needed.
    // For example, you can forward it to your content script:
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, message, sendResponse);
    });
  }
});
