// NEWTABSCRIPT.JS **
// Step 4: running the scripts for the new tab **

// utility functions defined here below:

// Step one, get data... data obtained, start automation
// Listener to act upon receiving messages from the Chrome extension.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "automateData") {
    console.log("Excel data retrieved:", message.data);

    // Ensure webpage content (DOM) is fully loaded before taking action.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        const openName = clickSpan(); // call the autoclicker here
        setupMutationObserverForModal(message.data);
        sendResponse({ status: openName ? "success" : "error" });
      });
    } else {
      //DOMContentLoaded already has fired
      const openName = clickSpan(); // Calling the span clicker here...
      setupMutationObserverForModal(message.data);
      sendResponse({ status: openName ? "success" : "error" });
    }
    return true;
  }
});

if (window.hasInjectedScript) {
  throw new Error("Script already injected");
}
window.hasInjectedScript = true;

// Step two, click "Create household" button
function clickSpan() {
  let success = false; // flag to indicate if click was successful

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
      // _DEV USE
      console.log("Creating new household...");
    }
  });
  return success; // Return the status
}

// Step three-one
// Find modal
function setupMutationObserverForModal(data) {
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subTree: true };
  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        if (mutation.target.querySelector(".modal-draggable-handle")) {
          console.log("MODAL DETECTED");
          processExcelData(data);

          // Disconnect the current observer since we found the modal
          observer.disconnect();

          // Setup another observer to detect the removal of the modal
          // setupObserverForModalRemoval();
        }
      }
    }
  };
  // Once modal is found:
  // Step three-two
  // Give aria labels definitions
  function setInputValueByAriaLabel(label, value) {
    const element = findElementByAriaLabel(label);
    if (element) {
      element.value = value;
      // Manually trigger a change event
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function findElementByAriaLabel(label) {
    return document.querySelector(`[aria-label="${label}"]`);
  }

  // Step three-three
  // Now Run processExcelData()

  // Pre defining addNameClick()
  function addNameClick() {
    let success = false; // Flag to indicate if click was successful.
    let container = document.querySelector(".MuiDialogContent-root");
    if (!container) {
      console.log("Container not found");
      return false;
    }
    console.log("MODAL FOUND: Searching <SPANS> 🔎");
    let spans = container.querySelectorAll("span");
    spans.forEach((span) => {
      if (span.textContent.includes("Add")) {
        console.log(`SPAN FOUND WITH STRING "ADD"`, span);
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

  function processExcelData(data) {
    console.log("Processing data: ", data);

    // Check if data is an array and has the required index
    if (Array.isArray(data) && data.length > 29) {
      const formData = data[29]; // For example, using the 30th item in the array
      const clientTitle = formData.CLIENT_TITLE || "Default Title"; // Fallback value
      const firstName = formData.FIRST_NAME || "Default FName"; // Fallback value for name
      const lastName = formData.LAST_NAME || "Default LNAME"; //Fallback for last name
      setInputValueByAriaLabel("Enter household name", clientTitle);
      setInputValueByAriaLabel("First name", firstName);
      setInputValueByAriaLabel("Last name", lastName);
    } else {
      console.error("Invalid data format or index out of bounds");
    }
    // Additional processing...
    setTimeout(() => {
      // Step three-four
      // Click "Add" inside of modal
      const addClicked = addNameClick();
      console.log("Add button clicked? :", addClicked);

      // Step three-five
      // Once addClicked, run modal Closer
      if (addClicked) {
        setupObserverForModalRemoval(); // Set up the observer only if "Add" was clicked.
      }
    }, 2000); // Adjust delay too long is noticable to short will mess up flow...
  }

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

// Step three-six
// Close modal
function setupObserverForModalRemoval() {
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subTree: true };
  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
        const modalRemoved = Array.from(mutation.removedNodes).some(
          (node) =>
            node.querySelector && node.querySelector(".modal-draggable-handle")
        );
        if (modalRemoved) {
          console.log("MODAL REMOVED");
          // Once the setupObserverForModalRemoval() is ran it will start the next function clickSaveAndContinue()
          clickSaveAndContinue();

          // Disconnect the observer since we detected the removal of the modal
          observer.disconnect();
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

function clickSaveAndContinue() {
  // Look for the button with text "Save and continue"
  let buttons = document.querySelectorAll("button");
  for (let button of buttons) {
    if (button.textContent.includes("Save and continue")) {
      console.log(`BUTTON FOUND WITH STRING "SAVE AND CONTINUE"`, button);

      setTimeout(() => {
        // Create a new mouse event
        let event = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        // Dispatch the event on the button
        button.dispatchEvent(event);

        // Step four-one
        // Click "I know my clients risk tolerance" button
        clickRiskToleranceButtonAfterDelay();
      }, 3000);

      return;
    }
  }
  console.log("Save and continue button not found");
}

function clickRiskToleranceButtonAfterDelay() {
  setTimeout(() => {
    const button = document.querySelector(
      'button[aria-label="I already know my client\'s risk tolerance"]'
    );
    if (button) {
      button.click();
      console.log("Clicked the 'I already know the risk tolerance' button.");

      // Introduce a delay after clicking the risk tolerance button and then adjust the slider
      setTimeout(() => {
        // Step four-two
        // Click slider to its proper location
      }, 5000); // Delay of 2 seconds (2000 milliseconds) to adjust the slider after clicking the button
    }
  }, 5000); // Delay of 5 seconds (5000 milliseconds) to click the button
}

// function standardizeColor(str) {
//   const ctx = document.createElement("canvas").getContext("2d");
//   ctx.fillStyle = str;
//   return ctx.fillStyle;
// }
// function clickDivByRiskTolerance(riskTolerance) {
//   const toleranceColorMapping = {
//     "Capital Preservation": "rgb(157, 196, 220)",
//     Conservative: "rgb(138, 180, 205)",
//     "Conservative Growth": "rgb(119, 163, 190)",
//     Moderate: "rgb(100, 147, 175)",
//     "Moderate Growth": "rgb(82, 130, 161)",
//     Growth: "rgb(63, 114, 146)",
//     Aggressive: "rgb(25, 81, 116)",
//   };

//   // Log the mapping for diagnostic purposes
//   console.log("Tolerance Color Mapping:", toleranceColorMapping);

//   const orderedTolerances = Object.keys(toleranceColorMapping);
//   const toleranceDivs = [];

//   // Log the divs with background color styles
//   console.log(
//     "Divs with background color styles:",
//     document.querySelectorAll('div[style*="background-color"]')
//   );

//   document.querySelectorAll('div[style*="background-color"]').forEach((div) => {
//     const computedStyle = window.getComputedStyle(div);
//     const backgroundColor = standardizeColor(computedStyle.backgroundColor);
//     console.log(
//       `Div background color: ${backgroundColor}, standardized to: ${standardizeColor(
//         backgroundColor
//       )}`
//     );
//     const toleranceIndex = orderedTolerances.findIndex((tolerance) => {
//       return (
//         standardizeColor(toleranceColorMapping[tolerance]) === backgroundColor
//       );
//     });

//     if (toleranceIndex !== -1) {
//       toleranceDivs[toleranceIndex] = div;
//     }
//   });

//   // Log the collected divs for diagnostic purposes
//   console.log("Collected divs mapped to tolerances:", toleranceDivs);

//   // Ensure the divs array has no 'undefined' elements due to unassigned indexes
//   const filteredToleranceDivs = toleranceDivs.filter(
//     (div) => div !== undefined
//   );

//   // Click the div by its position in the mapping array, not by color
//   const riskToleranceIndex = orderedTolerances.indexOf(riskTolerance);
//   console.log(
//     `Risk Tolerance Index: ${riskToleranceIndex}, Tolerance: ${riskTolerance}`
//   );

//   if (filteredToleranceDivs.length > riskToleranceIndex) {
//     filteredToleranceDivs[riskToleranceIndex].click();
//     console.log(`Clicked on div for risk tolerance: ${riskTolerance}`);
//   } else {
//     console.error(
//       `No div found for risk tolerance: ${riskTolerance}, or the divs are not in the expected order.`
//     );
//   }
// }

// Step 5
// Find the slider handle

//IGNORE VVV
// left: calc(7% - 14px);
// left: calc(21.5% - 14px);
// left: calc(36% - 14px);
// left: calc(50% - 14px);
// left: calc(64% - 14px);
// left: calc(78.5% - 14px);
// left: calc(93% - 14px);

// Capital Preservation
// Conservative
// Conservative Growth
// Moderate
// Moderate Growth
// Growth
// Aggressive

// const toleranceMapping = {
//   "Capital Preservation": "calc(7% - 14px)",
//   Conservative: "calc(21.5% - 14px)",
//   "Conservative Growth": "calc(36% - 14px)",
//   Moderate: "calc(50% - 14px)",
//   "Moderate Growth": "calc(64% - 14px)",
//   Growth: "calc(78.5% - 14px)",
//   Aggressive: "calc(93% - 14px)",
// };
