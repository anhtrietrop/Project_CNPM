// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "snake-fastfood-dellivery.firebaseapp.com",
  projectId: "snake-fastfood-dellivery",
  storageBucket: "snake-fastfood-dellivery.firebasestorage.app",
  messagingSenderId: "381527566402",
  appId: "1:381527566402:web:d4dad994ddd8b04ca025db",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
