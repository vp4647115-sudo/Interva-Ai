"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
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
} from "firebase/auth";
import { firebaseConfig } from "./config";

// Auth lives entirely in Firebase on the client; the FastAPI backend only ever
// sees a short-lived ID token which it verifies against Firebase's public keys.
function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const firebaseAuth = getAuth(getFirebaseApp());

export async function registerWithEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(firebaseAuth, provider);
  return cred.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function logout() {
  await signOut(firebaseAuth);
}

export async function getIdToken(): Promise<string | null> {
  return firebaseAuth.currentUser?.getIdToken() ?? null;
}

void setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {});
