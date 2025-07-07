import React, { useEffect } from "react";
import "./LandingPage.css";

const LandingPage = () => {
  useEffect(() => {
    const monate = [
      "JAN", "FEB", "MÄR", "APR", "MAI", "JUN",
      "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"
    ];
    const heute = new Date();
    const monthElement = document.getElementById('month');
    const dayElement = document.getElementById('day');

    if (monthElement) {
      monthElement.textContent = monate[heute.getMonth()];
    }
    if (dayElement) {
      dayElement.textContent = heute.getDate().toString().padStart(2, '0');
    }
  }, []);

  return (
    <div className="landing-container">
      <h1 className="landing-title">Willkommen bei Online Drive</h1>
      <div className="landing-buttons">
        <a href="/login" className="landing-btn">Login</a>
        <a href="/register" className="landing-btn landing-btn-outline">Registrieren</a>
      </div>
      <div className="parent" style={{ marginTop: '40px' }}>
        <div className="card" style={{ position: 'relative' }}>
          <div className="content-box">
            <span className="card-title">Cloud-Lösung</span>
            <p className="card-content">
              Deine sichere Cloud-Lösung für Schule, Studium und Alltag.
            </p>
            <span className="see-more">
              <a href="/more" style={{ color: 'inherit', textDecoration: 'none' }}>Mehr erfahren</a>
            </span>
          </div>
          <div className="date-box">
            <span className="month" id="month"></span>
            <span className="date" id="day"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;