/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*******************************!*\
  !*** ./src/service_worker.js ***!
  \*******************************/
// BACKGROUND.JS
// This is step 3 - after proposal button is clicked on the my.advisor page

const injectedTabs = new Set();
let currentIndex = 29; // Starting index
let excelData; // Array of data from Excel sheet

// Save current index to storage
chrome.storage.local.set({ currentIndex: currentIndex });

// Load current index from storage
chrome.storage.local.get("currentIndex", function (data) {
  currentIndex = data.currentIndex || 29; // Default to 29 if not set
  console.log("Current index from storage:", currentIndex);
});

// This part of the script monitors any navigation to certain URLS **
// As shown in the declaration for "targetURLS = [...]" **
// If matching URL is found, this will inject another js file (newTabScript.js) **
// into the tab (that its currently on) and sends some data over to the extensions local storage. **
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Below I am defining all the url paths in the SPA for ENVESTNET form....
  const targetUrls = [
    "https://my.advisorlogin.com/secure/proposalapp/#/household",
    "https://my.advisorlogin.com/secure/proposalapp/#/riskAndObjective",
    "https://my.advisorlogin.com/secure/proposalapp/#/strategies",
    "https://my.advisorlogin.com/secure/proposalapp/#/accountSetup",
    "https://my.advisorlogin.com/secure/proposalapp/#/fees",
    "https://my.advisorlogin.com/secure/proposalapp/#/overview",
  ];

  // Check if any of the URLs is in the updated tab's URL
  const isTargetUrl = tab.url
    ? targetUrls.some((part) => tab.url.includes(part))
    : false;

  // Reacting to Complete Page Load for Target URL //
  // Check for updated tab to see if it is done loading ("status === 'complete'")
  if (changeInfo.status === "complete" && isTargetUrl) {
    // Check if the script has already been injected into this tab
    if (injectedTabs.has(tabId)) {
      return; // If already injected, exit early
    }
    // Stored and parsed excel data will be fetched
    chrome.storage.local.get(["excelData", "currentIndex"], function (data) {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving the data:", chrome.runtime.lastError);
        return;
      }

      const excelData = data.excelData;
      currentIndex = data.currentIndex || currentIndex; // Update from storage

      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["newTabScript.js"],
        },
        (injectionResults) => {
          injectedTabs.add(tabId); // Add tabId to the set after successful injection
          // Iterating over Injection Results:
          for (const frameResult of injectionResults) {
            // Error check
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              return;
            }

            // _DEV USE ONLY
            // Success log
            console.log("script injected test");

            // Sending Message After Delay:
            setTimeout(() => {
              console.log("Sending automateData message to tab");
              chrome.tabs.sendMessage(tabId, {
                action: "automateData",
                data: excelData, // The entire data array
                currentIndex: currentIndex, // Current index
              });
            }, 2000); // A 2 second delay
          }
        }
      );
    });
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  injectedTabs.delete(tabId);
});

// background.js
function sendStartNextProposalMessage() {
  // Add a timeout to wait before checking for the target tab
  setTimeout(function () {
    chrome.tabs.query(
      { url: "https://my.advisorlogin.com/*" },
      function (tabs) {
        if (tabs.length > 0) {
          const targetTabId = tabs[0].id;
          chrome.tabs.sendMessage(targetTabId, {
            action: "startNextProposal",
            currentIndex: currentIndex,
          });
        } else {
          console.error("Target tab not found after waiting.");
          // Handle the case where the target tab is still not found
          // Optionally, you can open the tab here if it's critical for the next step
        }
      }
    );
  }, 3000); // Wait for 3000 milliseconds (3 seconds) before checking
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "closeTab") {
    // Increment currentIndex only when the tab is closed
    currentIndex++;
    // Save the new currentIndex immediately
    chrome.storage.local.set({ currentIndex: currentIndex }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error setting currentIndex:", chrome.runtime.lastError);
      } else {
        console.log("Index saved to storage:", currentIndex);
        // After saving, send a message to start next proposal
        sendStartNextProposalMessage();
      }
    });

    // Close the tab as before
    chrome.tabs.remove(sender.tab.id);
  }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV93b3JrZXIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0EsdUJBQXVCO0FBQ3ZCLGVBQWU7O0FBRWY7QUFDQSwyQkFBMkIsNEJBQTRCOztBQUV2RDtBQUNBO0FBQ0EsMENBQTBDO0FBQzFDO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3REFBd0Q7O0FBRXhEO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBLFNBQVM7QUFDVDtBQUNBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2YsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0NBQXNDO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxTQUFTO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQiw0QkFBNEI7QUFDM0Q7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Y2VsLXRyYW5zZmVyLy4vc3JjL3NlcnZpY2Vfd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEJBQ0tHUk9VTkQuSlNcbi8vIFRoaXMgaXMgc3RlcCAzIC0gYWZ0ZXIgcHJvcG9zYWwgYnV0dG9uIGlzIGNsaWNrZWQgb24gdGhlIG15LmFkdmlzb3IgcGFnZVxuXG5jb25zdCBpbmplY3RlZFRhYnMgPSBuZXcgU2V0KCk7XG5sZXQgY3VycmVudEluZGV4ID0gMjk7IC8vIFN0YXJ0aW5nIGluZGV4XG5sZXQgZXhjZWxEYXRhOyAvLyBBcnJheSBvZiBkYXRhIGZyb20gRXhjZWwgc2hlZXRcblxuLy8gU2F2ZSBjdXJyZW50IGluZGV4IHRvIHN0b3JhZ2VcbmNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGN1cnJlbnRJbmRleDogY3VycmVudEluZGV4IH0pO1xuXG4vLyBMb2FkIGN1cnJlbnQgaW5kZXggZnJvbSBzdG9yYWdlXG5jaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoXCJjdXJyZW50SW5kZXhcIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgY3VycmVudEluZGV4ID0gZGF0YS5jdXJyZW50SW5kZXggfHwgMjk7IC8vIERlZmF1bHQgdG8gMjkgaWYgbm90IHNldFxuICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgaW5kZXggZnJvbSBzdG9yYWdlOlwiLCBjdXJyZW50SW5kZXgpO1xufSk7XG5cbi8vIFRoaXMgcGFydCBvZiB0aGUgc2NyaXB0IG1vbml0b3JzIGFueSBuYXZpZ2F0aW9uIHRvIGNlcnRhaW4gVVJMUyAqKlxuLy8gQXMgc2hvd24gaW4gdGhlIGRlY2xhcmF0aW9uIGZvciBcInRhcmdldFVSTFMgPSBbLi4uXVwiICoqXG4vLyBJZiBtYXRjaGluZyBVUkwgaXMgZm91bmQsIHRoaXMgd2lsbCBpbmplY3QgYW5vdGhlciBqcyBmaWxlIChuZXdUYWJTY3JpcHQuanMpICoqXG4vLyBpbnRvIHRoZSB0YWIgKHRoYXQgaXRzIGN1cnJlbnRseSBvbikgYW5kIHNlbmRzIHNvbWUgZGF0YSBvdmVyIHRvIHRoZSBleHRlbnNpb25zIGxvY2FsIHN0b3JhZ2UuICoqXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpIHtcbiAgLy8gQmVsb3cgSSBhbSBkZWZpbmluZyBhbGwgdGhlIHVybCBwYXRocyBpbiB0aGUgU1BBIGZvciBFTlZFU1RORVQgZm9ybS4uLi5cbiAgY29uc3QgdGFyZ2V0VXJscyA9IFtcbiAgICBcImh0dHBzOi8vbXkuYWR2aXNvcmxvZ2luLmNvbS9zZWN1cmUvcHJvcG9zYWxhcHAvIy9ob3VzZWhvbGRcIixcbiAgICBcImh0dHBzOi8vbXkuYWR2aXNvcmxvZ2luLmNvbS9zZWN1cmUvcHJvcG9zYWxhcHAvIy9yaXNrQW5kT2JqZWN0aXZlXCIsXG4gICAgXCJodHRwczovL215LmFkdmlzb3Jsb2dpbi5jb20vc2VjdXJlL3Byb3Bvc2FsYXBwLyMvc3RyYXRlZ2llc1wiLFxuICAgIFwiaHR0cHM6Ly9teS5hZHZpc29ybG9naW4uY29tL3NlY3VyZS9wcm9wb3NhbGFwcC8jL2FjY291bnRTZXR1cFwiLFxuICAgIFwiaHR0cHM6Ly9teS5hZHZpc29ybG9naW4uY29tL3NlY3VyZS9wcm9wb3NhbGFwcC8jL2ZlZXNcIixcbiAgICBcImh0dHBzOi8vbXkuYWR2aXNvcmxvZ2luLmNvbS9zZWN1cmUvcHJvcG9zYWxhcHAvIy9vdmVydmlld1wiLFxuICBdO1xuXG4gIC8vIENoZWNrIGlmIGFueSBvZiB0aGUgVVJMcyBpcyBpbiB0aGUgdXBkYXRlZCB0YWIncyBVUkxcbiAgY29uc3QgaXNUYXJnZXRVcmwgPSB0YWIudXJsXG4gICAgPyB0YXJnZXRVcmxzLnNvbWUoKHBhcnQpID0+IHRhYi51cmwuaW5jbHVkZXMocGFydCkpXG4gICAgOiBmYWxzZTtcblxuICAvLyBSZWFjdGluZyB0byBDb21wbGV0ZSBQYWdlIExvYWQgZm9yIFRhcmdldCBVUkwgLy9cbiAgLy8gQ2hlY2sgZm9yIHVwZGF0ZWQgdGFiIHRvIHNlZSBpZiBpdCBpcyBkb25lIGxvYWRpbmcgKFwic3RhdHVzID09PSAnY29tcGxldGUnXCIpXG4gIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gXCJjb21wbGV0ZVwiICYmIGlzVGFyZ2V0VXJsKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIHNjcmlwdCBoYXMgYWxyZWFkeSBiZWVuIGluamVjdGVkIGludG8gdGhpcyB0YWJcbiAgICBpZiAoaW5qZWN0ZWRUYWJzLmhhcyh0YWJJZCkpIHtcbiAgICAgIHJldHVybjsgLy8gSWYgYWxyZWFkeSBpbmplY3RlZCwgZXhpdCBlYXJseVxuICAgIH1cbiAgICAvLyBTdG9yZWQgYW5kIHBhcnNlZCBleGNlbCBkYXRhIHdpbGwgYmUgZmV0Y2hlZFxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJleGNlbERhdGFcIiwgXCJjdXJyZW50SW5kZXhcIl0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZXRyaWV2aW5nIHRoZSBkYXRhOlwiLCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGV4Y2VsRGF0YSA9IGRhdGEuZXhjZWxEYXRhO1xuICAgICAgY3VycmVudEluZGV4ID0gZGF0YS5jdXJyZW50SW5kZXggfHwgY3VycmVudEluZGV4OyAvLyBVcGRhdGUgZnJvbSBzdG9yYWdlXG5cbiAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdChcbiAgICAgICAge1xuICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcbiAgICAgICAgICBmaWxlczogW1wibmV3VGFiU2NyaXB0LmpzXCJdLFxuICAgICAgICB9LFxuICAgICAgICAoaW5qZWN0aW9uUmVzdWx0cykgPT4ge1xuICAgICAgICAgIGluamVjdGVkVGFicy5hZGQodGFiSWQpOyAvLyBBZGQgdGFiSWQgdG8gdGhlIHNldCBhZnRlciBzdWNjZXNzZnVsIGluamVjdGlvblxuICAgICAgICAgIC8vIEl0ZXJhdGluZyBvdmVyIEluamVjdGlvbiBSZXN1bHRzOlxuICAgICAgICAgIGZvciAoY29uc3QgZnJhbWVSZXN1bHQgb2YgaW5qZWN0aW9uUmVzdWx0cykge1xuICAgICAgICAgICAgLy8gRXJyb3IgY2hlY2tcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gX0RFViBVU0UgT05MWVxuICAgICAgICAgICAgLy8gU3VjY2VzcyBsb2dcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2NyaXB0IGluamVjdGVkIHRlc3RcIik7XG5cbiAgICAgICAgICAgIC8vIFNlbmRpbmcgTWVzc2FnZSBBZnRlciBEZWxheTpcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgYXV0b21hdGVEYXRhIG1lc3NhZ2UgdG8gdGFiXCIpO1xuICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJhdXRvbWF0ZURhdGFcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBleGNlbERhdGEsIC8vIFRoZSBlbnRpcmUgZGF0YSBhcnJheVxuICAgICAgICAgICAgICAgIGN1cnJlbnRJbmRleDogY3VycmVudEluZGV4LCAvLyBDdXJyZW50IGluZGV4XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMjAwMCk7IC8vIEEgMiBzZWNvbmQgZGVsYXlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG5jaHJvbWUudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkKSB7XG4gIGluamVjdGVkVGFicy5kZWxldGUodGFiSWQpO1xufSk7XG5cbi8vIGJhY2tncm91bmQuanNcbmZ1bmN0aW9uIHNlbmRTdGFydE5leHRQcm9wb3NhbE1lc3NhZ2UoKSB7XG4gIC8vIEFkZCBhIHRpbWVvdXQgdG8gd2FpdCBiZWZvcmUgY2hlY2tpbmcgZm9yIHRoZSB0YXJnZXQgdGFiXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGNocm9tZS50YWJzLnF1ZXJ5KFxuICAgICAgeyB1cmw6IFwiaHR0cHM6Ly9teS5hZHZpc29ybG9naW4uY29tLypcIiB9LFxuICAgICAgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgaWYgKHRhYnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IHRhcmdldFRhYklkID0gdGFic1swXS5pZDtcbiAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YXJnZXRUYWJJZCwge1xuICAgICAgICAgICAgYWN0aW9uOiBcInN0YXJ0TmV4dFByb3Bvc2FsXCIsXG4gICAgICAgICAgICBjdXJyZW50SW5kZXg6IGN1cnJlbnRJbmRleCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVGFyZ2V0IHRhYiBub3QgZm91bmQgYWZ0ZXIgd2FpdGluZy5cIik7XG4gICAgICAgICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZSB0YXJnZXQgdGFiIGlzIHN0aWxsIG5vdCBmb3VuZFxuICAgICAgICAgIC8vIE9wdGlvbmFsbHksIHlvdSBjYW4gb3BlbiB0aGUgdGFiIGhlcmUgaWYgaXQncyBjcml0aWNhbCBmb3IgdGhlIG5leHQgc3RlcFxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfSwgMzAwMCk7IC8vIFdhaXQgZm9yIDMwMDAgbWlsbGlzZWNvbmRzICgzIHNlY29uZHMpIGJlZm9yZSBjaGVja2luZ1xufVxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJjbG9zZVRhYlwiKSB7XG4gICAgLy8gSW5jcmVtZW50IGN1cnJlbnRJbmRleCBvbmx5IHdoZW4gdGhlIHRhYiBpcyBjbG9zZWRcbiAgICBjdXJyZW50SW5kZXgrKztcbiAgICAvLyBTYXZlIHRoZSBuZXcgY3VycmVudEluZGV4IGltbWVkaWF0ZWx5XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgY3VycmVudEluZGV4OiBjdXJyZW50SW5kZXggfSwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2V0dGluZyBjdXJyZW50SW5kZXg6XCIsIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkluZGV4IHNhdmVkIHRvIHN0b3JhZ2U6XCIsIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIC8vIEFmdGVyIHNhdmluZywgc2VuZCBhIG1lc3NhZ2UgdG8gc3RhcnQgbmV4dCBwcm9wb3NhbFxuICAgICAgICBzZW5kU3RhcnROZXh0UHJvcG9zYWxNZXNzYWdlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDbG9zZSB0aGUgdGFiIGFzIGJlZm9yZVxuICAgIGNocm9tZS50YWJzLnJlbW92ZShzZW5kZXIudGFiLmlkKTtcbiAgfVxufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=