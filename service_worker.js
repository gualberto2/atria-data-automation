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
    // Below I will be retreiving the stored and parsed excel data...
    chrome.storage.local.get("excelData", function (data) {
      if (chrome.runtime.lastError) {
        console.error("Error retreiving the data:", chrome.runtime.lastError);
        return;
      }
      const excelData = data.excelData; // extracted data right here...
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["newTabScript.js"],
        },
        (injectionResults) => {
          for (const frameResult of injectionResults) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              return;
            }
            console.log("script injected test");
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, {
                action: "automateData",
                data: excelData, // Passing the excelData here to newTabScript.js
              });
            }, 2000); // A 2 second delay
          }
        }
      );
    });
  }
});
