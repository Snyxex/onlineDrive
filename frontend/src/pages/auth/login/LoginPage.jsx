import React, { useState } from "react";
import "./LoginPage.css";
import authService from '../../../services/authService';
 
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
});

const { email, password } = formData;

const [error, setError] = useState(''); 

const onChange = (e) => {
    setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value,
    }));
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { email, password }; // Erstelle ein FormData-Objekt
    try {
        await authService.login(formData); // Verwende das FormData-Objekt für den Login
        window.location.href = '/dashboard';
    } catch {
        setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
    }
};
 
  return (
      <div className="login-container">
    <h2 className="login-title">
      <span className="black-white">Online Drive Login</span>
    </h2>
    <p className="login-subtitle">Bitte melde dich mit deinen Zugangsdaten an</p>
    <form className="login-form" onSubmit={handleSubmit}>
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
      <button className="login-btn" type="submit">Login</button>
    </form>
    {error && <p className="error-message">{error}</p>}
    <p style={{ textAlign: 'center', marginTop: '18px', color: 'black' }}>
      Noch kein Konto? <a href="/register">Jetzt registrieren</a></p>
      </div>
  );
};
 
export default LoginPage;