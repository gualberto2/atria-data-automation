/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./src/inject.js ***!
  \***********************/
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
    startProposal(message.currentIndex); // Use the provided currentIndex
    sendResponse({ status: "success", data: excelDataFromStorage });
  }
});

function startProposal(index) {
  if (!excelDataFromStorage || index >= excelDataFromStorage.length) {
    console.error("Invalid index or excelDataFromStorage not loaded");
    return false;
  }

  const startProp = document.getElementById("submit_create_nextgen_proposal");
  const currentItem = excelDataFromStorage[index];

  if (startProp) {
    startProp.click();

    // Send a message to the background script
    chrome.runtime.sendMessage({
      action: "sendMessageToActiveTab",
      currentItem: currentItem,
    });

    return true;
  }
  return false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startNextProposal") {
    startProposal(message.currentIndex); // Use the received currentIndex
  }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDLG1CQUFtQiwrQ0FBK0M7QUFDbEU7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Y2VsLXRyYW5zZmVyLy4vc3JjL2luamVjdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJTkpFQ1QuSlMgKipcbi8vIFRoaXMgaXMgcmFuIGF0IHRoZSBteS5hZHZpc29yIHBvcnRhbCAqKlxuLy8gU3RlcCAyIGluIHRoZSBhdXRvbWF0aW9uIHByb2Nlc3MgKipcblxubGV0IGV4Y2VsRGF0YUZyb21TdG9yYWdlID0gbnVsbDtcblxuY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFwiZXhjZWxEYXRhXCIsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgZXhjZWxEYXRhRnJvbVN0b3JhZ2UgPSByZXN1bHQuZXhjZWxEYXRhO1xuICBpZiAoIWV4Y2VsRGF0YUZyb21TdG9yYWdlKSB7XG4gICAgY29uc29sZS5sb2coXCJleGNlbERhdGEgbm90IGZvdW5kIGluIHN0b3JhZ2VcIik7XG4gIH1cbn0pO1xuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJzdGFydEluamVjdGlvblwiKSB7XG4gICAgaWYgKCFleGNlbERhdGFGcm9tU3RvcmFnZSkge1xuICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgIHJlYXNvbjogXCJObyBleGNlbCBkYXRhIGZvdW5kIGluIHN0b3JhZ2VcIixcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdGFydFByb3Bvc2FsKG1lc3NhZ2UuY3VycmVudEluZGV4KTsgLy8gVXNlIHRoZSBwcm92aWRlZCBjdXJyZW50SW5kZXhcbiAgICBzZW5kUmVzcG9uc2UoeyBzdGF0dXM6IFwic3VjY2Vzc1wiLCBkYXRhOiBleGNlbERhdGFGcm9tU3RvcmFnZSB9KTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHN0YXJ0UHJvcG9zYWwoaW5kZXgpIHtcbiAgaWYgKCFleGNlbERhdGFGcm9tU3RvcmFnZSB8fCBpbmRleCA+PSBleGNlbERhdGFGcm9tU3RvcmFnZS5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbmRleCBvciBleGNlbERhdGFGcm9tU3RvcmFnZSBub3QgbG9hZGVkXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0UHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0X2NyZWF0ZV9uZXh0Z2VuX3Byb3Bvc2FsXCIpO1xuICBjb25zdCBjdXJyZW50SXRlbSA9IGV4Y2VsRGF0YUZyb21TdG9yYWdlW2luZGV4XTtcblxuICBpZiAoc3RhcnRQcm9wKSB7XG4gICAgc3RhcnRQcm9wLmNsaWNrKCk7XG5cbiAgICAvLyBTZW5kIGEgbWVzc2FnZSB0byB0aGUgYmFja2dyb3VuZCBzY3JpcHRcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICBhY3Rpb246IFwic2VuZE1lc3NhZ2VUb0FjdGl2ZVRhYlwiLFxuICAgICAgY3VycmVudEl0ZW06IGN1cnJlbnRJdGVtLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJzdGFydE5leHRQcm9wb3NhbFwiKSB7XG4gICAgc3RhcnRQcm9wb3NhbChtZXNzYWdlLmN1cnJlbnRJbmRleCk7IC8vIFVzZSB0aGUgcmVjZWl2ZWQgY3VycmVudEluZGV4XG4gIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9