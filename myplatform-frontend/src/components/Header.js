import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo.png';
import '../css/style.css';


const Header = () => (
  <nav className="header navbar navbar-expand-lg navbar-light bg-light">
    <a className="header__brand navbar-brand" href="#">
      <img src={logo} alt="Логотип" className="header__logo" />
    </a>
    <div className="header__collapse collapse navbar-collapse" id="navbarNav">
      <ul className="header__nav  mr-auto">
        <li className="header__nav-item nav-item">
          <a className="header__nav-link nav-link" href="/">Курси</a>
        </li>
        <li className="header__nav-item nav-item">
          <Link className="header__nav-link nav-link" to="/events">Найближчі заходи</Link>
        </li>
        <li className="header__nav-item nav-item">
          <Link className="header__nav-link nav-link" to="/blog">Блог</Link>
        </li>
        <li className="header__nav-item nav-item">
          <Link className="header__nav-link nav-link" to="/reviews">Відгуки</Link>
        </li>
        <li className="header__nav-item nav-item">
          <Link className="header__nav-link nav-link" to="/about">Про нас</Link>
        </li>
      </ul>
      <ul className="header__auth navbar-nav">
        <li className="header__auth-item nav-item">
          <button className="header__auth-button btn btn-outline-primary" onClick={() => window.location.href = '/login'}>Увійти</button>
        </li>
        <li className="header__auth-item nav-item ml-2">
          <button className="header__auth-button btn btn-primary" onClick={() => window.location.href = '/register'}>Зареєструватися</button>
        </li>
      </ul>
    </div>
  </nav>
);

export default Header;
