import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
    const userString = localStorage.getItem('user');
   
    const user = userString ? JSON.parse(userString) : null;
   
    if (user && user.token) {
        // Füge hier auch einen Content-Type für JSON-Anfragen hinzu,
        // obwohl bei Dateiuploads oft 'multipart/form-data' verwendet wird.
        // Für normale GET/DELETE passt 'application/json' gut.
        return { 
            headers: { 
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json' 
            } 
        };
    }
    // Throw an error if no user or token is found
    throw new Error("Authentication required: No user or token found.");
};

// Upload file
const uploadFile = async (fileData) => {
   
    const config = getAuthHeaders(); 
   
    if (fileData instanceof FormData) {
        delete config.headers['Content-Type']; // Wichtig für FormData
    }
    
    const response = await axios.post(`${API_URL}/upload`, fileData, config);
    return response.data;
};

// Get user files
const getFiles = async () => {
    const config = getAuthHeaders();
   
    const response = await axios.get(`${API_URL}/files`, config);
    return response.data;
};

// Download file
const downloadFile = async (fileId, fileName) => {
    // responseType: 'blob' ist korrekt für Binärdaten wie Dateien
    const config = { ...getAuthHeaders(), responseType: 'blob' };
    const response = await axios.get(`${API_URL}/file/${fileId}`, config);
    
    // Create a Blob from the response data
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
};

// Delete file
const deleteFile = async (fileId) => {
    const config = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/file/${fileId}`, config);
    return response.data;
};

const fileService = {
    uploadFile,
    getFiles,
    downloadFile,
    deleteFile,
};

export default fileService;