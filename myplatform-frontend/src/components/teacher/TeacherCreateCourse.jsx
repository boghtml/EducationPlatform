import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../../css/TeacherCreateCourse.css';
import { 
  FaGraduationCap, 
  FaBook, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaInfo, 
  FaImage, 
  FaVideo,
  FaPlus,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';

function TeacherCreateCourse() {
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Отримуємо CSRF токен
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        // Отримуємо категорії для курсів
        const categoriesResponse = await axios.get(`${API_URL}/categories/`, {
          withCredentials: true
        });
        
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();

    // Встановлюємо поточну дату для поля start_date за замовчуванням
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      start_date: formattedDate
    }));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Якщо змінилось поле status і нове значення "free", то очищаємо поле price
    if (name === 'status' && value === 'free') {
      setFormData(prev => ({
        ...prev,
        price: ''
      }));
    }
    
    // Якщо змінилось поле duration, оновлюємо end_date
    if (name === 'duration' && value && formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(value) * 7); // Тривалість в тижнях
      
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        end_date: formattedEndDate
      }));
    }
    
    // Якщо змінилось поле start_date, оновлюємо end_date, якщо є duration
    if (name === 'start_date' && value && formData.duration) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(formData.duration) * 7); // Тривалість в тижнях
      
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        end_date: formattedEndDate
      }));
    }
    
    // Очищаємо помилку при зміні поля
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
        // Додаємо категорію
        if (!newCategoryIds.includes(categoryId)) {
          newCategoryIds.push(categoryId);
        }
      } else {
        // Видаляємо категорію
        newCategoryIds = newCategoryIds.filter(id => id !== categoryId);
      }
      
      return {
        ...prev,
        category_ids: newCategoryIds
      };
    });
    
    // Очищаємо помилку при зміні категорій
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
      
      // Створюємо превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Очищаємо помилку при зміні зображення
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
      
      // Створюємо превью (для відео використовуємо URL.createObjectURL)
      const videoURL = URL.createObjectURL(file);
      setIntroVideoPreview(videoURL);
      
      // Очищаємо помилку при зміні відео
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
    setIntroVideoPreview(null);
    
    // Якщо є тимчасове URL для превью, ревокаємо його
    if (introVideoPreview) {
      URL.revokeObjectURL(introVideoPreview);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Валідація першого кроку
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Отримуємо CSRF токен
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Створюємо курс
      const courseResponse = await axios.post(`${API_URL}/courses/`, formData, {
        withCredentials: true
      });
      
      if (courseResponse.data && courseResponse.data.course && courseResponse.data.course.id) {
        const courseId = courseResponse.data.course.id;
        setCreatedCourseId(courseId);
        
        // Завантажуємо зображення, якщо воно є
        if (courseImage) {
          const formDataImage = new FormData();
          formDataImage.append('image', courseImage);
          
          await axios.post(`${API_URL}/courses/${courseId}/upload-image/`, formDataImage, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          });
        }
        
        // Завантажуємо відео, якщо воно є
        if (introVideo) {
          const formDataVideo = new FormData();
          formDataVideo.append('intro_video', introVideo);
          
          await axios.post(`${API_URL}/courses/${courseId}/upload-intro-video/`, formDataVideo, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          });
        }
        
        setSuccess(true);
        
        // Перенаправляємо на сторінку курсу через 2 секунди
        setTimeout(() => {
          navigate(`/teacher/courses/${courseId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      
      // Обробляємо помилки відповіді API
      if (error.response && error.response.data) {
        setErrors(prev => ({
          ...prev,
          submit: error.response.data.message || 'Помилка при створенні курсу. Спробуйте знову.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'Помилка при створенні курсу. Спробуйте знову.'
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => {
    return (
      <div className="create-course-step">
        <h2>Крок 1: Основна інформація</h2>
        
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
        
        <div className="form-navigation">
          <button 
            type="button" 
            className="btn-primary" 
            onClick={nextStep}
          >
            Далі
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="create-course-step">
        <h2>Крок 2: Медіа файли</h2>
        
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
                <span>Завантажте вступне відео</span>
                <input
                  type="file"
                  id="introVideo"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className={`file-input ${errors.video ? 'is-invalid' : ''}`}
                />
              </div>
            )}
          </div>
          {errors.video && <div className="invalid-feedback">{errors.video}</div>}
          <small className="form-text text-muted">Рекомендований формат відео: MP4, максимальний розмір: 100MB</small>
        </div>
        
        <div className="form-navigation">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={prevStep}
          >
            Назад
          </button>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Створення...' : 'Створити курс'}
          </button>
        </div>
        
        {errors.submit && (
          <div className="submit-error">
            <FaExclamationTriangle /> {errors.submit}
          </div>
        )}
      </div>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <div className="success-message">
        <div className="success-icon">
          <FaCheck />
        </div>
        <h2>Курс успішно створено!</h2>
        <p>Ви будете перенаправлені на сторінку курсу через кілька секунд...</p>
      </div>
    );
  };

  return (
    <div className="teacher-create-course-wrapper">
      <TeacherHeader />
      
      <div className="teacher-create-course-container">
        <TeacherSidebar />
        
        <div className="teacher-create-course-content">
          <div className="create-course-header">
            <h1>Створення нового курсу</h1>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Завантаження...</p>
            </div>
          ) : success ? (
            renderSuccessMessage()
          ) : (
            <div className="create-course-form-container">
              <form onSubmit={handleSubmit} className="create-course-form">
                <div className="steps-indicator">
                  <div className={`step-indicator ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Основна інформація</div>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step-indicator ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Медіа файли</div>
                  </div>
                </div>
                
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherCreateCourse;