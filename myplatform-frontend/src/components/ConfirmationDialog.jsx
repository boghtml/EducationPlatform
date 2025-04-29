import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import '../css/ConfirmationDialog.css';

// Компонент діалогового вікна для підтвердження дій
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className="confirmation-dialog-header">
          <h3>{title}</h3>
          <button className="confirmation-dialog-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="confirmation-dialog-content">
          <AlertTriangle size={24} className="confirmation-dialog-icon" />
          <p>{message}</p>
        </div>
        <div className="confirmation-dialog-actions">
          <button className="confirmation-dialog-confirm-btn" onClick={onConfirm}>
            Підтвердити
          </button>
          <button className="confirmation-dialog-cancel-btn" onClick={onClose}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;