// NEWTABSCRIPT.JS **
// Step 4: running the scripts for the new tab **

// _DEV USE ONLY
// Just to confirm its running n shit
console.log("New tab script running!");
// utility functions defined here below:

//Clicks a certain button that says "Create household"
function clickSpan() {
  let success = false; // flag to indicate if click was successful
  // let wasClicked = false;  // Boolean to track if the desired span was clicked. another way of reading above^

  // Fetch all span elements in the document.
  let spans = document.querySelectorAll("span");

  // Loop through each span and click if it matches the desired text.
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
      success = true; // Return whether the desired span was clicked or not.
    }
  });
  return success; // Return the status
}

// Helper function to fetch an element by its aria-label attribute.
function findElementByAriaLabel(label) {
  return document.querySelector(`[aria-label="${label}"]`);
}

// Set input value based on its aria-label attribute.
function setInputValueByAriaLabel(label, value) {
  const element = findElementByAriaLabel(label);
  if (element) {
    element.value = value;
  }
}

// Utility functions already defined above...

// Listener to act upon receiving messages from the Chrome extension.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "automateData") {
    console.log("Received Excel Data:", message.data);

    // Ensure webpage content (DOM) is fully loaded before taking action.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        const actionStatus = clickSpan();
        sendResponse({ status: actionStatus ? "success" : "error" });
      });
    } else {
      const actionStatus = clickSpan();
      sendResponse({ status: actionStatus ? "success" : "error" });
    }
    return true;
  }
});

// Process the provided Excel data to fill input fields.
function processExcelData(data) {
  // Assuming data is an array of objects with keys corresponding to aria labels
  data.forEach((item) => {
    for (const key in item) {
      setInputValueByAriaLabel(key, item[key]); // or setTextByAriaLabel, as appropriate
    }
  });
  //......
}
