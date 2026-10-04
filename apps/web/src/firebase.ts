import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
export const isEmulator = import.meta.env.VITE_FIREBASE_ENV !== "production";
const productionConfig = {
  projectId: "satsuniccode",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: "satsuniccode.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "295420145391",
};
if (!isEmulator && (!productionConfig.apiKey || !productionConfig.appId))
  throw new Error("Firebase production web configuration missing");
const app = initializeApp(
  isEmulator
    ? {
        projectId: "demo-satsuniccode",
        apiKey: "demo-not-a-secret",
        authDomain: "demo-satsuniccode.firebaseapp.com",
        storageBucket: "demo-satsuniccode.appspot.com",
      }
    : productionConfig,
);
export const auth = getAuth(app),
  db = getFirestore(app),
  functions = getFunctions(app, "us-central1");
if (isEmulator) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
export const googleClientId: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
export const googleOneTapReady =
  !isEmulator &&
  /^295420145391-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(
    googleClientId,
  );
export const authReady = setPersistence(auth, browserSessionPersistence);
