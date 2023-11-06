// INJECT.JS **
// This is ran at the my.advisor portal **
// Step 2 in the automation process **

function getExcelDataFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("excelData", (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result.excelData);
    });
  });
}

// Usage:
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "startInjection") {
    try {
      const excelDataFromStorage = await getExcelDataFromStorage();
      if (!excelDataFromStorage) {
        sendResponse({
          status: "error",
          reason: "No excel data found in storage",
        });
        return;
      }
      // ...rest of your code...
    } catch (error) {
      console.error(error);
      sendResponse({
        status: "error",
        reason: "Failed to retrieve storage data",
      });
    }
  }
});

// The first step in injection process
function startProposal() {
  // Declaration for the start proposal button on my.advisor portal (id for button is static)
  const startProp = document.getElementById("submit_create_nextgen_proposal");

  // if start prop exists
  if (startProp) {
    // Clicks the startProp button
    startProp.click();
    // return true - needed for async response
    return true;
  }
  // No else statement, if startProp is not true (button does not exist)
  // then it will always return false.
  // Possible that id changed if this is the case.
  return false;
}
