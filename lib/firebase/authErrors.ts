import { FirebaseError } from "firebase/app";

/** User-facing text for Firebase Auth failures (admin email/password, etc.). */
export function formatFirebaseAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "That email address is not valid.";
      case "auth/user-disabled":
        return "This account has been disabled in Firebase.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Wrong email or password. If you have not created a shop user yet, add one in Firebase Console → Authentication → Users.";
      case "auth/invalid-api-key":
        return "Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local and restart the dev server.";
      case "auth/network-request-failed":
        return "Network error. Check your connection. If you use 127.0.0.1, try http://localhost:3000 instead (Firebase authorized domains).";
      case "auth/too-many-requests":
        return "Too many attempts. Wait a few minutes and try again.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is turned off. In Firebase Console → Authentication → Sign-in method, enable Email/Password.";
      case "auth/unauthorized-domain":
        return "This site URL is not allowed. In Firebase Console → Authentication → Settings → Authorized domains, add localhost (or your dev host).";
      default:
        return err.message || "Sign-in failed.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Sign-in failed.";
}
