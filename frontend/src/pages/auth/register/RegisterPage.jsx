import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService'; 
import './RegisterPage.css'; 
 
const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Umbenannt von password2
    const navigate = useNavigate();
 
    const handleSubmit = (e) => {
        e.preventDefault();
 
        if (password !== confirmPassword) {
            alert('Passwörter stimmen nicht überein');
            return;
        }
 
        // Hier würde die Logik zum Senden der Registrierungsdaten an den Server stehen
        // console.log('Registrierungsdaten:', { username, email, password });
        // try {
        //     await authService.register({ username, email, password });
        //     alert('Registrierung erfolgreich!');
        //     navigate('/dashboard');
        // } catch (error) {
        //     alert(error.response?.data?.message || 'Fehler bei der Registrierung');
        // }
 
        console.log("Benutzername:", username);
        console.log("E-Mail:", email);
        console.log("Passwort:", password);
        console.log("Passwort bestätigen:", confirmPassword);
    };
 
    return (
        <div className="login-container"> 
            <h2 className="black-white">Online Drive Registrierung</h2> 
            <p className="login-subtitle">Erstelle dein kostenloses Online Drive Konto</p>
            <form onSubmit={handleSubmit} className="login-form"> 
                <label>
                    Benutzername:
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label>
                    E-Mail:
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Passwort:
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Passwort bestätigen:
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" className="login-btn"> {/* Angepasster Button-Klassenname */}
                    Registrieren
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '18px', color: 'black' }}>
                Bereits registriert? <a href="/login">Hier anmelden</a>
            </p>
        </div>
    );
};
 
export default RegisterPage;