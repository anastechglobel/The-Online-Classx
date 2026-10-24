import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInAnonymously,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  get,
  set,
  push,
  update,
  remove,
  child,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyAfQMEaTQhwMAnxgWlxQUa7MpbvnmHvSOI",
  authDomain: "the-online-classes.firebaseapp.com",
  databaseURL: "https://the-online-classes-default-rtdb.firebaseio.com",
  projectId: "the-online-classes",
  storageBucket: "the-online-classes.firebasestorage.app",
  messagingSenderId: "224999570486",
  appId: "1:224999570486:web:1c67f210dc60ad59192c97",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const fb = {
  ref,
  onValue,
  get,
  set,
  push,
  update,
  remove,
  child,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInAnonymously,
};

if (typeof window !== "undefined") {
  (window as any).auth = auth;
  (window as any).db = db;
  (window as any).fb = fb;
}
