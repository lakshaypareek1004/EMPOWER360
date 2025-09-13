// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBApxCa1mfEJIIe1FCu2KdwFT3ZIX7Vc68",
  authDomain: "empower360-7559f.firebaseapp.com",
  projectId: "empower360-7559f",
  storageBucket: "empower360-7559f.firebasestorage.app",
  messagingSenderId: "269502166923",
  appId: "1:269502166923:web:443ec42d0d75811782618e",
  measurementId: "G-MLEMJKEZPQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);