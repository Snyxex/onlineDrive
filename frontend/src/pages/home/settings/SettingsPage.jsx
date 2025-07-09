import React from "react";
import "./SettingsPage.css";
import authService from "../../../services/authService";
import { useNavigate, Link } from "react-router-dom";
// No need for axios or useState/useEffect for dark mode here anymore
import DarkModeToggle from "../../../components/Darkmode/DarkModeToggle"; 
import DeleteAccountButton from "../../../components/DeleteAccount/DeleteAccountButton";

const Settings = () => {
  const navigate = useNavigate();

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
          {/* Use the new DarkModeToggle component here */}
          <DarkModeToggle /> 
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
        <div className="setting-footer">
          <DeleteAccountButton />
        </div>

      </div>
    </div>
  );
};

export default Settings;