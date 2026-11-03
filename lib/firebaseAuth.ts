import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('openid');

let cachedAccessToken: string | null = null;

export const signInWithGoogleReal = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || '';
  cachedAccessToken = token;
  return { user: result.user, accessToken: token };
};

export const signOutReal = async (): Promise<void> => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};

export const updateDisplayNameReal = async (newName: string): Promise<void> => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: newName });
  }
};

export const getCachedToken = (): string | null => cachedAccessToken;
