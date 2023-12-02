/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/popup.js ***!
  \**********************/
// POPUP.JS **

// Below is form sign in and sign up logic

const signInSection = document.getElementById("userSignInSection");
const signUpSection = document.getElementById("userSignUpSection");
const btnShowSignUpForm = document.getElementById("btnShowSignUpForm");
const btnShowSignInForm = document.getElementById("btnShowSignInForm");

btnShowSignUpForm.addEventListener("click", () => {
  signInSection.style.display = "none";
  signUpSection.style.display = "block";
});

btnShowSignInForm.addEventListener("click", () => {
  signUpSection.style.display = "none";
  signInSection.style.display = "block";
});
// This is ran/opened at my.adivsor portal **
// This is step 1: Excel sheet is processed here and the "Start Button" sends **
// messages to the other scripts to run actions (functions) **

// Exvcel sheet processor, JSONify's and console.logs err + succ
document
  .getElementById("fileinput")
  .addEventListener("change", function (event) {
    // Declaration for target file
    const file = event.target.files[0];

    // IF file exists (if file uploaded)
    if (file) {
      // Declaration for function that async read contents of file given
      const reader = new FileReader();

      let excelData;

      reader.onload = function (e) {
        // Shortened declaration
        const data = e.target.result;

        // Data process step 2 goes here
        const workbook = XLSX.read(data, { type: "binary" });

        // Title of worksheet
        const sheetName = workbook.SheetNames[0];

        // Title of worksheet
        const worksheet = workbook.Sheets[sheetName];

        // Turns provided file into json (readable data)
        excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // _DEV USE ONLY
        console.log(excelData);

        // Storing the excelData below with chrome storage api
        chrome.storage.local.set({ excelData: excelData }, function () {
          // _DEV US ONLY
          console.log("Excel data stored in chrome storage");
        });
      };

      // XLXS method
      reader.readAsBinaryString(file);
    }
  });

// Below is the logic to start the automation injection process by opening a new window. As well as sending the
// - parsed data to the newTabScript, via the service_worker.js.....
document.getElementById("start").addEventListener("click", () => {
  // Below is the code that sends a message to start the injection process.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // Send message to "service_worker.js" to start the injection process
    chrome.tabs.sendMessage(activeTab.id, { action: "startInjection" });
  });
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJDQUEyQyxnQkFBZ0I7O0FBRTNEO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLDBEQUEwRCxXQUFXOztBQUVyRTtBQUNBOztBQUVBO0FBQ0EsbUNBQW1DLHNCQUFzQjtBQUN6RDtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsbUNBQW1DO0FBQ3pEO0FBQ0E7QUFDQSw0Q0FBNEMsMEJBQTBCO0FBQ3RFLEdBQUc7QUFDSCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhjZWwtdHJhbnNmZXIvLi9zcmMvcG9wdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUE9QVVAuSlMgKipcblxuLy8gQmVsb3cgaXMgZm9ybSBzaWduIGluIGFuZCBzaWduIHVwIGxvZ2ljXG5cbmNvbnN0IHNpZ25JblNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJTaWduSW5TZWN0aW9uXCIpO1xuY29uc3Qgc2lnblVwU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlclNpZ25VcFNlY3Rpb25cIik7XG5jb25zdCBidG5TaG93U2lnblVwRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuU2hvd1NpZ25VcEZvcm1cIik7XG5jb25zdCBidG5TaG93U2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuU2hvd1NpZ25JbkZvcm1cIik7XG5cbmJ0blNob3dTaWduVXBGb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIHNpZ25JblNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICBzaWduVXBTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG59KTtcblxuYnRuU2hvd1NpZ25JbkZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgc2lnblVwU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIHNpZ25JblNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbn0pO1xuLy8gVGhpcyBpcyByYW4vb3BlbmVkIGF0IG15LmFkaXZzb3IgcG9ydGFsICoqXG4vLyBUaGlzIGlzIHN0ZXAgMTogRXhjZWwgc2hlZXQgaXMgcHJvY2Vzc2VkIGhlcmUgYW5kIHRoZSBcIlN0YXJ0IEJ1dHRvblwiIHNlbmRzICoqXG4vLyBtZXNzYWdlcyB0byB0aGUgb3RoZXIgc2NyaXB0cyB0byBydW4gYWN0aW9ucyAoZnVuY3Rpb25zKSAqKlxuXG4vLyBFeHZjZWwgc2hlZXQgcHJvY2Vzc29yLCBKU09OaWZ5J3MgYW5kIGNvbnNvbGUubG9ncyBlcnIgKyBzdWNjXG5kb2N1bWVudFxuICAuZ2V0RWxlbWVudEJ5SWQoXCJmaWxlaW5wdXRcIilcbiAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gRGVjbGFyYXRpb24gZm9yIHRhcmdldCBmaWxlXG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcblxuICAgIC8vIElGIGZpbGUgZXhpc3RzIChpZiBmaWxlIHVwbG9hZGVkKVxuICAgIGlmIChmaWxlKSB7XG4gICAgICAvLyBEZWNsYXJhdGlvbiBmb3IgZnVuY3Rpb24gdGhhdCBhc3luYyByZWFkIGNvbnRlbnRzIG9mIGZpbGUgZ2l2ZW5cbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICAgIGxldCBleGNlbERhdGE7XG5cbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAvLyBTaG9ydGVuZWQgZGVjbGFyYXRpb25cbiAgICAgICAgY29uc3QgZGF0YSA9IGUudGFyZ2V0LnJlc3VsdDtcblxuICAgICAgICAvLyBEYXRhIHByb2Nlc3Mgc3RlcCAyIGdvZXMgaGVyZVxuICAgICAgICBjb25zdCB3b3JrYm9vayA9IFhMU1gucmVhZChkYXRhLCB7IHR5cGU6IFwiYmluYXJ5XCIgfSk7XG5cbiAgICAgICAgLy8gVGl0bGUgb2Ygd29ya3NoZWV0XG4gICAgICAgIGNvbnN0IHNoZWV0TmFtZSA9IHdvcmtib29rLlNoZWV0TmFtZXNbMF07XG5cbiAgICAgICAgLy8gVGl0bGUgb2Ygd29ya3NoZWV0XG4gICAgICAgIGNvbnN0IHdvcmtzaGVldCA9IHdvcmtib29rLlNoZWV0c1tzaGVldE5hbWVdO1xuXG4gICAgICAgIC8vIFR1cm5zIHByb3ZpZGVkIGZpbGUgaW50byBqc29uIChyZWFkYWJsZSBkYXRhKVxuICAgICAgICBleGNlbERhdGEgPSBYTFNYLnV0aWxzLnNoZWV0X3RvX2pzb24od29ya3NoZWV0LCB7IHJhdzogdHJ1ZSB9KTtcblxuICAgICAgICAvLyBfREVWIFVTRSBPTkxZXG4gICAgICAgIGNvbnNvbGUubG9nKGV4Y2VsRGF0YSk7XG5cbiAgICAgICAgLy8gU3RvcmluZyB0aGUgZXhjZWxEYXRhIGJlbG93IHdpdGggY2hyb21lIHN0b3JhZ2UgYXBpXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGV4Y2VsRGF0YTogZXhjZWxEYXRhIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBfREVWIFVTIE9OTFlcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkV4Y2VsIGRhdGEgc3RvcmVkIGluIGNocm9tZSBzdG9yYWdlXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFhMWFMgbWV0aG9kXG4gICAgICByZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUpO1xuICAgIH1cbiAgfSk7XG5cbi8vIEJlbG93IGlzIHRoZSBsb2dpYyB0byBzdGFydCB0aGUgYXV0b21hdGlvbiBpbmplY3Rpb24gcHJvY2VzcyBieSBvcGVuaW5nIGEgbmV3IHdpbmRvdy4gQXMgd2VsbCBhcyBzZW5kaW5nIHRoZVxuLy8gLSBwYXJzZWQgZGF0YSB0byB0aGUgbmV3VGFiU2NyaXB0LCB2aWEgdGhlIHNlcnZpY2Vfd29ya2VyLmpzLi4uLi5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgLy8gQmVsb3cgaXMgdGhlIGNvZGUgdGhhdCBzZW5kcyBhIG1lc3NhZ2UgdG8gc3RhcnQgdGhlIGluamVjdGlvbiBwcm9jZXNzLlxuICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCAodGFicykgPT4ge1xuICAgIGNvbnN0IGFjdGl2ZVRhYiA9IHRhYnNbMF07XG4gICAgLy8gU2VuZCBtZXNzYWdlIHRvIFwic2VydmljZV93b3JrZXIuanNcIiB0byBzdGFydCB0aGUgaW5qZWN0aW9uIHByb2Nlc3NcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWIuaWQsIHsgYWN0aW9uOiBcInN0YXJ0SW5qZWN0aW9uXCIgfSk7XG4gIH0pO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=