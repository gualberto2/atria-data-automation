chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Below I am defining all the url paths in the SPA for ENVESTNET form....
  const targetUrls = [
    "https://my.advisorlogin.com/secure/proposalapp/#/household",
    "https://my.advisorlogin.com/secure/proposalapp/#/riskAndObjective",
    "https://my.advisorlogin.com/secure/proposalapp/#/strategies",
    "https://my.advisorlogin.com/secure/proposalapp/#/accountSetup",
    "https://my.advisorlogin.com/secure/proposalapp/#/fees",
    "https://my.advisorlogin.com/secure/proposalapp/#/overview",
  ];

  // Check if any of the URLs is in the updated tab's URL
  const isTargetUrl = tab.url
    ? targetUrls.some((part) => tab.url.includes(part))
    : false;
  if (changeInfo.status === "complete" && isTargetUrl) {
    // Inject the new content script to finish the automation process?
    chrome.tabs.executeScript(
      tabId, // target the specific tab
      { file: "newTabScript.js" },
      function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        // Here, the script has been injected, and you can send a message if needed.
        chrome.tabs.sendMessage(tabId, {
          action: "automateData",
          data: {
            // Data goes here. This could be anything needed to pass to the content script.
          },
        });
      }
    );
  }
});
