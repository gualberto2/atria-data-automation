console.log("test script");
//Utility functions defined here below:

function clickSpan() {
  let success = false; // flag to indicate if click was successful
  let spans = document.querySelectorAll("span");
  spans.forEach((span) => {
    if (span.textContent.includes("Create a new household")) {
      // Create a new mouse event
      let event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      // Dispatch the event on the target element...
      span.dispatchEvent(event);
      success = true;
    }
  });
  return success; // Return the status
}

function setInputValueByAriaLabel(label, value) {
  const element = findElementByAriaLabel(label);
  if (element) {
    element.value = value;
  }
}

function findElementByAriaLabel(label) {
  return document.querySelector(`[aria-label="${label}"]`);
}

function setupMutationObserver(data) {
  // Select the node that will be observed for mutations
  const targetNode = document.body; //Assuming that we want to observe the entire body for changes....
  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subTree: true };
  // Callback function to execute when mutations are observed
  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Check if the added node is the modal or contains the modal
        // You might need to adjust the condition based on your modal's characteristics
        if (mutation.target.querySelector(".modal-draggable-handle")) {
          console.log("Modal detected!"); // Confirming modal detection
          // Replace '.modal-selector' with an actual selector for your modal
          processExcelData(data);
          observer.disconnect(); // Stop observing after successful data injection..
        }
      }
    }
  };
  //Create an instance of the observer with the callback function
  const observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}
// Utility functions defined above...

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "automateData") {
    console.log("Received Excel Data:", message.data);
    // Further processing can be done here
    // Ensure the DOM content is loaded before trying to click the span
    if (document.readyState === "loading") {
      // When loading has not finished yet
      document.addEventListener("DOMContentLoaded", function () {
        const openName = clickSpan(); // call the autoclicker here
        setupMutationObserver(message.data);
        sendResponse({ status: openName ? "success" : "error" });
      });
    } else {
      //DOMContentLoaded already has fired
      const openName = clickSpan(); // Calling the span clicker here...
      setupMutationObserver(message.data);
      sendResponse({ status: openName ? "success" : "error" });
    }
    return true;
  }
});

function processExcelData(data) {
  console.log("Processing data", data);
  // Check if data is an array and has the required index
  if (Array.isArray(data) && data.length > 29) {
    const formData = data[29]; // For example, using the 30th item in the array
    const clientTitle = data.CLIENT_TITLE || "Default Title"; // Fallback value
    const firstName = data.FIRST_NAME || "Default Name"; // Fallback value for name
    setInputValueByAriaLabel("Enter household name", clientTitle);
    setInputValueByAriaLabel("First name", firstName);
  } else {
    console.error("Invalid data format or index out of bounds");
  }
  // Additional processing...
}
