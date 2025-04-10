import { getAuth, sendPasswordResetEmail, onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, deleteDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

const friendList = document.getElementById("friendList");
const chatHeader = document.getElementById("chatWith");
const chatUsername = document.getElementById("chatUsername");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");

let currentUser = null;
let selectedFriend = null;
let typingTimeout;

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
        loadFriendsList();
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


async function loadFriendsList() {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    friendList.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== currentUser.uid) {
            const userData = docSnap.data();
            const li = document.createElement("li");
            li.textContent = userData.username || "Usuario";
            li.onclick = () => selectFriend(docSnap.id, userData.username);
            friendList.appendChild(li);
        }
    });
}

function selectFriend(userId, username) {
    selectedFriend = userId;
    chatUsername.textContent = username;
    chatMessages.innerHTML = "";

    const chatRoomId = getChatRoomId(currentUser.uid, selectedFriend);

    const chatMessagesRef = collection(db, "chats", chatRoomId, "messages");
    onSnapshot(chatMessagesRef, (snapshot) => {
        chatMessages.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            const messageElement = document.createElement("p");
            messageElement.innerHTML = `<strong>${msg.sender === currentUser.uid ? "Tú" : username}:</strong> ${msg.text}`;
            chatMessages.appendChild(messageElement);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    const typingDocRef = doc(db, "chats", chatRoomId, "typing");
    onSnapshot(typingDocRef, (docSnap) => {
        const typingStatus = docSnap.data();
        if (typingStatus && typingStatus[selectedFriend]) {
            chatHeader.textContent = `Chat con: ${username} (Está escribiendo...)`;
        } else {
            chatHeader.textContent = `Chat con: ${username}`;
        }
    });
}

function getChatRoomId(uid1, uid2) {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

async function sendMessage() {
    if (!selectedFriend || !messageInput.value.trim()) return;

    const chatRoomId = getChatRoomId(currentUser.uid, selectedFriend);
    const messageText = messageInput.value.trim();

    const messageRef = doc(collection(db, "chats", chatRoomId, "messages"));
    await setDoc(messageRef, {
        text: messageText,
        sender: currentUser.uid,
        timestamp: serverTimestamp(),
    });

    // Limpiar el input después de enviar el mensaje
    messageInput.value = "";
    notifyTypingStatus(false);
}

messageInput.addEventListener("input", () => {
    if (!selectedFriend) return;
    notifyTypingStatus(true);
});

function notifyTypingStatus(isTyping) {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedFriend);
    const typingRef = doc(db, "chats", chatRoomId, "typing");

    if (isTyping) {
        updateDoc(typingRef, {
            [currentUser.uid]: true,
        });
    } else {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            updateDoc(typingRef, {
                [currentUser.uid]: false,
            });
        }, 1500);
    }
}