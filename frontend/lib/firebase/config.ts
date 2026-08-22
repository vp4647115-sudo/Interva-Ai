// Firebase web SDK initialization. Config values are public client identifiers
// (safe to expose); security is enforced server-side via ID token verification.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Fail loudly instead of getting cryptic 400s from identitytoolkit.
  console.error(
    "[firebase] Missing NEXT_PUBLIC_FIREBASE_* environment variables. " +
      "Create frontend/.env.local from .env.example."
  );
}

export { firebaseConfig };
