import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import Header from './Header';
import Footer from './Footer';
import { FaCreditCard, FaHistory, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import '../css/subscription.css';

function Subscription() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    
    setUserId(userId);
    fetchTransactions(userId);
  }, []);
  
  const fetchTransactions = async (userId) => {
    try {
      setLoading(true);
      // First get CSRF token
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/payments/history/${userId}/`, {
        withCredentials: true
      });
      
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Не вдалося завантажити історію транзакцій. Спробуйте пізніше.');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(2) + ' грн';
  };
  
  return (
    <div className="subscription-page">
      <Header />
      
      <div className="subscription-container container">
        <div className="subscription-header">
          <h1>Керування підпискою</h1>
          <p>Перегляд історії ваших платежів та керування підпискою</p>
        </div>
        
        <div className="subscription-content">
          <div className="subscription-sidebar">
            <div className="subscription-menu">
              <h3>Меню</h3>
              <ul>
                <li className="active">
                  <FaHistory /> Історія платежів
                </li>
                <li>
                  <FaCreditCard /> Способи оплати
                </li>
              </ul>
            </div>
            
            <div className="subscription-status">
              <h3>Статус підписки</h3>
              <div className="status-box">
                <FaCheckCircle className="status-icon active" />
                <div>
                  <p className="status-label">Активна</p>
                  <p className="status-info">Ваша підписка активна до 01.06.2025</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="transactions-content">
            <div className="transactions-header">
              <h2>Історія платежів</h2>
            </div>
            
            {loading ? (
              <div className="loading-spinner">
                <FaSpinner className="spinner-icon" />
                <p>Завантаження платежів...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <FaExclamationTriangle />
                <p>{error}</p>
                <button 
                  className="btn btn-retry"
                  onClick={() => fetchTransactions(userId)}
                >
                  Спробувати знову
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="no-transactions">
                <FaHistory className="no-data-icon" />
                <h3>Немає транзакцій</h3>
                <p>Ви ще не здійснили жодної покупки на платформі</p>
              </div>
            ) : (
              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Опис</th>
                      <th>Курс</th>
                      <th>Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{formatDate(transaction.transaction_date)}</td>
                        <td>{transaction.description}</td>
                        <td>
                          {transaction.course_title || `ID: ${transaction.course}`}
                        </td>
                        <td className="amount">{formatAmount(transaction.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Subscription;