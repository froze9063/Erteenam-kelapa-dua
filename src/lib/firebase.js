import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2f_1SAvNUFFeTa4tsCzdEFzmVoEgOUvA",
  authDomain: "erteenam-kelapa-dua.firebaseapp.com",
  projectId: "erteenam-kelapa-dua",
  storageBucket: "erteenam-kelapa-dua.firebasestorage.app",
  messagingSenderId: "1093453845414",
  appId: "1:1093453845414:web:3e999094de03513a2b3567",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
