// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project settings
const firebaseConfig = {
    apiKey: "AIzaSyBlvH5Ur09hbNCP_m-3Mqj4sPiUZwx7m7c",
    authDomain: "mindflow-80ef6.firebaseapp.com",
    projectId: "mindflow-80ef6",
    storageBucket: "mindflow-80ef6.firebasestorage.app",
    messagingSenderId: "698273246114",
    appId: "1:698273246114:web:7bfe45c1e6555dd232a0fb",
    measurementId: "G-ZPSR4KXVY1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };