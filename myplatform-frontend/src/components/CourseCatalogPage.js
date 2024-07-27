import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import 'nouislider/dist/nouislider.css';
import noUiSlider from 'nouislider';
import '../css/style.css';
import { Link } from 'react-router-dom';

function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [durationRange, setDurationRange] = useState([1, 20]);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    axios.get(`${API_URL}/courses/`)
      .then(response => {
        setCourses(response.data);
        setFilteredCourses(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the courses!', error);
      });

    const priceSlider = document.getElementById('price-slider');
    const durationSlider = document.getElementById('duration-slider');

    if (priceSlider && !priceSlider.noUiSlider) {
      noUiSlider.create(priceSlider, {
        start: [0, 5000],
        connect: true,
        range: {
          'min': 0,
          'max': 5000
        },
        format: {
          to: value => Math.round(value),
          from: value => Number(value)
        }
      }).on('update', (values, handle) => {
        setPriceRange([parseInt(values[0]), parseInt(values[1])]);
      });
    }

    if (durationSlider && !durationSlider.noUiSlider) {
      noUiSlider.create(durationSlider, {
        start: [1, 20],
        connect: true,
        range: {
          'min': 1,
          'max': 20
        },
        format: {
          to: value => Math.round(value),
          from: value => Number(value)
        }
      }).on('update', (values, handle) => {
        setDurationRange([parseInt(values[0]), parseInt(values[1])]);
      });
    }

  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [statusFilter, priceRange, durationRange, sortOption, courses]);

  const filterAndSortCourses = () => {
    let filtered = courses;

    if (statusFilter) {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    filtered = filtered.filter(course => 
      course.price >= priceRange[0] && course.price <= priceRange[1] &&
      course.duration >= durationRange[0] && course.duration <= durationRange[1]
    );

    if (sortOption === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    } else if (sortOption === 'priceAsc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceDesc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredCourses(filtered);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setPriceRange([0, 5000]);
    setDurationRange([1, 20]);
    setSortOption('newest');

    // Reset sliders
    const priceSlider = document.getElementById('price-slider');
    const durationSlider = document.getElementById('duration-slider');

    if (priceSlider && priceSlider.noUiSlider) {
      priceSlider.noUiSlider.set([0, 5000]);
    }

    if (durationSlider && durationSlider.noUiSlider) {
      durationSlider.noUiSlider.set([1, 20]);
    }

    filterAndSortCourses();
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">Каталог курсів</a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" href="/">Курси <span className="sr-only">(поточна)</span></a>
            </li>
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
              <button className="btn btn-outline-primary" onClick={() => window.location.href = '/login'} >Увійти</button>
            </li>
            <li className="nav-item ml-2">
              <button className="btn btn-primary" onClick={() => window.location.href = '/register'}>Зареєструватися</button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row">
          <div className="col-md-3">
            <h5>ФІЛЬТРУВАТИ</h5>
            <div className="form-group">
              <label htmlFor="status-filter">Статус</label>
              <select id="status-filter" className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Всі</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="price-slider">Цінова категорія</label>
              <div id="price-slider"></div>
              <p>Від <span>{priceRange[0]}</span> до <span>{priceRange[1]}</span></p>
            </div>
            <div className="form-group">
              <label htmlFor="duration-slider">Тривалість курсу (тижнів)</label>
              <div id="duration-slider"></div>
              <p>Від <span>{durationRange[0]}</span> до <span>{durationRange[1]}</span> тижнів</p>
            </div>
            <button id="reset-filters" className="btn btn-secondary" onClick={handleResetFilters}>Скинути</button>
          </div>

          <div className="col-md-9">
            <h1>Каталог курсів</h1>
            <div className="form-group">
              <label htmlFor="sort">Сортування:</label>
              <select id="sort" className="form-control" value={sortOption} onChange={e => setSortOption(e.target.value)}>
                <option value="newest">Спочатку нові</option>
                <option value="priceAsc">Від дешевих до дорогих</option>
                <option value="priceDesc">Від дорогих до дешевих</option>
              </select>
            </div>

            <div className="row">
              {filteredCourses.map(course => (
                <div className="col-md-4" key={course.id}>
                  <div className="card mb-4 shadow-sm position-relative">
                    <img src={course.image_url} className="card-img-top" alt={course.title} />
                     <div className={`badge ${course.status === 'free' ? 'badge-free' : 'badge-premium'}`}>
                    {course.status}
                    </div>
                    <div className="card-body">
                      <Link to={`/courses/${course.id}`} style={{ color: 'orange', textDecoration: 'none' }}>
                        <h5 className="card-title">{course.title}</h5>
                      </Link>    
                      <p className="card-text">{course.description}</p>
                      <small className="text-muted">{course.duration} тижнів</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCatalogPage;
