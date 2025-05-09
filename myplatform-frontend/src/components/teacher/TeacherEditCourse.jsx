import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../css/teacher/TeacherCreateCourse.css';

import { 
  FaGraduationCap, 
  FaBook, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaClipboardList,
  FaInfo, 
  FaImage, 
  FaVideo,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa';

function TeacherEditCourse() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'free',
    price: '',
    start_date: '',
    end_date: '',
    duration: '',
    batch_number: 1,
    category_ids: []
  });
  const [errors, setErrors] = useState({});
  const [courseImage, setCourseImage] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [introVideoPreview, setIntroVideoPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchCourseAndCategories = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        // Fetch course data
        const courseResponse = await axios.get(`${API_URL}/courses/${courseId}/`, {
          withCredentials: true
        });
        
        if (courseResponse.data) {
          const course = courseResponse.data;
          setFormData({
            title: course.title,
            description: course.description,
            status: course.status,
            price: course.price || '',
            start_date: course.start_date,
            end_date: course.end_date,
            duration: course.duration,
            batch_number: course.batch_number,
            category_ids: course.categories.map(cat => cat.id)
          });

          if (course.image_url) {
            setCourseImagePreview(course.image_url);
          }

          if (course.intro_video_url) {
            setIntroVideoPreview(course.intro_video_url);
          }
        }

        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}/categories/`, {
          withCredentials: true
        });
        
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setLoading(false);
      }
    };

    fetchCourseAndCategories();
  }, [courseId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'start_date' || name === 'duration') {
      if (!value) return;
      
      const startDate = name === 'start_date' ? new Date(value) : new Date(formData.start_date);
      const duration = name === 'duration' ? parseInt(value) : parseInt(formData.duration);
      
      if (!startDate || isNaN(duration)) return;
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration * 7);
      
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        end_date: formattedEndDate
      }));
    }
    
    // Clear errors when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    setFormData(prev => {
      let newCategoryIds = [...prev.category_ids];
      
      if (isChecked) {
        if (!newCategoryIds.includes(categoryId)) {
          newCategoryIds.push(categoryId);
        }
      } else {
        newCategoryIds = newCategoryIds.filter(id => id !== categoryId);
      }
      
      return {
        ...prev,
        category_ids: newCategoryIds
      };
    });
    
    if (errors.category_ids) {
      setErrors(prev => ({
        ...prev,
        category_ids: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setCourseImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setIntroVideo(file);
      const videoURL = URL.createObjectURL(file);
      setIntroVideoPreview(videoURL);
      
      if (errors.video) {
        setErrors(prev => ({
          ...prev,
          video: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setCourseImage(null);
    setCourseImagePreview(null);
  };

  const removeVideo = () => {
    setIntroVideo(null);
    if (introVideoPreview) {
      URL.revokeObjectURL(introVideoPreview);
    }
    setIntroVideoPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Назва курсу обов\'язкова';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Опис курсу обов\'язковий';
    }
    
    if (formData.status === 'premium' && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Ціна обов\'язкова для преміум курсу';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Дата початку обов\'язкова';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Тривалість курсу обов\'язкова';
    }
    
    if (formData.category_ids.length === 0) {
      newErrors.category_ids = 'Виберіть хоча б одну категорію';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Update course
      const courseResponse = await axios.put(`${API_URL}/courses/${courseId}/`, formData, {
        withCredentials: true
      });
      
      if (courseImage) {
        const formData = new FormData();
        formData.append('image', courseImage);
        
        await axios.post(`${API_URL}/courses/${courseId}/update-image/`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      if (introVideo) {
        const formData = new FormData();
        formData.append('intro_video', introVideo);
        
        await axios.post(`${API_URL}/courses/${courseId}/update-intro-video/`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/teacher/courses/${courseId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating course:", error);
      setErrors(prev => ({
        ...prev,
        submit: 'Не вдалося оновити курс. Будь ласка, спробуйте пізніше.'
      }));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-create-course-wrapper">
        <TeacherHeader />
        <div className="teacher-create-course-container">
          <TeacherSidebar />
          <div className="teacher-create-course-content">
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Завантаження даних курсу...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="teacher-create-course-wrapper">
        <TeacherHeader />
        <div className="teacher-create-course-container">
          <TeacherSidebar />
          <div className="teacher-create-course-content">
            <div className="success-message">
              <div className="success-icon">
                <FaCheck />
              </div>
              <h2>Курс успішно оновлено!</h2>
              <p>Ви будете перенаправлені на сторінку курсу через кілька секунд...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-create-course-wrapper">
      <TeacherHeader />
      <div className="teacher-create-course-container">
        <TeacherSidebar />
        <div className="teacher-create-course-content">
          <div className="create-course-header">
            <button className="btn-back" onClick={() => navigate(`/teacher/courses/${courseId}`)}>
              <FaArrowLeft /> Назад до курсу
            </button>
            <h1>Редагування курсу</h1>
          </div>
          
          <div className="create-course-form-container">
            <form onSubmit={handleSubmit} className="create-course-form">
              <div className="form-group">
                <label htmlFor="title">
                  <FaGraduationCap className="form-icon" />
                  Назва курсу <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Введіть назву курсу"
                  required
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">
                  <FaInfo className="form-icon" />
                  Опис курсу <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Введіть детальний опис курсу"
                  rows="5"
                  required
                ></textarea>
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="status">
                    <FaMoneyBillWave className="form-icon" />
                    Тип курсу <span className="required">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="free">Безкоштовний</option>
                    <option value="premium">Преміум</option>
                  </select>
                </div>
                
                <div className="form-group form-group-half">
                  <label htmlFor="price">
                    <FaMoneyBillWave className="form-icon" />
                    Ціна {formData.status === 'premium' && <span className="required">*</span>}
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    placeholder="Введіть ціну курсу"
                    disabled={formData.status === 'free'}
                    min="0"
                    step="0.01"
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="start_date">
                    <FaCalendarAlt className="form-icon" />
                    Дата початку <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                    required
                  />
                  {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                </div>
                
                <div className="form-group form-group-half">
                  <label htmlFor="duration">
                    <FaCalendarAlt className="form-icon" />
                    Тривалість (тижнів) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
                    placeholder="Введіть тривалість курсу в тижнях"
                    min="1"
                    required
                  />
                  {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="end_date">
                  <FaCalendarAlt className="form-icon" />
                  Дата закінчення
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="form-control"
                  readOnly
                />
                <small className="form-text text-muted">Розраховується автоматично на основі дати початку і тривалості</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="batch_number">
                  <FaClipboardList className="form-icon" />
                  Номер потоку
                </label>
                <input
                  type="number"
                  id="batch_number"
                  name="batch_number"
                  value={formData.batch_number}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Введіть номер потоку курсу"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <FaBook className="form-icon" />
                  Категорії <span className="required">*</span>
                </label>
                <div className={`categories-container ${errors.category_ids ? 'is-invalid' : ''}`}>
                  {categories.map(category => (
                    <div className="category-checkbox" key={category.id}>
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        value={category.id}
                        checked={formData.category_ids.includes(category.id)}
                        onChange={handleCategoryChange}
                      />
                      <label htmlFor={`category-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
                {errors.category_ids && <div className="invalid-feedback">{errors.category_ids}</div>}
              </div>
              
              <div className="form-group">
                <label>
                  <FaImage className="form-icon" />
                  Зображення курсу
                </label>
                <div className="media-upload-container">
                  {courseImagePreview ? (
                    <div className="media-preview">
                      <img 
                        src={courseImagePreview} 
                        alt="Preview" 
                        className="image-preview" 
                      />
                      <button 
                        type="button" 
                        className="remove-media-btn" 
                        onClick={removeImage}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FaImage className="upload-icon" />
                      <span>Завантажте зображення</span>
                      <input
                        type="file"
                        id="courseImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`file-input ${errors.image ? 'is-invalid' : ''}`}
                      />
                    </div>
                  )}
                </div>
                {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                <small className="form-text text-muted">Рекомендований розмір зображення: 1280x720 пікселів</small>
              </div>
              
              <div className="form-group">
                <label>
                  <FaVideo className="form-icon" />
                  Вступне відео
                </label>
                <div className="media-upload-container">
                  {introVideoPreview ? (
                    <div className="media-preview">
                      <video 
                        src={introVideoPreview} 
                        controls 
                        className="video-preview" 
                      ></video>
                      <button 
                        type="button" 
                        className="remove-media-btn" 
                        onClick={removeVideo}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FaVideo className="upload-icon" />
                      <span>Завантажте відео</span>
                      <input
                        type="file"
                        id="courseVideo"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className={`file-input ${errors.video ? 'is-invalid' : ''}`}
                      />
                    </div>
                  )}
                </div>
                {errors.video && <div className="invalid-feedback">{errors.video}</div>}
                <small className="form-text text-muted">
                  Максимальний розмір файлу: 500MB. Підтримувані формати: MP4, WebM
                </small>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => navigate(`/teacher/courses/${courseId}`)}
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </div>
              
              {errors.submit && (
                <div className="submit-error">
                  <FaExclamationTriangle /> {errors.submit}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherEditCourse;