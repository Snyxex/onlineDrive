import React from 'react';
import "../LandingPage.css";

const MorePage = () => {
  return (
    <div className="landing-container">
      <h1 className="landing-title">Online Drive – Deine Cloud-Lösung</h1>
      <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '2rem auto',color:'black' }}>
        <li>Speichere und teile Dateien sicher in der Cloud</li>
        <li>Greife von überall auf deine Daten zu</li>
        <li>Intuitive Oberfläche, auch für Teams und Gruppen</li>
        <li>Datenschutz und Sicherheit made in Germany</li>
        <li>Ideal für Schule, Studium und Alltag</li>
      </ul>
      <div style={{ marginTop: '2rem' }}>
        <a href="/" className="landing-btn landing-btn-outline">Zurück</a>
      </div>
    </div>
  );
};

export default MorePage;