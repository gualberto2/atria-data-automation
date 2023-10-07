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

//Injection function here:
function injectDataIntoWebsite(data) {
  // Use JavaScript to interact with the website's DOM and inject data as needed
  // For example, fill out form fields, click buttons, etc.
  // Example:
  const inputField = document.getElementById("fileinput");
  if (inputField) {
    inputField.value = data.someValue;
    return true;
  }
  return false;
}
