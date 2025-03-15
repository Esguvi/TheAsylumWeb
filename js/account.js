import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDT-A7mlLu6X3LRV5AFVm9xqzIRMBlWfkk",
  authDomain: "theasylum-game.firebaseapp.com",
  projectId: "theasylum-game",
  storageBucket: "theasylum-game.firebasestorage.app",
  messagingSenderId: "585770314222",
  appId: "1:585770314222:web:33135f709bbca0969286ff",
  measurementId: "G-XSDM25Q5D0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    
    alertBox.className = `alert ${type}`;
    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");
    
    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);
}

document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    
    const email = document.getElementById("emailRegister").value;
    const password = document.getElementById("passRegister").value;
    const confirmPassword = document.getElementById("pass2Register").value;

    if (password !== confirmPassword) {
        showAlert("Las contraseñas no coinciden", "error");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            showAlert("Registro exitoso", "success");
            document.getElementById("registerForm").reset();
        })
        .catch(error => {
            showAlert(error.message, "error");
        });
});

document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    
    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passLogin").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showAlert("Inicio de sesión exitoso", "success");
            document.getElementById("loginForm").reset();
        })
        .catch(error => {
            showAlert(error.message, "error");
        });
});
