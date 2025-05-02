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

  // Refs for sliders
  const priceSliderRef = useRef(null);
  const durationSliderRef = useRef(null);

  // Additional state for UI
  const [hoveredCourse, setHoveredCourse] = useState(null);

  useEffect(() => {
    // Loading courses
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/courses/`);
        setCourses(response.data);
        setFilteredCourses(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('There was an error fetching the courses!', error);
        setError('Error loading courses. Please try again later.');
        setIsLoading(false);
      }
    };

    // Loading categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories/`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCourses();
    fetchCategories();
  }, []);

  // Filter and sort courses when parameters change
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

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Filter by price
    filtered = filtered.filter(course => {
      const price = course.status === 'premium' ? parseFloat(course.price) : 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by duration
    filtered = filtered.filter(course => 
      course.duration >= durationRange[0] && course.duration <= durationRange[1]
    );

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => {
        if (!course.categories) return false;
        return course.categories.some(category => 
          selectedCategories.includes(category.id)
        );
      });
    }

    // Filter by rating (placeholder since we don't have this in the API yet)
    if (selectedRating > 0) {
      filtered = filtered.filter(course => 
        (course.rating || 4.5) >= selectedRating
      );
    }

    // Sorting
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

  // Function to render rating stars
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

  // Function to display formatted price
  const formatPrice = (price, status) => {
    if (status === 'free') return 'Free';
    return `${price} UAH`;
  };

  return (
    <div className="course-catalog-page">
      <Header />
      
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Find the Perfect Course to Learn</h1>
            <p className="hero-subtitle">Develop your skills with our professional online courses</p>
            
            <div className="search-bar">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search courses by title or description..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <button 
                className="filter-toggle-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
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
            <h4>Found courses: {filteredCourses.length}</h4>
          </div>
          
          <div className="sort-options">
            <label htmlFor="sort" className="sort-label">
              <FaSort /> Sort by:
            </label>
            <select
              id="sort"
              className="form-control sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="duration">Duration</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
        
        <div className="course-catalog-container">
          {/* Sidebar with filters */}
          <div className={`courses-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h4>Filters</h4>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
            
            <div className="filter-section">
              <h5>Course Status</h5>
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
                  <label className="form-check-label" htmlFor="status-all">All</label>
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
                  <label className="form-check-label" htmlFor="status-free">Free</label>
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
                  <label className="form-check-label" htmlFor="status-premium">Premium</label>
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
                formatSuffix=" UAH"
                label="Price Range"
              />
            </div>
            
            <div className="filter-section">
              <RangeSlider
                min={1}
                max={50}
                initialValues={durationRange}
                onChange={handleDurationRangeChange}
                formatPrefix=""
                formatSuffix=" weeks"
                label="Course Duration"
              />
            </div>
            
            {categories.length > 0 && (
              <div className="filter-section">
                <h5>Categories</h5>
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
              <h5>Rating</h5>
              <div className="rating-filters">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div 
                    key={rating} 
                    className={`rating-option ${selectedRating === rating ? 'selected' : ''}`}
                    onClick={() => handleRatingChange(rating)}
                  >
                    {renderRatingStars(rating)}
                    <span>{rating} & above</span>
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
                </div>
                <span>Loading courses...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="no-courses-found">
                <h3>No courses found</h3>
                <p>Try changing your search parameters or filters</p>
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Reset all filters
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
                        src={course.image_url || 'https://via.placeholder.com/300x200?text=Course'} 
                        alt={course.title} 
                        className="course-image" 
                      />
                      <div className={`course-status ${course.status}`}>
                        {course.status === 'free' ? 'Free' : 'Premium'}
                      </div>
                      
                      {hoveredCourse === course.id && (
                        <div className="course-hover-actions">
                          <Link to={`/courses/${course.id}`} className="btn btn-primary">
                            View Details
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
                          <FaClock /> {course.duration} weeks
                        </div>
                        <div className="meta-item">
                          <FaUsers /> {course.students_count || 0} students
                        </div>
                      </div>
                      
                      <div className="course-teacher">
                        <FaChalkboardTeacher /> {course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Unknown Teacher'}
                      </div>
                      
                      <div className="course-footer">
                        <div className="course-price">
                          {formatPrice(course.price, course.status)}
                        </div>
                        <div className="course-lessons">
                          {course.total_lessons || 0} lessons
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