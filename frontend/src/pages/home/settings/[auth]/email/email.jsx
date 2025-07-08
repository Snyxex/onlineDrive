import React, { useState } from "react";
import "./email.css";

const Email = ({ navigation }) => {
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleCancel = () => {
    if (navigation) {
      navigation.navigateTo("settings");
    } else {
      window.location.href = "settings.html";
    }
  };

  const handleChangeEmail = () => {
    // Hier können Sie die E-Mail-Änderungslogik implementieren
    console.log("Changing email...", { oldEmail, newEmail, confirmEmail });

    // Beispiel: Validierung
    if (newEmail !== confirmEmail) {
      alert("New emails do not match!");
      return;
    }

    if (oldEmail === newEmail) {
      alert("The new email cannot be the same as the old email!");
      return;
    }

    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert("Please enter a valid email address!");
      return;
    }

    // Wenn alles okay ist, zurück zu settings
    if (navigation) {
      navigation.navigateTo("settings");
    } else {
      window.location.href = "settings.html";
    }
  };

  return (
    <div className="center">
      <div className="top">
        <h1>change email</h1>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="email"
            className="text"
            name="oldemail"
            required
            placeholder="Old email"
            value={oldEmail}
            onChange={e => setOldEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="email"
            className="text"
            name="newemail"
            required
            placeholder="New email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="email"
            className="text"
            name="confirmemail"
            required
            placeholder="Confirm New email"
            value={confirmEmail}
            onChange={e => setConfirmEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="change">
        <a onClick={handleCancel}>cancel</a>
        <a onClick={handleChangeEmail}>change</a>
      </div>
    </div>
  );
};

export default Email;
