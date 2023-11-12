// INJECT.JS **
// This is ran at the my.advisor portal **
// Step 2 in the automation process **

let excelDataFromStorage = null;

chrome.storage.local.get("excelData", function (result) {
  excelDataFromStorage = result.excelData;
  if (!excelDataFromStorage) {
    console.log("excelData not found in storage");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startInjection") {
    if (!excelDataFromStorage) {
      sendResponse({
        status: "error",
        reason: "No excel data found in storage",
      });
      return;
    }
    const injectionResult = startProposal();
    if (injectionResult) {
      sendResponse({ status: "success", data: excelDataFromStorage });
    } else {
      sendResponse({ status: "error" });
    }
  }
});

function startProposal(index) {
  if (!excelDataFromStorage || index >= excelDataFromStorage.length) {
    console.error("Invalid index or excelDataFromStorage not loaded");
    return false;
  }

  const startProp = document.getElementById("submit_create_nextgen_proposal");
  const currentItem = excelDataFromStorage[index];

  if (startProp) {
    startProp.click();

    // Send a message to the background script
    chrome.runtime.sendMessage({
      action: "sendMessageToActiveTab",
      currentItem: currentItem,
    });

    return true;
  }
  return false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startNextProposal") {
    currentIndex = message.currentIndex; // Update the current index
    startProposal(currentIndex);
  }
});
