import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_URL from '../api';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/courses/${id}/`)
      .then(response => {
        setCourse(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the course details!', error);
      });
  }, [id]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p><strong>Duration:</strong> {course.duration} тижнів</p>
      <p><strong>Status:</strong> {course.status}</p>
      <p><strong>Price:</strong> {course.price ? `${course.price} UAH` : 'Free'}</p>
    </div>
  );
}

export default CourseDetail;
