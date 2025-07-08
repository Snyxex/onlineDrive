import React, { useState, useEffect } from "react";
import "./SettingsPage.css";
import authService from "../../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

const API_URL = '/api'; 

const Settings = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(false);

  const getAuthHeaders = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (user && user.token) {
        return { 
            headers: { 
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json' 
            } 
        };
    }
    navigate('/login');
    throw new Error("Authentication required: No user or token found.");
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    let initialTheme = "light";

    if (user && user.theme) {
      initialTheme = user.theme;
    } else {
      const savedDarkMode = localStorage.getItem("darkmode");
      if (savedDarkMode === "active") {
        initialTheme = "dark";
      }
    }
    
    setIsDarkMode(initialTheme === "dark");
    if (initialTheme === "dark") {
      document.body.classList.add("darkmode");
    } else {
      document.body.classList.remove("darkmode");
    }
  }, []);

  const toggleDarkMode = async () => {
    setLoadingTheme(true);
    const newDarkModeState = !isDarkMode;
    const newTheme = newDarkModeState ? "dark" : "light";

    try {
      const config = getAuthHeaders();
      const response = await axios.put(`${API_URL}/user/update-theme`, { newTheme }, config);
      authService.updateUser(response.data.user);
      setIsDarkMode(newDarkModeState);
      if (newDarkModeState) {
        document.body.classList.add("darkmode");
      } else {
        document.body.classList.remove("darkmode");
      }
      localStorage.setItem("darkmode", newDarkModeState ? "active" : "inactive");

    } catch (error) {
      console.error("Fehler beim Aktualisieren des Themes:", error);
      if (error.response && error.response.status === 401) {
        // Handled by getAuthHeaders or axios interceptor
      } else {
        alert("Fehler beim Aktualisieren des Themes. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setLoadingTheme(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Möchten Sie sich wirklich abmelden?")) {
      authService.logout();
      navigate("/login");
    }
  };

  return (
    <div className="settings-page-container">
      <div className="settings-card">
        <div className="settings-header">
          <h1>Einstellungen</h1>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            Dark Mode
          </div>
          <button 
            id="theme-switch" 
            onClick={toggleDarkMode} 
            disabled={loadingTheme}
            className="theme-toggle-btn"
          >
            {loadingTheme ? (
              <span className="spinner"></span>
            ) : isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <path d="m12 2 0 2"></path>
                <path d="m12 20 0 2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="m2 12 2 0"></path>
                <path d="m20 12 2 0"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            Benutzername ändern
          </div>
          <Link to="/settings/username" className="setting-btn">username</Link>
        </div>
        
        <div className="setting-item">
          <div className="setting-label">
            E-Mail ändern
          </div>
          <Link to="/settings/email" className="setting-btn">email</Link>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            Passwort ändern
          </div>
          <Link to="/settings/password" className="setting-btn">password</Link>
        </div>

       <div className="setting-footer">
       <Link to="/dashboard" className="back-to-dashboard-btn">
            Zurück zum Dashboard
          </Link>
       </div>
        <div className="setting-footer">
          <button onClick={handleLogout} className="setting-btn">
            Abmelden
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;