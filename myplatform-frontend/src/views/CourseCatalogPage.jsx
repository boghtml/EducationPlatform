import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'nouislider/dist/nouislider.css';
import '../css/style.css';
import { Link } from 'react-router-dom';
import Header from './Header';
import { fetchCourses } from '../features/courses/courseSlice';


function CourseCatalogPage() {
  const dispatch = useDispatch();
  const { courses, status, error } = useSelector((state) => state.courses);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [durationRange, setDurationRange] = useState([1, 20]);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCourses());
    }
  }, [status, dispatch]);

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

  if (status === 'loading') {
    return <div>Завантаження курсів...</div>;
  }

  if (status === 'failed') {
    return <div>Помилка завантаження курсів: {error}</div>;
  }



  const handlePriceChange = (e) => {
    const newPriceRange = [parseInt(document.getElementById('price-from').value), parseInt(document.getElementById('price-to').value)];
    setPriceRange(newPriceRange);
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider && priceSlider.noUiSlider) {
      priceSlider.noUiSlider.set(newPriceRange);
    }
  };

  const handleDurationChange = (e) => {
    const newDurationRange = [parseInt(document.getElementById('duration-from').value), parseInt(document.getElementById('duration-to').value)];
    setDurationRange(newDurationRange);
    const durationSlider = document.getElementById('duration-slider');
    if (durationSlider && durationSlider.noUiSlider) {
      durationSlider.noUiSlider.set(newDurationRange);
    }
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

    document.getElementById('price-from').value = 0;
    document.getElementById('price-to').value = 5000;
    document.getElementById('duration-from').value = 1;
    document.getElementById('duration-to').value = 20;

    filterAndSortCourses();
  };

  return (
    <div>
      <Header />
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
              <label htmlFor="price-from">Цінова категорія</label>
              <div className="d-flex">
                <input id="price-from" type="number" className="form-control" value={priceRange[0]} onChange={handlePriceChange} />
                <span className="mx-2">до</span>
                <input id="price-to" type="number" className="form-control" value={priceRange[1]} onChange={handlePriceChange} />
              </div>
              <div id="price-slider" className="mt-2"></div>
              <p>Від <span>{priceRange[0]}</span> до <span>{priceRange[1]}</span></p>
            </div>
            <div className="form-group">
              <label htmlFor="duration-from">Тривалість курсу (тижнів)</label>
              <div className="d-flex">
                <input id="duration-from" type="number" className="form-control" value={durationRange[0]} onChange={handleDurationChange} />
                <span className="mx-2">до</span>
                <input id="duration-to" type="number" className="form-control" value={durationRange[1]} onChange={handleDurationChange} />
              </div>
              <div id="duration-slider" className="mt-2"></div>
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