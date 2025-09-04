import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  // Demo configuration - replace with your Firebase config
  apiKey: "demo-api-key",
  authDomain: "fastflow-demo.firebaseapp.com",
  projectId: "fastflow-demo",
  storageBucket: "fastflow-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

export default app