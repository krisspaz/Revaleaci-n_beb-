import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD6HyYJs1gOIZmHuIwzScf1mJ6EaWSOglI",
  authDomain: "gender-reveal-bd38b.firebaseapp.com",
  databaseURL: "https://gender-reveal-bd38b-default-rtdb.firebaseio.com",
  projectId: "gender-reveal-bd38b",
  storageBucket: "gender-reveal-bd38b.firebasestorage.app",
  messagingSenderId: "388440225736",
  appId: "1:388440225736:web:7b221db09ff5bc7ce072fd",
  measurementId: "G-JMCRKBM77C"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
