import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Importa o módulo de autenticação

const firebaseConfig = {
  apiKey: "AIzaSyArhu7KbK_LXV4-FgihOzfzMX6DwDq3BpQ",
  authDomain: "meunetflix-9b0b6.firebaseapp.com",
  projectId: "meunetflix-9b0b6",
  storageBucket: "meunetflix-9b0b6.firebasestorage.app",
  messagingSenderId: "669989427422",
  appId: "1:669989427422:web:bc51340e8c568a78668a4f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // 2. Inicializa e exporta o auth