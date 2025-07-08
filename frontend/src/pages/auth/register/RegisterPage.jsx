import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService'; 
import './RegisterPage.css'; 
 
const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });
   const navigate = useNavigate();

    const { username, email, password, password2 } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };
 
    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            alert('Passwörter stimmen nicht überein');
        } else {
            const userData = {
                username,
                email,
                password,
            };

            try {
                await authService.register(userData);
                alert('Registrierung erfolgreich!');
                navigate('/dashboard'); // Weiterleitung zum Dashboard nach erfolgreicher Registrierung
            } catch (error) {
                // Zugriff auf Fehlermeldung vom Backend
                alert(error.response?.data?.message || 'Fehler bei der Registrierung');
            }
        }
    };
    
 
    return (
        <div className="login-container"> 
            <h2 className="black-white">Online Drive Registrierung</h2> 
            <p className="login-subtitle">Erstelle dein kostenloses Online Drive Konto</p>
            <form onSubmit={onSubmit} className="login-form"> 
                <label>
                    Benutzername:
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                    />
                </label>
                <label>
                    E-Mail:
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </label>
                <label>
                    Passwort:
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </label>
                <label>
                    Passwort bestätigen:
                    <input
                    type="password"
                    id="password2"
                    name="password2"
                    value={password2}
                    onChange={onChange}
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