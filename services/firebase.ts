import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get Firebase ID token
    const token = await user.getIdToken();
    
    // Store token securely
    await SecureStore.setItemAsync('firebaseToken', token);
    await SecureStore.setItemAsync('userId', user.uid);
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email: string, password: string, fullName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: fullName,
      createdAt: new Date().toISOString(),
      isVolunteer: true,
    });
    
    // Get Firebase ID token
    const token = await user.getIdToken();
    
    // Store token securely
    await SecureStore.setItemAsync('firebaseToken', token);
    await SecureStore.setItemAsync('userId', user.uid);
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    await SecureStore.deleteItemAsync('firebaseToken');
    await SecureStore.deleteItemAsync('userId');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
