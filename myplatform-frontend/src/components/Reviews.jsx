import React, { useState, useEffect } from 'react';
import Header from './Header';
import { Card, CardContent } from './ui/Card';
import '../css/Reviews.css';
import Footer from './Footer';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [name, setName] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(6);

  useEffect(() => {
    document.title = "Відгуки | Освітня платформа";
    
    // Симуляція отримання даних з API
    const mockReviews = [
      {
        id: 1,
        name: "Марина Коваленко",
        date: "2024-03-15",
        rating: 5,
        text: "Неймовірно корисний курс програмування! Я нарешті зрозуміла основи JavaScript після кількох невдалих спроб навчання на інших платформах. Викладач пояснює все дуже зрозуміло і наводить багато практичних прикладів.",
        course: "JavaScript для початківців",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg"
      },
      {
        id: 2,
        name: "Олег Петренко",
        date: "2024-03-10",
        rating: 4,
        text: "Дуже задоволений курсом з Python. Матеріал викладений структуровано і послідовно. Єдиний недолік - хотілося б більше практичних проектів для закріплення теоретичних знань.",
        course: "Python: від основ до професіонала",
        avatar: "https://randomuser.me/api/portraits/men/11.jpg"
      },
      {
        id: 3,
        name: "Іванна Сидоренко",
        date: "2024-02-28",
        rating: 5,
        text: "Курс з дизайну UI/UX перевершив усі мої очікування! Викладач надзвичайно кваліфікований і завжди готовий відповісти на додаткові запитання. Після закінчення курсу я відразу знайшла роботу в IT-компанії.",
        course: "UI/UX Дизайн: від теорії до практики",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg"
      },
      {
        id: 4,
        name: "Максим Дмитренко",
        date: "2024-02-15",
        rating: 3,
        text: "Курс з Data Science містить багато цінної інформації, але подається вона досить складно для новачків. Рекомендую мати базові знання з програмування та математики перед початком навчання.",
        course: "Основи Data Science",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg"
      },
      {
        id: 5,
        name: "Наталія Бондаренко",
        date: "2024-01-30",
        rating: 5,
        text: "Надзвичайно практичний курс з React.js! Кожен урок містить корисні приклади реальних проектів. Після закінчення курсу я змогла створити власний додаток і додати його до портфоліо.",
        course: "React.js для розробників",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg"
      },
      {
        id: 6,
        name: "Андрій Мельник",
        date: "2024-01-22",
        rating: 4,
        text: "Курс з управління проектами дав мені необхідні інструменти для кар'єрного росту. Особливо цінними були практичні кейси та шаблони документів. Рекомендую всім, хто хоче розвиватися в цьому напрямку.",
        course: "Управління проектами в IT",
        avatar: "https://randomuser.me/api/portraits/men/76.jpg"
      },
      {
        id: 7,
        name: "Олена Ткаченко",
        date: "2024-01-15",
        rating: 5,
        text: "Курс з Node.js допоміг мені стати повноцінним fullstack розробником. Викладач пояснює складні концепції простою мовою і завжди відповідає на питання в коментарях.",
        course: "Node.js: серверна розробка",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg"
      },
      {
        id: 8,
        name: "Василь Шевчук",
        date: "2023-12-28",
        rating: 2,
        text: "Курс з Machine Learning виявився занадто складним. Багато теорії і мало практики. Викладач часто використовує складні терміни без достатнього пояснення.",
        course: "Основи Machine Learning",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      {
        id: 9,
        name: "Тетяна Іваненко",
        date: "2023-12-20",
        rating: 5,
        text: "Курс з HTML/CSS ідеально підходить для початківців. Детальні пояснення та цікаві проекти допомогли мені швидко освоїти основи веб-розробки.",
        course: "HTML/CSS для новачків",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg"
      },
      {
        id: 10,
        name: "Михайло Павленко",
        date: "2023-12-10",
        rating: 4,
        text: "Курс з бізнес-аналізу дав мені чітке розуміння процесів у IT-індустрії. Особливо корисними були шаблони документів та case studies. Рекомендую цей курс тим, хто хоче перейти в бізнес-аналіз.",
        course: "Бізнес-аналіз в IT проектах",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg"
      }
    ];
    
    setReviews(mockReviews);
    setFilteredReviews(mockReviews);
  }, []);

  useEffect(() => {
    let result = [...reviews];
    
    if (courseFilter) {
      result = result.filter(review => 
        review.course.toLowerCase().includes(courseFilter.toLowerCase())
      );
    }
    
    if (ratingFilter !== 'all') {
      result = result.filter(review => review.rating === parseInt(ratingFilter));
    }
    
    setFilteredReviews(result);
    setCurrentPage(1);
  }, [courseFilter, ratingFilter, reviews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !reviewText.trim() || rating === 0) {
      alert('Будь ласка, заповніть всі поля та оберіть рейтинг');
      return;
    }
    
    const newReview = {
      id: reviews.length + 1,
      name: name,
      date: new Date().toISOString().split('T')[0],
      rating: rating,
      text: reviewText,
      course: "Освітня платформа (загальний відгук)",
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`
    };
    
    setReviews([newReview, ...reviews]);
    setFilteredReviews([newReview, ...filteredReviews]);
    
    // Скидання форми
    setName('');
    setReviewText('');
    setRating(0);
    setShowForm(false);
    
    alert('Дякуємо за ваш відгук!');
  };
  
  const renderStars = (count, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <span 
            key={i} 
            className={`star ${i <= (hoverRating || rating) ? 'filled' : ''}`}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <i className={`bi ${i <= (hoverRating || rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
          </span>
        );
      } else {
        stars.push(
          <span key={i} className={`star ${i <= count ? 'filled' : ''}`}>
            <i className={`bi ${i <= count ? 'bi-star-fill' : 'bi-star'}`}></i>
          </span>
        );
      }
    }
    return stars;
  };
  
  // Пагінація
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Унікальні курси для фільтра
  const uniqueCourses = [...new Set(reviews.map(review => review.course))];
  
  // Статистика рейтингів
  const ratingStats = {
    average: reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0,
    count: reviews.length,
    distribution: {
      5: reviews.filter(review => review.rating === 5).length,
      4: reviews.filter(review => review.rating === 4).length,
      3: reviews.filter(review => review.rating === 3).length,
      2: reviews.filter(review => review.rating === 2).length,
      1: reviews.filter(review => review.rating === 1).length
    }
  };

  return (
    <div className="reviews-page">
      <Header />
      <div className="reviews-hero">
        <div className="container">
          <h1 className="reviews-hero-title">Відгуки наших студентів</h1>
          <p className="reviews-hero-subtitle">Дізнайтеся, що кажуть студенти про нашу платформу та курси</p>
        </div>
      </div>
      
      <div className="container reviews-container mt-5">
        <div className="row">
          <div className="col-lg-4">
            <div className="reviews-stats sticky-top">
               
              <div className="reviews-filters">
                <h3>Фільтри</h3>
                <div className="form-group mb-3">
                  <label htmlFor="courseFilter">Курс:</label>
                  <select 
                    id="courseFilter" 
                    className="form-control" 
                    value={courseFilter} 
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="">Всі курси</option>
                    {uniqueCourses.map((course, index) => (
                      <option key={index} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="ratingFilter">Рейтинг:</label>
                  <select 
                    id="ratingFilter" 
                    className="form-control" 
                    value={ratingFilter} 
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="all">Всі рейтинги</option>
                    <option value="5">5 зірок</option>
                    <option value="4">4 зірки</option>
                    <option value="3">3 зірки</option>
                    <option value="2">2 зірки</option>
                    <option value="1">1 зірка</option>
                  </select>
                </div>
              </div>
              
              <button 
                className="btn btn-primary btn-block mt-3" 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Скасувати' : 'Залишити відгук'}
              </button>
            </div>
          </div>
          
          <div className="col-lg-8">
            {showForm && (
              <div className="reviews-form-container">
                <Card className="reviews-form-card mb-4">
                  <CardContent>
                    <h3 className="reviews-form-title">Залиште свій відгук</h3>
                    <form onSubmit={handleSubmit} className="reviews-form">
                      <div className="form-group mb-3">
                        <label htmlFor="reviewName">Ваше ім'я:</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="reviewName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group mb-3">
                        <label>Ваша оцінка:</label>
                        <div className="reviews-rating">
                          {renderStars(rating, true)}
                        </div>
                      </div>
                      
                      <div className="form-group mb-3">
                        <label htmlFor="reviewText">Ваш відгук:</label>
                        <textarea 
                          className="form-control" 
                          id="reviewText" 
                          rows="4"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Надіслати відгук</button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="reviews-list">
              {currentReviews.length > 0 ? (
                currentReviews.map(review => (
                  <Card key={review.id} className="review-card mb-4">
                    <CardContent>
                      <div className="review-header">
                        <div className="review-avatar">
                          <img src={review.avatar} alt={review.name} />
                        </div>
                        <div className="review-meta">
                          <h4 className="review-name">{review.name}</h4>
                          <p className="review-course">{review.course}</p>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                          <p className="review-date">{new Date(review.date).toLocaleDateString('uk-UA')}</p>
                        </div>
                      </div>
                      <div className="review-content">
                        <p>{review.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="reviews-empty">
                  <i className="bi bi-search"></i>
                  <p>На жаль, відгуків з обраними параметрами не знайдено</p>
                </div>
              )}
              
              {filteredReviews.length > reviewsPerPage && (
                <div className="reviews-pagination">
                  <button 
                    className="pagination-prev" 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        className={`pagination-page ${number === currentPage ? 'active' : ''}`}
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="pagination-next" 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reviews;