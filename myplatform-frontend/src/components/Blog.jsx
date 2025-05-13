import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import '../css/Blog.css';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaTag, 
  FaSearch, 
  FaThumbsUp, 
  FaComment, 
  FaShare, 
  FaFilter,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa';

function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const postsPerPage = 6;

  useEffect(() => {
    // Загрузка даних (в реальному додатку тут був би API запит)
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Імітація запиту до API
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Тестові дані для блогу
        const postsData = generateBlogPosts();
        setBlogPosts(postsData);
        
        // Витягуємо всі категорії
        const uniqueCategories = [...new Set(postsData.flatMap(post => post.categories))];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Фільтрація публікацій при зміні категорії або пошукового запиту
    let results = [...blogPosts];
    
    if (activeCategory !== 'all') {
      results = results.filter(post => post.categories.includes(activeCategory));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredPosts(results);
    
    // Розрахунок загальної кількості сторінок
    setTotalPages(Math.ceil(results.length / postsPerPage));
    
    // Скидаємо на першу сторінку при зміні фільтрів
    setCurrentPage(1);
  }, [blogPosts, activeCategory, searchQuery]);

  // Генератор тестових даних
  const generateBlogPosts = () => {
    const categories = [
      'Онлайн-навчання', 
      'Вивчення мов', 
      'Розробка курсів', 
      'EdTech', 
      'Педагогіка', 
      'Оцінювання',
      'Методологія',
      'Студентський досвід'
    ];
    
    const posts = [
      {
        id: 1,
        title: 'Як створити захоплюючий онлайн-курс у 2024 році',
        excerpt: 'Дізнайтеся про найкращі практики та інструменти для створення якісного онлайн-курсу, який привертає увагу студентів та підвищує їхню успішність.',
        author: 'Олена Петренко',
        date: '2024-05-01',
        imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Розробка курсів', 'Онлайн-навчання'],
        likes: 142,
        comments: 38,
        featured: true
      },
      {
        id: 2,
        title: 'Інтерактивні методи навчання в дистанційній освіті',
        excerpt: 'Огляд найефективніших інтерактивних методів, які допоможуть вашим студентам залишатися зацікавленими та мотивованими під час дистанційного навчання.',
        author: 'Андрій Коваленко',
        date: '2024-04-25',
        imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Методологія', 'Онлайн-навчання'],
        likes: 87,
        comments: 21,
        featured: false
      },
      {
        id: 3,
        title: 'Штучний інтелект у персоналізації навчання',
        excerpt: 'Як сучасні алгоритми штучного інтелекту допомагають адаптувати навчальні матеріали для кожного студента та підвищувати ефективність освітнього процесу.',
        author: 'Михайло Іванов',
        date: '2024-04-18',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['EdTech', 'Методологія'],
        likes: 215,
        comments: 46,
        featured: true
      },
      {
        id: 4,
        title: 'Ефективні стратегії оцінювання в онлайн-курсах',
        excerpt: 'Розглядаємо різні методи оцінювання студентів у онлайн-середовищі та як вибрати найбільш підходящі для вашого предмету.',
        author: 'Наталія Савченко',
        date: '2024-04-10',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Оцінювання', 'Педагогіка'],
        likes: 95,
        comments: 28,
        featured: false
      },
      {
        id: 5,
        title: 'Гейміфікація навчання: методи та інструменти',
        excerpt: 'Дослідження того, як ігрові елементи можуть підвищити залученість студентів та мотивацію до навчання в цифровому середовищі.',
        author: 'Віктор Литвиненко',
        date: '2024-04-02',
        imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['EdTech', 'Методологія'],
        likes: 178,
        comments: 42,
        featured: true
      },
      {
        id: 6,
        title: 'Психологічні аспекти онлайн-навчання',
        excerpt: 'Аналіз впливу дистанційного формату навчання на психологічний стан студентів та стратегії підтримки їхнього ментального здоров\'я.',
        author: 'Ірина Мельник',
        date: '2024-03-25',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Студентський досвід', 'Педагогіка'],
        likes: 132,
        comments: 56,
        featured: false
      },
      {
        id: 7,
        title: 'Як ефективно вивчати іноземні мови онлайн',
        excerpt: 'Поради та методики для успішного вивчення іноземних мов за допомогою сучасних онлайн-платформ та інструментів.',
        author: 'Марія Козак',
        date: '2024-03-18',
        imageUrl: 'https://images.unsplash.com/photo-1598193957011-39b9f2916992?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Вивчення мов', 'Онлайн-навчання'],
        likes: 105,
        comments: 37,
        featured: false
      },
      {
        id: 8,
        title: 'Тренди EdTech у 2024 році',
        excerpt: 'Огляд найважливіших технологічних трендів у освіті, які змінюють спосіб викладання та навчання в цьому році.',
        author: 'Олег Задорожний',
        date: '2024-03-10',
        imageUrl: 'https://images.unsplash.com/photo-1581091877018-dac6a371d50f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['EdTech', 'Онлайн-навчання'],
        likes: 223,
        comments: 49,
        featured: true
      },
      {
        id: 9,
        title: 'Роль соціальної взаємодії в онлайн-навчанні',
        excerpt: 'Дослідження важливості соціальних аспектів у віртуальному освітньому середовищі та методів їх посилення.',
        author: 'Тетяна Литвин',
        date: '2024-03-05',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Студентський досвід', 'Педагогіка'],
        likes: 89,
        comments: 32,
        featured: false
      },
      {
        id: 10,
        title: 'Мобільне навчання: переваги та виклики',
        excerpt: 'Аналіз потенціалу мобільних пристроїв для освіти та рекомендації щодо оптимізації навчального контенту для смартфонів.',
        author: 'Ігор Лисенко',
        date: '2024-02-28',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['EdTech', 'Методологія'],
        likes: 112,
        comments: 27,
        featured: false
      },
      {
        id: 11,
        title: 'Відеоконтент як ефективний інструмент навчання',
        excerpt: 'Практичні поради щодо створення якісних навчальних відео, які утримують увагу студентів та покращують засвоєння матеріалу.',
        author: 'Валентина Ткаченко',
        date: '2024-02-20',
        imageUrl: 'https://images.unsplash.com/photo-1595617795501-9661aafda72a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Розробка курсів', 'Онлайн-навчання'],
        likes: 143,
        comments: 39,
        featured: false
      },
      {
        id: 12,
        title: 'Стратегії запобігання академічної недоброчесності в онлайн-освіті',
        excerpt: 'Як розробити завдання та оцінювання, що мінімізують можливості для плагіату та шахрайства в дистанційному форматі.',
        author: 'Петро Васильєв',
        date: '2024-02-15',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        categories: ['Оцінювання', 'Педагогіка'],
        likes: 165,
        comments: 58,
        featured: false
      }
    ];
    
    return posts;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Пошук вже виконується через useEffect при зміні searchQuery
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setShowCategoriesMenu(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Прокрутка до верху сторінки
    window.scrollTo(0, 0);
  };

  // Отримання публікацій для поточної сторінки
  const getCurrentPagePosts = () => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  };

  // Форматування дати
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('uk-UA', options);
  };

  return (
    <div className="blog-page">
      <Header />
      
      <div className="blog-hero">
        <div className="blog-hero-content">
          <h1>Блог про освіту та онлайн-навчання</h1>
          <p>Корисні статті, поради та новини освітнього простору</p>
        </div>
      </div>
      
      <div className="blog-container">
        <div className="blog-sidebar">
          <div className="blog-search">
            <h3>Пошук статей</h3>
            <form onSubmit={handleSearch}>
              <div className="search-input-container">
                <input 
                  type="text" 
                  placeholder="Введіть ключові слова..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
          
          <div className="blog-categories">
            <h3>Категорії</h3>
            <ul>
              <li 
                className={activeCategory === 'all' ? 'active' : ''}
                onClick={() => handleCategoryChange('all')}
              >
                Всі категорії
              </li>
              {categories.map(category => (
                <li 
                  key={category} 
                  className={activeCategory === category ? 'active' : ''}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="featured-posts">
            <h3>Популярні статті</h3>
            <div className="featured-posts-list">
              {blogPosts
                .filter(post => post.featured)
                .slice(0, 3)
                .map(post => (
                  <div className="featured-post-item" key={post.id}>
                    <img src={post.imageUrl} alt={post.title} />
                    <div className="featured-post-content">
                      <h4>{post.title}</h4>
                      <div className="featured-post-meta">
                        <span><FaCalendarAlt /> {formatDate(post.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="blog-content">
          <div className="blog-filters-mobile">
            <div className="categories-dropdown">
              <button 
                className="categories-dropdown-btn"
                onClick={() => setShowCategoriesMenu(!showCategoriesMenu)}
              >
                <FaFilter /> {activeCategory === 'all' ? 'Всі категорії' : activeCategory}
              </button>
              {showCategoriesMenu && (
                <div className="categories-dropdown-content">
                  <ul>
                    <li 
                      className={activeCategory === 'all' ? 'active' : ''}
                      onClick={() => handleCategoryChange('all')}
                    >
                      Всі категорії
                    </li>
                    {categories.map(category => (
                      <li 
                        key={category} 
                        className={activeCategory === category ? 'active' : ''}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <form className="search-form-mobile" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Пошук..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </div>
          
          <div className="blog-posts-info">
            {activeCategory !== 'all' ? (
              <h2>Статті в категорії: {activeCategory}</h2>
            ) : (
              <h2>Всі статті блогу</h2>
            )}
            <p>Знайдено {filteredPosts.length} статей</p>
          </div>
          
          {isLoading ? (
            <div className="blog-loading">
              <div className="loading-spinner"></div>
              <p>Завантаження статей...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="no-posts-found">
              <h3>Не знайдено статей</h3>
              <p>Спробуйте змінити пошуковий запит або вибрати іншу категорію</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Скинути фільтри
              </button>
            </div>
          ) : (
            <>
              <div className="blog-posts-grid">
                {getCurrentPagePosts().map(post => (
                  <div className="blog-post-card" key={post.id}>
                    <div className="blog-post-image">
                      <img src={post.imageUrl} alt={post.title} />
                    </div>
                    <div className="blog-post-content">
                      <div className="blog-post-categories">
                        {post.categories.map(category => (
                          <span 
                            key={category} 
                            className="category-tag"
                            onClick={() => handleCategoryChange(category)}
                          >
                            <FaTag /> {category}
                          </span>
                        ))}
                      </div>
                      <h3 className="blog-post-title">{post.title}</h3>
                      <p className="blog-post-excerpt">{post.excerpt}</p>
                      <div className="blog-post-meta">
                        <div className="blog-post-author">
                          <FaUser /> {post.author}
                        </div>
                        <div className="blog-post-date">
                          <FaCalendarAlt /> {formatDate(post.date)}
                        </div>
                      </div>
                      <div className="blog-post-stats">
                        <span><FaThumbsUp /> {post.likes}</span>
                        <span><FaComment /> {post.comments}</span>
                      </div>
                      <Link to={`/blog/${post.id}`} className="read-more-btn">
                        Читати далі
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="blog-pagination">
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <FaChevronLeft />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button 
                      key={index}
                      className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="blog-newsletter">
        <div className="newsletter-content">
          <h2>Підпишіться на наші новини</h2>
          <p>Отримуйте найсвіжіші статті та оновлення прямо на вашу електронну пошту</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Ваш email" required />
            <button type="submit">Підписатися</button>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Blog;