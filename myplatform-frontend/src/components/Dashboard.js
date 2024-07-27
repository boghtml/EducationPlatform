import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/dashboard.css'; // Підключаємо стилі

function Dashboard() {
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', profileImageUrl: 'https://via.placeholder.com/40' });

  useEffect(() => {
    const userName = sessionStorage.getItem('userName') || 'User';
    const userEmail = sessionStorage.getItem('userEmail') || 'undefined';
    const profileImageUrl = sessionStorage.getItem('profileImageUrl') || 'https://via.placeholder.com/40';
    setUser({ name: userName, email: userEmail, profileImageUrl: profileImageUrl });
    console.log("User data from session:", { userName, userEmail, profileImageUrl });
  }, []);

  const toggleDropdown = () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="#">Best IT School</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="#">Мої курси</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>Магазин</a>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            <input className="form-control mr-sm-2" type="search" placeholder="Пошук курсів" aria-label="Search" />
          </form>
          <ul className="navbar-nav">
            <li className="nav-item">
              <img src={user.profileImageUrl} className="rounded-circle profile-icon" id="profile-icon" alt="User Icon" onClick={toggleDropdown} />
            </li>
          </ul>
        </div>
      </nav>
      <div className="profile-dropdown" id="profile-dropdown">
        <div id="user-info">
          <p id="user-name-email">{user.name} ({user.email})</p>
        </div>
        <a href="profile.html">Профіль</a>
        <a href="#">Мої домашні завдання</a>
        <a href="#">Керування підпискою</a>
        <a href="#">Налаштування</a>
        <a href="#">Вихід</a>
      </div>
      <div className="container">
        <h1>Ласкаво просимо, <span id="user-name">{user.name}</span>!</h1>
      </div>
    </div>
  );
}

export default Dashboard;