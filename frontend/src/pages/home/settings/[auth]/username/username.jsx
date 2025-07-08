import React, { useState } from "react";
import "./username.css";

const Username = ({ navigation }) => {
  const [oldUsername, setOldUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [confirmUsername, setConfirmUsername] = useState("");

  const handleCancel = () => {
    if (navigation) {
      navigation.navigateTo("settings");
    } else {
      window.location.href = "settings.html";
    }
  };

  const handleChangeUsername = () => {
    // Hier können Sie die Username-Änderungslogik implementieren
    console.log("Changing username...", {
      oldUsername,
      newUsername,
      confirmUsername,
    });

    // Beispiel: Validierung
    if (newUsername !== confirmUsername) {
      alert("New usernames do not match!");
      return;
    }

    // Username-Validierung (mindestens 3 Zeichen, keine Sonderzeichen)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (newUsername.length < 3) {
      alert("Username must be at least 3 characters long!");
      return;
    }

    if (!usernameRegex.test(newUsername)) {
      alert("Username can only contain letters, numbers, and underscores!");
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
        <h1>change Username</h1>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="text"
            className="text"
            name="oldusername"
            required
            placeholder="Old Username"
            value={oldUsername}
            onChange={e => setOldUsername(e.target.value)}
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
            onChange={e => setNewUsername(e.target.value)}
          />
        </div>
      </div>

      <div className="box">
        <div className="inbox">
          <input
            type="text"
            className="text"
            name="confirmUsername"
            required
            placeholder="Confirm New Username"
            value={confirmUsername}
            onChange={e => setConfirmUsername(e.target.value)}
          />
        </div>
      </div>

      <div className="change">
        <a onClick={handleCancel}>cancel</a>
        <a onClick={handleChangeUsername}>change</a>
      </div>
    </div>
  );
};

export default Username;
