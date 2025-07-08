import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService"; // Adjust path as needed
import './DarkModeToggle.css'; // Create this CSS file for styling



const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const navigate = useNavigate();

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
    // If no user or token, redirect to login. This assumes authService.getCurrentUser() also redirects or handles this.
    navigate('/login');
    throw new Error("Authentication required: No user or token found.");
  };

  useEffect(() => {
    // Check local storage and user's saved theme on component mount
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
      const response = await axios.put(`/api/user/update_theme`, { newTheme }, config);
      authService.update_theme(response.data.user); // Update theme in local storage/auth context
      
      setIsDarkMode(newDarkModeState);
      if (newDarkModeState) {
        document.body.classList.add("darkmode");
      } else {
        document.body.classList.remove("darkmode");
      }
      localStorage.setItem("darkmode", newDarkModeState ? "active" : "inactive");

    } catch (error) {
      console.error("Fehler beim Aktualisieren des Themes:", error);
      // More robust error handling might be needed, e.g., showing a user-friendly message
      if (error.response && error.response.status === 401) {
        // Auth handled by getAuthHeaders or axios interceptor, but good to note
        // Potentially show a message like "Session expired"
      } else {
        alert("Fehler beim Aktualisieren des Themes. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setLoadingTheme(false);
    }
  };

  return (
    <button 
      id="theme-switch" 
      onClick={toggleDarkMode} 
      disabled={loadingTheme}
      className="theme-toggle-btn" // Apply styling from DarkModeToggle.css
    >
      {loadingTheme ? (
        <span className="spinner"></span> // Add spinner styling in CSS
      ) : isDarkMode ? (
        // Sun icon for dark mode (currently active)
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
        // Moon icon for light mode (currently active)
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
  );
};

export default DarkModeToggle;