export default function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    const user = req.headers["x-user-email"]; 

    if (!user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    res.status(200).json({ email: user });
}
