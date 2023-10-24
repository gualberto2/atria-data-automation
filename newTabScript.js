console.log("test script");

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
  return success; // return the status
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("received a message", message);
  if (message.action === "automateData") {
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
