
'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase }from "firebase/database";
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration from the prompt
const firebaseConfig = {
  apiKey: "AIzaSyBtKTdYqIubn2Bjc6KJRb009vk8hVhJBZk",
  authDomain: "flashsparks-7c21b.firebaseapp.com",
  projectId: "flashsparks-7c21b",
  storageBucket: "flashsparks-7c21b.appspot.com",
  messagingSenderId: "121165428625",
  appId: "1:121165428625:web:48ce65d74979ab58194c30",
  measurementId: "G-96L4N10EW2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };
