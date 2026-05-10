// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyASjHoThDqoT-kp5EUpGL4s8-r0UncTOYY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "civictrack-cd12f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "civictrack-cd12f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "civictrack-cd12f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "281097746888",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:281097746888:web:c35dca9f664495b073e8fd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LPYT6RPLNM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);