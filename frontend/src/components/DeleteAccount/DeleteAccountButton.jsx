// src/components/DeleteAccountButton.jsx
import React, { useState } from 'react';
import authService from '../../services/authService'; // Passe den Pfad zu deinem authService an
import { useNavigate } from 'react-router-dom'; // Für die Weiterleitung nach dem Löschen
import './DeleteAccountButton.css'; // Optional: Für Styling

const DeleteAccountButton = () => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Hook für die Navigation

    // Erster Bestätigungsdialog öffnen
    const handleDeleteClick = () => {
        setError(null); // Fehler zurücksetzen
        setShowConfirmModal(true);
    };

    // Ersten Bestätigungsdialog schließen
    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setShowFinalConfirmModal(false);
    };

    // Zweiten Bestätigungsdialog öffnen
    const handleConfirmFirstStep = () => {
        setShowConfirmModal(false); // Ersten schließen
        setShowFinalConfirmModal(true); // Zweiten öffnen
    };

    // Konto tatsächlich löschen
    const handleConfirmFinalStep = async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.delete_account();
            
            alert("Your account has been successfully deleted. You are now logged out.");
            navigate('/signin'); // Oder '/login', je nach deiner Route
            // authService.logout() wird bereits in delete_account aufgerufen
        } catch (err) {
            console.error("Failed to delete account:", err);
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "An unexpected error occurred. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
            setShowFinalConfirmModal(false); // Modals schließen
        }
    };

    return (
        <div className="delete-account-container">
            <button
                className="delete-account-button"
                onClick={handleDeleteClick}
                disabled={loading}
            >
                {loading ? 'Deleting Account...' : 'Delete Account'}
            </button>

            {/* Erster Bestätigungs-Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Account Deletion</h3>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCancelDelete} disabled={loading}>Cancel</button>
                            <button className="btn-confirm" onClick={handleConfirmFirstStep} disabled={loading}>Yes, I'm sure</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zweiter, finaler Bestätigungs-Modal */}
            {showFinalConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Final Confirmation!</h3>
                        <p className="warning-text">
                            **WARNING:** Deleting your account will permanently remove all your data, including your uploaded files.
                            This cannot be recovered.
                        </p>
                        <p>Do you REALLY want to proceed?</p>
                        {error && <p className="error-message">{error}</p>}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCancelDelete} disabled={loading}>No, Cancel</button>
                            <button className="btn-danger" onClick={handleConfirmFinalStep} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeleteAccountButton;