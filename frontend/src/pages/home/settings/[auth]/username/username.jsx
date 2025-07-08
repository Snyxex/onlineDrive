import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../../../services/authService"; // Passe den Pfad bei Bedarf an
import "./username.css"; // Stelle sicher, dass diese CSS-Datei existiert

// const API_URL = "/api"; // Nicht mehr direkt benötigt, da authService axiosInstance nutzt

const UsernamePage = () => {
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [confirmNewUsername, setConfirmNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lade den aktuellen Benutzernamen, wenn die Komponente geladen wird
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.userName) {
      setCurrentUsername(user.userName);
    } else {
      // Wenn kein Benutzer angemeldet ist, zur Login-Seite umleiten
      navigate("/login");
    }
  }, [navigate]);


  const handleCancel = () => {
    navigate("/settings"); // Zurück zur Einstellungsseite
  };

  const handleChangeUsername = async () => {
    setError(""); // Fehler zurücksetzen
    setSuccess(""); // Erfolgsmeldung zurücksetzen

    // --- Frontend-Validierung ---
    if (!newUsername || !confirmNewUsername) {
      setError("Please fill in all fields.");
      return;
    }

    if (newUsername !== confirmNewUsername) {
      setError("New usernames do not match!");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Erlaubt Buchstaben, Zahlen und Unterstriche
    if (newUsername.length < 3) {
      setError("Username must be at least 3 characters long!");
      return;
    }

    if (newUsername.length > 20) { // Optional: Max-Länge hinzufügen
      setError("Username cannot be longer than 20 characters!");
      return;
    }

    if (!usernameRegex.test(newUsername)) {
      setError("Username can only contain letters, numbers, and underscores!");
      return;
    }

    if (newUsername === currentUsername) {
      setError("New username cannot be the same as the current username.");
      return;
    }

    setLoading(true); // Ladezustand aktivieren
    try {
      // Direkter Aufruf der authService-Funktion
      const response = await authService.update_username({ newUsername: newUsername.trim() });
      
      setSuccess(response.message || "Username updated successfully!");
      // currentUsername wird automatisch aktualisiert, da authService den localStorage anpasst
      // und useEffect auf Änderungen im localStorage (via authService.getCurrentUser) reagieren könnte,
      // oder wir aktualisieren es direkt aus der Antwort:
      setCurrentUsername(response.user.userName); // Backend gibt 'user' direkt zurück
      setNewUsername("");
      setConfirmNewUsername("");

      // Optional: Nach einer kurzen Zeit zurück zur Settings-Seite navigieren
      setTimeout(() => {
        navigate("/settings");
      }, 2000);

    } catch (err) {
      console.error("Error updating username:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Zeige spezifische Fehlermeldung vom Backend
      } else {
        setError("Failed to update username. Please try again.");
      }
    } finally {
      setLoading(false); // Ladezustand deaktivieren
    }
  };

  return (
    <div className="center">
      <div className="top">
        <h1>Change Username</h1>
        {currentUsername && (
          <p className="current-username">Current: {currentUsername}</p>
        )}
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="text"
            className="text"
            name="oldusername"
            value={currentUsername}
            readOnly
            disabled // Deaktiviere das Feld, da es nicht geändert werden soll
            placeholder="Current Username"
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="text"
            className="text"
            name="newusername"
            required
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="text"
            className="text"
            name="confirmNewUsername"
            required
            placeholder="Confirm New Username"
            value={confirmNewUsername}
            onChange={(e) => setConfirmNewUsername(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="change">
        <a onClick={handleCancel} className="cancel-btn" disabled={loading}>Cancel</a>
        <a onClick={handleChangeUsername} className="change-btn" disabled={loading}>
          {loading ? "Changing..." : "Change"}
        </a>
      </div>
    </div>
  );
};

export default UsernamePage;