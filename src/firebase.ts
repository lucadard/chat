// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from '@firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: 'chat-app-c9ff3.firebaseapp.com',
  projectId: 'chat-app-c9ff3',
  storageBucket: 'chat-app-c9ff3.appspot.com',
  messagingSenderId: '595511158838',
  appId: '1:595511158838:web:5bfd5e1aa79a121583d097',
  measurementId: 'G-T1BHDD01N9'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const initFirebase = () => app

// Initialize Firestore
const db = getFirestore()
export const getDb = () => db
