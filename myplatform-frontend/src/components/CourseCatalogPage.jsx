import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Link } from 'react-router-dom';
import Header from './Header';
import { FaSearch, FaFilter, FaSort, FaStar, FaUsers, FaClock, FaCalendarAlt, FaTag, FaChalkboardTeacher } from 'react-icons/fa';
import { TiArrowSortedUp, TiArrowSortedDown } from 'react-icons/ti';
import 'nouislider/dist/nouislider.css';
import noUiSlider from 'nouislider';
import '../css/courseCatalog.css';

function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [durationRange, setDurationRange] = useState([1, 20]);
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);

  // Refs for sliders
  const priceSliderRef = useRef(null);
  const durationSliderRef = useRef(null);
  const ratingSliderRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/courses/`);
        setCourses(response.data);
        setFilteredCourses(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка завантаження курсів!', error);
        setError('Помилка завантаження курсів. Спробуйте ще раз пізніше.');
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories/`);
        setCategories(response.data);
      } catch (error) {
        console.error('Помилка завантаження категорій:', error);
      }
    };

    fetchCourses();
    fetchCategories();

    const initSliders = () => {
      if (typeof window !== 'undefined' && window.noUiSlider) {
        // Price Slider
        if (priceSliderRef.current && !priceSliderRef.current.noUiSlider) {
          noUiSlider.create(priceSliderRef.current, {
            start: [0, 5000],
            connect: true,
            range: { 'min': 0, 'max': 5000 },
            format: { to: value => Math.round(value), from: value => Number(value) }
          });
          priceSliderRef.current.noUiSlider.on('update', (values) => {
            setPriceRange([parseInt(values[0]), parseInt(values[1])]);
          });
        }

        // Duration Slider
        if (durationSliderRef.current && !durationSliderRef.current.noUiSlider) {
          noUiSlider.create(durationSliderRef.current, {
            start: [1, 20],
            connect: true,
            range: { 'min': 1, 'max': 20 },
            format: { to: value => Math.round(value), from: value => Number(value) }
          });
          durationSliderRef.current.noUiSlider.on('update', (values) => {
            setDurationRange([parseInt(values[0]), parseInt(values[1])]);
          });
        }

        // Rating Slider
        if (ratingSliderRef.current && !ratingSliderRef.current.noUiSlider) {
          noUiSlider.create(ratingSliderRef.current, {
            start: [0, 5],
            connect: true,
            range: { 'min': 0, 'max': 5 },
            step: 0.5,
            format: { to: value => Number(value.toFixed(1)), from: value => Number(value) }
          });
          ratingSliderRef.current.noUiSlider.on('update', (values) => {
            setRatingRange([parseFloat(values[0]), parseFloat(values[1])]);
          });
        }
      }
    };

    const timer = setTimeout(() => {
      initSliders();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (priceSliderRef.current && priceSliderRef.current.noUiSlider) {
        priceSliderRef.current.noUiSlider.destroy();
      }
      if (durationSliderRef.current && durationSliderRef.current.noUiSlider) {
        durationSliderRef.current.noUiSlider.destroy();
      }
      if (ratingSliderRef.current && ratingSliderRef.current.noUiSlider) {
        ratingSliderRef.current.noUiSlider.destroy();
      }
    };
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [statusFilter, priceRange, durationRange, ratingRange, sortOption, searchQuery, selectedCategories, courses]);

  const filterAndSortCourses = () => {
    if (!courses.length) return;
    let filtered = [...courses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    filtered = filtered.filter(course => {
      const price = course.status === 'premium' ? parseFloat(course.price) : 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    filtered = filtered.filter(course => 
      course.duration >= durationRange[0] && course.duration <= durationRange[1]
    );

    filtered = filtered.filter(course => {
      const rating = course.rating || 4.5;
      return rating >= ratingRange[0] && rating <= ratingRange[1];
    });

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => {
        if (!course.categories) return false;
        return course.categories.some(category => 
          selectedCategories.includes(category.id)
        );
      });
    }

    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => {
          const aPrice = a.status === 'premium' ? parseFloat(a.price) : 0;
          const bPrice = b.status === 'premium' ? parseFloat(b.price) : 0;
          return aPrice - bPrice;
        });
        break;
      case 'priceDesc':
        filtered.sort((a, b) => {
          const aPrice = a.status === 'premium' ? parseFloat(a.price) : 0;
          const bPrice = b.status === 'premium' ? parseFloat(b.price) : 0;
          return bPrice - aPrice;
        });
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = [...priceRange];
    if (name === 'price-from') {
      newPriceRange[0] = parseInt(value);
    } else {
      newPriceRange[1] = parseInt(value);
    }
    setPriceRange(newPriceRange);
    if (priceSliderRef.current && priceSliderRef.current.noUiSlider) {
      priceSliderRef.current.noUiSlider.set(newPriceRange);
    }
  };

  const handleDurationRangeChange = (e) => {
    const { name, value } = e.target;
    const newDurationRange = [...durationRange];
    if (name === 'duration-from') {
      newDurationRange[0] = parseInt(value);
    } else {
      newDurationRange[1] = parseInt(value);
    }
    setDurationRange(newDurationRange);
    if (durationSliderRef.current && durationSliderRef.current.noUiSlider) {
      durationSliderRef.current.noUiSlider.set(newDurationRange);
    }
  };

  const handleRatingRangeChange = (e) => {
    const { name, value } = e.target;
    const newRatingRange = [...ratingRange];
    if (name === 'rating-from') {
      newRatingRange[0] = parseFloat(value);
    } else {
      newRatingRange[1] = parseFloat(value);
    }
    setRatingRange(newRatingRange);
    if (ratingSliderRef.current && ratingSliderRef.current.noUiSlider) {
      ratingSliderRef.current.noUiSlider.set(newRatingRange);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setPriceRange([0, 5000]);
    setDurationRange([1, 20]);
    setRatingRange([0, 5]);
    setSortOption('newest');
    setSearchQuery('');
    setSelectedCategories([]);
    if (priceSliderRef.current && priceSliderRef.current.noUiSlider) {
      priceSliderRef.current.noUiSlider.set([0, 5000]);
    }
    if (durationSliderRef.current && durationSliderRef.current.noUiSlider) {
      durationSliderRef.current.noUiSlider.set([1, 20]);
    }
    if (ratingSliderRef.current && ratingSliderRef.current.noUiSlider) {
      ratingSliderRef.current.noUiSlider.set([0, 5]);
    }
  };

  const renderRatingStars = (rating) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating || 4.5);
    const emptyStars = totalStars - fullStars;
    return (
      <div className="rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star star-filled" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="star star-empty" />
        ))}
      </div>
    );
  };

  const formatPrice = (price, status) => {
    if (status === 'free') return 'Безкоштовно';
    return `${price} грн`;
  };

  return (
    <div className="course-catalog-page">
      <Header />
      
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Знайдіть ідеальний курс для навчання</h1>
            <p className="hero-subtitle">Розвивайте свої навички з нашими професійними онлайн-курсами</p>
            
            <div className="search-bar">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Пошук курсів за назвою або описом..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <button 
                className="filter-toggle-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> {showFilters ? 'Приховати фільтри' : 'Показати фільтри'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="courses-header">
          <div className="courses-count">
            <h4>Знайдено курсів: {filteredCourses.length}</h4>
          </div>
          
          <div className="sort-options">
            <label htmlFor="sort" className="sort-label">
              <FaSort /> Сортувати за:
            </label>
            <select
              id="sort"
              className="form-control sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Спочатку нові</option>
              <option value="oldest">Спочатку старі</option>
              <option value="priceAsc">Ціна: від низької до високої</option>
              <option value="priceDesc">Ціна: від високої до низької</option>
              <option value="duration">Тривалість</option>
              <option value="name">Назва</option>
            </select>
          </div>
        </div>
        
        <div className="course-catalog-container">
          <div className={`courses-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h4>Фільтри</h4>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetFilters}
              >
                Скинути фільтри
              </button>
            </div>
            
            <div className="filter-section">
              <h5>Статус курсу</h5>
              <div className="status-filters">
                <div className="form-check">
                  <input
                    type="radio"
                    id="status-all"
                    name="status"
                    className="form-check-input"
                    checked={statusFilter === ''}
                    onChange={() => setStatusFilter('')}
                  />
                  <label className="form-check-label" htmlFor="status-all">Усі</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    id="status-free"
                    name="status"
                    className="form-check-input"
                    checked={statusFilter === 'free'}
                    onChange={() => setStatusFilter('free')}
                  />
                  <label className="form-check-label" htmlFor="status-free">Безкоштовні</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    id="status-premium"
                    name="status"
                    className="form-check-input"
                    checked={statusFilter === 'premium'}
                    onChange={() => setStatusFilter('premium')}
                  />
                  <label className="form-check-label" htmlFor="status-premium">Преміум</label>
                </div>
              </div>
            </div>
            
            <div className="filter-section">
              <h5>Діапазон цін</h5>
              <div className="range-inputs">
                <input
                  type="number"
                  id="price-from"
                  name="price-from"
                  className="form-control"
                  value={priceRange[0]}
                  onChange={handlePriceRangeChange}
                  min="0"
                  max={priceRange[1]}
                />
                <span className="range-separator">до</span>
                <input
                  type="number"
                  id="price-to"
                  name="price-to"
                  className="form-control"
                  value={priceRange[1]}
                  onChange={handlePriceRangeChange}
                  min={priceRange[0]}
                  max="5000"
                />
              </div>
              <div ref={priceSliderRef} className="noUiSlider"></div>
              <div className="range-values">
                <span>Від: {priceRange[0]} грн</span>
                <span>До: {priceRange[1]} грн</span>
              </div>
            </div>
            
            <div className="filter-section">
              <h5>Тривалість курсу (тижні)</h5>
              <div className="range-inputs">
                <input
                  type="number"
                  id="duration-from"
                  name="duration-from"
                  className="form-control"
                  value={durationRange[0]}
                  onChange={handleDurationRangeChange}
                  min="1"
                  max={durationRange[1]}
                />
                <span className="range-separator">до</span>
                <input
                  type="number"
                  id="duration-to"
                  name="duration-to"
                  className="form-control"
                  value={durationRange[1]}
                  onChange={handleDurationRangeChange}
                  min={durationRange[0]}
                  max="20"
                />
              </div>
              <div ref={durationSliderRef} className="noUiSlider"></div>
              <div className="range-values">
                <span>Від: {durationRange[0]} тижнів</span>
                <span>До: {durationRange[1]} тижнів</span>
              </div>
            </div>
            
            {categories.length > 0 && (
              <div className="filter-section">
                <h5>Категорії</h5>
                <div className="categories-list">
                  {categories.map(category => (
                    <div className="form-check" key={category.id}>
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        className="form-check-input"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`category-${category.id}`}
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="filter-section">
              <h5>Рейтинг</h5>
              <div className="range-inputs">
                <input
                  type="number"
                  id="rating-from"
                  name="rating-from"
                  className="form-control"
                  value={ratingRange[0]}
                  onChange={handleRatingRangeChange}
                  min="0"
                  max={ratingRange[1]}
                  step="0.5"
                />
                <span className="range-separator">до</span>
                <input
                  type="number"
                  id="rating-to"
                  name="rating-to"
                  className="form-control"
                  value={ratingRange[1]}
                  onChange={handleRatingRangeChange}
                  min={ratingRange[0]}
                  max="5"
                  step="0.5"
                />
              </div>
              <div ref={ratingSliderRef} className="noUiSlider"></div>
              <div className="range-values">
                <span>Від: {ratingRange[0]}</span>
                <span>До: {ratingRange[1]}</span>
              </div>
            </div>
          </div>
          
          <div className="courses-content">
            {isLoading ? (
              <div className="courses-loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Завантаження...</span>
                </div>
                <span>Завантаження курсів...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="no-courses-found">
                <h3>Курсів не знайдено</h3>
                <p>Спробуйте змінити параметри пошуку або фільтри</p>
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Скинути всі фільтри
                </button>
              </div>
            ) : (
              <div className="courses-grid">
                {filteredCourses.map(course => (
                  <div 
                    className="course-card" 
                    key={course.id}
                    onMouseEnter={() => setHoveredCourse(course.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    <div className="course-image-container">
                      <img 
                        src={course.image_url || 'https://via.placeholder.com/300x200?text=Курс'} 
                        alt={course.title} 
                        className="course-image" 
                      />
                      <div className={`course-status ${course.status}`}>
                        {course.status === 'free' ? 'Безкоштовно' : 'Преміум'}
                      </div>
                      
                      {hoveredCourse === course.id && (
                        <div className="course-hover-actions">
                          <Link to={`/courses/${course.id}`} className="btn btn-primary">
                            Переглянути деталі
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div className="course-content">
                      <div className="course-categories">
                        {course.categories && course.categories.slice(0, 2).map(category => (
                          <span className="course-category" key={category.id}>
                            <FaTag /> {category.name}
                          </span>
                        ))}
                        {course.categories && course.categories.length > 2 && (
                          <span className="course-category more">+{course.categories.length - 2}</span>
                        )}
                      </div>
                      
                      <h3 className="course-title">
                        <Link to={`/courses/${course.id}`}>{course.title}</Link>
                      </h3>
                      
                      <div className="course-rating">
                        {renderRatingStars(course.rating || 4.5)}
                        <span className="rating-value">{course.rating || 4.5}</span>
                      </div>
                      
                      <p className="course-description">{course.description.substring(0, 100)}...</p>
                      
                      <div className="course-meta">
                        <div className="meta-item">
                          <FaClock /> {course.duration} тижнів
                        </div>
                        <div className="meta-item">
                          <FaUsers /> {course.students_count || 0} студентів
                        </div>
                      </div>
                      
                      <div className="course-teacher">
                        <FaChalkboardTeacher /> {course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Невідомий викладач'}
                      </div>
                      
                      <div className="course-footer">
                        <div className="course-price">
                          {formatPrice(course.price, course.status)}
                        </div>
                        <div className="course-lessons">
                          {course.total_lessons || 0} уроків
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCatalogPage;