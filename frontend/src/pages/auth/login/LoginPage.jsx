import React, { useState } from "react";
import "./LoginPage.css";
 
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const handleSubmit = (e) => {
    e.preventDefault();
    // Hier würde die Logik zum Senden der Anmeldedaten an den Server stehen
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
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Passwort:
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <button className="login-btn" type="submit">Login</button>
    </form>
    <p style={{ textAlign: 'center', marginTop: '18px', color: 'black' }}>
      Noch kein Konto? <a href="/register">Jetzt registrieren</a></p>
      </div>
  );
};
 
export default LoginPage;