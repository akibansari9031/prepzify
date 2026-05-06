import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, updateDoc, deleteDoc, getDoc, setDoc, getDocs, onSnapshot, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Ensure user record exists
    await ensureUserStats(result.user);
    return result.user;
  } catch (error: any) {
    console.error("Authentication Error:", error);
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    }
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google Sign-In. Please check your Firebase project settings.');
    }
    throw error;
  }
}

export async function ensureUserStats(user: User) {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        userId: user.uid,
        totalSessions: 0,
        averageScore: 0,
        streak: 0,
        lastActive: serverTimestamp()
      });
    }
  } catch (error) {
    console.warn("Failed to ensure user stats record:", error);
  }
}

export const signOut = () => firebaseSignOut(auth);

export async function updateXp(points: number) {
  if (!auth.currentUser) return;
  const userDocRef = doc(db, 'users', auth.currentUser.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      await updateDoc(userDocRef, {
        xp: (data.xp || 0) + points,
        totalSessions: (data.totalSessions || 0) + 1,
        lastActive: serverTimestamp()
      });
    } else {
      await setDoc(userDocRef, {
        userId: auth.currentUser.uid,
        xp: points,
        totalSessions: 1,
        averageScore: 0,
        streak: 1,
        lastActive: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Failed to update XP:", error);
  }
}

export const signUpWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const signInWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);

export const updateUserProfile = (name: string) => {
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, { displayName: name });
  }
  return Promise.reject('No user logged in');
};

export { onAuthStateChanged };

async function testConnection() {
  try {
    // Basic connectivity check - use a dummy doc that doesn't need to exist
    // but tests if we can reach the server.
    await getDocFromServer(doc(db, 'system', 'ping'));
  } catch (error: any) {
    // If it's permission denied, it's actually "connected" but rules blocked it (expected if not logged in)
    // If it's truly offline or config is wrong, it will say "the client is offline" or similar
    if (error?.message?.includes('the client is offline')) {
      console.warn("Firestore: Client appears to be offline or config is invalid.");
    }
    // We swallow other errors to avoid distracting the user with "permission denied" on a ping test
  }
}

testConnection();
