"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
} from "firebase/auth";
import { firebaseConfig } from "./config";

// Auth lives entirely in Firebase on the client; the FastAPI backend only ever
// sees a short-lived ID token which it verifies against Firebase's public keys.

// ---------- Lazy initialisation (SSG-safe) ----------
// During `next build` Vercel pre-renders pages server-side where the
// NEXT_PUBLIC_FIREBASE_* env vars may not exist yet. Eagerly calling
// initializeApp / getAuth would throw "auth/invalid-api-key".
// We defer all Firebase work to the first *browser* call.

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  // Best-effort persistence — silence errors server-side.
  void setPersistence(_auth, browserLocalPersistence).catch(() => {});
  return _auth;
}

// For call-sites that import `firebaseAuth` directly (e.g. onAuthStateChanged)
// we expose a getter-backed proxy. Accessing the value triggers lazy init.
export const firebaseAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirebaseAuth(), prop, receiver);
  },
});

export async function registerWithEmail(name: string, email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function logout() {
  await signOut(getFirebaseAuth());
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  return auth.currentUser?.getIdToken() ?? null;
}
