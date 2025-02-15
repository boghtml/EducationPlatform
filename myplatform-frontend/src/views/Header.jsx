import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate()
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="/">Каталог курсів</a>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Курси</Link>
          </li>
          {user ?(
            <li className="nav-item">
            <Link className="nav-link" to="/dashboard">Кабінет користувача</Link>
          </li>
          ):("")}
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
          {user ? (
            <li className="nav-item">
            <span className="navbar-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              Привіт, {user.userName}
            </span>
          </li>
          ) : (
            <>
              <li className="nav-item">
                <button className="btn btn-outline-primary" onClick={() => navigate( '/login')}>Увійти</button>
              </li>
              <li className="nav-item ml-2">
                <button className="btn btn-primary" onClick={() => navigate('/register')}>Зареєструватися</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
