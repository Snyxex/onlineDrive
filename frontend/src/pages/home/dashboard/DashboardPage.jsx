import React, { useState, useEffect } from "react";
import "./DashboardPage.css";
import { useNavigate } from "react-router-dom";
import fileService from '../../../services/fileService';
import authService from '../../../services/authService';

const Main = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]); // Initialisiere mit leerem Array
  const [isLoading, setIsLoading] = useState(true); // Neuer State für Ladezustand der Dateien
  const [isUploading, setIsUploading] = useState(false); // Neuer State für Upload-Ladezustand
  const [isDeleting, setIsDeleting] = useState(null); // Speichert die ID der Datei, die gerade gelöscht wird

  const fetchFiles = async () => {
    try {
        setIsLoading(true); // Ladezustand starten
        const userFiles = await fileService.getFiles();
        console.log("DEBUG: userFiles from fileService.getFiles():", userFiles);
        if (userFiles && userFiles.files && Array.isArray(userFiles.files)) {
            setFiles(userFiles.files.map(file => ({
                name: file.filename,
                size: file.size,
                date: file.createdAt,
                id: file._id,
            })));
        } else {
            setFiles([]);
            console.warn('Unerwartetes Datenformat von fileService.getFiles():', userFiles);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Dateien:', error);
        if (error.response && error.response.status === 401) {
            authService.logout();
            navigate('/login');
        }
    } finally {
        setIsLoading(false); // Ladezustand beenden, egal ob Erfolg oder Fehler
    }
  };

  useEffect(() => {
    console.log("DEBUG: useEffect for filtering triggered. Current files:", files);
    // Filtere Dateien basierend auf Suchbegriff
    if (searchTerm === "") {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
    console.log("DEBUG: filteredFiles after update:", filteredFiles);
  }, [searchTerm, files]);

  useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
          navigate('/login'); 
      } else {
          fetchFiles();
      }
  }, [navigate]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE");
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      await fileService.downloadFile(fileId, fileName);
    } catch (error) {
      console.error("Fehler beim Herunterladen der Datei:", error);
      if (error.message.includes("Authentication required") || (error.response && error.response.status === 401)) {
        authService.logout(); // Sicherstellen, dass der Benutzer abgemeldet wird
        navigate("/login");
      }
      alert(error.response?.data?.message || 'Fehler beim Herunterladen der Datei');
    }
  };

  const handleFileUpload = async event => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true); // Upload-Ladezustand starten
      try {
        const formData = new FormData();
        formData.append("file", file);

        await fileService.uploadFile(formData);
        console.log("Datei erfolgreich hochgeladen.");
        alert('Datei erfolgreich hochgeladen!');
        document.getElementById('fileInput').value = ''; // Input zurücksetzen
        fetchFiles(); // Dateiliste aktualisieren
      } catch (error) {
        console.error("Fehler beim Hochladen der Datei:", error);
        if (error.message.includes("Authentication required") || (error.response && error.response.status === 401)) {
            authService.logout();
            navigate("/login");
        }
        alert(error.response?.data?.message || 'Fehler beim Hochladen der Datei');
      } finally {
        setIsUploading(false); // Upload-Ladezustand beenden
      }
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Datei löschen möchten?')) {
      setIsDeleting(fileId); // Setze die ID der zu löschenden Datei
      try {
        await fileService.deleteFile(fileId);
        alert('Datei erfolgreich gelöscht!');
        fetchFiles();
      } catch (error) {
        console.error('Fehler beim Löschen der Datei:', error);
        if (error.message.includes("Authentication required") || (error.response && error.response.status === 401)) {
            authService.logout();
            navigate("/login");
        }
        alert(error.response?.data?.message || 'Fehler beim Löschen der Datei');
      } finally {
        setIsDeleting(null); // Löschen Ladezustand beenden
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="top">
        <h1>OnlineDrive</h1>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-main-content">
        <div className="file">
          <h2>Files</h2>
          <div className="upload">
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              required
              onChange={handleFileUpload}
              disabled={isUploading} // Input deaktivieren während des Uploads
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => document.getElementById("fileInput").click()}
              disabled={isUploading} // Button während des Uploads deaktivieren
            >
              {isUploading ? 'Wird hochgeladen...' : 'Upload File'}
            </button>
          </div>
          <button type="button" className="settings" onClick={handleSettingsClick}>
            Settings
          </button>
        </div>

        <div className="filesearch">
          <form onSubmit={(e) => e.preventDefault()}> {/* Verhindert Neuladen der Seite bei Enter */}
            <input
              type="text"
              name="search"
              id="searchInput"
              placeholder="Search files..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={isLoading} // Suche deaktivieren, wenn Dateien geladen werden
            />
          </form>
        </div>

        <div className="filelist">
          {console.log("DEBUG: filteredFiles before map:", filteredFiles)}
          {isLoading ? (
            <p className="loading-message">Dateien werden geladen...</p> // Ladeanzeige
          ) : filteredFiles.length === 0 ? (
            <p className="keinedatei">Keine Dateien gefunden.</p>
          ) : (
            filteredFiles.map((file) => ( // Index entfernt, da ID als Key verwendet wird
              <div key={file.id} className="file-item"> {/* Hier wurde index durch file.id ersetzt */}
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-details">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">{formatDate(file.date)}</span>
                  </div>
                </div>
                <button
                  className="download-btn"
                  onClick={() => downloadFile(file.id, file.name)}
                  disabled={isUploading || isDeleting === file.id} // Deaktivieren, wenn Upload/Delete läuft
                >
                  Download
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(file.id)}
                  disabled={isUploading || isDeleting === file.id} // Deaktivieren, wenn Upload/Delete läuft
                >
                  {isDeleting === file.id ? 'Löschen...' : 'Delete'} {/* Angepasster Text beim Löschen */}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;