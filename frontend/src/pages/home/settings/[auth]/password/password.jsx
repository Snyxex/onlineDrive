import React, { useState } from "react";
import "./password.css";

const Password = ({ navigation }) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    if (navigation) {
      navigation.navigateTo("settings");
    } else {
      window.location.href = "settings.html";
    }
  };

  const handleChangePassword = () => {
    // Hier können Sie die Passwort-Änderungslogik implementieren
    console.log("Changing password...", {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    // Beispiel: Validierung
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (navigation) {
      navigation.navigateTo("settings");
    } else {
      window.location.href = "settings.html";
    }
  };

  return (
    <div className="center">
      <div className="top">
        <h1>change Password</h1>
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
              onChange={e => setOldPassword(e.target.value)}
            />
            <button className="show-btn" onClick={handleShowOldPassword}>
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
              onChange={e => setNewPassword(e.target.value)}
            />
            <button className="show-btn" onClick={handleShowNewPassword}>
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
              name="confirmPassword"
              required
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button className="show-btn" onClick={handleShowConfirmPassword}>
              👁️
            </button>
          </div>
        </div>
      </div>

      <div className="change">
        <a onClick={handleCancel}>cancel</a>
        <a onClick={handleChangePassword}>change</a>
      </div>
    </div>
  );
};

export default Password;
