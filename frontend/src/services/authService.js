import axios from 'axios';

// ÄNDERE DIESE ZEILE: Nutze den Proxy-Pfad, den du in vite.config.js definiert hast
// Wenn dein Proxy '/api' ist, und dein Backend '/api/auth' erwartet,
// dann sollte die baseURL hier '/api/auth' sein, um den Proxy zu nutzen.
const BASE_URL = '/api'; // <-- WICHTIG: Kein 'http://localhost:5000' mehr!

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { // Füge dies hinzu, um explizit zu sein
        'Content-Type': 'application/json'
    }
});

// Register user
const register = async (userData) => {
    const response = await axiosInstance.post('/signup', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axiosInstance.post('/signin', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    register,
    login,
    logout,
};

export default authService;