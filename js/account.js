import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

async function getFirebaseConfig() {
    try {
        const response = await fetch("/api/firebase-config");
        return await response.json();
    } catch (error) {
        console.error("Error cargando la configuración de Firebase:", error);
        showAlert("Error al cargar la configuración. Inténtalo más tarde.", "error");
        return null;
    }
}

async function initFirebase() {
    const firebaseConfig = await getFirebaseConfig();
    if (!firebaseConfig) return;

    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
    window.auth = getAuth(app);
    window.db = getFirestore(app);

    console.log("Firebase inicializado correctamente.");
}

initFirebase();

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");

    alertIcon.className = '';

    if (type === "success") {
        alertBox.className = "alert success";
        alertIcon.classList.add("fas", "fa-check-circle");
    } else if (type === "error") {
        alertBox.className = "alert error";
        alertIcon.classList.add("fas", "fa-times-circle"); 
    } else if (type === "info") {
        alertBox.className = "alert info";
        alertIcon.classList.add("fas", "fa-info-circle");
    }

    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);
}

document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullname = document.getElementById("nameRegister").value.trim();
    const username = document.getElementById("userRegister").value.trim();
    const email = document.getElementById("emailRegister").value.trim();
    const password = document.getElementById("passRegister").value;
    const confirmPassword = document.getElementById("pass2Register").value;

    if (!fullname || !username || !email || !password || !confirmPassword) {
        showAlert("Todos los campos son obligatorios", "error");
        return;
    }

    if (password !== confirmPassword) {
        showAlert("Las contraseñas no coinciden", "error");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(window.db, "users", user.uid), {
            fullname: fullname,
            username: username,
            email: email,
            uid: user.uid
        });

        showAlert("Registro exitoso", "success");
        document.getElementById("registerForm").reset();
    } catch (error) {
        showAlert(error.message, "error");
    }
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("emailLogin").value.trim();
    const password = document.getElementById("passLogin").value;

    if (!email || !password) {
        showAlert("Todos los campos son obligatorios", "error");
        return;
    }

    try {
        await signInWithEmailAndPassword(window.auth, email, password);
        showAlert("Inicio de sesión exitoso", "success");
        document.getElementById("loginForm").reset();
    } catch (error) {
        showAlert(error.message, "error");
    }
});
