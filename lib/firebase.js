// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyCTQG5UySSF7BbcvLEYUmlqbxnsol956Yc",
  authDomain: "kanrigamen-32823.firebaseapp.com",
  projectId: "kanrigamen-32823",
  storageBucket: "kanrigamen-32823.appspot.com",
  messagingSenderId: "1048885212553",
  appId: "1:1048885212553:web:64ca3a202fd4df566b5d58"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;