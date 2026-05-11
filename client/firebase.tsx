// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDh4qWe1J79z6yVbVGjRDOfY3-OR_kvL8A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-1-b8b69.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-1-b8b69",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-1-b8b69.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "48174289786",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:48174289786:web:4285217626fc6c730bbcc3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3W9PBF71NE"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);