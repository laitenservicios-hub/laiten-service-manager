import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAg6OOrPsN4PQeZDPTJxJ_18vhO1g_jVA0",
  authDomain: "laiten-service-manager.firebaseapp.com",
  projectId: "laiten-service-manager",
  storageBucket: "laiten-service-manager.firebasestorage.app",
  messagingSenderId: "1067386350724",
  appId: "1:1067386350724:web:7a7697c02ebd04951726d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 IMPORTANTE: exportación correcta
export { db };