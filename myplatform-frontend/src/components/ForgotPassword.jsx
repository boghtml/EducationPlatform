import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email !== confirmEmail) {
      alert('Email не співпадає');
      return;
    }
    axios.post(`${API_URL}/users/forgot-password/`, { email })
      .then(response => {
        console.log('Password reset link sent', response.data);
        alert('Посилання для скидання паролю надіслано на вашу пошту');
      })
      .catch(error => {
        console.error('Error sending reset link', error);
        alert('Сталася помилка при надсиланні посилання для скидання паролю');
      });
  };

  return (
    <div className="container mt-5">
      <h2>Забули пароль?</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-email">Підтвердження Email</label>
          <input type="email" className="form-control" id="confirm-email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Відправити</button>
      </form>
    </div>
  );
}

export default ForgotPassword;