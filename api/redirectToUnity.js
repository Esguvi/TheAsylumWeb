export default function handler(req, res) {
    const { email } = req.query;

    if (email) {
        const unityDeepLink = `unitygame://start?email=${encodeURIComponent(email)}`;
        
        res.redirect(301, unityDeepLink);
    } else {
        res.status(400).json({ message: 'Email is required' });
    }
}
