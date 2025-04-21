import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../api';
import Header from './Header';
import '../css/CourseDetail.css';
import { FaStar, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaChalkboardTeacher, FaTag } from 'react-icons/fa';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const navigate = useNavigate();
  
  // Create a ref for the payment form section
  const paymentFormRef = useRef(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/courses/${id}/`);
        setCourse(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('There was an error fetching the course details!', error);
        setError('Failed to load course details. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Function to render rating stars
  const renderRatingStars = (rating) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating || 4.5);
    const emptyStars = totalStars - fullStars;
    
    return (
      <div className="course-rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star star-filled" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="star star-empty" />
        ))}
        <span className="rating-value">{rating || 4.5}</span>
      </div>
    );
  };

  // Handle enrollment for free courses
  const handleEnrollFree = async () => {
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      
      const response = await axios.post(
        `${API_URL}/enrollments/enroll/`, 
        {
          course_id: parseInt(id),
          student_id: parseInt(userId)
        },
        {
          withCredentials: true
        }
      );
      
      setEnrollmentSuccess(true);
      setEnrollmentLoading(false);
      
      // Redirect to dashboard after successful enrollment
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setEnrollmentLoading(false);
      console.error('Error enrolling in course:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setEnrollmentError(error.response.data.error);
      } else {
        setEnrollmentError('Failed to enroll in the course. Please try again later.');
      }
    }
  };

  // Handle premium course signup - show payment form
  const handlePremiumSignup = () => {
    setShowPaymentForm(true);
    // Scroll to payment form
    if (paymentFormRef.current) {
      paymentFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle payment form submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Payment processing logic would go here...
    // For now, just redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="course-detail-container">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p>Loading course details...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : !course ? (
          <div className="alert alert-warning" role="alert">
            Course not found
          </div>
        ) : (
          <>
            {enrollmentSuccess && (
              <div className="alert alert-success" role="alert">
                Successfully enrolled in the course! Redirecting to your dashboard...
              </div>
            )}
            
            {enrollmentError && (
              <div className="alert alert-danger" role="alert">
                {enrollmentError}
              </div>
            )}
            
            <div className="course-detail-hero" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${course.image_url})`}}>
              <div className="container">
                <div className="course-detail-hero-content">
                  <div className={`course-badge ${course.status}`}>
                    {course.status === 'free' ? 'Free' : 'Premium'}
                  </div>
                  <h1>{course.title}</h1>
                  <p className="course-short-description">{course.description.slice(0, 150)}...</p>
                  
                  <div className="course-meta-info">
                    <div className="course-meta-item">
                      {renderRatingStars(course.rating || 4.5)}
                    </div>
                    <div className="course-meta-item">
                      <FaUsers /> <span>{course.students_count || 0} students enrolled</span>
                    </div>
                    <div className="course-meta-item">
                      <FaCalendarAlt /> <span>Last updated {new Date(course.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="course-author">
                    <div className="author-image">
                      <img src={course.teacher?.profile_image_url || 'https://via.placeholder.com/40'} alt={course.teacher?.full_name} />
                    </div>
                    <div className="author-info">
                      <span>Created by</span>
                      <h4>{course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Unknown Teacher'}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container course-detail-body">
              <div className="row">
                <div className="col-lg-8">
                  <div className="course-tabs">
                    <div className="course-tabs-header">
                      <button 
                        className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                      >
                        Description
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'curriculum' ? 'active' : ''}`}
                        onClick={() => setActiveTab('curriculum')}
                      >
                        Curriculum
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'instructor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('instructor')}
                      >
                        Instructor
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                      >
                        Reviews
                      </button>
                    </div>
                    
                    <div className="course-tabs-content">
                      {activeTab === 'description' && (
                        <div className="tab-pane description-pane">
                          <h3>About This Course</h3>
                          <p>{course.description}</p>
                          
                          <div className="course-categories-section">
                            <h4>Categories</h4>
                            <div className="course-categories">
                              {course.categories && course.categories.map(category => (
                                <span className="course-category" key={category.id}>
                                  <FaTag /> {category.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="what-you-learn">
                            <h4>What You'll Learn</h4>
                            <ul className="learn-list">
                              <li><FaCheckCircle /> Understand the fundamental concepts of the subject</li>
                              <li><FaCheckCircle /> Apply theoretical knowledge to real-world problems</li>
                              <li><FaCheckCircle /> Develop practical skills through hands-on exercises</li>
                              <li><FaCheckCircle /> Build your own projects from scratch</li>
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'curriculum' && (
                        <div className="tab-pane curriculum-pane">
                          <h3>Course Curriculum</h3>
                          <p>This course contains {course.total_lessons || 0} lessons organized into several modules. The curriculum is designed to take you from beginner to advanced level.</p>
                          
                          <div className="curriculum-modules">
                            <div className="curriculum-module">
                              <div className="module-header">
                                <h4>Module 1: Introduction</h4>
                                <span className="module-duration">2 weeks</span>
                              </div>
                              <ul className="module-lessons">
                                <li className="lesson-item">
                                  <span className="lesson-title">Lesson 1: Getting Started</span>
                                  <span className="lesson-duration"><FaClock /> 45 min</span>
                                </li>
                                <li className="lesson-item">
                                  <span className="lesson-title">Lesson 2: Basic Concepts</span>
                                  <span className="lesson-duration"><FaClock /> 60 min</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div className="curriculum-module">
                              <div className="module-header">
                                <h4>Module 2: Intermediate Level</h4>
                                <span className="module-duration">3 weeks</span>
                              </div>
                              <ul className="module-lessons">
                                <li className="lesson-item">
                                  <span className="lesson-title">Lesson 3: Advanced Concepts</span>
                                  <span className="lesson-duration"><FaClock /> 75 min</span>
                                </li>
                                <li className="lesson-item">
                                  <span className="lesson-title">Lesson 4: Practical Applications</span>
                                  <span className="lesson-duration"><FaClock /> 90 min</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'instructor' && (
                        <div className="tab-pane instructor-pane">
                          <h3>About the Instructor</h3>
                          
                          <div className="instructor-profile">
                            <div className="instructor-image">
                              <img 
                                src={course.teacher?.profile_image_url || 'https://via.placeholder.com/150'} 
                                alt={course.teacher?.full_name || 'Instructor'} 
                              />
                            </div>
                            <div className="instructor-info">
                              <h4>{course.teacher ? course.teacher.full_name || `${course.teacher.first_name} ${course.teacher.last_name}` : 'Unknown Teacher'}</h4>
                              <p className="instructor-title">Course Instructor</p>
                              <div className="instructor-stats">
                                <div className="stat-item">
                                  <span className="stat-value">4.8</span>
                                  <span className="stat-label">Instructor Rating</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-value">24,357</span>
                                  <span className="stat-label">Students</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-value">12</span>
                                  <span className="stat-label">Courses</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="instructor-bio">
                            <p>
                              Our instructor has extensive experience in the field and has been teaching for over 5 years. 
                              They are passionate about helping students achieve their goals and have a track record of 
                              successful alumni who have gone on to work in top companies.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'reviews' && (
                        <div className="tab-pane reviews-pane">
                          <h3>Student Reviews</h3>
                          
                          <div className="reviews-summary">
                            <div className="overall-rating">
                              <div className="big-rating">{course.rating || 4.5}</div>
                              <div className="big-stars">{renderRatingStars(course.rating || 4.5)}</div>
                              <div className="rating-count">Course Rating • {course.students_count || 0} students</div>
                            </div>
                            
                            <div className="rating-breakdown">
                              <div className="rating-bar">
                                <span className="rating-label">5 stars</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '80%'}}></div>
                                </div>
                                <span className="rating-percent">80%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">4 stars</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '15%'}}></div>
                                </div>
                                <span className="rating-percent">15%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">3 stars</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '3%'}}></div>
                                </div>
                                <span className="rating-percent">3%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">2 stars</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '1%'}}></div>
                                </div>
                                <span className="rating-percent">1%</span>
                              </div>
                              <div className="rating-bar">
                                <span className="rating-label">1 star</span>
                                <div className="progress">
                                  <div className="progress-bar" style={{width: '1%'}}></div>
                                </div>
                                <span className="rating-percent">1%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="review-list">
                            <div className="review-item">
                              <div className="reviewer-avatar">
                                <img src="https://via.placeholder.com/50" alt="Student" />
                              </div>
                              <div className="review-content">
                                <div className="reviewer-name">John Doe</div>
                                <div className="review-date">3 months ago</div>
                                <div className="review-rating">{renderRatingStars(5)}</div>
                                <p className="review-text">
                                  This course exceeded my expectations. The instructor explains complex topics in a simple manner, 
                                  and the practical exercises helped me apply what I learned immediately.
                                </p>
                              </div>
                            </div>
                            
                            <div className="review-item">
                              <div className="reviewer-avatar">
                                <img src="https://via.placeholder.com/50" alt="Student" />
                              </div>
                              <div className="review-content">
                                <div className="reviewer-name">Jane Smith</div>
                                <div className="review-date">1 month ago</div>
                                <div className="review-rating">{renderRatingStars(4)}</div>
                                <p className="review-text">
                                  Great course with lots of practical information. I would have given 5 stars if there 
                                  were more examples, but overall I'm very satisfied with what I learned.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4">
                  <div className="course-sidebar">
                    {course.intro_video_url ? (
                      <div className="course-video">
                        <iframe 
                          src={course.intro_video_url} 
                          title="Course Introduction" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="course-image">
                        <img src={course.image_url} alt={course.title} />
                      </div>
                    )}
                    
                    <div className="course-sidebar-content">
                      <div className="course-price">
                        {course.status === 'free' ? (
                          <span className="price free">Free</span>
                        ) : (
                          <span className="price premium">{course.price} UAH</span>
                        )}
                      </div>
                      
                      <div className="course-includes">
                        <h4>This course includes:</h4>
                        <ul>
                          <li><FaClock /> <span>{course.duration} weeks of access</span></li>
                          <li><FaChalkboardTeacher /> <span>{course.total_lessons || 10} lessons</span></li>
                          <li><FaUsers /> <span>Access to community</span></li>
                          <li><FaCheckCircle /> <span>Certificate of completion</span></li>
                        </ul>
                      </div>
                      
                      {enrollmentLoading ? (
                        <button className="btn-enroll" disabled>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Enrolling...
                        </button>
                      ) : course.status === 'free' ? (
                        <button className="btn-enroll" onClick={handleEnrollFree}>
                          Enroll Now - Free
                        </button>
                      ) : (
                        <button className="btn-enroll" onClick={handlePremiumSignup}>
                          Buy Now
                        </button>
                      )}
                      
                      <p className="money-back">30-Day Money-Back Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {showPaymentForm && (
              <div className="payment-section" ref={paymentFormRef}>
                <div className="container">
                  <div className="course__payment-details">
                    <h3 className="course__payment-title">Payment Details</h3>
                    <form onSubmit={handlePaymentSubmit} className="course__payment-form">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          className="form-control"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="expiryDate">Expiry Date</label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              className="form-control"
                              placeholder="MM/YY"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              className="form-control"
                              placeholder="123"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="course__submit-btn btn btn-primary">
                        Complete Payment - {course.price} UAH
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;