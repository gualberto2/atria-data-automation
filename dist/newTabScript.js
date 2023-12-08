/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./src/newTabScript.js ***!
  \*****************************/
// NEWTABSCRIPT.JS **
// Step 4: running the scripts for the new tab **

// Utility functions defined here below:

// Step one, get data... data obtained, start automation
// Listener to act upon receiving messages from the Chrome extension.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "automateData") {
    // Ensure webpage content (DOM) is fully loaded before taking action.
    const index = message.currentIndex;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        const openName = clickSpan(); // call the autoclicker here
        setupMutationObserverForModal(message.data, index);
        sendResponse({ status: openName ? "success" : "error" });
      });
    } else {
      //DOMContentLoaded already has fired
      const openName = clickSpan(); // Calling the span clicker here...
      setupMutationObserverForModal(message.data, index);
      sendResponse({ status: openName ? "success" : "error" });
    }
    return true;
  }
});

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
      console.log("Creating new household button...");
    }
  });
  return success; // Return the status
}

// Step three-one
const riskToleranceToPercentage = {
  "Capital Preservation": 7,
  Conservative: 21.5,
  "Conservative Growth": 36,
  Moderate: 50,
  "Moderate Growth": 64,
  Growth: 78.5,
  Aggressive: 93,
};

let globalRegistrationType = "";
let globalCustodianType = "";
let globalProposalAmount = 0;
let globalProgram = "";
let globalRiskTolerance = "";
let nameOnPortfolio = "";
let feeSchedule = "";
let feeTemplate = "";
let jointFirst = "";
let jointLast = "";
// Find modal
function setupMutationObserverForModal(data, index) {
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subTree: true };

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        if (mutation.target.querySelector(".modal-draggable-handle")) {
          console.log("MODAL_DETECTED");
          processExcelData(data, index);

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
      console.log("MODAL_NOT_FOUND");
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

  function processExcelData(data, index) {
    console.log("Processing data for index: ", index);
    console.log("Received data:", data);
    console.log("Received index:", index);

    if (Array.isArray(data) && index < data.length) {
      const formData = data[index];
      const clientTitle = formData.CLIENT_TITLE || "Default Title"; // Fallback value
      const firstName = formData.FIRST_NAME || "Default FName"; // Fallback value for name
      const lastName = formData.LAST_NAME || "Default LNAME"; //Fallback for last name
      setInputValueByAriaLabel("Enter household name", clientTitle);
      setInputValueByAriaLabel("First name", firstName);
      setInputValueByAriaLabel("Last name", lastName);

      globalRegistrationType = formData.REGISTRATION || "Default Registration";
      globalCustodianType = formData.CUSTODIAN || "Default Registration";
      globalProposalAmount = formData.ACCOUNT_VALUE || 0;
      globalProgram = formData.PROGRAM || "";
      globalRiskTolerance = formData.PORTFOLIO_RISK || "";
      nameOnPortfolio = formData.NAME_ON_PORTFOLIO || "";
      feeSchedule = formData.BILLING_FFREQUENCY || "Monthly";
      feeTemplate = formData.ADVISOR_FEE || "Standard";

      setTimeout(() => {
        const addClicked = addNameClick();
        console.log("Add button clicked? :", addClicked);

        if (addClicked) {
          // Check if it's a joint account and add a secondary owner
          if (globalRegistrationType.includes("Joint")) {
            jointFirst = formData.JOINT_OWNER_FIRST_NAME || "";
            jointLast = formData.JOINT_OWNER_LAST_NAME || "";
            setTimeout(() => {
              clickAddMemberButton();
            }, 3000);
          } else {
            setupObserverForModalRemoval();
          }
        }
      }, 3000);
    } else {
      console.error("Invalid data format or index out of bounds");
    }

    function clickAddMemberButton() {
      const addMemberButton = document.querySelector(
        'button[aria-label="add-member"]'
      );
      if (addMemberButton) {
        addMemberButton.click();
        console.log("Clicked 'Add member' button");
        setTimeout(() => {
          fillJointOwnerDetails();
        }, 3000);

        // Continue with the next step
        // setTimeout(() => {
        //   setupObserverForModalRemoval();
        // }, 4000);
      } else {
        console.log("'Add member' button not found");
      }
    }

    function fillJointOwnerDetails() {
      const firstNameInput = document.querySelector(
        'input[aria-label="First name"]'
      );
      const lastNameInput = document.querySelector(
        'input[aria-label="Last name"]'
      );

      function triggerInputEvents(input) {
        input.dispatchEvent(new Event("focus"));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("blur"));
      }

      if (firstNameInput && lastNameInput) {
        firstNameInput.value = jointFirst;
        triggerInputEvents(firstNameInput);

        setTimeout(() => {
          lastNameInput.value = jointLast;
          triggerInputEvents(lastNameInput);
          setTimeout(() => {
            clickRelationshipDropdown();
          }, 500);
        }, 1000); // Delay for lastNameInput

        console.log("Joint owner names set");
      } else {
        console.log("Joint owner name inputs not found");
      }
    }

    function clickRelationshipDropdown() {
      const dropdown = document.querySelector(
        'div.MuiSelect-root[aria-haspopup="listbox"]'
      );
      if (dropdown) {
        // Simulate focusing on the dropdown
        dropdown.focus();
        console.log("Focused on relationship dropdown");

        // Simulate clicking the dropdown to open options
        dropdown.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        dropdown.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        dropdown.click();
        console.log("Clicked relationship dropdown");

        // Select a relationship option after a delay
        setTimeout(() => {
          selectRelationshipOption();
        }, 2000);
      } else {
        console.log("Relationship dropdown not found");
      }
    }
    function selectRelationshipOption() {
      // Example: Selecting 'Spouse' as the relationship
      // Update the selector or text content based on actual options available
      const optionText = "Other"; // Update this based on your needs
      const options = document.querySelectorAll(
        "ul.MuiList-root li.MuiMenuItem-root"
      );
      const targetOption = Array.from(options).find(
        (option) => option.textContent === optionText
      );

      if (targetOption) {
        targetOption.click();
        console.log("Selected relationship:", optionText);
        setTimeout(() => {
          addNameClick();
          setTimeout(() => {
            clickSaveAndContinue();
          }, 500);
        }, 500);

        // Continue with the next step after selecting the relationship
        // setTimeout(() => {
        //   setupObserverForModalRemoval();
        // }, 2000);
      } else {
        console.log("Relationship option not found");
      }
    }
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
          setTimeout(() => {
            clickSaveAndContinue();
          }, 4000);

          // Disconnect the observer since we detected the removal of the modal
          observer.disconnect();
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}
// Step four-one save and continue into the new risk and objective functions sections....
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
// Step four-two
// Click that we know our client's risks...
function adjustRiskToleranceSlider() {
  const percentage = riskToleranceToPercentage[globalRiskTolerance] || 50; // Default to 50 if no match is found
  clickSliderAtPosition(percentage);
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
        adjustRiskToleranceSlider();
      }, 2000); // Delay of 2 seconds (2000 milliseconds) to adjust the slider after clicking the button
    }
  }, 5000); // Delay of 5 seconds (5000 milliseconds) to click the button
}

// Step four-three
// Slide the correlating client risks, based on RISK_ASSESSMENT::
function clickSliderAtPosition(percentage) {
  const sliderContainers = document.querySelectorAll('div[role="button"]');

  const slider = Array.from(sliderContainers).find((container) => {
    return Array.from(container.children).some((child) =>
      child.style.left.includes("calc")
    );
  });

  if (slider) {
    const rect = slider.getBoundingClientRect();
    const clickX = rect.left + rect.width * (percentage / 100);
    const clickY = rect.top + rect.height / 2;

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: clickX,
      clientY: clickY,
    });

    slider.dispatchEvent(clickEvent);
    setTimeout(() => {
      // Step four-two
      // Click slider to its proper location
      clickRiskAssessmentDropdown();
      console.log("Clicked assessment dropdown");
    }, 2000);
  }
}

// Step four-four
// Open the dropdown after the slider
function clickRiskAssessmentDropdown() {
  const dropdown = document.querySelector(
    "div.MuiSelect-root[aria-haspopup='listbox']"
  );

  if (dropdown) {
    dropdown.focus();
    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      dropdown.dispatchEvent(
        new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });
    setTimeout(() => {
      console.log("going to click n ext options");
      clickRiskAssessmentOption();
    }, 2000);
  }
}

// Step four-five
// Click the option after dropdown is clicked and opened...
function clickRiskAssessmentOption() {
  const optionText =
    "Existing client (Current risk-tolerance questionnaire is on file)";

  // Define a function to click the target option when it's available
  const tryClickOption = () => {
    const options = Array.from(
      document.querySelectorAll("ul.MuiList-root li.MuiMenuItem-root")
    );
    const targetOption = options.find((option) =>
      option.textContent.includes(optionText)
    );

    if (targetOption) {
      targetOption.click();
      console.log("Clicked option - MAIN FUNC");
      clickTermsCheckbox();
      return true; // Indicate success
    }
    return false; // Indicate failure
  };

  // Create an observer instance
  const observer = new MutationObserver((mutations, obs) => {
    if (tryClickOption()) {
      // Try to click the option
      obs.disconnect(); // If successful, disconnect the observer
    }
  });

  // Start observing the body for changes in the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try to click the option immediately in case it's already there
  if (!tryClickOption()) {
    // If the option was not clicked successfully, trigger the dropdown to show options
    setTimeout(() => {
      const dropdown = document.querySelector("div.MuiSelect-root");
      if (dropdown) {
        dropdown.click();
        console.log("Clicked option - BACKUP FUNC");
        clickTermsCheckbox();
      }
    }, 300); // Adjust the timeout as necessary
  } else {
    observer.disconnect(); // If we clicked the option, disconnect the observer
  }
}
// Step four-six
// Click the terms dropdown...
function clickTermsCheckbox() {
  // Find button by its role and aria-label attributes
  const checkBoxButton = document.querySelector(
    'button[role="checkbox"][aria-label="I confirm the terms and conditions for selecting my client\'s risk"]'
  );

  if (checkBoxButton) {
    checkBoxButton.click();
    console.log("Checkbox button clicked!");
    setTimeout(() => {
      console.log("Clicking agree to terms button");
      termsCheckboxConfirmation();
    }, 2000);
  }
}
// Step four-seven
// Click the checkbox to accept current clients risk and investment objective...
function termsCheckboxConfirmation() {
  // Use XPath to find the button based on its text content
  var xpath = "//button[.//span[contains(text(), 'I agree')]]";
  var agreeButton = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (agreeButton) {
    agreeButton.click();
    console.log("Agree button clicked!");
    setTimeout(() => {
      // Timeout to kickstart the saveandcontinue button
      console.log("Clicking agree to terms button");
      saveAndContinueRandO();
    }, 1000);
  } else {
    console.log("Agree button not found!");
  }
}

// Step four-eight: Confirm selected options, save and continue...
function saveAndContinueRandO() {
  let spanFound = false;
  let spans = document.querySelectorAll("span");

  for (let span of spans) {
    if (span.textContent.includes("Save and continue")) {
      console.log(`SPAN FOUND WITH STRING "SAVE AND CONTINUE"`, span);
      spanFound = true;

      setTimeout(() => {
        span.click(); // Simpler way to click without creating a MouseEvent
        console.log("Clicked 'Save and continue'");

        setTimeout(() => {
          // This delay waits for the page to process the save and continue action
          clickAddAccountButton();
        }, 7000); // The delay might need adjustment based on actual page behavior
      }, 5000); // Waiting for animations to complete

      break; // Exit the loop as we've found and clicked the span
    }
  }

  if (!spanFound) {
    console.log("Save and continue span not found");
    // Handle the error case appropriately, possibly retrying or alerting the user
  }
}

// BELOW ARE THE FUNCTIONS TO MANIPULATE THE ACCOUNT STRATEGY SECTION

//Version 0.39.1 - Nov 7 2023
// step five-one: Click the add account button
function clickAddAccountButton() {
  let spans = document.querySelectorAll("span");

  for (let span of spans) {
    if (span.textContent.trim() === "Add account") {
      // Using trim() to remove any leading/trailing whitespace
      let button = span.closest("button");
      if (button) {
        button.click();
        console.log('Clicked "Add account" button.');
        return true;
      }
    }
    setTimeout(() => {
      console.log("Inputting proposal amount...");
      setProposalAmount();
    }, 5000);
  }

  console.log("Add account button not found.");
  // Similar to above, handle the error case appropriately
  return false;
}

function setProposalAmount() {
  // Find the input field for the proposal amount by its aria-label
  const proposalAmountInput = document.querySelector(
    'input[aria-label="Proposal amount"]'
  );

  if (proposalAmountInput) {
    // Parse the globalProposalAmount as a float number and ensure it's a finite number
    const amount = parseFloat(globalProposalAmount);
    if (isFinite(amount)) {
      // Set the value of the input to the numeric globalProposalAmount
      proposalAmountInput.value = amount;

      // Simulate a change event to notify any JavaScript listening to this event
      const event = new Event("change", { bubbles: true });
      proposalAmountInput.dispatchEvent(event);

      console.log(`Proposal amount set to ${amount}`);
    }
  }
  setTimeout(() => {
    console.log("Clicking registration dropdown...");
    clickRegistrationTypeDropdown();
  }, 2000);
}

// step five-three: Click select registration type
function clickRegistrationTypeDropdown() {
  const dropdown = document.querySelector(
    'div.MuiSelect-root[aria-haspopup="listbox"]'
  );

  if (dropdown) {
    dropdown.focus();
    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      dropdown.dispatchEvent(
        new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });

    setTimeout(() => {
      console.log("Preparing to select an option...");
      clickRegistrationTypeOption();
    }, 2000); // 2-second delay
  }
}

function clickRegistrationTypeOption() {
  // Define a function to click the target option when it's available
  const tryClickOption = () => {
    const options = Array.from(
      document.querySelectorAll("ul.MuiList-root li.MuiMenuItem-root")
    );
    const targetOption = options.find((option) =>
      option.textContent.includes(globalRegistrationType)
    );

    if (targetOption) {
      targetOption.click();
      console.log(
        `Clicked registration type option: ${globalRegistrationType}`
      );

      setTimeout(() => {
        if (globalRegistrationType.includes("Joint")) {
          clickSelectOwnerButton();
        } else {
          setTimeout(() => {
            clickCustodianDropdown();
          }, 2000);
        }
      }, 2000);

      return true; // Indicate success
    }
    return false; // Indicate failure
  };
  function clickSelectOwnerButton() {
    // Find and click the "select owner" button
    const selectOwnerButton = document.querySelector(
      'button[aria-label="select owner"]'
    );
    if (selectOwnerButton) {
      selectOwnerButton.click();
      console.log("Clicked 'select owner' button");

      // Wait for the secondary owner options to appear, then click
      setTimeout(() => {
        clickSecondaryOwnerDropdown();
      }, 3000); // Adjust the delay as necessary
    } else {
      console.log("'select owner' button not found");
    }
  }

  function clickSecondaryOwnerDropdown() {
    // Define the text that will help us find the "Secondary owner" dropdown
    const optionText = "Secondary owner";

    // Define a function to try clicking the target dropdown when it's available
    const interactWithDropdown = (dropdown) => {
      dropdown.focus();
      ["mousedown", "mouseup"].forEach((eventType) =>
        dropdown.dispatchEvent(new MouseEvent(eventType, { bubbles: true }))
      );
      dropdown.click();
      console.log("Interacted with 'Secondary owner' dropdown like a human");
      setTimeout(() => {
        clickAddMemberOption();
      }, 1000);
    };
    const tryClickDropdown = () => {
      const labels = Array.from(document.querySelectorAll("div"));
      const targetLabel = labels.find(
        (div) => div.textContent.trim() === optionText
      );
      const dropdown = targetLabel?.nextElementSibling.querySelector(
        'div[role="button"][aria-haspopup="listbox"]'
      );

      if (dropdown) {
        interactWithDropdown(dropdown);
        return true; // Indicate success
      }
      return false; // Indicate failure
    };

    // Create an observer instance to watch for changes in the DOM
    const observer = new MutationObserver((mutations, obs) => {
      if (tryClickDropdown()) {
        obs.disconnect(); // If successful, disconnect the observer
      }
    });

    // Start observing the body for changes in the DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Attempt to click the dropdown immediately in case it's already there
    if (!tryClickDropdown()) {
      // If the dropdown wasn't clicked successfully, it might be because the modal hasn't appeared yet
      // Find and click the button or element that triggers the modal to open
      const triggerElementSelector = 'button[aria-haspopup="dialog"]'; // Update this selector to match the element that opens the modal
      const triggerElement = document.querySelector(triggerElementSelector);

      if (triggerElement) {
        triggerElement.click();
        console.log("Triggered the modal to open");

        // Since the modal opening is likely to be animated and take some time, set a timeout before trying to click the dropdown again
        setTimeout(() => {
          if (!tryClickDropdown()) {
            console.error(
              "Failed to click the 'Secondary owner' dropdown after opening the modal"
            );
            // Handle the failure as appropriate for your application
          }
        }, 1000); // Adjust the timeout as necessary to allow for the modal to fully open and render
      } else {
        console.error(
          "Unable to find the element that triggers the modal to open"
        );
        // Handle this situation as appropriate for your application
      }
    } else {
      observer.disconnect();
    }
  }

  function clickAddMemberOption() {
    const fullName = jointFirst + " " + jointLast;

    // Function to find and click the option
    const tryClickMemberOption = () => {
      const options = Array.from(
        document.querySelectorAll("ul.MuiList-root li.MuiMenuItem-root")
      );
      const targetOption = options.find((option) =>
        option.textContent.includes(fullName)
      );

      if (targetOption) {
        targetOption.click();
        console.log(`Clicked on member: ${fullName}`);
        setTimeout(() => {
          clickSaveButton();
        }, 1000);

        return true; // Indicate success
      }
      return false; // Indicate failure
    };

    // Try to click the member option immediately
    if (!tryClickMemberOption()) {
      console.error(`Member with name ${fullName} not found`);
      // Handle the failure as appropriate for your application
    }
  }

  function clickSaveButton() {
    // Find all buttons on the page
    const buttons = Array.from(document.querySelectorAll("button"));

    // Find the save button by its text content
    const saveButton = buttons.find(
      (button) => button.textContent.trim() === "Save"
    );

    if (saveButton) {
      saveButton.click();
      console.log("Clicked the 'Save' button");
      setTimeout(() => {
        clickCustodianDropdown();
      }, 1000);
    } else {
      console.error("Save button not found");
      // Handle the situation where the button is not found
    }
  }

  // Create an observer instance
  const observer = new MutationObserver((mutations, obs) => {
    if (tryClickOption()) {
      // Try to click the option
      obs.disconnect(); // If successful, disconnect the observer
    }
  });

  // Start observing the body for changes in the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try to click the option immediately in case it's already there
  if (!tryClickOption()) {
    // If the option was not clicked successfully, trigger the dropdown to show options
    setTimeout(() => {
      const dropdown = document.querySelector("div.MuiSelect-root");
      if (dropdown) {
        dropdown.click();
        console.log("Opened dropdown - waiting for options...");
      }
    }, 300); // Adjust the timeout as necessary
  } else {
    observer.disconnect(); // If we clicked the option, disconnect the observer
  }
}

// step five-three: Click select registration type
function clickCustodianDropdown() {
  // Query the document for the dropdown element
  const dropdownSpans = Array.from(
    document.querySelectorAll(
      'div.MuiSelect-root[aria-haspopup="listbox"] > span'
    )
  );
  const custodianDropdown = dropdownSpans.find(
    (span) => span.textContent === "Select a custodian"
  )?.parentNode;

  if (custodianDropdown) {
    // Focus on the dropdown element
    custodianDropdown.focus();

    // Dispatch mouse events to mimic the user's actions
    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      custodianDropdown.dispatchEvent(
        new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });

    // Set a timeout to handle subsequent actions
    setTimeout(() => {
      console.log("Preparing to select an option...");
      clickCustodianOption();
    }, 4000); // 2-second delay
  }
}

function clickCustodianOption() {
  // Define a function to click the target option when it's available
  const tryClickOption = () => {
    const options = Array.from(
      document.querySelectorAll("ul.MuiList-root li.MuiMenuItem-root")
    );
    const targetOption = options.find((option) =>
      option.textContent.includes(globalCustodianType)
    );

    if (targetOption) {
      targetOption.click();
      console.log(`Clicked registration type option: ${globalCustodianType}`);
      // Add any additional logic you need after clicking the option
      setTimeout(() => {
        console.log("Preparing to select an option...");
        selectExistingStrategy();
      }, 4000); // 2-second delay
      return true; // Indicate success
    }
    return false; // Indicate failure
  };

  // Create an observer instance
  const observer = new MutationObserver((mutations, obs) => {
    if (tryClickOption()) {
      // Try to click the option
      obs.disconnect(); // If successful, disconnect the observer
    }
  });

  // Start observing the body for changes in the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try to click the option immediately in case it's already there
  if (!tryClickOption()) {
    // If the option was not clicked successfully, trigger the dropdown to show options
    setTimeout(() => {
      const dropdown = document.querySelector("div.MuiSelect-root");
      if (dropdown) {
        dropdown.click();
        console.log("Opened dropdown - waiting for options...");
      }
    }, 4000); // Adjust the timeout as necessary
  } else {
    observer.disconnect(); // If we clicked the option, disconnect the observer
  }
}

// // Function to find and click on the span that opens the modal for selecting an existing strategy
function selectExistingStrategy() {
  let spans = document.querySelectorAll("span");

  for (let span of spans) {
    // Using trim() to ensure there are no leading/trailing spaces
    if (span.textContent.trim() === "Select an existing strategy") {
      // Simulate a click on this span
      span.click();
      console.log('Clicked "Select an existing strategy" span.');
      setTimeout(() => {
        console.log("Preparing to select an option...");
        clickProgramOptionByContent(globalProgram);
      }, 2000); // 2-second delay
      return true; // Indicate that the span was found and clicked
    }
  }

  console.log("Select an existing strategy span not found.");
  return false; // Indicate that the span was not found
}

function clickProgramOptionByContent(programString) {
  // Define a function to click the target option when it's available
  const tryClickProgramOption = () => {
    const options = Array.from(
      document.querySelectorAll("button[role='radio']")
    );
    const targetOption = options.find((option) => {
      const labelSpan = option.nextElementSibling;
      return labelSpan && labelSpan.textContent.includes(programString);
    });

    if (targetOption) {
      targetOption.click();
      console.log(`Clicked program option with string "${programString}"`);

      setTimeout(() => {
        console.log("Preparing to select an option...");
        clickStartSelectingButton();
      }, 15000);
      return true; // Indicate success
    }
    return false; // Indicate failure if the target option wasn't found
  };

  // Create an observer instance to watch for when the modal is added to the DOM
  const observer = new MutationObserver((mutations, obs) => {
    if (tryClickProgramOption()) {
      obs.disconnect(); // If successful, disconnect the observer
    }
  });

  // Start observing the body for changes in the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try to click the program option immediately in case it's already visible
  if (!tryClickProgramOption()) {
    console.log("Waiting for modal to appear...");
  }
}

function clickStartSelectingButton() {
  // Look for the button with the aria-label "Start Button"
  let buttons = document.querySelectorAll('button[aria-label="Start Button"]');
  for (let button of buttons) {
    button.click();
    setTimeout(() => {
      setInputValueForNameFilterWhenModalAppears(nameOnPortfolio);
    }, 5000);

    return; // Exit the function after clicking the button
  }
}

function setInputValueForNameFilterWhenModalAppears(inputValue) {
  const trySetInputValue = () => {
    const input = document.querySelector(
      `.MuiDrawer-root input[placeholder="Filter by name"]`
    );

    if (input) {
      input.focus();
      input.value = inputValue;
      ["change", "input"].forEach((event) => {
        input.dispatchEvent(new Event(event, { bubbles: true }));
      });

      console.log(`Set input value to "${inputValue}"`);

      setTimeout(() => {
        findRowAndClickRadioButton(nameOnPortfolio);
      }, 3000);

      return true; // Indicate success
    }
    return false; // Indicate failure if the input field wasn't found
  };

  // This observer looks for changes in the DOM that indicate the modal has been added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check if the modal is now present
        const modalExists = Array.from(mutation.addedNodes).some(
          (node) => node.matches && node.matches(".MuiDrawer-root")
        );
        if (modalExists && trySetInputValue()) {
          observer.disconnect(); // Disconnect the observer if successful
          break; // Exit the loop
        }
      }
    }
  });

  // Start observing the body for when elements are added to the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try to set the input value immediately in case the modal is already visible
  if (!trySetInputValue()) {
    console.log("Waiting for the modal to appear...");
  }
}

function findRowAndClickRadioButton(nameOnPortfolio) {
  const rows = document.querySelectorAll('.MuiDrawer-root [role="row"]');
  rows.forEach((row) => {
    const nameCell = Array.from(row.querySelectorAll('div[role="cell"]')).find(
      (cell) => cell.textContent.includes(nameOnPortfolio)
    );

    if (nameCell) {
      console.log("Found row with portfolio name:", nameOnPortfolio);
      const radioButton = nameCell.parentNode.querySelector(
        'button[role="radio"]'
      );
      if (radioButton) {
        radioButton.click();
        console.log("Clicked the radio button for", nameOnPortfolio);
        // Now proceed to click the "Select product" button after a delay
        setTimeout(() => {
          clickSelectProductButton();
        }, 3000);
      }
    }
  });
}

function rebalanceFrequencyAdd() {
  // Query all buttons and convert NodeList to Array
  let buttons = Array.from(document.querySelectorAll("button"));

  // Find the "Add" button that is within the "Account Settings" section
  let addButton = buttons.find(
    (button) =>
      button.textContent.includes("Add") &&
      button.closest("h2")?.textContent.includes("Account Settings")
  );

  if (addButton) {
    console.log("Add button found in Account Settings:", addButton);

    // Click the found button
    addButton.click();
    console.log("Clicked 'Add' in Account Settings");

    setTimeout(() => {
      console.log("setting up observer for rebalance");
      rebalanceFreqObs();
    }, 3000);
  }

  function clickSaveButton() {
    let saveButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Save")
    );

    if (saveButton) {
      console.log("Save button found:", saveButton);

      saveButton.click();
      console.log("Clicked 'Save'");
      setTimeout(() => {
        saveContinue();
        setTimeout(() => {
          clickFeeScheduleDropdownAndSelectOption();
        }, 11000);
      }, 5000);
    } else {
      console.log("Save button not found");
    }
  }
}

function clickSelectProductButton() {
  // Query for the button based on class name and content
  const buttons = Array.from(document.querySelectorAll("button"));
  const selectProductButton = buttons.find((button) => {
    return button.textContent.includes("Select product");
  });

  if (selectProductButton && !selectProductButton.disabled) {
    // Check if the button exists and is not disabled
    selectProductButton.click();
    console.log('Clicked the "Select product" button.');
    setTimeout(() => {
      saveContinue();
      if (nameOnPortfolio === "6.18 UMA") {
        setTimeout(() => {
          rebalanceFrequencyAdd();
          console.log("referenceting");
        }, 7000);
      } else {
        setTimeout(() => {
          saveContinue();
          setTimeout(() => {
            clickFeeScheduleDropdownAndSelectOption();
          }, 11000);
        }, 5000);
      }
    }, 3000);
  } else {
    console.log("Button not found or it is disabled.");
  }
}

function saveContinue() {
  let spanFound = false;
  let spans = document.querySelectorAll("span");

  for (let span of spans) {
    if (span.textContent.includes("Save and continue")) {
      console.log(`SPAN FOUND WITH STRING "SAVE AND CONTINUE"`, span);
      spanFound = true;

      setTimeout(() => {
        span.click(); // Simpler way to click without creating a MouseEvent
        console.log("Clicked 'Save and continue'");
      }, 2000); // Waiting for animations to complete

      break; // Exit the loop as we've found and clicked the span
    }
  }
}

function clickFeeScheduleDropdownAndSelectOption() {
  // First, click the dropdown to reveal the options
  const dropdown = document.querySelector(".MuiSelect-selectMenu");
  if (dropdown) {
    dropdown.focus();
    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      dropdown.dispatchEvent(
        new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });
    // Wait for the options to appear
    setTimeout(() => {
      // Look for the options in the list
      const optionText = feeSchedule === "quarterly" ? "Quarterly" : "Monthly";
      const listItems = document.querySelectorAll(
        "ul.MuiList-root li.MuiMenuItem-root"
      );

      // Find the specific option
      const optionToSelect = Array.from(listItems).find((item) => {
        return item.innerText.includes(optionText);
      });

      if (optionToSelect) {
        optionToSelect.click();
        console.log(`Option "${optionText}" has been clicked.`);
        setTimeout(() => {
          clickEditAdvisorFeeButton();
        }, 8000);
      } else {
        console.log(`Option "${optionText}" not found.`);
      }
    }, 500); // Adjust this timeout to match the time it takes for the options to appear
  } else {
    console.log("Dropdown for fee schedule not found.");
  }
}

function clickEditAdvisorFeeButton() {
  // Query the document for the button with the specific aria-label
  const button = document.querySelector(
    'button[aria-label="edit-advisor-fee"]'
  );

  // Check if the button exists
  if (button) {
    button.click(); // Click the button
    console.log('Clicked the "edit-advisor-fee" button.');
    setTimeout(() => {
      setupModalObserverAndClickDropdown();
      setTimeout(() => {
        clickDropdownMenu();
      }, 5000);
    }, 5000);
  }
}

function setupModalObserverAndClickDropdown() {
  // Define the observer
  const observer = new MutationObserver((mutations, obs) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check for the specific modal class
        const modalExists = Array.from(mutation.addedNodes).some(
          (node) => node.matches && node.matches(".MuiDialog-scrollPaper")
        );

        if (modalExists) {
          console.log("Modal detected, clicking dropdown...");
          setTimeout(() => {
            clickDropdownMenu();
          }, 5000);
          obs.disconnect(); // Disconnect the observer after clicking the dropdown
          break;
        }
      }
    }
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function clickDropdownMenu() {
  // Select all dropdowns
  const dropdowns = document.querySelectorAll(
    "div.MuiSelect-root[aria-haspopup='listbox']"
  );

  // Find the dropdown that contains the specific span text
  const targetDropdown = Array.from(dropdowns).find((dropdown) => {
    const span = dropdown.querySelector("span");
    return span && span.textContent === "Select a fee template";
  });

  if (targetDropdown) {
    targetDropdown.focus();
    ["mousedown", "mouseup", "click"].forEach((eventType) => {
      targetDropdown.dispatchEvent(
        new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });
    console.log("Dropdown with 'Select a fee template' clicked.");
    setTimeout(() => {
      clickFeeTemplateOption(feeTemplate);
    }, 5000);
  } else {
    console.log("Specific dropdown not found.");
  }
}

function clickFeeTemplateOption(feeTemplate) {
  // Wait for the dropdown to be opened and rendered in the DOM
  const interval = setInterval(() => {
    const options = document.querySelectorAll(
      ".MuiMenu-paper .MuiMenuItem-root"
    );
    if (options.length > 0) {
      clearInterval(interval);

      // Find the option that includes the fee template text
      const targetOption = Array.from(options).find((option) =>
        option.textContent.includes(feeTemplate)
      );

      if (targetOption) {
        targetOption.click();
        console.log(`Clicked fee template option: ${feeTemplate}`);
        setTimeout(() => {
          clickApplyButton(feeTemplate);
        }, 1000);
      } else {
        console.log(`Fee template option '${feeTemplate}' not found.`);
      }
    }
  }, 500); // Check every 500 milliseconds
}
function clickApplyButton() {
  // Select all buttons
  const buttons = document.querySelectorAll('button[type="button"]');

  // Find the button with the text "Apply"
  const targetButton = Array.from(buttons).find((button) =>
    button.textContent.includes("Apply")
  );

  if (targetButton) {
    targetButton.click();
    console.log("Clicked 'Apply' button.");
    setTimeout(() => {
      clickAgreeButton();
    }, 5000);
  } else {
    console.log("'Apply' button not found.");
  }
}

function clickAgreeButton() {
  // Find the span containing the specific text
  const span = Array.from(document.querySelectorAll("span")).find((span) =>
    span.textContent.includes("I agree to the fee schedules shown above")
  );

  if (span) {
    // Find the button within the parent of the span
    const button = span.parentElement.querySelector('button[role="checkbox"]');
    if (button) {
      button.click();
      console.log("Clicked 'I agree' checkbox button.");
      setTimeout(() => {
        clickContinueButton();
      }, 5000);
    } else {
      console.log("'I agree' checkbox button not found.");
    }
  } else {
    console.log("Span with 'I agree' text not found.");
  }
}

function clickContinueButton() {
  // Find the span containing the specific text "Continue"
  const span = Array.from(document.querySelectorAll("button span")).find(
    (span) => span.textContent.includes("Continue")
  );

  if (span) {
    // Get the button that is the ancestor of the span
    const button = span.closest("button");
    if (button) {
      if (!button.disabled) {
        button.click();
        console.log("Clicked 'Continue' button.");
        setTimeout(() => {
          clickGenerateDocumentsButton();
        }, 5000);
      }
    }
  }
}

function clickGenerateDocumentsButton() {
  // Find the span containing the specific text "Generate documents"
  const span = Array.from(document.querySelectorAll("button span")).find(
    (span) => span.textContent.includes("Generate documents")
  );

  if (span) {
    // Get the button that is the ancestor of the span
    const button = span.closest("button");
    if (button) {
      button.click();
      console.log("Clicked 'Generate documents' button.");
      setTimeout(() => {
        closeCurrentTab();
      }, 2000);
    } else {
      console.log("'Generate documents' button not found.");
    }
  } else {
    console.log("Span with 'Generate documents' text not found.");
  }
}

//NEWTABSCRIPT
function closeCurrentTab() {
  // Send a message to the background script
  chrome.runtime.sendMessage({ action: "closeTab" });
}

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9EQUFvRCxZQUFZO0FBQ2hFO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsUUFBUTtBQUNSLDRDQUE0QyxZQUFZO0FBQ3hEO0FBQ0E7QUFDQSxHQUFHLFFBQVE7QUFDWDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixvQkFBb0I7QUFDbkQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGNlbC10cmFuc2Zlci8uL3NyYy9uZXdUYWJTY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTkVXVEFCU0NSSVBULkpTICoqXG4vLyBTdGVwIDQ6IHJ1bm5pbmcgdGhlIHNjcmlwdHMgZm9yIHRoZSBuZXcgdGFiICoqXG5cbi8vIFV0aWxpdHkgZnVuY3Rpb25zIGRlZmluZWQgaGVyZSBiZWxvdzpcblxuLy8gU3RlcCBvbmUsIGdldCBkYXRhLi4uIGRhdGEgb2J0YWluZWQsIHN0YXJ0IGF1dG9tYXRpb25cbi8vIExpc3RlbmVyIHRvIGFjdCB1cG9uIHJlY2VpdmluZyBtZXNzYWdlcyBmcm9tIHRoZSBDaHJvbWUgZXh0ZW5zaW9uLlxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwiYXV0b21hdGVEYXRhXCIpIHtcbiAgICAvLyBFbnN1cmUgd2VicGFnZSBjb250ZW50IChET00pIGlzIGZ1bGx5IGxvYWRlZCBiZWZvcmUgdGFraW5nIGFjdGlvbi5cbiAgICBjb25zdCBpbmRleCA9IG1lc3NhZ2UuY3VycmVudEluZGV4O1xuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBvcGVuTmFtZSA9IGNsaWNrU3BhbigpOyAvLyBjYWxsIHRoZSBhdXRvY2xpY2tlciBoZXJlXG4gICAgICAgIHNldHVwTXV0YXRpb25PYnNlcnZlckZvck1vZGFsKG1lc3NhZ2UuZGF0YSwgaW5kZXgpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdGF0dXM6IG9wZW5OYW1lID8gXCJzdWNjZXNzXCIgOiBcImVycm9yXCIgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9ET01Db250ZW50TG9hZGVkIGFscmVhZHkgaGFzIGZpcmVkXG4gICAgICBjb25zdCBvcGVuTmFtZSA9IGNsaWNrU3BhbigpOyAvLyBDYWxsaW5nIHRoZSBzcGFuIGNsaWNrZXIgaGVyZS4uLlxuICAgICAgc2V0dXBNdXRhdGlvbk9ic2VydmVyRm9yTW9kYWwobWVzc2FnZS5kYXRhLCBpbmRleCk7XG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdGF0dXM6IG9wZW5OYW1lID8gXCJzdWNjZXNzXCIgOiBcImVycm9yXCIgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59KTtcblxuLy8gU3RlcCB0d28sIGNsaWNrIFwiQ3JlYXRlIGhvdXNlaG9sZFwiIGJ1dHRvblxuZnVuY3Rpb24gY2xpY2tTcGFuKCkge1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlOyAvLyBmbGFnIHRvIGluZGljYXRlIGlmIGNsaWNrIHdhcyBzdWNjZXNzZnVsXG5cbiAgLy8gRmV0Y2ggYWxsIHNwYW4gZWxlbWVudHMgaW4gdGhlIGRvY3VtZW50LlxuICBsZXQgc3BhbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic3BhblwiKTtcblxuICAvLyBMb29wIHRocm91Z2ggZWFjaCBzcGFuIGFuZCBjbGljayBpZiBpdCBtYXRjaGVzIHRoZSBkZXNpcmVkIHRleHQuXG4gIHNwYW5zLmZvckVhY2goKHNwYW4pID0+IHtcbiAgICBpZiAoc3Bhbi50ZXh0Q29udGVudC5pbmNsdWRlcyhcIkNyZWF0ZSBhIG5ldyBob3VzZWhvbGRcIikpIHtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBtb3VzZSBldmVudFxuICAgICAgbGV0IGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiLCB7XG4gICAgICAgIHZpZXc6IHdpbmRvdyxcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgIH0pO1xuICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV2ZW50IG9uIHRoZSB0YXJnZXQgZWxlbWVudC4uLlxuICAgICAgc3Bhbi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlOyAvLyBSZXR1cm4gd2hldGhlciB0aGUgZGVzaXJlZCBzcGFuIHdhcyBjbGlja2VkIG9yIG5vdC5cbiAgICAgIC8vIF9ERVYgVVNFXG4gICAgICBjb25zb2xlLmxvZyhcIkNyZWF0aW5nIG5ldyBob3VzZWhvbGQgYnV0dG9uLi4uXCIpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzdWNjZXNzOyAvLyBSZXR1cm4gdGhlIHN0YXR1c1xufVxuXG4vLyBTdGVwIHRocmVlLW9uZVxuY29uc3Qgcmlza1RvbGVyYW5jZVRvUGVyY2VudGFnZSA9IHtcbiAgXCJDYXBpdGFsIFByZXNlcnZhdGlvblwiOiA3LFxuICBDb25zZXJ2YXRpdmU6IDIxLjUsXG4gIFwiQ29uc2VydmF0aXZlIEdyb3d0aFwiOiAzNixcbiAgTW9kZXJhdGU6IDUwLFxuICBcIk1vZGVyYXRlIEdyb3d0aFwiOiA2NCxcbiAgR3Jvd3RoOiA3OC41LFxuICBBZ2dyZXNzaXZlOiA5Myxcbn07XG5cbmxldCBnbG9iYWxSZWdpc3RyYXRpb25UeXBlID0gXCJcIjtcbmxldCBnbG9iYWxDdXN0b2RpYW5UeXBlID0gXCJcIjtcbmxldCBnbG9iYWxQcm9wb3NhbEFtb3VudCA9IDA7XG5sZXQgZ2xvYmFsUHJvZ3JhbSA9IFwiXCI7XG5sZXQgZ2xvYmFsUmlza1RvbGVyYW5jZSA9IFwiXCI7XG5sZXQgbmFtZU9uUG9ydGZvbGlvID0gXCJcIjtcbmxldCBmZWVTY2hlZHVsZSA9IFwiXCI7XG5sZXQgZmVlVGVtcGxhdGUgPSBcIlwiO1xubGV0IGpvaW50Rmlyc3QgPSBcIlwiO1xubGV0IGpvaW50TGFzdCA9IFwiXCI7XG4vLyBGaW5kIG1vZGFsXG5mdW5jdGlvbiBzZXR1cE11dGF0aW9uT2JzZXJ2ZXJGb3JNb2RhbChkYXRhLCBpbmRleCkge1xuICBjb25zdCB0YXJnZXROb2RlID0gZG9jdW1lbnQuYm9keTtcbiAgY29uc3QgY29uZmlnID0geyBhdHRyaWJ1dGVzOiBmYWxzZSwgY2hpbGRMaXN0OiB0cnVlLCBzdWJUcmVlOiB0cnVlIH07XG5cbiAgY29uc3QgY2FsbGJhY2sgPSBmdW5jdGlvbiAobXV0YXRpb25zTGlzdCwgb2JzZXJ2ZXIpIHtcbiAgICBmb3IgKGNvbnN0IG11dGF0aW9uIG9mIG11dGF0aW9uc0xpc3QpIHtcbiAgICAgIGlmIChtdXRhdGlvbi50eXBlID09PSBcImNoaWxkTGlzdFwiICYmIG11dGF0aW9uLmFkZGVkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAobXV0YXRpb24udGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubW9kYWwtZHJhZ2dhYmxlLWhhbmRsZVwiKSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTU9EQUxfREVURUNURURcIik7XG4gICAgICAgICAgcHJvY2Vzc0V4Y2VsRGF0YShkYXRhLCBpbmRleCk7XG5cbiAgICAgICAgICAvLyBEaXNjb25uZWN0IHRoZSBjdXJyZW50IG9ic2VydmVyIHNpbmNlIHdlIGZvdW5kIHRoZSBtb2RhbFxuICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcblxuICAgICAgICAgIC8vIFNldHVwIGFub3RoZXIgb2JzZXJ2ZXIgdG8gZGV0ZWN0IHRoZSByZW1vdmFsIG9mIHRoZSBtb2RhbFxuICAgICAgICAgIC8vIHNldHVwT2JzZXJ2ZXJGb3JNb2RhbFJlbW92YWwoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLy8gT25jZSBtb2RhbCBpcyBmb3VuZDpcbiAgLy8gU3RlcCB0aHJlZS10d29cbiAgLy8gR2l2ZSBhcmlhIGxhYmVscyBkZWZpbml0aW9uc1xuICBmdW5jdGlvbiBzZXRJbnB1dFZhbHVlQnlBcmlhTGFiZWwobGFiZWwsIHZhbHVlKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGZpbmRFbGVtZW50QnlBcmlhTGFiZWwobGFiZWwpO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAvLyBNYW51YWxseSB0cmlnZ2VyIGEgY2hhbmdlIGV2ZW50XG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmluZEVsZW1lbnRCeUFyaWFMYWJlbChsYWJlbCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbYXJpYS1sYWJlbD1cIiR7bGFiZWx9XCJdYCk7XG4gIH1cblxuICAvLyBTdGVwIHRocmVlLXRocmVlXG4gIC8vIE5vdyBSdW4gcHJvY2Vzc0V4Y2VsRGF0YSgpXG5cbiAgLy8gUHJlIGRlZmluaW5nIGFkZE5hbWVDbGljaygpXG4gIGZ1bmN0aW9uIGFkZE5hbWVDbGljaygpIHtcbiAgICBsZXQgc3VjY2VzcyA9IGZhbHNlOyAvLyBGbGFnIHRvIGluZGljYXRlIGlmIGNsaWNrIHdhcyBzdWNjZXNzZnVsLlxuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLk11aURpYWxvZ0NvbnRlbnQtcm9vdFwiKTtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgY29uc29sZS5sb2coXCJNT0RBTF9OT1RfRk9VTkRcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiTU9EQUwgRk9VTkQ6IFNlYXJjaGluZyA8U1BBTlM+IPCflI5cIik7XG4gICAgbGV0IHNwYW5zID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzcGFuXCIpO1xuICAgIHNwYW5zLmZvckVhY2goKHNwYW4pID0+IHtcbiAgICAgIGlmIChzcGFuLnRleHRDb250ZW50LmluY2x1ZGVzKFwiQWRkXCIpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBTUEFOIEZPVU5EIFdJVEggU1RSSU5HIFwiQUREXCJgLCBzcGFuKTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IG1vdXNlIGV2ZW50XG4gICAgICAgIGxldCBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIiwge1xuICAgICAgICAgIHZpZXc6IHdpbmRvdyxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXZlbnQgb24gdGhlIHRhcmdldCBlbGVtZW50Li4uXG4gICAgICAgIHNwYW4uZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzdWNjZXNzOyAvLyBSZXR1cm4gdGhlIHN0YXR1c1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc0V4Y2VsRGF0YShkYXRhLCBpbmRleCkge1xuICAgIGNvbnNvbGUubG9nKFwiUHJvY2Vzc2luZyBkYXRhIGZvciBpbmRleDogXCIsIGluZGV4KTtcbiAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmVkIGRhdGE6XCIsIGRhdGEpO1xuICAgIGNvbnNvbGUubG9nKFwiUmVjZWl2ZWQgaW5kZXg6XCIsIGluZGV4KTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpICYmIGluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gZGF0YVtpbmRleF07XG4gICAgICBjb25zdCBjbGllbnRUaXRsZSA9IGZvcm1EYXRhLkNMSUVOVF9USVRMRSB8fCBcIkRlZmF1bHQgVGl0bGVcIjsgLy8gRmFsbGJhY2sgdmFsdWVcbiAgICAgIGNvbnN0IGZpcnN0TmFtZSA9IGZvcm1EYXRhLkZJUlNUX05BTUUgfHwgXCJEZWZhdWx0IEZOYW1lXCI7IC8vIEZhbGxiYWNrIHZhbHVlIGZvciBuYW1lXG4gICAgICBjb25zdCBsYXN0TmFtZSA9IGZvcm1EYXRhLkxBU1RfTkFNRSB8fCBcIkRlZmF1bHQgTE5BTUVcIjsgLy9GYWxsYmFjayBmb3IgbGFzdCBuYW1lXG4gICAgICBzZXRJbnB1dFZhbHVlQnlBcmlhTGFiZWwoXCJFbnRlciBob3VzZWhvbGQgbmFtZVwiLCBjbGllbnRUaXRsZSk7XG4gICAgICBzZXRJbnB1dFZhbHVlQnlBcmlhTGFiZWwoXCJGaXJzdCBuYW1lXCIsIGZpcnN0TmFtZSk7XG4gICAgICBzZXRJbnB1dFZhbHVlQnlBcmlhTGFiZWwoXCJMYXN0IG5hbWVcIiwgbGFzdE5hbWUpO1xuXG4gICAgICBnbG9iYWxSZWdpc3RyYXRpb25UeXBlID0gZm9ybURhdGEuUkVHSVNUUkFUSU9OIHx8IFwiRGVmYXVsdCBSZWdpc3RyYXRpb25cIjtcbiAgICAgIGdsb2JhbEN1c3RvZGlhblR5cGUgPSBmb3JtRGF0YS5DVVNUT0RJQU4gfHwgXCJEZWZhdWx0IFJlZ2lzdHJhdGlvblwiO1xuICAgICAgZ2xvYmFsUHJvcG9zYWxBbW91bnQgPSBmb3JtRGF0YS5BQ0NPVU5UX1ZBTFVFIHx8IDA7XG4gICAgICBnbG9iYWxQcm9ncmFtID0gZm9ybURhdGEuUFJPR1JBTSB8fCBcIlwiO1xuICAgICAgZ2xvYmFsUmlza1RvbGVyYW5jZSA9IGZvcm1EYXRhLlBPUlRGT0xJT19SSVNLIHx8IFwiXCI7XG4gICAgICBuYW1lT25Qb3J0Zm9saW8gPSBmb3JtRGF0YS5OQU1FX09OX1BPUlRGT0xJTyB8fCBcIlwiO1xuICAgICAgZmVlU2NoZWR1bGUgPSBmb3JtRGF0YS5CSUxMSU5HX0ZGUkVRVUVOQ1kgfHwgXCJNb250aGx5XCI7XG4gICAgICBmZWVUZW1wbGF0ZSA9IGZvcm1EYXRhLkFEVklTT1JfRkVFIHx8IFwiU3RhbmRhcmRcIjtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZENsaWNrZWQgPSBhZGROYW1lQ2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJBZGQgYnV0dG9uIGNsaWNrZWQ/IDpcIiwgYWRkQ2xpY2tlZCk7XG5cbiAgICAgICAgaWYgKGFkZENsaWNrZWQpIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGEgam9pbnQgYWNjb3VudCBhbmQgYWRkIGEgc2Vjb25kYXJ5IG93bmVyXG4gICAgICAgICAgaWYgKGdsb2JhbFJlZ2lzdHJhdGlvblR5cGUuaW5jbHVkZXMoXCJKb2ludFwiKSkge1xuICAgICAgICAgICAgam9pbnRGaXJzdCA9IGZvcm1EYXRhLkpPSU5UX09XTkVSX0ZJUlNUX05BTUUgfHwgXCJcIjtcbiAgICAgICAgICAgIGpvaW50TGFzdCA9IGZvcm1EYXRhLkpPSU5UX09XTkVSX0xBU1RfTkFNRSB8fCBcIlwiO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGNsaWNrQWRkTWVtYmVyQnV0dG9uKCk7XG4gICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0dXBPYnNlcnZlckZvck1vZGFsUmVtb3ZhbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgMzAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGRhdGEgZm9ybWF0IG9yIGluZGV4IG91dCBvZiBib3VuZHNcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpY2tBZGRNZW1iZXJCdXR0b24oKSB7XG4gICAgICBjb25zdCBhZGRNZW1iZXJCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWw9XCJhZGQtbWVtYmVyXCJdJ1xuICAgICAgKTtcbiAgICAgIGlmIChhZGRNZW1iZXJCdXR0b24pIHtcbiAgICAgICAgYWRkTWVtYmVyQnV0dG9uLmNsaWNrKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCAnQWRkIG1lbWJlcicgYnV0dG9uXCIpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBmaWxsSm9pbnRPd25lckRldGFpbHMoKTtcbiAgICAgICAgfSwgMzAwMCk7XG5cbiAgICAgICAgLy8gQ29udGludWUgd2l0aCB0aGUgbmV4dCBzdGVwXG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyAgIHNldHVwT2JzZXJ2ZXJGb3JNb2RhbFJlbW92YWwoKTtcbiAgICAgICAgLy8gfSwgNDAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIidBZGQgbWVtYmVyJyBidXR0b24gbm90IGZvdW5kXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbGxKb2ludE93bmVyRGV0YWlscygpIHtcbiAgICAgIGNvbnN0IGZpcnN0TmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJ2lucHV0W2FyaWEtbGFiZWw9XCJGaXJzdCBuYW1lXCJdJ1xuICAgICAgKTtcbiAgICAgIGNvbnN0IGxhc3ROYW1lSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnaW5wdXRbYXJpYS1sYWJlbD1cIkxhc3QgbmFtZVwiXSdcbiAgICAgICk7XG5cbiAgICAgIGZ1bmN0aW9uIHRyaWdnZXJJbnB1dEV2ZW50cyhpbnB1dCkge1xuICAgICAgICBpbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImZvY3VzXCIpKTtcbiAgICAgICAgaW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBpbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBpbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImJsdXJcIikpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlyc3ROYW1lSW5wdXQgJiYgbGFzdE5hbWVJbnB1dCkge1xuICAgICAgICBmaXJzdE5hbWVJbnB1dC52YWx1ZSA9IGpvaW50Rmlyc3Q7XG4gICAgICAgIHRyaWdnZXJJbnB1dEV2ZW50cyhmaXJzdE5hbWVJbnB1dCk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgbGFzdE5hbWVJbnB1dC52YWx1ZSA9IGpvaW50TGFzdDtcbiAgICAgICAgICB0cmlnZ2VySW5wdXRFdmVudHMobGFzdE5hbWVJbnB1dCk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjbGlja1JlbGF0aW9uc2hpcERyb3Bkb3duKCk7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfSwgMTAwMCk7IC8vIERlbGF5IGZvciBsYXN0TmFtZUlucHV0XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJKb2ludCBvd25lciBuYW1lcyBzZXRcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkpvaW50IG93bmVyIG5hbWUgaW5wdXRzIG5vdCBmb3VuZFwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGlja1JlbGF0aW9uc2hpcERyb3Bkb3duKCkge1xuICAgICAgY29uc3QgZHJvcGRvd24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnZGl2Lk11aVNlbGVjdC1yb290W2FyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJdJ1xuICAgICAgKTtcbiAgICAgIGlmIChkcm9wZG93bikge1xuICAgICAgICAvLyBTaW11bGF0ZSBmb2N1c2luZyBvbiB0aGUgZHJvcGRvd25cbiAgICAgICAgZHJvcGRvd24uZm9jdXMoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJGb2N1c2VkIG9uIHJlbGF0aW9uc2hpcCBkcm9wZG93blwiKTtcblxuICAgICAgICAvLyBTaW11bGF0ZSBjbGlja2luZyB0aGUgZHJvcGRvd24gdG8gb3BlbiBvcHRpb25zXG4gICAgICAgIGRyb3Bkb3duLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoXCJtb3VzZWRvd25cIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgZHJvcGRvd24uZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudChcIm1vdXNldXBcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgZHJvcGRvd24uY2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkIHJlbGF0aW9uc2hpcCBkcm9wZG93blwiKTtcblxuICAgICAgICAvLyBTZWxlY3QgYSByZWxhdGlvbnNoaXAgb3B0aW9uIGFmdGVyIGEgZGVsYXlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgc2VsZWN0UmVsYXRpb25zaGlwT3B0aW9uKCk7XG4gICAgICAgIH0sIDIwMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWxhdGlvbnNoaXAgZHJvcGRvd24gbm90IGZvdW5kXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZWxlY3RSZWxhdGlvbnNoaXBPcHRpb24oKSB7XG4gICAgICAvLyBFeGFtcGxlOiBTZWxlY3RpbmcgJ1Nwb3VzZScgYXMgdGhlIHJlbGF0aW9uc2hpcFxuICAgICAgLy8gVXBkYXRlIHRoZSBzZWxlY3RvciBvciB0ZXh0IGNvbnRlbnQgYmFzZWQgb24gYWN0dWFsIG9wdGlvbnMgYXZhaWxhYmxlXG4gICAgICBjb25zdCBvcHRpb25UZXh0ID0gXCJPdGhlclwiOyAvLyBVcGRhdGUgdGhpcyBiYXNlZCBvbiB5b3VyIG5lZWRzXG4gICAgICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgXCJ1bC5NdWlMaXN0LXJvb3QgbGkuTXVpTWVudUl0ZW0tcm9vdFwiXG4gICAgICApO1xuICAgICAgY29uc3QgdGFyZ2V0T3B0aW9uID0gQXJyYXkuZnJvbShvcHRpb25zKS5maW5kKFxuICAgICAgICAob3B0aW9uKSA9PiBvcHRpb24udGV4dENvbnRlbnQgPT09IG9wdGlvblRleHRcbiAgICAgICk7XG5cbiAgICAgIGlmICh0YXJnZXRPcHRpb24pIHtcbiAgICAgICAgdGFyZ2V0T3B0aW9uLmNsaWNrKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2VsZWN0ZWQgcmVsYXRpb25zaGlwOlwiLCBvcHRpb25UZXh0KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgYWRkTmFtZUNsaWNrKCk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjbGlja1NhdmVBbmRDb250aW51ZSgpO1xuICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgLy8gQ29udGludWUgd2l0aCB0aGUgbmV4dCBzdGVwIGFmdGVyIHNlbGVjdGluZyB0aGUgcmVsYXRpb25zaGlwXG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyAgIHNldHVwT2JzZXJ2ZXJGb3JNb2RhbFJlbW92YWwoKTtcbiAgICAgICAgLy8gfSwgMjAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlbGF0aW9uc2hpcCBvcHRpb24gbm90IGZvdW5kXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xuICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldE5vZGUsIGNvbmZpZyk7XG59XG5cbi8vIFN0ZXAgdGhyZWUtc2l4XG4vLyBDbG9zZSBtb2RhbFxuZnVuY3Rpb24gc2V0dXBPYnNlcnZlckZvck1vZGFsUmVtb3ZhbCgpIHtcbiAgY29uc3QgdGFyZ2V0Tm9kZSA9IGRvY3VtZW50LmJvZHk7XG4gIGNvbnN0IGNvbmZpZyA9IHsgYXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgc3ViVHJlZTogdHJ1ZSB9O1xuICBjb25zdCBjYWxsYmFjayA9IGZ1bmN0aW9uIChtdXRhdGlvbnNMaXN0LCBvYnNlcnZlcikge1xuICAgIGZvciAoY29uc3QgbXV0YXRpb24gb2YgbXV0YXRpb25zTGlzdCkge1xuICAgICAgaWYgKG11dGF0aW9uLnR5cGUgPT09IFwiY2hpbGRMaXN0XCIgJiYgbXV0YXRpb24ucmVtb3ZlZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbW9kYWxSZW1vdmVkID0gQXJyYXkuZnJvbShtdXRhdGlvbi5yZW1vdmVkTm9kZXMpLnNvbWUoXG4gICAgICAgICAgKG5vZGUpID0+XG4gICAgICAgICAgICBub2RlLnF1ZXJ5U2VsZWN0b3IgJiYgbm9kZS5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsLWRyYWdnYWJsZS1oYW5kbGVcIilcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG1vZGFsUmVtb3ZlZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTU9EQUwgUkVNT1ZFRFwiKTtcbiAgICAgICAgICAvLyBPbmNlIHRoZSBzZXR1cE9ic2VydmVyRm9yTW9kYWxSZW1vdmFsKCkgaXMgcmFuIGl0IHdpbGwgc3RhcnQgdGhlIG5leHQgZnVuY3Rpb24gY2xpY2tTYXZlQW5kQ29udGludWUoKVxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2xpY2tTYXZlQW5kQ29udGludWUoKTtcbiAgICAgICAgICB9LCA0MDAwKTtcblxuICAgICAgICAgIC8vIERpc2Nvbm5lY3QgdGhlIG9ic2VydmVyIHNpbmNlIHdlIGRldGVjdGVkIHRoZSByZW1vdmFsIG9mIHRoZSBtb2RhbFxuICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKTtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXROb2RlLCBjb25maWcpO1xufVxuLy8gU3RlcCBmb3VyLW9uZSBzYXZlIGFuZCBjb250aW51ZSBpbnRvIHRoZSBuZXcgcmlzayBhbmQgb2JqZWN0aXZlIGZ1bmN0aW9ucyBzZWN0aW9ucy4uLi5cbmZ1bmN0aW9uIGNsaWNrU2F2ZUFuZENvbnRpbnVlKCkge1xuICAvLyBMb29rIGZvciB0aGUgYnV0dG9uIHdpdGggdGV4dCBcIlNhdmUgYW5kIGNvbnRpbnVlXCJcbiAgbGV0IGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uXCIpO1xuICBmb3IgKGxldCBidXR0b24gb2YgYnV0dG9ucykge1xuICAgIGlmIChidXR0b24udGV4dENvbnRlbnQuaW5jbHVkZXMoXCJTYXZlIGFuZCBjb250aW51ZVwiKSkge1xuICAgICAgY29uc29sZS5sb2coYEJVVFRPTiBGT1VORCBXSVRIIFNUUklORyBcIlNBVkUgQU5EIENPTlRJTlVFXCJgLCBidXR0b24pO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IG1vdXNlIGV2ZW50XG4gICAgICAgIGxldCBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIiwge1xuICAgICAgICAgIHZpZXc6IHdpbmRvdyxcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXZlbnQgb24gdGhlIGJ1dHRvblxuICAgICAgICBidXR0b24uZGlzcGF0Y2hFdmVudChldmVudCk7XG5cbiAgICAgICAgLy8gU3RlcCBmb3VyLW9uZVxuICAgICAgICAvLyBDbGljayBcIkkga25vdyBteSBjbGllbnRzIHJpc2sgdG9sZXJhbmNlXCIgYnV0dG9uXG4gICAgICAgIGNsaWNrUmlza1RvbGVyYW5jZUJ1dHRvbkFmdGVyRGVsYXkoKTtcbiAgICAgIH0sIDMwMDApO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKFwiU2F2ZSBhbmQgY29udGludWUgYnV0dG9uIG5vdCBmb3VuZFwiKTtcbn1cbi8vIFN0ZXAgZm91ci10d29cbi8vIENsaWNrIHRoYXQgd2Uga25vdyBvdXIgY2xpZW50J3Mgcmlza3MuLi5cbmZ1bmN0aW9uIGFkanVzdFJpc2tUb2xlcmFuY2VTbGlkZXIoKSB7XG4gIGNvbnN0IHBlcmNlbnRhZ2UgPSByaXNrVG9sZXJhbmNlVG9QZXJjZW50YWdlW2dsb2JhbFJpc2tUb2xlcmFuY2VdIHx8IDUwOyAvLyBEZWZhdWx0IHRvIDUwIGlmIG5vIG1hdGNoIGlzIGZvdW5kXG4gIGNsaWNrU2xpZGVyQXRQb3NpdGlvbihwZXJjZW50YWdlKTtcbn1cblxuZnVuY3Rpb24gY2xpY2tSaXNrVG9sZXJhbmNlQnV0dG9uQWZ0ZXJEZWxheSgpIHtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICdidXR0b25bYXJpYS1sYWJlbD1cIkkgYWxyZWFkeSBrbm93IG15IGNsaWVudFxcJ3MgcmlzayB0b2xlcmFuY2VcIl0nXG4gICAgKTtcbiAgICBpZiAoYnV0dG9uKSB7XG4gICAgICBidXR0b24uY2xpY2soKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCB0aGUgJ0kgYWxyZWFkeSBrbm93IHRoZSByaXNrIHRvbGVyYW5jZScgYnV0dG9uLlwiKTtcblxuICAgICAgLy8gSW50cm9kdWNlIGEgZGVsYXkgYWZ0ZXIgY2xpY2tpbmcgdGhlIHJpc2sgdG9sZXJhbmNlIGJ1dHRvbiBhbmQgdGhlbiBhZGp1c3QgdGhlIHNsaWRlclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIFN0ZXAgZm91ci10d29cbiAgICAgICAgLy8gQ2xpY2sgc2xpZGVyIHRvIGl0cyBwcm9wZXIgbG9jYXRpb25cbiAgICAgICAgYWRqdXN0Umlza1RvbGVyYW5jZVNsaWRlcigpO1xuICAgICAgfSwgMjAwMCk7IC8vIERlbGF5IG9mIDIgc2Vjb25kcyAoMjAwMCBtaWxsaXNlY29uZHMpIHRvIGFkanVzdCB0aGUgc2xpZGVyIGFmdGVyIGNsaWNraW5nIHRoZSBidXR0b25cbiAgICB9XG4gIH0sIDUwMDApOyAvLyBEZWxheSBvZiA1IHNlY29uZHMgKDUwMDAgbWlsbGlzZWNvbmRzKSB0byBjbGljayB0aGUgYnV0dG9uXG59XG5cbi8vIFN0ZXAgZm91ci10aHJlZVxuLy8gU2xpZGUgdGhlIGNvcnJlbGF0aW5nIGNsaWVudCByaXNrcywgYmFzZWQgb24gUklTS19BU1NFU1NNRU5UOjpcbmZ1bmN0aW9uIGNsaWNrU2xpZGVyQXRQb3NpdGlvbihwZXJjZW50YWdlKSB7XG4gIGNvbnN0IHNsaWRlckNvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXZbcm9sZT1cImJ1dHRvblwiXScpO1xuXG4gIGNvbnN0IHNsaWRlciA9IEFycmF5LmZyb20oc2xpZGVyQ29udGFpbmVycykuZmluZCgoY29udGFpbmVyKSA9PiB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oY29udGFpbmVyLmNoaWxkcmVuKS5zb21lKChjaGlsZCkgPT5cbiAgICAgIGNoaWxkLnN0eWxlLmxlZnQuaW5jbHVkZXMoXCJjYWxjXCIpXG4gICAgKTtcbiAgfSk7XG5cbiAgaWYgKHNsaWRlcikge1xuICAgIGNvbnN0IHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgY2xpY2tYID0gcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCAqIChwZXJjZW50YWdlIC8gMTAwKTtcbiAgICBjb25zdCBjbGlja1kgPSByZWN0LnRvcCArIHJlY3QuaGVpZ2h0IC8gMjtcblxuICAgIGNvbnN0IGNsaWNrRXZlbnQgPSBuZXcgTW91c2VFdmVudChcImNsaWNrXCIsIHtcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgdmlldzogd2luZG93LFxuICAgICAgY2xpZW50WDogY2xpY2tYLFxuICAgICAgY2xpZW50WTogY2xpY2tZLFxuICAgIH0pO1xuXG4gICAgc2xpZGVyLmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBTdGVwIGZvdXItdHdvXG4gICAgICAvLyBDbGljayBzbGlkZXIgdG8gaXRzIHByb3BlciBsb2NhdGlvblxuICAgICAgY2xpY2tSaXNrQXNzZXNzbWVudERyb3Bkb3duKCk7XG4gICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXNzZXNzbWVudCBkcm9wZG93blwiKTtcbiAgICB9LCAyMDAwKTtcbiAgfVxufVxuXG4vLyBTdGVwIGZvdXItZm91clxuLy8gT3BlbiB0aGUgZHJvcGRvd24gYWZ0ZXIgdGhlIHNsaWRlclxuZnVuY3Rpb24gY2xpY2tSaXNrQXNzZXNzbWVudERyb3Bkb3duKCkge1xuICBjb25zdCBkcm9wZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgXCJkaXYuTXVpU2VsZWN0LXJvb3RbYXJpYS1oYXNwb3B1cD0nbGlzdGJveCddXCJcbiAgKTtcblxuICBpZiAoZHJvcGRvd24pIHtcbiAgICBkcm9wZG93bi5mb2N1cygpO1xuICAgIFtcIm1vdXNlZG93blwiLCBcIm1vdXNldXBcIiwgXCJjbGlja1wiXS5mb3JFYWNoKChldmVudFR5cGUpID0+IHtcbiAgICAgIGRyb3Bkb3duLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBNb3VzZUV2ZW50KGV2ZW50VHlwZSwge1xuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICB2aWV3OiB3aW5kb3csXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJnb2luZyB0byBjbGljayBuIGV4dCBvcHRpb25zXCIpO1xuICAgICAgY2xpY2tSaXNrQXNzZXNzbWVudE9wdGlvbigpO1xuICAgIH0sIDIwMDApO1xuICB9XG59XG5cbi8vIFN0ZXAgZm91ci1maXZlXG4vLyBDbGljayB0aGUgb3B0aW9uIGFmdGVyIGRyb3Bkb3duIGlzIGNsaWNrZWQgYW5kIG9wZW5lZC4uLlxuZnVuY3Rpb24gY2xpY2tSaXNrQXNzZXNzbWVudE9wdGlvbigpIHtcbiAgY29uc3Qgb3B0aW9uVGV4dCA9XG4gICAgXCJFeGlzdGluZyBjbGllbnQgKEN1cnJlbnQgcmlzay10b2xlcmFuY2UgcXVlc3Rpb25uYWlyZSBpcyBvbiBmaWxlKVwiO1xuXG4gIC8vIERlZmluZSBhIGZ1bmN0aW9uIHRvIGNsaWNrIHRoZSB0YXJnZXQgb3B0aW9uIHdoZW4gaXQncyBhdmFpbGFibGVcbiAgY29uc3QgdHJ5Q2xpY2tPcHRpb24gPSAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidWwuTXVpTGlzdC1yb290IGxpLk11aU1lbnVJdGVtLXJvb3RcIilcbiAgICApO1xuICAgIGNvbnN0IHRhcmdldE9wdGlvbiA9IG9wdGlvbnMuZmluZCgob3B0aW9uKSA9PlxuICAgICAgb3B0aW9uLnRleHRDb250ZW50LmluY2x1ZGVzKG9wdGlvblRleHQpXG4gICAgKTtcblxuICAgIGlmICh0YXJnZXRPcHRpb24pIHtcbiAgICAgIHRhcmdldE9wdGlvbi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkIG9wdGlvbiAtIE1BSU4gRlVOQ1wiKTtcbiAgICAgIGNsaWNrVGVybXNDaGVja2JveCgpO1xuICAgICAgcmV0dXJuIHRydWU7IC8vIEluZGljYXRlIHN1Y2Nlc3NcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlOyAvLyBJbmRpY2F0ZSBmYWlsdXJlXG4gIH07XG5cbiAgLy8gQ3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucywgb2JzKSA9PiB7XG4gICAgaWYgKHRyeUNsaWNrT3B0aW9uKCkpIHtcbiAgICAgIC8vIFRyeSB0byBjbGljayB0aGUgb3B0aW9uXG4gICAgICBvYnMuZGlzY29ubmVjdCgpOyAvLyBJZiBzdWNjZXNzZnVsLCBkaXNjb25uZWN0IHRoZSBvYnNlcnZlclxuICAgIH1cbiAgfSk7XG5cbiAgLy8gU3RhcnQgb2JzZXJ2aW5nIHRoZSBib2R5IGZvciBjaGFuZ2VzIGluIHRoZSBET01cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gIH0pO1xuXG4gIC8vIFRyeSB0byBjbGljayB0aGUgb3B0aW9uIGltbWVkaWF0ZWx5IGluIGNhc2UgaXQncyBhbHJlYWR5IHRoZXJlXG4gIGlmICghdHJ5Q2xpY2tPcHRpb24oKSkge1xuICAgIC8vIElmIHRoZSBvcHRpb24gd2FzIG5vdCBjbGlja2VkIHN1Y2Nlc3NmdWxseSwgdHJpZ2dlciB0aGUgZHJvcGRvd24gdG8gc2hvdyBvcHRpb25zXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBkcm9wZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYuTXVpU2VsZWN0LXJvb3RcIik7XG4gICAgICBpZiAoZHJvcGRvd24pIHtcbiAgICAgICAgZHJvcGRvd24uY2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkIG9wdGlvbiAtIEJBQ0tVUCBGVU5DXCIpO1xuICAgICAgICBjbGlja1Rlcm1zQ2hlY2tib3goKTtcbiAgICAgIH1cbiAgICB9LCAzMDApOyAvLyBBZGp1c3QgdGhlIHRpbWVvdXQgYXMgbmVjZXNzYXJ5XG4gIH0gZWxzZSB7XG4gICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyAvLyBJZiB3ZSBjbGlja2VkIHRoZSBvcHRpb24sIGRpc2Nvbm5lY3QgdGhlIG9ic2VydmVyXG4gIH1cbn1cbi8vIFN0ZXAgZm91ci1zaXhcbi8vIENsaWNrIHRoZSB0ZXJtcyBkcm9wZG93bi4uLlxuZnVuY3Rpb24gY2xpY2tUZXJtc0NoZWNrYm94KCkge1xuICAvLyBGaW5kIGJ1dHRvbiBieSBpdHMgcm9sZSBhbmQgYXJpYS1sYWJlbCBhdHRyaWJ1dGVzXG4gIGNvbnN0IGNoZWNrQm94QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAnYnV0dG9uW3JvbGU9XCJjaGVja2JveFwiXVthcmlhLWxhYmVsPVwiSSBjb25maXJtIHRoZSB0ZXJtcyBhbmQgY29uZGl0aW9ucyBmb3Igc2VsZWN0aW5nIG15IGNsaWVudFxcJ3Mgcmlza1wiXSdcbiAgKTtcblxuICBpZiAoY2hlY2tCb3hCdXR0b24pIHtcbiAgICBjaGVja0JveEJ1dHRvbi5jbGljaygpO1xuICAgIGNvbnNvbGUubG9nKFwiQ2hlY2tib3ggYnV0dG9uIGNsaWNrZWQhXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJDbGlja2luZyBhZ3JlZSB0byB0ZXJtcyBidXR0b25cIik7XG4gICAgICB0ZXJtc0NoZWNrYm94Q29uZmlybWF0aW9uKCk7XG4gICAgfSwgMjAwMCk7XG4gIH1cbn1cbi8vIFN0ZXAgZm91ci1zZXZlblxuLy8gQ2xpY2sgdGhlIGNoZWNrYm94IHRvIGFjY2VwdCBjdXJyZW50IGNsaWVudHMgcmlzayBhbmQgaW52ZXN0bWVudCBvYmplY3RpdmUuLi5cbmZ1bmN0aW9uIHRlcm1zQ2hlY2tib3hDb25maXJtYXRpb24oKSB7XG4gIC8vIFVzZSBYUGF0aCB0byBmaW5kIHRoZSBidXR0b24gYmFzZWQgb24gaXRzIHRleHQgY29udGVudFxuICB2YXIgeHBhdGggPSBcIi8vYnV0dG9uWy4vL3NwYW5bY29udGFpbnModGV4dCgpLCAnSSBhZ3JlZScpXV1cIjtcbiAgdmFyIGFncmVlQnV0dG9uID0gZG9jdW1lbnQuZXZhbHVhdGUoXG4gICAgeHBhdGgsXG4gICAgZG9jdW1lbnQsXG4gICAgbnVsbCxcbiAgICBYUGF0aFJlc3VsdC5GSVJTVF9PUkRFUkVEX05PREVfVFlQRSxcbiAgICBudWxsXG4gICkuc2luZ2xlTm9kZVZhbHVlO1xuXG4gIGlmIChhZ3JlZUJ1dHRvbikge1xuICAgIGFncmVlQnV0dG9uLmNsaWNrKCk7XG4gICAgY29uc29sZS5sb2coXCJBZ3JlZSBidXR0b24gY2xpY2tlZCFcIik7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBUaW1lb3V0IHRvIGtpY2tzdGFydCB0aGUgc2F2ZWFuZGNvbnRpbnVlIGJ1dHRvblxuICAgICAgY29uc29sZS5sb2coXCJDbGlja2luZyBhZ3JlZSB0byB0ZXJtcyBidXR0b25cIik7XG4gICAgICBzYXZlQW5kQ29udGludWVSYW5kTygpO1xuICAgIH0sIDEwMDApO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQWdyZWUgYnV0dG9uIG5vdCBmb3VuZCFcIik7XG4gIH1cbn1cblxuLy8gU3RlcCBmb3VyLWVpZ2h0OiBDb25maXJtIHNlbGVjdGVkIG9wdGlvbnMsIHNhdmUgYW5kIGNvbnRpbnVlLi4uXG5mdW5jdGlvbiBzYXZlQW5kQ29udGludWVSYW5kTygpIHtcbiAgbGV0IHNwYW5Gb3VuZCA9IGZhbHNlO1xuICBsZXQgc3BhbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic3BhblwiKTtcblxuICBmb3IgKGxldCBzcGFuIG9mIHNwYW5zKSB7XG4gICAgaWYgKHNwYW4udGV4dENvbnRlbnQuaW5jbHVkZXMoXCJTYXZlIGFuZCBjb250aW51ZVwiKSkge1xuICAgICAgY29uc29sZS5sb2coYFNQQU4gRk9VTkQgV0lUSCBTVFJJTkcgXCJTQVZFIEFORCBDT05USU5VRVwiYCwgc3Bhbik7XG4gICAgICBzcGFuRm91bmQgPSB0cnVlO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc3Bhbi5jbGljaygpOyAvLyBTaW1wbGVyIHdheSB0byBjbGljayB3aXRob3V0IGNyZWF0aW5nIGEgTW91c2VFdmVudFxuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgJ1NhdmUgYW5kIGNvbnRpbnVlJ1wiKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAvLyBUaGlzIGRlbGF5IHdhaXRzIGZvciB0aGUgcGFnZSB0byBwcm9jZXNzIHRoZSBzYXZlIGFuZCBjb250aW51ZSBhY3Rpb25cbiAgICAgICAgICBjbGlja0FkZEFjY291bnRCdXR0b24oKTtcbiAgICAgICAgfSwgNzAwMCk7IC8vIFRoZSBkZWxheSBtaWdodCBuZWVkIGFkanVzdG1lbnQgYmFzZWQgb24gYWN0dWFsIHBhZ2UgYmVoYXZpb3JcbiAgICAgIH0sIDUwMDApOyAvLyBXYWl0aW5nIGZvciBhbmltYXRpb25zIHRvIGNvbXBsZXRlXG5cbiAgICAgIGJyZWFrOyAvLyBFeGl0IHRoZSBsb29wIGFzIHdlJ3ZlIGZvdW5kIGFuZCBjbGlja2VkIHRoZSBzcGFuXG4gICAgfVxuICB9XG5cbiAgaWYgKCFzcGFuRm91bmQpIHtcbiAgICBjb25zb2xlLmxvZyhcIlNhdmUgYW5kIGNvbnRpbnVlIHNwYW4gbm90IGZvdW5kXCIpO1xuICAgIC8vIEhhbmRsZSB0aGUgZXJyb3IgY2FzZSBhcHByb3ByaWF0ZWx5LCBwb3NzaWJseSByZXRyeWluZyBvciBhbGVydGluZyB0aGUgdXNlclxuICB9XG59XG5cbi8vIEJFTE9XIEFSRSBUSEUgRlVOQ1RJT05TIFRPIE1BTklQVUxBVEUgVEhFIEFDQ09VTlQgU1RSQVRFR1kgU0VDVElPTlxuXG4vL1ZlcnNpb24gMC4zOS4xIC0gTm92IDcgMjAyM1xuLy8gc3RlcCBmaXZlLW9uZTogQ2xpY2sgdGhlIGFkZCBhY2NvdW50IGJ1dHRvblxuZnVuY3Rpb24gY2xpY2tBZGRBY2NvdW50QnV0dG9uKCkge1xuICBsZXQgc3BhbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic3BhblwiKTtcblxuICBmb3IgKGxldCBzcGFuIG9mIHNwYW5zKSB7XG4gICAgaWYgKHNwYW4udGV4dENvbnRlbnQudHJpbSgpID09PSBcIkFkZCBhY2NvdW50XCIpIHtcbiAgICAgIC8vIFVzaW5nIHRyaW0oKSB0byByZW1vdmUgYW55IGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgbGV0IGJ1dHRvbiA9IHNwYW4uY2xvc2VzdChcImJ1dHRvblwiKTtcbiAgICAgIGlmIChidXR0b24pIHtcbiAgICAgICAgYnV0dG9uLmNsaWNrKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkIFwiQWRkIGFjY291bnRcIiBidXR0b24uJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiSW5wdXR0aW5nIHByb3Bvc2FsIGFtb3VudC4uLlwiKTtcbiAgICAgIHNldFByb3Bvc2FsQW1vdW50KCk7XG4gICAgfSwgNTAwMCk7XG4gIH1cblxuICBjb25zb2xlLmxvZyhcIkFkZCBhY2NvdW50IGJ1dHRvbiBub3QgZm91bmQuXCIpO1xuICAvLyBTaW1pbGFyIHRvIGFib3ZlLCBoYW5kbGUgdGhlIGVycm9yIGNhc2UgYXBwcm9wcmlhdGVseVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNldFByb3Bvc2FsQW1vdW50KCkge1xuICAvLyBGaW5kIHRoZSBpbnB1dCBmaWVsZCBmb3IgdGhlIHByb3Bvc2FsIGFtb3VudCBieSBpdHMgYXJpYS1sYWJlbFxuICBjb25zdCBwcm9wb3NhbEFtb3VudElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAnaW5wdXRbYXJpYS1sYWJlbD1cIlByb3Bvc2FsIGFtb3VudFwiXSdcbiAgKTtcblxuICBpZiAocHJvcG9zYWxBbW91bnRJbnB1dCkge1xuICAgIC8vIFBhcnNlIHRoZSBnbG9iYWxQcm9wb3NhbEFtb3VudCBhcyBhIGZsb2F0IG51bWJlciBhbmQgZW5zdXJlIGl0J3MgYSBmaW5pdGUgbnVtYmVyXG4gICAgY29uc3QgYW1vdW50ID0gcGFyc2VGbG9hdChnbG9iYWxQcm9wb3NhbEFtb3VudCk7XG4gICAgaWYgKGlzRmluaXRlKGFtb3VudCkpIHtcbiAgICAgIC8vIFNldCB0aGUgdmFsdWUgb2YgdGhlIGlucHV0IHRvIHRoZSBudW1lcmljIGdsb2JhbFByb3Bvc2FsQW1vdW50XG4gICAgICBwcm9wb3NhbEFtb3VudElucHV0LnZhbHVlID0gYW1vdW50O1xuXG4gICAgICAvLyBTaW11bGF0ZSBhIGNoYW5nZSBldmVudCB0byBub3RpZnkgYW55IEphdmFTY3JpcHQgbGlzdGVuaW5nIHRvIHRoaXMgZXZlbnRcbiAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgIHByb3Bvc2FsQW1vdW50SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGBQcm9wb3NhbCBhbW91bnQgc2V0IHRvICR7YW1vdW50fWApO1xuICAgIH1cbiAgfVxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkNsaWNraW5nIHJlZ2lzdHJhdGlvbiBkcm9wZG93bi4uLlwiKTtcbiAgICBjbGlja1JlZ2lzdHJhdGlvblR5cGVEcm9wZG93bigpO1xuICB9LCAyMDAwKTtcbn1cblxuLy8gc3RlcCBmaXZlLXRocmVlOiBDbGljayBzZWxlY3QgcmVnaXN0cmF0aW9uIHR5cGVcbmZ1bmN0aW9uIGNsaWNrUmVnaXN0cmF0aW9uVHlwZURyb3Bkb3duKCkge1xuICBjb25zdCBkcm9wZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgJ2Rpdi5NdWlTZWxlY3Qtcm9vdFthcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXSdcbiAgKTtcblxuICBpZiAoZHJvcGRvd24pIHtcbiAgICBkcm9wZG93bi5mb2N1cygpO1xuICAgIFtcIm1vdXNlZG93blwiLCBcIm1vdXNldXBcIiwgXCJjbGlja1wiXS5mb3JFYWNoKChldmVudFR5cGUpID0+IHtcbiAgICAgIGRyb3Bkb3duLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBNb3VzZUV2ZW50KGV2ZW50VHlwZSwge1xuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICB2aWV3OiB3aW5kb3csXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIlByZXBhcmluZyB0byBzZWxlY3QgYW4gb3B0aW9uLi4uXCIpO1xuICAgICAgY2xpY2tSZWdpc3RyYXRpb25UeXBlT3B0aW9uKCk7XG4gICAgfSwgMjAwMCk7IC8vIDItc2Vjb25kIGRlbGF5XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2tSZWdpc3RyYXRpb25UeXBlT3B0aW9uKCkge1xuICAvLyBEZWZpbmUgYSBmdW5jdGlvbiB0byBjbGljayB0aGUgdGFyZ2V0IG9wdGlvbiB3aGVuIGl0J3MgYXZhaWxhYmxlXG4gIGNvbnN0IHRyeUNsaWNrT3B0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInVsLk11aUxpc3Qtcm9vdCBsaS5NdWlNZW51SXRlbS1yb290XCIpXG4gICAgKTtcbiAgICBjb25zdCB0YXJnZXRPcHRpb24gPSBvcHRpb25zLmZpbmQoKG9wdGlvbikgPT5cbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudC5pbmNsdWRlcyhnbG9iYWxSZWdpc3RyYXRpb25UeXBlKVxuICAgICk7XG5cbiAgICBpZiAodGFyZ2V0T3B0aW9uKSB7XG4gICAgICB0YXJnZXRPcHRpb24uY2xpY2soKTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgQ2xpY2tlZCByZWdpc3RyYXRpb24gdHlwZSBvcHRpb246ICR7Z2xvYmFsUmVnaXN0cmF0aW9uVHlwZX1gXG4gICAgICApO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKGdsb2JhbFJlZ2lzdHJhdGlvblR5cGUuaW5jbHVkZXMoXCJKb2ludFwiKSkge1xuICAgICAgICAgIGNsaWNrU2VsZWN0T3duZXJCdXR0b24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNsaWNrQ3VzdG9kaWFuRHJvcGRvd24oKTtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgMjAwMCk7XG5cbiAgICAgIHJldHVybiB0cnVlOyAvLyBJbmRpY2F0ZSBzdWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgLy8gSW5kaWNhdGUgZmFpbHVyZVxuICB9O1xuICBmdW5jdGlvbiBjbGlja1NlbGVjdE93bmVyQnV0dG9uKCkge1xuICAgIC8vIEZpbmQgYW5kIGNsaWNrIHRoZSBcInNlbGVjdCBvd25lclwiIGJ1dHRvblxuICAgIGNvbnN0IHNlbGVjdE93bmVyQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICdidXR0b25bYXJpYS1sYWJlbD1cInNlbGVjdCBvd25lclwiXSdcbiAgICApO1xuICAgIGlmIChzZWxlY3RPd25lckJ1dHRvbikge1xuICAgICAgc2VsZWN0T3duZXJCdXR0b24uY2xpY2soKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCAnc2VsZWN0IG93bmVyJyBidXR0b25cIik7XG5cbiAgICAgIC8vIFdhaXQgZm9yIHRoZSBzZWNvbmRhcnkgb3duZXIgb3B0aW9ucyB0byBhcHBlYXIsIHRoZW4gY2xpY2tcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjbGlja1NlY29uZGFyeU93bmVyRHJvcGRvd24oKTtcbiAgICAgIH0sIDMwMDApOyAvLyBBZGp1c3QgdGhlIGRlbGF5IGFzIG5lY2Vzc2FyeVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIidzZWxlY3Qgb3duZXInIGJ1dHRvbiBub3QgZm91bmRcIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xpY2tTZWNvbmRhcnlPd25lckRyb3Bkb3duKCkge1xuICAgIC8vIERlZmluZSB0aGUgdGV4dCB0aGF0IHdpbGwgaGVscCB1cyBmaW5kIHRoZSBcIlNlY29uZGFyeSBvd25lclwiIGRyb3Bkb3duXG4gICAgY29uc3Qgb3B0aW9uVGV4dCA9IFwiU2Vjb25kYXJ5IG93bmVyXCI7XG5cbiAgICAvLyBEZWZpbmUgYSBmdW5jdGlvbiB0byB0cnkgY2xpY2tpbmcgdGhlIHRhcmdldCBkcm9wZG93biB3aGVuIGl0J3MgYXZhaWxhYmxlXG4gICAgY29uc3QgaW50ZXJhY3RXaXRoRHJvcGRvd24gPSAoZHJvcGRvd24pID0+IHtcbiAgICAgIGRyb3Bkb3duLmZvY3VzKCk7XG4gICAgICBbXCJtb3VzZWRvd25cIiwgXCJtb3VzZXVwXCJdLmZvckVhY2goKGV2ZW50VHlwZSkgPT5cbiAgICAgICAgZHJvcGRvd24uZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudChldmVudFR5cGUsIHsgYnViYmxlczogdHJ1ZSB9KSlcbiAgICAgICk7XG4gICAgICBkcm9wZG93bi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coXCJJbnRlcmFjdGVkIHdpdGggJ1NlY29uZGFyeSBvd25lcicgZHJvcGRvd24gbGlrZSBhIGh1bWFuXCIpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsaWNrQWRkTWVtYmVyT3B0aW9uKCk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9O1xuICAgIGNvbnN0IHRyeUNsaWNrRHJvcGRvd24gPSAoKSA9PiB7XG4gICAgICBjb25zdCBsYWJlbHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZcIikpO1xuICAgICAgY29uc3QgdGFyZ2V0TGFiZWwgPSBsYWJlbHMuZmluZChcbiAgICAgICAgKGRpdikgPT4gZGl2LnRleHRDb250ZW50LnRyaW0oKSA9PT0gb3B0aW9uVGV4dFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGRyb3Bkb3duID0gdGFyZ2V0TGFiZWw/Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAnZGl2W3JvbGU9XCJidXR0b25cIl1bYXJpYS1oYXNwb3B1cD1cImxpc3Rib3hcIl0nXG4gICAgICApO1xuXG4gICAgICBpZiAoZHJvcGRvd24pIHtcbiAgICAgICAgaW50ZXJhY3RXaXRoRHJvcGRvd24oZHJvcGRvd24pO1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gSW5kaWNhdGUgc3VjY2Vzc1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBJbmRpY2F0ZSBmYWlsdXJlXG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBhbiBvYnNlcnZlciBpbnN0YW5jZSB0byB3YXRjaCBmb3IgY2hhbmdlcyBpbiB0aGUgRE9NXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zLCBvYnMpID0+IHtcbiAgICAgIGlmICh0cnlDbGlja0Ryb3Bkb3duKCkpIHtcbiAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKTsgLy8gSWYgc3VjY2Vzc2Z1bCwgZGlzY29ubmVjdCB0aGUgb2JzZXJ2ZXJcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFN0YXJ0IG9ic2VydmluZyB0aGUgYm9keSBmb3IgY2hhbmdlcyBpbiB0aGUgRE9NXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQXR0ZW1wdCB0byBjbGljayB0aGUgZHJvcGRvd24gaW1tZWRpYXRlbHkgaW4gY2FzZSBpdCdzIGFscmVhZHkgdGhlcmVcbiAgICBpZiAoIXRyeUNsaWNrRHJvcGRvd24oKSkge1xuICAgICAgLy8gSWYgdGhlIGRyb3Bkb3duIHdhc24ndCBjbGlja2VkIHN1Y2Nlc3NmdWxseSwgaXQgbWlnaHQgYmUgYmVjYXVzZSB0aGUgbW9kYWwgaGFzbid0IGFwcGVhcmVkIHlldFxuICAgICAgLy8gRmluZCBhbmQgY2xpY2sgdGhlIGJ1dHRvbiBvciBlbGVtZW50IHRoYXQgdHJpZ2dlcnMgdGhlIG1vZGFsIHRvIG9wZW5cbiAgICAgIGNvbnN0IHRyaWdnZXJFbGVtZW50U2VsZWN0b3IgPSAnYnV0dG9uW2FyaWEtaGFzcG9wdXA9XCJkaWFsb2dcIl0nOyAvLyBVcGRhdGUgdGhpcyBzZWxlY3RvciB0byBtYXRjaCB0aGUgZWxlbWVudCB0aGF0IG9wZW5zIHRoZSBtb2RhbFxuICAgICAgY29uc3QgdHJpZ2dlckVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRyaWdnZXJFbGVtZW50U2VsZWN0b3IpO1xuXG4gICAgICBpZiAodHJpZ2dlckVsZW1lbnQpIHtcbiAgICAgICAgdHJpZ2dlckVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJUcmlnZ2VyZWQgdGhlIG1vZGFsIHRvIG9wZW5cIik7XG5cbiAgICAgICAgLy8gU2luY2UgdGhlIG1vZGFsIG9wZW5pbmcgaXMgbGlrZWx5IHRvIGJlIGFuaW1hdGVkIGFuZCB0YWtlIHNvbWUgdGltZSwgc2V0IGEgdGltZW91dCBiZWZvcmUgdHJ5aW5nIHRvIGNsaWNrIHRoZSBkcm9wZG93biBhZ2FpblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAoIXRyeUNsaWNrRHJvcGRvd24oKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgXCJGYWlsZWQgdG8gY2xpY2sgdGhlICdTZWNvbmRhcnkgb3duZXInIGRyb3Bkb3duIGFmdGVyIG9wZW5pbmcgdGhlIG1vZGFsXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBIYW5kbGUgdGhlIGZhaWx1cmUgYXMgYXBwcm9wcmlhdGUgZm9yIHlvdXIgYXBwbGljYXRpb25cbiAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMDApOyAvLyBBZGp1c3QgdGhlIHRpbWVvdXQgYXMgbmVjZXNzYXJ5IHRvIGFsbG93IGZvciB0aGUgbW9kYWwgdG8gZnVsbHkgb3BlbiBhbmQgcmVuZGVyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIFwiVW5hYmxlIHRvIGZpbmQgdGhlIGVsZW1lbnQgdGhhdCB0cmlnZ2VycyB0aGUgbW9kYWwgdG8gb3BlblwiXG4gICAgICAgICk7XG4gICAgICAgIC8vIEhhbmRsZSB0aGlzIHNpdHVhdGlvbiBhcyBhcHByb3ByaWF0ZSBmb3IgeW91ciBhcHBsaWNhdGlvblxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xpY2tBZGRNZW1iZXJPcHRpb24oKSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSBqb2ludEZpcnN0ICsgXCIgXCIgKyBqb2ludExhc3Q7XG5cbiAgICAvLyBGdW5jdGlvbiB0byBmaW5kIGFuZCBjbGljayB0aGUgb3B0aW9uXG4gICAgY29uc3QgdHJ5Q2xpY2tNZW1iZXJPcHRpb24gPSAoKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInVsLk11aUxpc3Qtcm9vdCBsaS5NdWlNZW51SXRlbS1yb290XCIpXG4gICAgICApO1xuICAgICAgY29uc3QgdGFyZ2V0T3B0aW9uID0gb3B0aW9ucy5maW5kKChvcHRpb24pID0+XG4gICAgICAgIG9wdGlvbi50ZXh0Q29udGVudC5pbmNsdWRlcyhmdWxsTmFtZSlcbiAgICAgICk7XG5cbiAgICAgIGlmICh0YXJnZXRPcHRpb24pIHtcbiAgICAgICAgdGFyZ2V0T3B0aW9uLmNsaWNrKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBDbGlja2VkIG9uIG1lbWJlcjogJHtmdWxsTmFtZX1gKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY2xpY2tTYXZlQnV0dG9uKCk7XG4gICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBJbmRpY2F0ZSBzdWNjZXNzXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIEluZGljYXRlIGZhaWx1cmVcbiAgICB9O1xuXG4gICAgLy8gVHJ5IHRvIGNsaWNrIHRoZSBtZW1iZXIgb3B0aW9uIGltbWVkaWF0ZWx5XG4gICAgaWYgKCF0cnlDbGlja01lbWJlck9wdGlvbigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBNZW1iZXIgd2l0aCBuYW1lICR7ZnVsbE5hbWV9IG5vdCBmb3VuZGApO1xuICAgICAgLy8gSGFuZGxlIHRoZSBmYWlsdXJlIGFzIGFwcHJvcHJpYXRlIGZvciB5b3VyIGFwcGxpY2F0aW9uXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xpY2tTYXZlQnV0dG9uKCkge1xuICAgIC8vIEZpbmQgYWxsIGJ1dHRvbnMgb24gdGhlIHBhZ2VcbiAgICBjb25zdCBidXR0b25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uXCIpKTtcblxuICAgIC8vIEZpbmQgdGhlIHNhdmUgYnV0dG9uIGJ5IGl0cyB0ZXh0IGNvbnRlbnRcbiAgICBjb25zdCBzYXZlQnV0dG9uID0gYnV0dG9ucy5maW5kKFxuICAgICAgKGJ1dHRvbikgPT4gYnV0dG9uLnRleHRDb250ZW50LnRyaW0oKSA9PT0gXCJTYXZlXCJcbiAgICApO1xuXG4gICAgaWYgKHNhdmVCdXR0b24pIHtcbiAgICAgIHNhdmVCdXR0b24uY2xpY2soKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCB0aGUgJ1NhdmUnIGJ1dHRvblwiKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjbGlja0N1c3RvZGlhbkRyb3Bkb3duKCk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcIlNhdmUgYnV0dG9uIG5vdCBmb3VuZFwiKTtcbiAgICAgIC8vIEhhbmRsZSB0aGUgc2l0dWF0aW9uIHdoZXJlIHRoZSBidXR0b24gaXMgbm90IGZvdW5kXG4gICAgfVxuICB9XG5cbiAgLy8gQ3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucywgb2JzKSA9PiB7XG4gICAgaWYgKHRyeUNsaWNrT3B0aW9uKCkpIHtcbiAgICAgIC8vIFRyeSB0byBjbGljayB0aGUgb3B0aW9uXG4gICAgICBvYnMuZGlzY29ubmVjdCgpOyAvLyBJZiBzdWNjZXNzZnVsLCBkaXNjb25uZWN0IHRoZSBvYnNlcnZlclxuICAgIH1cbiAgfSk7XG5cbiAgLy8gU3RhcnQgb2JzZXJ2aW5nIHRoZSBib2R5IGZvciBjaGFuZ2VzIGluIHRoZSBET01cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gIH0pO1xuXG4gIC8vIFRyeSB0byBjbGljayB0aGUgb3B0aW9uIGltbWVkaWF0ZWx5IGluIGNhc2UgaXQncyBhbHJlYWR5IHRoZXJlXG4gIGlmICghdHJ5Q2xpY2tPcHRpb24oKSkge1xuICAgIC8vIElmIHRoZSBvcHRpb24gd2FzIG5vdCBjbGlja2VkIHN1Y2Nlc3NmdWxseSwgdHJpZ2dlciB0aGUgZHJvcGRvd24gdG8gc2hvdyBvcHRpb25zXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBkcm9wZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYuTXVpU2VsZWN0LXJvb3RcIik7XG4gICAgICBpZiAoZHJvcGRvd24pIHtcbiAgICAgICAgZHJvcGRvd24uY2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcGVuZWQgZHJvcGRvd24gLSB3YWl0aW5nIGZvciBvcHRpb25zLi4uXCIpO1xuICAgICAgfVxuICAgIH0sIDMwMCk7IC8vIEFkanVzdCB0aGUgdGltZW91dCBhcyBuZWNlc3NhcnlcbiAgfSBlbHNlIHtcbiAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7IC8vIElmIHdlIGNsaWNrZWQgdGhlIG9wdGlvbiwgZGlzY29ubmVjdCB0aGUgb2JzZXJ2ZXJcbiAgfVxufVxuXG4vLyBzdGVwIGZpdmUtdGhyZWU6IENsaWNrIHNlbGVjdCByZWdpc3RyYXRpb24gdHlwZVxuZnVuY3Rpb24gY2xpY2tDdXN0b2RpYW5Ecm9wZG93bigpIHtcbiAgLy8gUXVlcnkgdGhlIGRvY3VtZW50IGZvciB0aGUgZHJvcGRvd24gZWxlbWVudFxuICBjb25zdCBkcm9wZG93blNwYW5zID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgJ2Rpdi5NdWlTZWxlY3Qtcm9vdFthcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXSA+IHNwYW4nXG4gICAgKVxuICApO1xuICBjb25zdCBjdXN0b2RpYW5Ecm9wZG93biA9IGRyb3Bkb3duU3BhbnMuZmluZChcbiAgICAoc3BhbikgPT4gc3Bhbi50ZXh0Q29udGVudCA9PT0gXCJTZWxlY3QgYSBjdXN0b2RpYW5cIlxuICApPy5wYXJlbnROb2RlO1xuXG4gIGlmIChjdXN0b2RpYW5Ecm9wZG93bikge1xuICAgIC8vIEZvY3VzIG9uIHRoZSBkcm9wZG93biBlbGVtZW50XG4gICAgY3VzdG9kaWFuRHJvcGRvd24uZm9jdXMoKTtcblxuICAgIC8vIERpc3BhdGNoIG1vdXNlIGV2ZW50cyB0byBtaW1pYyB0aGUgdXNlcidzIGFjdGlvbnNcbiAgICBbXCJtb3VzZWRvd25cIiwgXCJtb3VzZXVwXCIsIFwiY2xpY2tcIl0uZm9yRWFjaCgoZXZlbnRUeXBlKSA9PiB7XG4gICAgICBjdXN0b2RpYW5Ecm9wZG93bi5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgTW91c2VFdmVudChldmVudFR5cGUsIHtcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgdmlldzogd2luZG93LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIFNldCBhIHRpbWVvdXQgdG8gaGFuZGxlIHN1YnNlcXVlbnQgYWN0aW9uc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJQcmVwYXJpbmcgdG8gc2VsZWN0IGFuIG9wdGlvbi4uLlwiKTtcbiAgICAgIGNsaWNrQ3VzdG9kaWFuT3B0aW9uKCk7XG4gICAgfSwgNDAwMCk7IC8vIDItc2Vjb25kIGRlbGF5XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2tDdXN0b2RpYW5PcHRpb24oKSB7XG4gIC8vIERlZmluZSBhIGZ1bmN0aW9uIHRvIGNsaWNrIHRoZSB0YXJnZXQgb3B0aW9uIHdoZW4gaXQncyBhdmFpbGFibGVcbiAgY29uc3QgdHJ5Q2xpY2tPcHRpb24gPSAoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidWwuTXVpTGlzdC1yb290IGxpLk11aU1lbnVJdGVtLXJvb3RcIilcbiAgICApO1xuICAgIGNvbnN0IHRhcmdldE9wdGlvbiA9IG9wdGlvbnMuZmluZCgob3B0aW9uKSA9PlxuICAgICAgb3B0aW9uLnRleHRDb250ZW50LmluY2x1ZGVzKGdsb2JhbEN1c3RvZGlhblR5cGUpXG4gICAgKTtcblxuICAgIGlmICh0YXJnZXRPcHRpb24pIHtcbiAgICAgIHRhcmdldE9wdGlvbi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coYENsaWNrZWQgcmVnaXN0cmF0aW9uIHR5cGUgb3B0aW9uOiAke2dsb2JhbEN1c3RvZGlhblR5cGV9YCk7XG4gICAgICAvLyBBZGQgYW55IGFkZGl0aW9uYWwgbG9naWMgeW91IG5lZWQgYWZ0ZXIgY2xpY2tpbmcgdGhlIG9wdGlvblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUHJlcGFyaW5nIHRvIHNlbGVjdCBhbiBvcHRpb24uLi5cIik7XG4gICAgICAgIHNlbGVjdEV4aXN0aW5nU3RyYXRlZ3koKTtcbiAgICAgIH0sIDQwMDApOyAvLyAyLXNlY29uZCBkZWxheVxuICAgICAgcmV0dXJuIHRydWU7IC8vIEluZGljYXRlIHN1Y2Nlc3NcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlOyAvLyBJbmRpY2F0ZSBmYWlsdXJlXG4gIH07XG5cbiAgLy8gQ3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucywgb2JzKSA9PiB7XG4gICAgaWYgKHRyeUNsaWNrT3B0aW9uKCkpIHtcbiAgICAgIC8vIFRyeSB0byBjbGljayB0aGUgb3B0aW9uXG4gICAgICBvYnMuZGlzY29ubmVjdCgpOyAvLyBJZiBzdWNjZXNzZnVsLCBkaXNjb25uZWN0IHRoZSBvYnNlcnZlclxuICAgIH1cbiAgfSk7XG5cbiAgLy8gU3RhcnQgb2JzZXJ2aW5nIHRoZSBib2R5IGZvciBjaGFuZ2VzIGluIHRoZSBET01cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gIH0pO1xuXG4gIC8vIFRyeSB0byBjbGljayB0aGUgb3B0aW9uIGltbWVkaWF0ZWx5IGluIGNhc2UgaXQncyBhbHJlYWR5IHRoZXJlXG4gIGlmICghdHJ5Q2xpY2tPcHRpb24oKSkge1xuICAgIC8vIElmIHRoZSBvcHRpb24gd2FzIG5vdCBjbGlja2VkIHN1Y2Nlc3NmdWxseSwgdHJpZ2dlciB0aGUgZHJvcGRvd24gdG8gc2hvdyBvcHRpb25zXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBkcm9wZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYuTXVpU2VsZWN0LXJvb3RcIik7XG4gICAgICBpZiAoZHJvcGRvd24pIHtcbiAgICAgICAgZHJvcGRvd24uY2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcGVuZWQgZHJvcGRvd24gLSB3YWl0aW5nIGZvciBvcHRpb25zLi4uXCIpO1xuICAgICAgfVxuICAgIH0sIDQwMDApOyAvLyBBZGp1c3QgdGhlIHRpbWVvdXQgYXMgbmVjZXNzYXJ5XG4gIH0gZWxzZSB7XG4gICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyAvLyBJZiB3ZSBjbGlja2VkIHRoZSBvcHRpb24sIGRpc2Nvbm5lY3QgdGhlIG9ic2VydmVyXG4gIH1cbn1cblxuLy8gLy8gRnVuY3Rpb24gdG8gZmluZCBhbmQgY2xpY2sgb24gdGhlIHNwYW4gdGhhdCBvcGVucyB0aGUgbW9kYWwgZm9yIHNlbGVjdGluZyBhbiBleGlzdGluZyBzdHJhdGVneVxuZnVuY3Rpb24gc2VsZWN0RXhpc3RpbmdTdHJhdGVneSgpIHtcbiAgbGV0IHNwYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInNwYW5cIik7XG5cbiAgZm9yIChsZXQgc3BhbiBvZiBzcGFucykge1xuICAgIC8vIFVzaW5nIHRyaW0oKSB0byBlbnN1cmUgdGhlcmUgYXJlIG5vIGxlYWRpbmcvdHJhaWxpbmcgc3BhY2VzXG4gICAgaWYgKHNwYW4udGV4dENvbnRlbnQudHJpbSgpID09PSBcIlNlbGVjdCBhbiBleGlzdGluZyBzdHJhdGVneVwiKSB7XG4gICAgICAvLyBTaW11bGF0ZSBhIGNsaWNrIG9uIHRoaXMgc3BhblxuICAgICAgc3Bhbi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQgXCJTZWxlY3QgYW4gZXhpc3Rpbmcgc3RyYXRlZ3lcIiBzcGFuLicpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUHJlcGFyaW5nIHRvIHNlbGVjdCBhbiBvcHRpb24uLi5cIik7XG4gICAgICAgIGNsaWNrUHJvZ3JhbU9wdGlvbkJ5Q29udGVudChnbG9iYWxQcm9ncmFtKTtcbiAgICAgIH0sIDIwMDApOyAvLyAyLXNlY29uZCBkZWxheVxuICAgICAgcmV0dXJuIHRydWU7IC8vIEluZGljYXRlIHRoYXQgdGhlIHNwYW4gd2FzIGZvdW5kIGFuZCBjbGlja2VkXG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2coXCJTZWxlY3QgYW4gZXhpc3Rpbmcgc3RyYXRlZ3kgc3BhbiBub3QgZm91bmQuXCIpO1xuICByZXR1cm4gZmFsc2U7IC8vIEluZGljYXRlIHRoYXQgdGhlIHNwYW4gd2FzIG5vdCBmb3VuZFxufVxuXG5mdW5jdGlvbiBjbGlja1Byb2dyYW1PcHRpb25CeUNvbnRlbnQocHJvZ3JhbVN0cmluZykge1xuICAvLyBEZWZpbmUgYSBmdW5jdGlvbiB0byBjbGljayB0aGUgdGFyZ2V0IG9wdGlvbiB3aGVuIGl0J3MgYXZhaWxhYmxlXG4gIGNvbnN0IHRyeUNsaWNrUHJvZ3JhbU9wdGlvbiA9ICgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b25bcm9sZT0ncmFkaW8nXVwiKVxuICAgICk7XG4gICAgY29uc3QgdGFyZ2V0T3B0aW9uID0gb3B0aW9ucy5maW5kKChvcHRpb24pID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsU3BhbiA9IG9wdGlvbi5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICByZXR1cm4gbGFiZWxTcGFuICYmIGxhYmVsU3Bhbi50ZXh0Q29udGVudC5pbmNsdWRlcyhwcm9ncmFtU3RyaW5nKTtcbiAgICB9KTtcblxuICAgIGlmICh0YXJnZXRPcHRpb24pIHtcbiAgICAgIHRhcmdldE9wdGlvbi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coYENsaWNrZWQgcHJvZ3JhbSBvcHRpb24gd2l0aCBzdHJpbmcgXCIke3Byb2dyYW1TdHJpbmd9XCJgKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUHJlcGFyaW5nIHRvIHNlbGVjdCBhbiBvcHRpb24uLi5cIik7XG4gICAgICAgIGNsaWNrU3RhcnRTZWxlY3RpbmdCdXR0b24oKTtcbiAgICAgIH0sIDE1MDAwKTtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBJbmRpY2F0ZSBzdWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgLy8gSW5kaWNhdGUgZmFpbHVyZSBpZiB0aGUgdGFyZ2V0IG9wdGlvbiB3YXNuJ3QgZm91bmRcbiAgfTtcblxuICAvLyBDcmVhdGUgYW4gb2JzZXJ2ZXIgaW5zdGFuY2UgdG8gd2F0Y2ggZm9yIHdoZW4gdGhlIG1vZGFsIGlzIGFkZGVkIHRvIHRoZSBET01cbiAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zLCBvYnMpID0+IHtcbiAgICBpZiAodHJ5Q2xpY2tQcm9ncmFtT3B0aW9uKCkpIHtcbiAgICAgIG9icy5kaXNjb25uZWN0KCk7IC8vIElmIHN1Y2Nlc3NmdWwsIGRpc2Nvbm5lY3QgdGhlIG9ic2VydmVyXG4gICAgfVxuICB9KTtcblxuICAvLyBTdGFydCBvYnNlcnZpbmcgdGhlIGJvZHkgZm9yIGNoYW5nZXMgaW4gdGhlIERPTVxuICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgfSk7XG5cbiAgLy8gVHJ5IHRvIGNsaWNrIHRoZSBwcm9ncmFtIG9wdGlvbiBpbW1lZGlhdGVseSBpbiBjYXNlIGl0J3MgYWxyZWFkeSB2aXNpYmxlXG4gIGlmICghdHJ5Q2xpY2tQcm9ncmFtT3B0aW9uKCkpIHtcbiAgICBjb25zb2xlLmxvZyhcIldhaXRpbmcgZm9yIG1vZGFsIHRvIGFwcGVhci4uLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGlja1N0YXJ0U2VsZWN0aW5nQnV0dG9uKCkge1xuICAvLyBMb29rIGZvciB0aGUgYnV0dG9uIHdpdGggdGhlIGFyaWEtbGFiZWwgXCJTdGFydCBCdXR0b25cIlxuICBsZXQgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvblthcmlhLWxhYmVsPVwiU3RhcnQgQnV0dG9uXCJdJyk7XG4gIGZvciAobGV0IGJ1dHRvbiBvZiBidXR0b25zKSB7XG4gICAgYnV0dG9uLmNsaWNrKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRJbnB1dFZhbHVlRm9yTmFtZUZpbHRlcldoZW5Nb2RhbEFwcGVhcnMobmFtZU9uUG9ydGZvbGlvKTtcbiAgICB9LCA1MDAwKTtcblxuICAgIHJldHVybjsgLy8gRXhpdCB0aGUgZnVuY3Rpb24gYWZ0ZXIgY2xpY2tpbmcgdGhlIGJ1dHRvblxuICB9XG59XG5cbmZ1bmN0aW9uIHNldElucHV0VmFsdWVGb3JOYW1lRmlsdGVyV2hlbk1vZGFsQXBwZWFycyhpbnB1dFZhbHVlKSB7XG4gIGNvbnN0IHRyeVNldElucHV0VmFsdWUgPSAoKSA9PiB7XG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgYC5NdWlEcmF3ZXItcm9vdCBpbnB1dFtwbGFjZWhvbGRlcj1cIkZpbHRlciBieSBuYW1lXCJdYFxuICAgICk7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICBpbnB1dC52YWx1ZSA9IGlucHV0VmFsdWU7XG4gICAgICBbXCJjaGFuZ2VcIiwgXCJpbnB1dFwiXS5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICBpbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChldmVudCwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zb2xlLmxvZyhgU2V0IGlucHV0IHZhbHVlIHRvIFwiJHtpbnB1dFZhbHVlfVwiYCk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBmaW5kUm93QW5kQ2xpY2tSYWRpb0J1dHRvbihuYW1lT25Qb3J0Zm9saW8pO1xuICAgICAgfSwgMzAwMCk7XG5cbiAgICAgIHJldHVybiB0cnVlOyAvLyBJbmRpY2F0ZSBzdWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTsgLy8gSW5kaWNhdGUgZmFpbHVyZSBpZiB0aGUgaW5wdXQgZmllbGQgd2Fzbid0IGZvdW5kXG4gIH07XG5cbiAgLy8gVGhpcyBvYnNlcnZlciBsb29rcyBmb3IgY2hhbmdlcyBpbiB0aGUgRE9NIHRoYXQgaW5kaWNhdGUgdGhlIG1vZGFsIGhhcyBiZWVuIGFkZGVkXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgIGZvciAoY29uc3QgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XG4gICAgICBpZiAobXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBtb2RhbCBpcyBub3cgcHJlc2VudFxuICAgICAgICBjb25zdCBtb2RhbEV4aXN0cyA9IEFycmF5LmZyb20obXV0YXRpb24uYWRkZWROb2Rlcykuc29tZShcbiAgICAgICAgICAobm9kZSkgPT4gbm9kZS5tYXRjaGVzICYmIG5vZGUubWF0Y2hlcyhcIi5NdWlEcmF3ZXItcm9vdFwiKVxuICAgICAgICApO1xuICAgICAgICBpZiAobW9kYWxFeGlzdHMgJiYgdHJ5U2V0SW5wdXRWYWx1ZSgpKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyAvLyBEaXNjb25uZWN0IHRoZSBvYnNlcnZlciBpZiBzdWNjZXNzZnVsXG4gICAgICAgICAgYnJlYWs7IC8vIEV4aXQgdGhlIGxvb3BcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gU3RhcnQgb2JzZXJ2aW5nIHRoZSBib2R5IGZvciB3aGVuIGVsZW1lbnRzIGFyZSBhZGRlZCB0byB0aGUgRE9NXG4gIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICB9KTtcblxuICAvLyBUcnkgdG8gc2V0IHRoZSBpbnB1dCB2YWx1ZSBpbW1lZGlhdGVseSBpbiBjYXNlIHRoZSBtb2RhbCBpcyBhbHJlYWR5IHZpc2libGVcbiAgaWYgKCF0cnlTZXRJbnB1dFZhbHVlKCkpIHtcbiAgICBjb25zb2xlLmxvZyhcIldhaXRpbmcgZm9yIHRoZSBtb2RhbCB0byBhcHBlYXIuLi5cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZFJvd0FuZENsaWNrUmFkaW9CdXR0b24obmFtZU9uUG9ydGZvbGlvKSB7XG4gIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuTXVpRHJhd2VyLXJvb3QgW3JvbGU9XCJyb3dcIl0nKTtcbiAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICBjb25zdCBuYW1lQ2VsbCA9IEFycmF5LmZyb20ocm93LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdltyb2xlPVwiY2VsbFwiXScpKS5maW5kKFxuICAgICAgKGNlbGwpID0+IGNlbGwudGV4dENvbnRlbnQuaW5jbHVkZXMobmFtZU9uUG9ydGZvbGlvKVxuICAgICk7XG5cbiAgICBpZiAobmFtZUNlbGwpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiRm91bmQgcm93IHdpdGggcG9ydGZvbGlvIG5hbWU6XCIsIG5hbWVPblBvcnRmb2xpbyk7XG4gICAgICBjb25zdCByYWRpb0J1dHRvbiA9IG5hbWVDZWxsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJ2J1dHRvbltyb2xlPVwicmFkaW9cIl0nXG4gICAgICApO1xuICAgICAgaWYgKHJhZGlvQnV0dG9uKSB7XG4gICAgICAgIHJhZGlvQnV0dG9uLmNsaWNrKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCB0aGUgcmFkaW8gYnV0dG9uIGZvclwiLCBuYW1lT25Qb3J0Zm9saW8pO1xuICAgICAgICAvLyBOb3cgcHJvY2VlZCB0byBjbGljayB0aGUgXCJTZWxlY3QgcHJvZHVjdFwiIGJ1dHRvbiBhZnRlciBhIGRlbGF5XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNsaWNrU2VsZWN0UHJvZHVjdEJ1dHRvbigpO1xuICAgICAgICB9LCAzMDAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZWJhbGFuY2VGcmVxdWVuY3lBZGQoKSB7XG4gIC8vIFF1ZXJ5IGFsbCBidXR0b25zIGFuZCBjb252ZXJ0IE5vZGVMaXN0IHRvIEFycmF5XG4gIGxldCBidXR0b25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uXCIpKTtcblxuICAvLyBGaW5kIHRoZSBcIkFkZFwiIGJ1dHRvbiB0aGF0IGlzIHdpdGhpbiB0aGUgXCJBY2NvdW50IFNldHRpbmdzXCIgc2VjdGlvblxuICBsZXQgYWRkQnV0dG9uID0gYnV0dG9ucy5maW5kKFxuICAgIChidXR0b24pID0+XG4gICAgICBidXR0b24udGV4dENvbnRlbnQuaW5jbHVkZXMoXCJBZGRcIikgJiZcbiAgICAgIGJ1dHRvbi5jbG9zZXN0KFwiaDJcIik/LnRleHRDb250ZW50LmluY2x1ZGVzKFwiQWNjb3VudCBTZXR0aW5nc1wiKVxuICApO1xuXG4gIGlmIChhZGRCdXR0b24pIHtcbiAgICBjb25zb2xlLmxvZyhcIkFkZCBidXR0b24gZm91bmQgaW4gQWNjb3VudCBTZXR0aW5nczpcIiwgYWRkQnV0dG9uKTtcblxuICAgIC8vIENsaWNrIHRoZSBmb3VuZCBidXR0b25cbiAgICBhZGRCdXR0b24uY2xpY2soKTtcbiAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgJ0FkZCcgaW4gQWNjb3VudCBTZXR0aW5nc1wiKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJzZXR0aW5nIHVwIG9ic2VydmVyIGZvciByZWJhbGFuY2VcIik7XG4gICAgICByZWJhbGFuY2VGcmVxT2JzKCk7XG4gICAgfSwgMzAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGlja1NhdmVCdXR0b24oKSB7XG4gICAgbGV0IHNhdmVCdXR0b24gPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b25cIikpLmZpbmQoXG4gICAgICAoYnV0dG9uKSA9PiBidXR0b24udGV4dENvbnRlbnQuaW5jbHVkZXMoXCJTYXZlXCIpXG4gICAgKTtcblxuICAgIGlmIChzYXZlQnV0dG9uKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlNhdmUgYnV0dG9uIGZvdW5kOlwiLCBzYXZlQnV0dG9uKTtcblxuICAgICAgc2F2ZUJ1dHRvbi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkICdTYXZlJ1wiKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzYXZlQ29udGludWUoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY2xpY2tGZWVTY2hlZHVsZURyb3Bkb3duQW5kU2VsZWN0T3B0aW9uKCk7XG4gICAgICAgIH0sIDExMDAwKTtcbiAgICAgIH0sIDUwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlNhdmUgYnV0dG9uIG5vdCBmb3VuZFwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2tTZWxlY3RQcm9kdWN0QnV0dG9uKCkge1xuICAvLyBRdWVyeSBmb3IgdGhlIGJ1dHRvbiBiYXNlZCBvbiBjbGFzcyBuYW1lIGFuZCBjb250ZW50XG4gIGNvbnN0IGJ1dHRvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b25cIikpO1xuICBjb25zdCBzZWxlY3RQcm9kdWN0QnV0dG9uID0gYnV0dG9ucy5maW5kKChidXR0b24pID0+IHtcbiAgICByZXR1cm4gYnV0dG9uLnRleHRDb250ZW50LmluY2x1ZGVzKFwiU2VsZWN0IHByb2R1Y3RcIik7XG4gIH0pO1xuXG4gIGlmIChzZWxlY3RQcm9kdWN0QnV0dG9uICYmICFzZWxlY3RQcm9kdWN0QnV0dG9uLmRpc2FibGVkKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIGJ1dHRvbiBleGlzdHMgYW5kIGlzIG5vdCBkaXNhYmxlZFxuICAgIHNlbGVjdFByb2R1Y3RCdXR0b24uY2xpY2soKTtcbiAgICBjb25zb2xlLmxvZygnQ2xpY2tlZCB0aGUgXCJTZWxlY3QgcHJvZHVjdFwiIGJ1dHRvbi4nKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNhdmVDb250aW51ZSgpO1xuICAgICAgaWYgKG5hbWVPblBvcnRmb2xpbyA9PT0gXCI2LjE4IFVNQVwiKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJlYmFsYW5jZUZyZXF1ZW5jeUFkZCgpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVmZXJlbmNldGluZ1wiKTtcbiAgICAgICAgfSwgNzAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzYXZlQ29udGludWUoKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNsaWNrRmVlU2NoZWR1bGVEcm9wZG93bkFuZFNlbGVjdE9wdGlvbigpO1xuICAgICAgICAgIH0sIDExMDAwKTtcbiAgICAgICAgfSwgNTAwMCk7XG4gICAgICB9XG4gICAgfSwgMzAwMCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJCdXR0b24gbm90IGZvdW5kIG9yIGl0IGlzIGRpc2FibGVkLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzYXZlQ29udGludWUoKSB7XG4gIGxldCBzcGFuRm91bmQgPSBmYWxzZTtcbiAgbGV0IHNwYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInNwYW5cIik7XG5cbiAgZm9yIChsZXQgc3BhbiBvZiBzcGFucykge1xuICAgIGlmIChzcGFuLnRleHRDb250ZW50LmluY2x1ZGVzKFwiU2F2ZSBhbmQgY29udGludWVcIikpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBTUEFOIEZPVU5EIFdJVEggU1RSSU5HIFwiU0FWRSBBTkQgQ09OVElOVUVcImAsIHNwYW4pO1xuICAgICAgc3BhbkZvdW5kID0gdHJ1ZTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNwYW4uY2xpY2soKTsgLy8gU2ltcGxlciB3YXkgdG8gY2xpY2sgd2l0aG91dCBjcmVhdGluZyBhIE1vdXNlRXZlbnRcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkICdTYXZlIGFuZCBjb250aW51ZSdcIik7XG4gICAgICB9LCAyMDAwKTsgLy8gV2FpdGluZyBmb3IgYW5pbWF0aW9ucyB0byBjb21wbGV0ZVxuXG4gICAgICBicmVhazsgLy8gRXhpdCB0aGUgbG9vcCBhcyB3ZSd2ZSBmb3VuZCBhbmQgY2xpY2tlZCB0aGUgc3BhblxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjbGlja0ZlZVNjaGVkdWxlRHJvcGRvd25BbmRTZWxlY3RPcHRpb24oKSB7XG4gIC8vIEZpcnN0LCBjbGljayB0aGUgZHJvcGRvd24gdG8gcmV2ZWFsIHRoZSBvcHRpb25zXG4gIGNvbnN0IGRyb3Bkb3duID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5NdWlTZWxlY3Qtc2VsZWN0TWVudVwiKTtcbiAgaWYgKGRyb3Bkb3duKSB7XG4gICAgZHJvcGRvd24uZm9jdXMoKTtcbiAgICBbXCJtb3VzZWRvd25cIiwgXCJtb3VzZXVwXCIsIFwiY2xpY2tcIl0uZm9yRWFjaCgoZXZlbnRUeXBlKSA9PiB7XG4gICAgICBkcm9wZG93bi5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgTW91c2VFdmVudChldmVudFR5cGUsIHtcbiAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgdmlldzogd2luZG93LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9KTtcbiAgICAvLyBXYWl0IGZvciB0aGUgb3B0aW9ucyB0byBhcHBlYXJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIExvb2sgZm9yIHRoZSBvcHRpb25zIGluIHRoZSBsaXN0XG4gICAgICBjb25zdCBvcHRpb25UZXh0ID0gZmVlU2NoZWR1bGUgPT09IFwicXVhcnRlcmx5XCIgPyBcIlF1YXJ0ZXJseVwiIDogXCJNb250aGx5XCI7XG4gICAgICBjb25zdCBsaXN0SXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICBcInVsLk11aUxpc3Qtcm9vdCBsaS5NdWlNZW51SXRlbS1yb290XCJcbiAgICAgICk7XG5cbiAgICAgIC8vIEZpbmQgdGhlIHNwZWNpZmljIG9wdGlvblxuICAgICAgY29uc3Qgb3B0aW9uVG9TZWxlY3QgPSBBcnJheS5mcm9tKGxpc3RJdGVtcykuZmluZCgoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbS5pbm5lclRleHQuaW5jbHVkZXMob3B0aW9uVGV4dCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKG9wdGlvblRvU2VsZWN0KSB7XG4gICAgICAgIG9wdGlvblRvU2VsZWN0LmNsaWNrKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBPcHRpb24gXCIke29wdGlvblRleHR9XCIgaGFzIGJlZW4gY2xpY2tlZC5gKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY2xpY2tFZGl0QWR2aXNvckZlZUJ1dHRvbigpO1xuICAgICAgICB9LCA4MDAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBPcHRpb24gXCIke29wdGlvblRleHR9XCIgbm90IGZvdW5kLmApO1xuICAgICAgfVxuICAgIH0sIDUwMCk7IC8vIEFkanVzdCB0aGlzIHRpbWVvdXQgdG8gbWF0Y2ggdGhlIHRpbWUgaXQgdGFrZXMgZm9yIHRoZSBvcHRpb25zIHRvIGFwcGVhclxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiRHJvcGRvd24gZm9yIGZlZSBzY2hlZHVsZSBub3QgZm91bmQuXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsaWNrRWRpdEFkdmlzb3JGZWVCdXR0b24oKSB7XG4gIC8vIFF1ZXJ5IHRoZSBkb2N1bWVudCBmb3IgdGhlIGJ1dHRvbiB3aXRoIHRoZSBzcGVjaWZpYyBhcmlhLWxhYmVsXG4gIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgJ2J1dHRvblthcmlhLWxhYmVsPVwiZWRpdC1hZHZpc29yLWZlZVwiXSdcbiAgKTtcblxuICAvLyBDaGVjayBpZiB0aGUgYnV0dG9uIGV4aXN0c1xuICBpZiAoYnV0dG9uKSB7XG4gICAgYnV0dG9uLmNsaWNrKCk7IC8vIENsaWNrIHRoZSBidXR0b25cbiAgICBjb25zb2xlLmxvZygnQ2xpY2tlZCB0aGUgXCJlZGl0LWFkdmlzb3ItZmVlXCIgYnV0dG9uLicpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0dXBNb2RhbE9ic2VydmVyQW5kQ2xpY2tEcm9wZG93bigpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsaWNrRHJvcGRvd25NZW51KCk7XG4gICAgICB9LCA1MDAwKTtcbiAgICB9LCA1MDAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXR1cE1vZGFsT2JzZXJ2ZXJBbmRDbGlja0Ryb3Bkb3duKCkge1xuICAvLyBEZWZpbmUgdGhlIG9ic2VydmVyXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucywgb2JzKSA9PiB7XG4gICAgZm9yIChjb25zdCBtdXRhdGlvbiBvZiBtdXRhdGlvbnMpIHtcbiAgICAgIGlmIChtdXRhdGlvbi5hZGRlZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRoZSBzcGVjaWZpYyBtb2RhbCBjbGFzc1xuICAgICAgICBjb25zdCBtb2RhbEV4aXN0cyA9IEFycmF5LmZyb20obXV0YXRpb24uYWRkZWROb2Rlcykuc29tZShcbiAgICAgICAgICAobm9kZSkgPT4gbm9kZS5tYXRjaGVzICYmIG5vZGUubWF0Y2hlcyhcIi5NdWlEaWFsb2ctc2Nyb2xsUGFwZXJcIilcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobW9kYWxFeGlzdHMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIk1vZGFsIGRldGVjdGVkLCBjbGlja2luZyBkcm9wZG93bi4uLlwiKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNsaWNrRHJvcGRvd25NZW51KCk7XG4gICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKTsgLy8gRGlzY29ubmVjdCB0aGUgb2JzZXJ2ZXIgYWZ0ZXIgY2xpY2tpbmcgdGhlIGRyb3Bkb3duXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IG9ic2VydmluZyB0aGUgZG9jdW1lbnQgYm9keSBmb3IgYWRkZWQgbm9kZXNcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjbGlja0Ryb3Bkb3duTWVudSgpIHtcbiAgLy8gU2VsZWN0IGFsbCBkcm9wZG93bnNcbiAgY29uc3QgZHJvcGRvd25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICBcImRpdi5NdWlTZWxlY3Qtcm9vdFthcmlhLWhhc3BvcHVwPSdsaXN0Ym94J11cIlxuICApO1xuXG4gIC8vIEZpbmQgdGhlIGRyb3Bkb3duIHRoYXQgY29udGFpbnMgdGhlIHNwZWNpZmljIHNwYW4gdGV4dFxuICBjb25zdCB0YXJnZXREcm9wZG93biA9IEFycmF5LmZyb20oZHJvcGRvd25zKS5maW5kKChkcm9wZG93bikgPT4ge1xuICAgIGNvbnN0IHNwYW4gPSBkcm9wZG93bi5xdWVyeVNlbGVjdG9yKFwic3BhblwiKTtcbiAgICByZXR1cm4gc3BhbiAmJiBzcGFuLnRleHRDb250ZW50ID09PSBcIlNlbGVjdCBhIGZlZSB0ZW1wbGF0ZVwiO1xuICB9KTtcblxuICBpZiAodGFyZ2V0RHJvcGRvd24pIHtcbiAgICB0YXJnZXREcm9wZG93bi5mb2N1cygpO1xuICAgIFtcIm1vdXNlZG93blwiLCBcIm1vdXNldXBcIiwgXCJjbGlja1wiXS5mb3JFYWNoKChldmVudFR5cGUpID0+IHtcbiAgICAgIHRhcmdldERyb3Bkb3duLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBNb3VzZUV2ZW50KGV2ZW50VHlwZSwge1xuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICB2aWV3OiB3aW5kb3csXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKFwiRHJvcGRvd24gd2l0aCAnU2VsZWN0IGEgZmVlIHRlbXBsYXRlJyBjbGlja2VkLlwiKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsaWNrRmVlVGVtcGxhdGVPcHRpb24oZmVlVGVtcGxhdGUpO1xuICAgIH0sIDUwMDApO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiU3BlY2lmaWMgZHJvcGRvd24gbm90IGZvdW5kLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGlja0ZlZVRlbXBsYXRlT3B0aW9uKGZlZVRlbXBsYXRlKSB7XG4gIC8vIFdhaXQgZm9yIHRoZSBkcm9wZG93biB0byBiZSBvcGVuZWQgYW5kIHJlbmRlcmVkIGluIHRoZSBET01cbiAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBcIi5NdWlNZW51LXBhcGVyIC5NdWlNZW51SXRlbS1yb290XCJcbiAgICApO1xuICAgIGlmIChvcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuXG4gICAgICAvLyBGaW5kIHRoZSBvcHRpb24gdGhhdCBpbmNsdWRlcyB0aGUgZmVlIHRlbXBsYXRlIHRleHRcbiAgICAgIGNvbnN0IHRhcmdldE9wdGlvbiA9IEFycmF5LmZyb20ob3B0aW9ucykuZmluZCgob3B0aW9uKSA9PlxuICAgICAgICBvcHRpb24udGV4dENvbnRlbnQuaW5jbHVkZXMoZmVlVGVtcGxhdGUpXG4gICAgICApO1xuXG4gICAgICBpZiAodGFyZ2V0T3B0aW9uKSB7XG4gICAgICAgIHRhcmdldE9wdGlvbi5jbGljaygpO1xuICAgICAgICBjb25zb2xlLmxvZyhgQ2xpY2tlZCBmZWUgdGVtcGxhdGUgb3B0aW9uOiAke2ZlZVRlbXBsYXRlfWApO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjbGlja0FwcGx5QnV0dG9uKGZlZVRlbXBsYXRlKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgRmVlIHRlbXBsYXRlIG9wdGlvbiAnJHtmZWVUZW1wbGF0ZX0nIG5vdCBmb3VuZC5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIDUwMCk7IC8vIENoZWNrIGV2ZXJ5IDUwMCBtaWxsaXNlY29uZHNcbn1cbmZ1bmN0aW9uIGNsaWNrQXBwbHlCdXR0b24oKSB7XG4gIC8vIFNlbGVjdCBhbGwgYnV0dG9uc1xuICBjb25zdCBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uW3R5cGU9XCJidXR0b25cIl0nKTtcblxuICAvLyBGaW5kIHRoZSBidXR0b24gd2l0aCB0aGUgdGV4dCBcIkFwcGx5XCJcbiAgY29uc3QgdGFyZ2V0QnV0dG9uID0gQXJyYXkuZnJvbShidXR0b25zKS5maW5kKChidXR0b24pID0+XG4gICAgYnV0dG9uLnRleHRDb250ZW50LmluY2x1ZGVzKFwiQXBwbHlcIilcbiAgKTtcblxuICBpZiAodGFyZ2V0QnV0dG9uKSB7XG4gICAgdGFyZ2V0QnV0dG9uLmNsaWNrKCk7XG4gICAgY29uc29sZS5sb2coXCJDbGlja2VkICdBcHBseScgYnV0dG9uLlwiKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNsaWNrQWdyZWVCdXR0b24oKTtcbiAgICB9LCA1MDAwKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIidBcHBseScgYnV0dG9uIG5vdCBmb3VuZC5cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2tBZ3JlZUJ1dHRvbigpIHtcbiAgLy8gRmluZCB0aGUgc3BhbiBjb250YWluaW5nIHRoZSBzcGVjaWZpYyB0ZXh0XG4gIGNvbnN0IHNwYW4gPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzcGFuXCIpKS5maW5kKChzcGFuKSA9PlxuICAgIHNwYW4udGV4dENvbnRlbnQuaW5jbHVkZXMoXCJJIGFncmVlIHRvIHRoZSBmZWUgc2NoZWR1bGVzIHNob3duIGFib3ZlXCIpXG4gICk7XG5cbiAgaWYgKHNwYW4pIHtcbiAgICAvLyBGaW5kIHRoZSBidXR0b24gd2l0aGluIHRoZSBwYXJlbnQgb2YgdGhlIHNwYW5cbiAgICBjb25zdCBidXR0b24gPSBzcGFuLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW3JvbGU9XCJjaGVja2JveFwiXScpO1xuICAgIGlmIChidXR0b24pIHtcbiAgICAgIGJ1dHRvbi5jbGljaygpO1xuICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkICdJIGFncmVlJyBjaGVja2JveCBidXR0b24uXCIpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsaWNrQ29udGludWVCdXR0b24oKTtcbiAgICAgIH0sIDUwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIidJIGFncmVlJyBjaGVja2JveCBidXR0b24gbm90IGZvdW5kLlwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJTcGFuIHdpdGggJ0kgYWdyZWUnIHRleHQgbm90IGZvdW5kLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGlja0NvbnRpbnVlQnV0dG9uKCkge1xuICAvLyBGaW5kIHRoZSBzcGFuIGNvbnRhaW5pbmcgdGhlIHNwZWNpZmljIHRleHQgXCJDb250aW51ZVwiXG4gIGNvbnN0IHNwYW4gPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJidXR0b24gc3BhblwiKSkuZmluZChcbiAgICAoc3BhbikgPT4gc3Bhbi50ZXh0Q29udGVudC5pbmNsdWRlcyhcIkNvbnRpbnVlXCIpXG4gICk7XG5cbiAgaWYgKHNwYW4pIHtcbiAgICAvLyBHZXQgdGhlIGJ1dHRvbiB0aGF0IGlzIHRoZSBhbmNlc3RvciBvZiB0aGUgc3BhblxuICAgIGNvbnN0IGJ1dHRvbiA9IHNwYW4uY2xvc2VzdChcImJ1dHRvblwiKTtcbiAgICBpZiAoYnV0dG9uKSB7XG4gICAgICBpZiAoIWJ1dHRvbi5kaXNhYmxlZCkge1xuICAgICAgICBidXR0b24uY2xpY2soKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkICdDb250aW51ZScgYnV0dG9uLlwiKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY2xpY2tHZW5lcmF0ZURvY3VtZW50c0J1dHRvbigpO1xuICAgICAgICB9LCA1MDAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2tHZW5lcmF0ZURvY3VtZW50c0J1dHRvbigpIHtcbiAgLy8gRmluZCB0aGUgc3BhbiBjb250YWluaW5nIHRoZSBzcGVjaWZpYyB0ZXh0IFwiR2VuZXJhdGUgZG9jdW1lbnRzXCJcbiAgY29uc3Qgc3BhbiA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImJ1dHRvbiBzcGFuXCIpKS5maW5kKFxuICAgIChzcGFuKSA9PiBzcGFuLnRleHRDb250ZW50LmluY2x1ZGVzKFwiR2VuZXJhdGUgZG9jdW1lbnRzXCIpXG4gICk7XG5cbiAgaWYgKHNwYW4pIHtcbiAgICAvLyBHZXQgdGhlIGJ1dHRvbiB0aGF0IGlzIHRoZSBhbmNlc3RvciBvZiB0aGUgc3BhblxuICAgIGNvbnN0IGJ1dHRvbiA9IHNwYW4uY2xvc2VzdChcImJ1dHRvblwiKTtcbiAgICBpZiAoYnV0dG9uKSB7XG4gICAgICBidXR0b24uY2xpY2soKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCAnR2VuZXJhdGUgZG9jdW1lbnRzJyBidXR0b24uXCIpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsb3NlQ3VycmVudFRhYigpO1xuICAgICAgfSwgMjAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiJ0dlbmVyYXRlIGRvY3VtZW50cycgYnV0dG9uIG5vdCBmb3VuZC5cIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiU3BhbiB3aXRoICdHZW5lcmF0ZSBkb2N1bWVudHMnIHRleHQgbm90IGZvdW5kLlwiKTtcbiAgfVxufVxuXG4vL05FV1RBQlNDUklQVFxuZnVuY3Rpb24gY2xvc2VDdXJyZW50VGFiKCkge1xuICAvLyBTZW5kIGEgbWVzc2FnZSB0byB0aGUgYmFja2dyb3VuZCBzY3JpcHRcbiAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBhY3Rpb246IFwiY2xvc2VUYWJcIiB9KTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==