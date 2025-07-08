import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../../../services/authService"; // Passe den Pfad bei Bedarf an
import "./password.css"; // Stelle sicher, dass diese CSS-Datei existiert

const PasswordPage = () => {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Umbenannt zur Klarheit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCancel = () => {
    navigate("/settings"); // Zurück zur Einstellungsseite
  };

  const handleChangePassword = async () => {
    setError(""); // Fehler zurücksetzen
    setSuccess(""); // Erfolgsmeldung zurücksetzen

    // --- Frontend-Validierung ---
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long!");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password cannot be the same as the old password.");
      return;
    }

    setLoading(true); // Ladezustand aktivieren
    try {
      // Direkter Aufruf der authService-Funktion zum Aktualisieren des Passworts
      // Der authService kümmert sich um das Senden des Tokens in den Headern.
      const response = await authService.update_password({
        oldPassword,
        newPassword: newPassword.trim(), // Trimmen, falls Leerzeichen eingegeben wurden
      });

      setSuccess(response.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      // Optional: Nach einer kurzen Zeit zurück zur Settings-Seite navigieren
      // oder den Benutzer bitten, sich mit dem neuen Passwort neu anzumelden.
      // Aus Sicherheitsgründen ist es oft besser, den Benutzer nach einer Passwortänderung auszuloggen.
      setTimeout(() => {
        authService.logout(); // Benutzer ausloggen
        navigate("/login"); // Zur Login-Seite umleiten
      }, 2000);

    } catch (err) {
      console.error("Error updating password:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Zeige spezifische Fehlermeldung vom Backend
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false); // Ladezustand deaktivieren
    }
  };

  return (
    <div className="center">
      <div className="top">
        <h1>Change Password</h1>
      </div>

      <div className="box">
        <div className="inbox">
          <div className="input-container">
            <input
              type={showOldPassword ? "text" : "password"}
              className="text"
              name="oldPassword"
              required
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
            />
            <button className="show-btn" onClick={handleShowOldPassword} type="button">
              👁️
            </button>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <div className="input-container">
            <input
              type={showNewPassword ? "text" : "password"}
              className="text"
              name="newPassword"
              required
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <button className="show-btn" onClick={handleShowNewPassword} type="button">
              👁️
            </button>
          </div>
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <div className="input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="text"
              name="confirmNewPassword" // Name anpassen
              required
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={loading}
            />
            <button className="show-btn" onClick={handleShowConfirmPassword} type="button">
              👁️
            </button>
          </div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="change">
        <a onClick={handleCancel} className="cancel-btn" disabled={loading}>Cancel</a>
        <a onClick={handleChangePassword} className="change-btn" disabled={loading}>
          {loading ? "Changing..." : "Change"}
        </a>
      </div>
    </div>
  );
};

export default PasswordPage;