// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional
};

export const app = initializeApp(firebaseConfig);

// Analytics is optional; only init in browser and if measurementId present
try {
  if (typeof window !== "undefined" && firebaseConfig.measurementId) {
    getAnalytics(app);
  }
} catch {
  // no-op
}

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Use session persistence (clears when the tab/window is closed)
setPersistence(auth, browserSessionPersistence).catch(() => {
  // optional: console.warn("Failed to set session persistence");
});

/**
 * Force sign-out on first page load per tab.
 * We use a sessionStorage flag so this runs only once after a hard refresh/open.
 * Subsequent client-side route changes won't sign the user out again.
 */
if (typeof window !== "undefined") {
  const INIT_FLAG = "E360_SESSION_INIT";
  if (!sessionStorage.getItem(INIT_FLAG)) {
    // Fire-and-forget — ensure user is signed out on the first load in this tab.
    signOut(auth).finally(() => {
      try {
        sessionStorage.setItem(INIT_FLAG, "1");
      } catch {
        // no-op
      }
    });
  }
}
