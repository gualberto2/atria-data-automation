console.log("test script");
// utility functions defined here below:

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

function findElementByAriaLabel(label) {
  return document.querySelector(`[aria-label="${label}"]`);
}

function setInputValueByAriaLabel(label, value) {
  const element = findElementByAriaLabel(label);
  if (element) {
    element.value = value;
  }
}

// Utility functions already defined above...

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "automateData") {
    console.log("Received Excel Data:", message.data);
    // Further processing can be done here
    // Ensure the DOM content is loaded before trying to click the span
    if (document.readyState === "loading") {
      // When loading has not finished yet
      document.addEventListener("DOMContentLoaded", function () {
        const openName = clickSpan(); // call the autoclicker here
        sendResponse({ status: openName ? "success" : "error" });
      });
    } else {
      //DOMContentLoaded already has fired
      const openName = clickSpan(); // Calling the span clicker here...
      sendResponse({ status: openName ? "success" : "error" });
    }
    return true;
  }
});

function processExcelData(data) {
  // Assuming data is an array of objects with keys corresponding to aria labels
  data.forEach((item) => {
    for (const key in item) {
      setInputValueByAriaLabel(key, item[key]); // or setTextByAriaLabel, as appropriate
    }
  });
  // ... any additional processing ...
}
