import { getAuth, sendPasswordResetEmail, updateEmail, sendEmailVerification, onAuthStateChanged, signOut  } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

document.getElementById("verifyEmailBtn").addEventListener("click", () => {
    const user = auth.currentUser;

    if (user) {
        sendEmailVerification(user)
            .then(() => {
                showAlert("Correo de verificación enviado. Revisa tu bandeja de entrada.", "success");
            })
            .catch((error) => {
                console.error("Error al enviar el correo de verificación: ", error);
                showAlert("Hubo un error al enviar el correo de verificación.", "error");
            });
    } else {
        showAlert("No hay ningún usuario autenticado. Inicia sesión para verificar tu correo.", "error");
    }
});

document.getElementById("changePasswordBtn").addEventListener("click", () => {
    const userEmail = auth.currentUser.email;

    sendPasswordResetEmail(auth, userEmail)
        .then(() => {
            showAlert("Se ha enviado un correo para restablecer tu contraseña. Comprueba tu correo.", "success");
        })
        .catch((error) => {
            console.error("Error al enviar el correo de restablecimiento de contraseña: ", error);
            showAlert("Hubo un error al enviar el correo de restablecimiento de contraseña.", "error");
        });
});

document.getElementById("changeEmailBtn").addEventListener("click", () => {
    const newEmail = prompt("Introduce tu nuevo correo electrónico:");

    if (newEmail && validateEmail(newEmail)) {
        const currentUser = auth.currentUser;

        currentUser.reload()
            .then(() => {
                if (currentUser.emailVerified) {
                    updateEmail(currentUser, newEmail)
                        .then(() => {
                            sendEmailVerification(currentUser)
                                .then(() => {
                                    showAlert("Email actualizado con éxito. Verifica tu nuevo correo electrónico.", "success");
                                })
                                .catch((error) => {
                                    console.error("Error al enviar el correo de verificación del nuevo correo: ", error);
                                    showAlert("Hubo un error al enviar el correo de verificación del nuevo correo.", "error");
                                });
                        })
                        .catch((error) => {
                            console.error("Error al actualizar el email: ", error);
                            showAlert("Hubo un error al actualizar tu email.", "error");
                        });
                } else {
                    // Si el correo no está verificado, mostrar un mensaje de error
                    showAlert("El correo actual no está verificado. Verifica tu correo para continuar.", "error");
                }
            })
            .catch((error) => {
                console.error("Error al recargar el estado del usuario: ", error);
                showAlert("Hubo un error al verificar el estado de tu correo. Intenta nuevamente.", "error");
            });
    } else {
        showAlert("Por favor, introduce un correo electrónico válido.", "error");
    }
});


document.getElementById("signOutBtn").addEventListener("click", () => {
    const auth = getAuth();
    
    signOut(auth)
        .then(() => {
            showAlert("Has cerrado sesión correctamente.", "success");
            window.location.href = "account.html";  
        })
        .catch((error) => {
            console.error("Error al cerrar sesión: ", error);
            showAlert("Hubo un error al cerrar sesión.", "error");
        });
});

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}
