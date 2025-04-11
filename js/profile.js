import { getAuth, sendPasswordResetEmail, onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDT-A7mlLu6X3LRV5AFVm9xqzIRMBlWfkk",
    authDomain: "theasylum-game.firebaseapp.com",
    projectId: "theasylum-game",
    storageBucket: "theasylum-game.firebasestorage.app",
    messagingSenderId: "585770314222",
    appId: "1:585770314222:web:33135f709bbca0969286ff",
    measurementId: "G-XSDM25Q5D0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const databaseURL = "https://theasylum-game-default-rtdb.europe-west1.firebasedatabase.app";
const rtdb = getDatabase(app, databaseURL);

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

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

sendChatBtn.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    const user = auth.currentUser;

    console.log("Antes de enviar:", chatInput.value); // Verifica el valor antes de enviar

    if (message && user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            let username = user.email.split('@')[0];

            if (docSnap.exists()) {
                const userData = docSnap.data();
                username = userData.username || username;
            }

            await push(ref(rtdb, "socialChat"), {
                user: username,
                message: message,
                timestamp: Date.now()
            });

            document.getElementById("chatInput").value = "";  
            console.log("Después de limpiar:", document.getElementById("chatInput").value); // Verifica si el valor se limpió

            chatInput.focus();
            console.log("Mensaje enviado y textarea limpiado.");
        } catch (error) {
            showAlert("No se pudo enviar el mensaje.", "error");
            console.error(error);
        }
    }
});


chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); 
        sendChatBtn.click(); 
    }
});

onChildAdded(ref(rtdb, "socialChat"), (snapshot) => {
    const data = snapshot.val();
    const messageElem = document.createElement("p");
    const date = new Date(data.timestamp);
    const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

    messageElem.innerHTML = `<strong>${data.user}</strong> <span style="color:gray;">[${time}]</span>: ${data.message}`;
    chatMessages.appendChild(messageElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
