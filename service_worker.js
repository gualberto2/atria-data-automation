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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && isTabOfInterest(tab)) {
    // The tab is one we're interested in and it's fully loaded, so inject the content script into it to execute step two...
    chrome.tabs.executeScript(tabId, { file: "newTabScript.js" }, function () {
      // Optional callback to handle after the script is injected
      console.log("Script injected and executed");
    });
  }
});

function isTabOfInterest(tab) {
  // Check the tab's properties, like URL, to see if it's the tab you're interested in
  // Return true if it is, false otherwise
  return tab.url.includes(
    "https://my.advisorlogin.com/secure/proposalapp/#/household"
  ); // Simplified check, you might need more complex logic
}
