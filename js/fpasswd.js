import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

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
const auth = getAuth(app);

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");

    alertIcon.className = '';

    if (type === "success") {
        alertBox.className = `alert success`;
        alertIcon.classList.add("fas", "fa-check-circle");
    } else if (type === "error") {
        alertBox.className = `alert error`;
        alertIcon.classList.add("fas", "fa-times-circle"); 
    } else if (type === "info") {
        alertBox.className = `alert info`;
        alertIcon.classList.add("fas", "fa-info-circle");
    }

    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);
}
document.getElementById("fPasswordBtn").addEventListener("click", async (event) => {
    event.preventDefault();

    const userEmail = document.getElementById("emailfpasswd").value.trim();

    if (!userEmail) {
        showAlert("Introduce un correo válido.", "error");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, userEmail);
        showAlert("Se ha enviado un correo para restablecer tu contraseña. Comprueba tu correo.", "success");
    } catch (error) {
        showAlert("Hubo un error al enviar el correo de restablecimiento de contraseña.", "error");
    }
});
