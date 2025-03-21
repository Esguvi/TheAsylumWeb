import { getAuth, sendPasswordResetEmail, onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
const db = getFirestore(app);

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
    }

    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);
}

async function loadUserData() {
    const user = auth.currentUser;

    if (user) {
        const userRef = doc(db, "users", user.uid);  
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById("profileName").textContent = userData.fullname || "Sin nombre";
            document.getElementById("profileUsername").textContent = userData.username || "Sin usuario";
        } else {
            document.getElementById("profileName").textContent = user.displayName || "Sin nombre";
            document.getElementById("profileUsername").textContent = user.email.split('@')[0];
        }

        document.getElementById("profileEmail").textContent = user.email;
    } else {
        showAlert("No hay ningún usuario autenticado. Inicia sesión para ver los datos.", "error");
        window.location.href = "account.html";
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserData();
    } else {
        showAlert("No estás autenticado. Por favor, inicia sesión.", "error");
        window.location.href = "account.html";
    }
});

document.getElementById("changePasswordBtn").addEventListener("click", () => {
    const userEmail = auth.currentUser.email;

    sendPasswordResetEmail(auth, userEmail)
        .then(() => {
            showAlert("Se ha enviado un correo para restablecer tu contraseña. Comprueba tu correo.", "success");
        })
        .catch((error) => {
            showAlert("Hubo un error al enviar el correo de restablecimiento de contraseña.", "error");
        });
});

document.getElementById("signOutBtn").addEventListener("click", () => {
    const auth = getAuth();
    
    signOut(auth)
        .then(() => {
            showAlert("Has cerrado sesión correctamente.", "success");
            window.location.href = "account.html";  
        })
        .catch((error) => {
            showAlert("Hubo un error al cerrar sesión.", "error");
        });
});

document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
        showAlert("No hay usuario autenticado.", "error");
        return;
    }

    const userId = user.uid;
    const password = prompt("Para eliminar tu cuenta, ingresa tu contraseña:");

    if (!password) {
        showAlert("Eliminación cancelada.", "info");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        await deleteDoc(doc(db, "users", userId));

        await deleteUser(user);

        showAlert("Cuenta eliminada correctamente.", "success");
    } catch (error) {
        showAlert("Hubo un error al eliminar la cuenta: " + error.message, "error");
    }
});

function redirectToUnity() {
    const email = document.getElementById("profileEmail").textContent;

    if (email && email !== "Cargando...") {
        const apiUrl = `/api/redirectToUnity?email=${encodeURIComponent(email)}`;

        fetch(apiUrl)
            .then(response => {
                if (response.ok) {
                    window.location.href = `/api/redirectToUnity?email=${encodeURIComponent(email)}`;
                } else {
                    alert('Hubo un error al intentar iniciar el juego.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al intentar iniciar el juego.');
            });
    } else {
        alert("Por favor, asegúrate de estar autenticado.");
    }
}


