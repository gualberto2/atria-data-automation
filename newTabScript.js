// // This is a file specific for auto click and injection of excel data into the new proposals tab that gets opened after step one

// const { sendResponse } = require("next/dist/server/image-optimizer");

// // Below is a listener to receive data from other part's of the extension (i.e. the service_worker.js file)
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "injectData" && message.data) {
//     // Perform the autofill and autoclick operations here
//     performAutoFill(message.data);
//   }
// });

// function performAutoFill(data) {
//   // Assuming 'data' is an array of objects representing rows from your Excel file
//   // and you know the IDs or some way to query the elements you want to interact with.
//   // Example: fill a text field
//   const someTextField = document.querySelector("#someTextField");
//   if (someTextField && data[0].textFieldValue) {
//     someTextField.value = data[0].textFieldValue;
//   }
//   // This example below clicks a button...
//   const someButton = document.querySelector("#someButton");
//   if (someButton) {
//     someButton.click(); // This simulates a click on the button
//   }
//   // Continue with other fields and actions as necessary
// }
// // Any other logic or functions you need
