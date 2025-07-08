import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../../../services/authService"; // Passen Sie den Pfad bei Bedarf an
import "./email.css"; // Stellen Sie sicher, dass diese CSS-Datei existiert

const EmailPage = () => {
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [password, setPassword] = useState(""); // Passwort zur Bestätigung
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lädt die aktuelle E-Mail-Adresse, wenn die Komponente geladen wird
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.email) {
      setCurrentEmail(user.email);
    } else {
      // Wenn kein Benutzer angemeldet ist, zur Login-Seite umleiten
      navigate("/login");
    }
  }, [navigate]);

  const handleCancel = () => {
    navigate("/settings"); // Zurück zur Einstellungsseite
  };

  const handleChangeEmail = async () => {
    setError(""); // Fehler zurücksetzen
    setSuccess(""); // Erfolgsmeldung zurücksetzen

    // --- Frontend-Validierung ---
    if (!newEmail || !confirmNewEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (newEmail !== confirmNewEmail) {
      setError("New emails do not match!");
      return;
    }

    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError("Please enter a valid new email address.");
      return;
    }

    if (newEmail === currentEmail) {
      setError("New email cannot be the same as the current email.");
      return;
    }

    setLoading(true); // Ladezustand aktivieren
    try {
      // Aufruf der authService-Funktion zum Aktualisieren der E-Mail-Adresse
      // Senden von newEmail und dem aktuellen Passwort zur Bestätigung
      const response = await authService.update_email({
        newEmail: newEmail.trim(), // Trimmen, falls Leerzeichen eingegeben wurden
        password: password, // Passwort zur Bestätigung
      });

      setSuccess(response.message || "Email updated successfully!");
      setNewEmail("");
      setConfirmNewEmail("");
      setPassword(""); // Passwortfeld leeren

      // Aus Sicherheitsgründen ist es am besten, den Benutzer nach einer E-Mail-Änderung auszuloggen
      // und zur erneuten Anmeldung mit der neuen E-Mail aufzufordern.
      setTimeout(() => {
        authService.logout(); // Benutzer ausloggen
        navigate("/login"); // Zur Login-Seite umleiten
      }, 2000);

    } catch (err) {
      console.error("Error updating email:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Zeigen Sie spezifische Fehlermeldung vom Backend
      } else {
        setError("Failed to update email. Please try again.");
      }
    } finally {
      setLoading(false); // Ladezustand deaktivieren
    }
  };

  return (
    <div className="center">
      <div className="top">
        <h1>Change Email</h1>
        {currentEmail && (
          <p className="current-email">Current: {currentEmail}</p>
        )}
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="email"
            className="text"
            name="currentEmail"
            value={currentEmail}
            readOnly
            disabled // Deaktivieren Sie das Feld, da es nicht geändert werden soll
            placeholder="Current Email"
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="email"
            className="text"
            name="newEmail"
            required
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="email"
            className="text"
            name="confirmNewEmail"
            required
            placeholder="Confirm New Email"
            value={confirmNewEmail}
            onChange={(e) => setConfirmNewEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="password"
            className="text"
            name="password"
            required
            placeholder="Your Password (for confirmation)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="change">
        <a onClick={handleCancel} className="cancel-btn" disabled={loading}>Cancel</a>
        <a onClick={handleChangeEmail} className="change-btn" disabled={loading}>
          {loading ? "Changing..." : "Change"}
        </a>
      </div>
    </div>
  );
};

export default EmailPage;