import React, { useState, useEffect, useMemo } from "react";
import "./DashboardPage.css";
import { useNavigate } from "react-router-dom";
import fileService from '../../../services/fileService';
import authService from '../../../services/authService';

const Main = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // Maximale Speicherbegrenzung in MB (5 GB = 5000 MB)
  const MAX_STORAGE_MB = 5000;

  // NEU: Funktion zur Umrechnung und Summierung des Speicherplatzes in MB
  // Diese Funktion ersetzt die Logik deiner ursprünglichen Storage()-Funktion
  // und wird mit useMemo optimiert, um nur bei Änderungen von 'files' neu zu rechnen.
  const calculateTotalStorageMB = useMemo(() => {
    let totalMB = 0;
    for (let i = 0; i < files.length; i++) {
      // Annahme: file.size aus dem Backend ist bereits eine Zahl in Bytes
      // Wenn files[i].size immer noch ein String ist (z.B. "1024 Bytes"),
      // musst du die Parselogik aus deiner Storage()-Funktion hier anwenden.
      // Basierend auf deinem File Model ist 'size' ein Number (Bytes),
      // daher konvertieren wir es hier direkt nach MB.
      let sizeBytes = files[i].size; // Dies ist die Größe in Bytes vom Backend

      // Umwandlung von Bytes in MB
      let sizeMB = sizeBytes / (1024 * 1024);
      totalMB = totalMB + sizeMB;
    }
    return totalMB;
  }, [files]);

  // Den berechneten Gesamtspeicher in MB speichern
  const currentUsedStorageMB = useMemo(() => {
    return calculateTotalStorageMB;
  }
  , [calculateTotalStorageMB]);

  // NEU: State für Upload-Fehlermeldung (Speicher voll)
  const [storageError, setStorageError] = useState(null);

  const fetchFiles = async () => {
    try {
        setIsLoading(true);
        const data = await fileService.getFiles();
        console.log("DEBUG: Data from fileService.getFiles():", data);

        if (data && data.files && Array.isArray(data.files)) {
            setFiles(data.files.map(file => ({
                name: file.filename,
                size: file.size, // Geht davon aus, dass 'size' hier in Bytes ist (Number)
                date: file.createdAt,
                id: file._id,
            })));
            setStorageError(null);
        } else {
            setFiles([]);
            console.warn('Unerwartetes Datenformat von fileService.getFiles():', data);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Dateien:', error);
        if (error.response && error.response.status === 401) {
            authService.logout();
            navigate('/login');
        }
        setStorageError(error.response?.data?.message || 'Fehler beim Laden der Dateien.');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("DEBUG: useEffect for filtering triggered. Current files:", files);
    if (searchTerm === "") {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [searchTerm, files]);

  useEffect(() => {
      const user = authService.getCurrentUser();
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
      if (error.response && error.response.status === 401) {
        authService.logout();
        navigate("/login");
      }
      alert(error.response?.data?.message || 'Fehler beim Herunterladen der Datei');
    }
  };

  const handleFileUpload = async event => {
    const fileToUpload = event.target.files[0];
    if (!fileToUpload) {
      return;
    }

    // NEU: Frontend-Prüfung des Speicherlimits
    // Größe der hochzuladenden Datei in MB umrechnen
    const fileSizeMB = fileToUpload.size / (1024 * 1024);

    if ((currentUsedStorageMB + fileSizeMB) > MAX_STORAGE_MB) {
        const message = `Upload failed: Not enough storage space. You have ${currentUsedStorageMB.toFixed(2)} MB / ${MAX_STORAGE_MB} MB used.`;
        setStorageError(message);
        alert(message);
        document.getElementById('fileInput').value = '';
        return;
    }
    setStorageError(null);

    setIsUploading(true);
    try {
        const formData = new FormData();
        formData.append("file", fileToUpload);

        await fileService.uploadFile(formData);
        console.log("Datei erfolgreich hochgeladen.");
        alert('Datei erfolgreich hochgeladen!');
        document.getElementById('fileInput').value = '';
        fetchFiles(); // Dateiliste neu laden, um den aktualisierten Speicherplatz zu sehen
    } catch (error) {
        console.error("Fehler beim Hochladen der Datei:", error);
        if (error.response && error.response.status === 401) {
            authService.logout();
            navigate("/login");
        }
        const errorMessage = error.response?.data?.message || 'Fehler beim Hochladen der Datei';
        setStorageError(errorMessage);
        alert(errorMessage);
    } finally {
        setIsUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Datei löschen möchten?')) {
      setIsDeleting(fileId);
      setStorageError(null);
      try {
        await fileService.deleteFile(fileId);
        alert('Datei erfolgreich gelöscht!');
        fetchFiles(); // Dateiliste neu laden, um den aktualisierten Speicherplatz zu sehen
      } catch (error) {
        console.error('Fehler beim Löschen der Datei:', error);
        if (error.response && error.response.status === 401) {
            authService.logout();
            navigate("/login");
        }
        const errorMessage = error.response?.data?.message || 'Fehler beim Löschen der Datei';
        setStorageError(errorMessage);
        alert(errorMessage);
      } finally {
        setIsDeleting(null);
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

  // Diese Funktion bleibt gleich, da sie nur für die Anzeige ist.
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // NEU: Überprüfen, ob Upload erlaubt ist (Speicher voll)
  const isUploadAllowed = currentUsedStorageMB < MAX_STORAGE_MB;

  return (
    <div>
      <header className="top">
        <h1>OnlineDrive</h1>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

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
              disabled={isUploading || !isUploadAllowed}
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => document.getElementById("fileInput").click()}
              disabled={isUploading || !isUploadAllowed}
            >
              {isUploading ? 'Wird hochgeladen...' : (isUploadAllowed ? 'Upload File' : 'Speicher voll')}
            </button>
          </div>
          <button type="button" className="upload-btn" onClick={handleSettingsClick}>
            Settings
          </button>
        </div>

        {/* NEU: Speicheranzeige mit den berechneten Werten */}
        <div className="storage-info" id="totalSize"> {/* Hier ist deine 'totalSize' ID */}
            <span>Gesamtspeicher: {currentUsedStorageMB.toFixed(2)} MB / {MAX_STORAGE_MB} MB</span>
            <progress value={currentUsedStorageMB} max={MAX_STORAGE_MB}></progress>
            {!isUploadAllowed && (
                <p className="storage-full-message">Der Speicher ist voll. Bitte löschen Sie Dateien, um neuen Platz zu schaffen.</p>
            )}
        </div>

        {/* NEU: Anzeige von Fehlermeldungen (z.B. Speicher voll) */}
        {storageError && !isUploading && (
            <p className="error-message">{storageError}</p>
        )}


        <div className="filesearch">
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="search"
              id="searchInput"
              placeholder="Search files..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </form>
        </div>

        <div className="filelist custom-scrollbar">
          {isLoading ? (
            <p className="loading-message">Dateien werden geladen...</p>
          ) : filteredFiles.length === 0 && searchTerm === "" ? (
            <p className="keinedatei">Keine Dateien gefunden.</p>
          ) : filteredFiles.length === 0 && searchTerm !== "" ? (
            <p className="keinedatei">Keine Ergebnisse für "{searchTerm}" gefunden.</p>
          ) : (
            filteredFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-details">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">{formatDate(file.date)}</span>
                  </div>
                </div>
                <button
                  className="upload-btn"
                  onClick={() => downloadFile(file.id, file.name)}
                  disabled={isUploading || isDeleting === file.id}
                >
                  Download
                </button>
                <button
                  className="upload-btn"
                  onClick={() => handleDelete(file.id)}
                  disabled={isUploading || isDeleting === file.id}
                >
                  {isDeleting === file.id ? 'Löschen...' : 'Delete'}
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