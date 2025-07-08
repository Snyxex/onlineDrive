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

// Private Funktion zum Aktualisieren des Benutzers im Local Storage
const updateUserInLocalStorage = (updatedUserObjectFromServer) => {
    const userString = localStorage.getItem('user');
    let currentUser = userString ? JSON.parse(userString) : null;

    if (currentUser) {
        // Wir wollen den Token beibehalten, der direkt auf der obersten Ebene des localStorage-Objekts liegt
        // und nur die Benutzerdaten (userName, email, theme etc.) aktualisieren,
        // die vom Backend im 'user'-Objekt der Antwort kommen.
        const userWithUpdatedData = {
            ...currentUser, // Behalte alle aktuellen Felder, inkl. token
            ...updatedUserObjectFromServer // Überschreibe die geänderten Felder
        };
        localStorage.setItem('user', JSON.stringify(userWithUpdatedData));
        console.log("authService: User data updated in localStorage.");
    } else {
        console.warn("authService: No user found in localStorage to update.");
    }
};

// Register user
const register = async (userData) => {
    const response = await axiosInstance.post('/signup', userData);
    if (response.data && response.data.body) {
        // Für Registrierung speichere den vollen body, da er token und user enthält
        localStorage.setItem('user', JSON.stringify(response.data.body));
    }
    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axiosInstance.post('/signin', userData);
    if (response.data && response.data.body) {
        // Speichere das user-Objekt und füge den Token direkt hinzu,
        // damit es ein flaches Objekt im Local Storage ist (token direkt auf oberster Ebene).
        const userToStore = {
            ...response.data.body.user, // Das eigentliche User-Objekt vom Backend
            token: response.data.body.token // Füge den Token hinzu
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
    }
    return response.data;
};

// Update username
const update_username = async (newUsernameData) => {
    // Hole den Token aus dem localStorage, um ihn in den Headern zu verwenden
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.token) {
        throw new Error("Authentication required: No user or token found.");
    }

    const config = {
        headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
        }
    };
    
    // Korrigierter Endpunkt: /user/update-username (mit Hyphen)
    const response = await axiosInstance.put('/user/update-username', newUsernameData, config);
    if (response.data && response.data.user) {
        updateUserInLocalStorage(response.data.user); // Nutze die Hilfsfunktion
    }
    return response.data;
};

// Update email
const update_email = async (newEmailData) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.token) {
        throw new Error("Authentication required: No user or token found.");
    }

    const config = {
        headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
        }
    };

    // Korrigierter Endpunkt: /user/update-email (mit Hyphen)
    const response = await axiosInstance.put('/user/update-email', newEmailData, config);
    if (response.data && response.data.user) {
        updateUserInLocalStorage(response.data.user); // Nutze die Hilfsfunktion
    }
    return response.data;
}

// Update password
const update_password = async (passwordData) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.token) {
        throw new Error("Authentication required: No user or token found.");
    }

    const config = {
        headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
        }
    };

    // Korrigierter Endpunkt: /user/update-password (mit Hyphen)
    const response = await axiosInstance.put('/user/update-password', passwordData, config);
    // Bei Passwortänderung gibt das Backend oft nicht das gesamte user-Objekt zurück.
    // Daher kein updateUserInLocalStorage hier, es sei denn, dein Backend sendet es.
    return response.data;
};

// Delete account
const delete_account = async () => { // Keine userData im Request Body für delete
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.token) {
        throw new Error("Authentication required: No user or token found.");
    }

    const config = {
        headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
        }
    };

    // Korrigierter Endpunkt: /user/delete-account (mit Hyphen)
    const response = await axiosInstance.delete('/user/delete-account', config);
    localStorage.removeItem('user'); // Benutzer nach Löschen des Kontos abmelden
    return response.data;
}

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

// Get current user from localStorage
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Update theme
const update_theme = async (newThemeData) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.token) {
        throw new Error("Authentication required: No user or token found.");
    }

    const config = {
        headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
        }
    };

    // Korrigierter Endpunkt: /user/update-theme (mit Hyphen)
    const response = await axiosInstance.put('/user/update-theme', newThemeData, config);
    if (response.data && response.data.user) {
        updateUserInLocalStorage(response.data.user); // Nutze die Hilfsfunktion
    }
    return response.data;
}

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    update_theme,
    update_username,
    update_email,
    update_password,
    delete_account,
    // update_user_in_local_storage ist keine öffentliche API des Services,
    // da sie nur intern verwendet wird, wenn ein API-Aufruf erfolgreich war.
};

export default authService;