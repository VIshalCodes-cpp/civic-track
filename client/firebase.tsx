// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASjHoThDqoT-kp5EUpGL4s8-r0UncTOYY",
  authDomain: "civictrack-cd12f.firebaseapp.com",
  projectId: "civictrack-cd12f",
  storageBucket: "civictrack-cd12f.firebasestorage.app",
  messagingSenderId: "281097746888",
  appId: "1:281097746888:web:c35dca9f664495b073e8fd",
  measurementId: "G-LPYT6RPLNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);