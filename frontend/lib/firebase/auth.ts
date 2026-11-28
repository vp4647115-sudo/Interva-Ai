"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  getRedirectResult,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile,
  type Auth,
  type User,
  type UserCredential,
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
let _googleRedirectResult: Promise<UserCredential | null> | null = null;

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
  const auth = await getReadyFirebaseAuth();
  await auth.authStateReady();
}

// For call-sites that import `firebaseAuth` directly (e.g. onAuthStateChanged)
// we expose a getter-backed proxy. Accessing the value triggers lazy init.
export const firebaseAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getFirebaseAuth(), prop, receiver);
  },
});

export async function registerWithEmail(name: string, email: string, password: string) {
  const auth = await getReadyFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const auth = await getReadyFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const auth = await getReadyFirebaseAuth();
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
}

export async function completeGoogleRedirect(): Promise<UserCredential | null> {
  const auth = await getReadyFirebaseAuth();
  _googleRedirectResult ??= getRedirectResult(auth);
  return _googleRedirectResult;
}

export async function getCurrentFirebaseUser(): Promise<User | null> {
  const auth = await getReadyFirebaseAuth();
  await auth.authStateReady();
  return auth.currentUser;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(await getReadyFirebaseAuth(), email);
}

export async function logout() {
  await signOut(await getReadyFirebaseAuth());
}

export async function reauthenticateCurrentUser(password?: string) {
  const user = (await getReadyFirebaseAuth()).currentUser;
  if (!user) throw new Error("You are signed out. Please sign in again.");

  const providerIds = user.providerData.map((provider) => provider.providerId);
  if (providerIds.includes("password")) {
    if (!password) throw new Error("Enter your password to confirm account deletion.");
    if (!user.email) throw new Error("Your account has no email address to reauthenticate.");
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    return;
  }

  if (providerIds.includes("google.com")) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
    return;
  }

  throw new Error("Reauthentication is not supported for this sign-in method. Contact support.");
}

export async function deleteCurrentUser() {
  const user = (await getReadyFirebaseAuth()).currentUser;
  if (!user) throw new Error("You are signed out. Please sign in again.");
  await deleteUser(user);
}

export async function getIdToken(): Promise<string | null> {
  const auth = await getReadyFirebaseAuth();
  await auth.authStateReady();
  return auth.currentUser?.getIdToken() ?? null;
}
