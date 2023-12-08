// POPUP.JS **
import "./firebaseconfig";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "./index.css";
// Imports above

// Declaring auth below (firebase)
const auth = getAuth();

// Below is function to verify atria domain:
function isAllowedDomain(email) {
  const domain = email.substring(email.lastIndexOf("@") + 1);
  return domain === "atriawealth.com";
}

// Below is form sign in and sign up logic
const signInSection = document.getElementById("userSignInSection");
const signUpSection = document.getElementById("userSignUpSection");
const btnShowSignUpForm = document.getElementById("btnShowSignUpForm");
const btnShowSignInForm = document.getElementById("btnShowSignInForm");
const errorElement = document.getElementById("signInError"); // SIGN IN error
const errorElement2 = document.getElementById("signUpError"); // Sign UP error

btnShowSignUpForm.addEventListener("click", () => {
  signInSection.style.display = "none";
  signUpSection.style.display = "block";
  errorElement.style.display = "none";
});

btnShowSignInForm.addEventListener("click", () => {
  signUpSection.style.display = "none";
  signInSection.style.display = "block";
  errorElement2.style.display = "none";
});

// Firebase Logic for SIGN UP
const signUpForm = document.getElementById("formUserSignUp");
signUpForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("inputEmailSignUp").value;
  const password = document.getElementById("inputPasswordSignUp").value;
  const signUpError = document.getElementById("signUpError"); // get element

  if (!isAllowedDomain(email)) {
    console.log("Invalid email/password.");
    signUpError.style.display = "block";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      signUpError.style.display = "none";
      signUpSection.style.display = "none";
      const mainContent = document.getElementById("main-content");
      // Hide sign-up form
      mainContent.style.display = "block";

      //Handle newly signed up user
      const userNameSpan = document.getElementById("userName");
      userNameSpan.textContent = userCredential.user.email;

      // Show welcome message w/timeout
      const welcomeSection = document.getElementById("welcomeSection");
      welcomeSection.style.display = "block";

      setTimeout(() => {
        welcomeSection.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        signUpError.textContent =
          "This email is already in use. Please sign in or use a different email.";
      } else {
        signUpError.textContent =
          "An error occurred during sign-up. Please try again";
      }
      signUpError.style.display = "block";
    });
});
// SIGN IN logic with firebase
const signInForm = document.getElementById("formUserSignIn");
signInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("inputEmailSignIn").value;
  const password = document.getElementById("inputPasswordSignIn").value;
  const signInError = document.getElementById("signInError"); // Get the error element

  if (!isAllowedDomain(email)) {
    console.log("Invalid email/password");
    signInError.style.display = "block";
    return;
  }

  // Firebase sign-in logic...
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // hide sign in error below
      signInError.style.display = "none";

      // Handle signed in user here
      signInSection.style.display = "none";

      // Show main content
      const mainContent = document.getElementById("main-content");
      mainContent.style.display = "block";

      // Optional: Display welcome message or user info
      // const userNameSpan = document.getElementById("userName");
      // userNameSpan.textContent = userCredential.user.email;
    })
    .catch((error) => {
      // Show error messages
      if (
        error.code === "auth/wrong-passcode" ||
        error.code === "auth/user-not-found"
      ) {
        signInError.textContent = "Incorrect email or password";
      } else {
        signInError.textContent =
          "An error occurred during sign-in. Please try again";
      }
      signInError.style.display = "block";
    });
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
