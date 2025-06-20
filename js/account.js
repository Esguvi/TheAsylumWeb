import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
const db = getFirestore(app);
var seen = true;
var seen2 = true;
var seen3 = true;

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

document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullname = document.getElementById("nameRegister").value;
    const username = document.getElementById("userRegister").value;
    const email = document.getElementById("emailRegister").value;
    const password = document.getElementById("passRegister").value;
    const confirmPassword = document.getElementById("pass2Register").value;

    if (password !== confirmPassword) {
        showAlert("Las contraseñas no coinciden", "error");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
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

    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passLogin").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showAlert("Inicio de sesión exitoso", "success");
        document.getElementById("loginForm").reset();

        window.location.href = "profile.html?email=" + encodeURIComponent(email);
    } catch (error) {
        showAlert("Ha habido un error al iniciar sesión", "error");
    }
});

document.getElementById("see").addEventListener("click", () => {
    var password = document.getElementById("passLogin");

    if (seen) {
        password.type = "text";
        seen = false;
    } else {
        password.type = "password";
        seen = true;
    }
});

document.getElementById("see2").addEventListener("click", () => {
    var password = document.getElementById("passRegister");

    if (seen2) {
        password.type = "text";
        seen2 = false;
    } else {
        password.type = "password";
        seen2 = true;
    }
});

document.getElementById("see3").addEventListener("click", () => {
    var password = document.getElementById("pass2Register");

    if (seen3) {
        password.type = "text";
        seen3 = false;
    } else {
        password.type = "password";
        seen3 = true;
    }
});

