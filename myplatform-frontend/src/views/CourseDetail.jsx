import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_URL from '../api';
import Header from './Header';
import '../css/style.css';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const paymentFormRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/courses/${id}/`)
      .then(response => {
        setCourse(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the course details!', error);
      });
  }, [id]);

  const handleSignUp = () => {
    if (course.status === 'free') {
      console.log('Course added to user library');
    } else {
      setShowForm(true);
      if (paymentFormRef.current) {
        paymentFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted with data:', formData);
    // Example: send data to the server
    // axios.post(`${API_URL}/courses/${id}/enroll/`, formData)
    //   .then(response => {
    //     console.log('Enrollment successful:', response.data);
    //     navigate('/confirmation'); // Redirect to a confirmation page
    //   })
    //   .catch(error => {
    //     console.error('Error enrolling in the course:', error);
    //   });
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="course container mt-5">
      <h1 className="course__title">{course.title}</h1>
        <div className="course__info">
          <div className="course__info-basic">
  
            <p className="course__description">{course.description}</p>
            {course.image_url && (
              <img src={course.image_url} alt={course.title} className="course__image img-fluid mb-4" />
            )}
          </div>
          <div className="course__info-detailed">
            <p><strong>Duration:</strong> {course.duration} weeks</p>
            <p><strong>Status:</strong> {course.status}</p>
            <p><strong>Price:</strong> {course.price ? `${course.price} UAH` : 'Free'}</p>
            <button className="course__signup-btn btn btn-primary" onClick={handleSignUp}>
              {course.status === 'free' ? 'Add to Library' : 'Sign Up'}
            </button>
          </div>
        </div>
        {course.status === 'premium' && (
          <div className="course__payment-details mt-5" ref={paymentFormRef}>
            <h3 className="course__payment-title">Payment Details</h3>
            <form onSubmit={handleSubmit} className="course__payment-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  value={formData.lastName}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="course__submit-btn btn btn-primary">Submit Payment</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;
