import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp, applicationDefault } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

initializeApp({
    credential: applicationDefault(),
});

export default async function handler(req, res) {
    const auth = getAuth();
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        return res.status(401).json({ error: "No autenticado" });
    }

    try {
        const decodedToken = await auth.verifyIdToken(token);
        res.json({ email: decodedToken.email });
    } catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
}
