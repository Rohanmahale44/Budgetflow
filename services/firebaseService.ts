import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';

// Firebase config is expected in Vite env vars (e.g. .env.local)
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || '',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || '',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || '',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || '',
};

// Lazy init - if already initialized, initializeApp will return the same app
try {
  initializeApp(firebaseConfig);
} catch (e) {
  // ignore if already initialized in hot-reload during dev
}

const auth = getAuth();

function ensureConfigured() {
  const key = firebaseConfig.apiKey || '';
  if (!key || key === 'your_firebase_api_key' || key === 'PLACEHOLDER_API_KEY') {
    throw new Error(
      'Firebase is not configured. Please add valid VITE_FIREBASE_API_KEY and other Firebase settings to .env.local and restart the dev server.'
    );
  }
}

export const firebaseService = {
  async signIn(email: string, password: string) {
    ensureConfigured();
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signUp(email: string, password: string) {
    ensureConfigured();
    return createUserWithEmailAndPassword(auth, email, password);
  },

  async signOut() {
    return fbSignOut(auth);
  },

  // Provide a simple wrapper for auth state changes; callback receives { uid, email } | null
  onAuthStateChanged(callback: (user: { uid: string; email: string | null } | null) => void) {
    return fbOnAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) callback({ uid: user.uid, email: user.email });
      else callback(null);
    });
  },

  getCurrentAuthUser() {
    const u = auth.currentUser;
    if (!u) return null;
    return { uid: u.uid, email: u.email };
  },

  // Change password requires reauthentication with current credentials
  async changePassword(currentPassword: string, newPassword: string) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return true;
  },
};
