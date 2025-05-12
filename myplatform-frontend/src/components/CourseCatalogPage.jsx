import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import RangeSlider from './RangeSlider';
import { FaSearch, FaFilter, FaSort, FaStar, FaUsers, FaClock, FaCalendarAlt, FaTag, FaChalkboardTeacher } from 'react-icons/fa';
import 'nouislider/dist/nouislider.css';
import '../css/courseCatalog.css';

function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [durationRange, setDurationRange] = useState([1, 50]);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [error, setError] = useState(null);

  const priceSliderRef = useRef(null);
  const durationSliderRef = useRef(null);

  const [hoveredCourse, setHoveredCourse] = useState(null);

  const getCSRFToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get CSRF token first
        await getCSRFToken();

        // Fetch courses and categories in parallel
        const [coursesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${API_URL}/courses/`, { withCredentials: true }),
          axios.get(`${API_URL}/categories/`, { withCredentials: true })
        ]);

        setCourses(coursesResponse.data);
        setFilteredCourses(coursesResponse.data);
        setCategories(categoriesResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [
    statusFilter, 
    priceRange, 
    durationRange, 
    sortOption, 
    searchQuery, 
    selectedCategories, 
    selectedRating, 
    courses
  ]);

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

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => {
        if (!course.categories) return false;
        return course.categories.some(category => 
          selectedCategories.includes(category.id)
        );
      });
    }

    if (selectedRating > 0) {
      filtered = filtered.filter(course => 
        (course.rating || 4.5) >= selectedRating
      );
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

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const handleDurationRangeChange = (values) => {
    setDurationRange(values);
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

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? 0 : rating);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setPriceRange([0, 5000]);
    setDurationRange([1, 50]);
    setSortOption('newest');
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedRating(0);
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
    if (status === 'free') return 'Free';
    return `${price} UAH`;
  };

  return (
    <div className="course-catalog-page">
      <Header />
      
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">            <h1 className="hero-title">Знайдіть ідеальний курс для навчання</h1>
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
              >                <FaFilter /> {showFilters ? 'Сховати фільтри' : 'Показати фільтри'}
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
          {/* Sidebar with filters */}
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
                  <label className="form-check-label" htmlFor="status-all">Всі</label>
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
              <RangeSlider
                min={0}
                max={5000}
                initialValues={priceRange}
                onChange={handlePriceRangeChange}
                formatPrefix=""
                formatSuffix=" грн"
                label="Діапазон цін"
              />
            </div>
            
            <div className="filter-section">
              <RangeSlider
                min={1}
                max={50}
                initialValues={durationRange}
                onChange={handleDurationRangeChange}
                formatPrefix=""
                formatSuffix=" тижнів"
                label="Тривалість курсу"
              />
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
            
            <div className="filter-section">              <h5>Рейтинг</h5>
              <div className="rating-filters">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div 
                    key={rating} 
                    className={`rating-option ${selectedRating === rating ? 'selected' : ''}`}
                    onClick={() => handleRatingChange(rating)}
                  >
                    {renderRatingStars(rating)}
                    <span>{rating} і вище</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="courses-content">
            {isLoading ? (
              <div className="courses-loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>                <span>Завантаження курсів...</span>
              </div>
            ) : filteredCourses.length === 0 ? (<div className="no-courses-found">
                <h3>Курси не знайдено</h3>
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
                        <div className="course-hover-actions">                          <Link to={`/courses/${course.id}`} className="btn btn-primary">
                            Детальніше
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
                      
                      <p className="course-description">{course.description.substring(0, 50)}...</p>
                      
                      <div className="course-meta">
                        <div className="meta-item">
                          <FaClock /> {course.duration} тижнів
                        </div>
                        <div className="meta-item">
                          <FaUsers /> {course.students_count || 0} студентів
                        </div>
                      </div>
                      
                      <div className="course-teacher">
                        <FaChalkboardTeacher /> {course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Викладач не вказаний'}
                      </div>
                      
                      <div className="course-footer">
                        <div className="course-price">
                          {formatPrice(course.price, course.status)}
                        </div>                        <div className="course-lessons">
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

      <Footer />
    </div>
  );
}

export default CourseCatalogPage;