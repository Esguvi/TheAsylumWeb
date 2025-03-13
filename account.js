import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Accede directamente a las variables de entorno definidas en Vercel
/*const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};*/

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
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const fullname = document.getElementById("nameRegister").value;
    const username = document.getElementById("userRegister").value;
    const email = document.getElementById("emailRegister").value;
    const password = document.getElementById("passRegister").value;
    const confirmPassword = document.querySelector("input[name='pass2Register']").value;

    // Validación de contraseñas coincidentes
    if (password !== confirmPassword) {
        showAlert("Las contraseñas no coinciden", "error");
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        showAlert("La contraseña debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.", "error");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await addDoc(collection(db, "users"), {
            fullname: fullname,
            username: username,
            email: email,
            uid: user.uid
        });

        showAlert("Usuario registrado correctamente.", "success");
        document.getElementById("registerForm").reset();
    } catch (error) {
        let errorMessage = "Error: " + error.message;
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "Este correo ya está en uso.";
        }
        showAlert(errorMessage, "error");
    }
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passLogin").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showAlert("Inicio de sesión exitoso.", "success");
    } catch (error) {
        let errorMessage = "Error: " + error.message;
        if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            errorMessage = "Alguno de los datos es incorrecto.";
        } else if (error.code === "auth/user-not-found") {
            errorMessage = "Usuario no encontrado.";
        }
        showAlert(errorMessage, "error");
    }
});

export function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");

    alertMessage.textContent = message;

    if (type === "success") {
        alertBox.className = "alert success";
        alertIcon.innerHTML = '<i class="fa fa-check-circle"></i>';
    } else if (type === "error") {
        alertBox.className = "alert error";
        alertIcon.innerHTML = '<i class="fa fa-times-circle"></i>';
    } else {
        alertBox.className = "alert info";
        alertIcon.innerHTML = '<i class="fa fa-info-circle"></i>';
    }

    alertBox.classList.remove("hidden");

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 5000);
}