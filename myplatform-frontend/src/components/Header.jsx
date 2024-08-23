// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { NavbarItem } from './ui/NavbarItem';

const Header = () => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <a className="navbar-brand" href="#">Каталог курсів</a>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <a className="nav-link" href="/">Курси</a>
        </li>
        <NavbarItem link="/events" title="Найближчі заходи" />
        <li className="nav-item">
          <Link className="nav-link" to="/events">Найближчі заходи</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/blog">Блог</Link>
        </li>
        
        <li className="nav-item">
          <Link className="nav-link" to="/reviews">Відгуки</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/about">Про нас</Link>
        </li>
      </ul>
      <ul className="navbar-nav">
        <li className="nav-item">
          <button className="btn btn-outline-primary" onClick={() => window.location.href = '/login'}>Увійти</button>
        </li>
        <li className="nav-item ml-2">
          <button className="btn btn-primary" onClick={() => window.location.href = '/register'}>Зареєструватися</button>
        </li>
      </ul>
    </div>
  </nav>
);

export default Header;