import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  Auth,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch {
  try {
    app = getApps()[0] || initializeApp(firebaseConfig, 'heroes-app');
  } catch {
    app = initializeApp(firebaseConfig, `app-${Date.now()}`);
  }
}

let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn('Firebase getAuth warning:', e);
  authInstance = {} as Auth;
}

export const auth: Auth = authInstance;

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('openid');
provider.setCustomParameters({ prompt: 'select_account' });

let cachedAccessToken: string | null = null;

export const signInWithGoogleReal = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  if (!auth?.app) {
    throw new Error('Firebase authentication is not initialized.');
  }
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || '';
  cachedAccessToken = token;
  return { user: result.user, accessToken: token };
};

export const signOutReal = async (): Promise<void> => {
  if (auth?.app) {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
  }
  cachedAccessToken = null;
};

export const updateDisplayNameReal = async (newName: string): Promise<void> => {
  if (auth?.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
    } catch {
      // ignore
    }
  }
};

export const getCachedToken = (): string | null => cachedAccessToken;
