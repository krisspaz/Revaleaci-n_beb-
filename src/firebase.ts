import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Replace with your Firebase project config
// Go to https://console.firebase.google.com → Create project → 
// Build → Realtime Database → Create Database (test mode) →
// Project Settings → Your apps → Web app → Copy config
const firebaseConfig = {
  apiKey: "AIzaSyD_placeholder_replace_me",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:placeholder"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
