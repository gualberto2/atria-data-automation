// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmoFTnp4iyOZbxmGjZxmYzt2Jb5uDihdo",
  authDomain: "ocomni-automation.firebaseapp.com",
  projectId: "ocomni-automation",
  storageBucket: "ocomni-automation.appspot.com",
  messagingSenderId: "492723599672",
  appId: "1:492723599672:web:b965e792c0b4e4bbf2a9cd",
  measurementId: "G-MWYVT95X4R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
