// Below is function for autofilling for for example,
function startInjectionProcess() {
  // This function should contain the logic to start the automation process
  // For example, clicking buttons, filling in forms, etc.
  // You can put your steps for opening a new proposal tab here.
  const startProp = document.getElementById("submit_create_nextgen_proposal");
  if (startProp) {
    //Simulate a click on the first button
    startProp.click();
    return true;
  }
  return false;
}

// Below is a listener for a message from the background script...
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectData") {
    const injectionResult = startInjectionProcess(); // Call the injection logic from above once the message is received

    if (injectionResult) {
      sendResponse({ status: "success" });
    } else {
      sendResponse({ status: "error" });
    }
  }
});
