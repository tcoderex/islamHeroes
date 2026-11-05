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

/**
 * Direct Google Identity Services (GIS) Token Client fallback
 * Works across domains and mobile browsers using Google's official GSI OAuth 2.0 endpoint
 */
export const signInWithGoogleGIS = (): Promise<{
  email: string;
  name: string;
  picture: string;
  sub: string;
  accessToken: string;
}> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services not loaded'));
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            return reject(tokenResponse);
          }
          if (tokenResponse?.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const data = await res.json();
              if (data && data.email) {
                cachedAccessToken = tokenResponse.access_token;
                return resolve({
                  email: data.email,
                  name: data.name || data.given_name || data.email.split('@')[0],
                  picture: data.picture || '',
                  sub: data.sub || '',
                  accessToken: tokenResponse.access_token,
                });
              }
            } catch (fetchErr) {
              return reject(fetchErr);
            }
          }
          reject(new Error('No access token received'));
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (e) {
      reject(e);
    }
  });
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
