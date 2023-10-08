chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.data) {
    // Assuming you have a function to inject data into the website
    const injectionResult = injectDataIntoWebsite(message.data);

    if (injectionResult) {
      sendResponse({ status: "success" });
    } else {
      sendResponse({ status: "error" });
    }
  }
});

// Below is the first steps to start the proposal:
const startProp = document.getElementById("nextgenproposal~popup-intro.0x1");
// Below is a click event listener for the button:
startProp.addEventListener("click", () => {
  // Click button to lightning start prop and open the modal:
  startProp.textContent = "Clicked!";

  // Disable the button:
  startProp.disabled = true;

  // Change the buttons background color:
  startProp.style.backgroundColor = "red";

  // Other manipulations can be added within the startProp function....
});
