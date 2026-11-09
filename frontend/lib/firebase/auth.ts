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
let _persistenceReady: Promise<void> = Promise.resolve();
let _persistenceError: unknown = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  _persistenceReady = setPersistence(_auth, browserLocalPersistence).catch((error: unknown) => {
    _persistenceError = error;
    console.error("[firebase/auth] Failed to configure browser persistence.", error);
  });
  return _auth;
}

async function getReadyFirebaseAuth(): Promise<Auth> {
  const auth = getFirebaseAuth();
  await _persistenceReady;
  if (_persistenceError) throw _persistenceError;
  return auth;
}

export async function prepareFirebaseAuth(): Promise<void> {
  await getReadyFirebaseAuth();
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
  const auth = await getReadyFirebaseAuth();
  const provider = new GoogleAuthProvider();
  // Complete the auth flow in the current page so users do not depend on
  // Firebase Hosting's /__/firebase/init.json redirect bootstrap endpoint.
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function logout() {
  await signOut(getFirebaseAuth());
}

export async function getIdToken(): Promise<string | null> {
  const auth = await getReadyFirebaseAuth();
  // Firebase restores browserLocalPersistence asynchronously. Requests made
  // during that window otherwise omit Authorization and produce a misleading
  // backend 401 on protected routes such as /onboarding/state.
  await auth.authStateReady();
  return auth.currentUser?.getIdToken() ?? null;
}
