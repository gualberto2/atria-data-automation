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
