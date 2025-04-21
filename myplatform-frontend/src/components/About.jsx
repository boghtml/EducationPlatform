import React, { useEffect } from 'react';
import Header from './Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import '../css/About.css';

const AboutPage = () => {
  useEffect(() => {
    // Анімація при завантаженні сторінки
    const cards = document.querySelectorAll('.about__card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, 300 * index);
    });

    document.title = "Про нас | Освітня платформа";
  }, []);

  const teamMembers = [
    {
      name: "Марія Петренко",
      position: "Засновниця & CEO",
      bio: "Експертка з онлайн-освіти з досвідом більше 10 років",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Олександр Ковальчук",
      position: "Технічний директор",
      bio: "Спеціаліст з розробки освітніх платформ",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Наталія Шевченко",
      position: "Директорка з контенту",
      bio: "Експертка з розробки навчальних матеріалів",
      photo: "https://randomuser.me/api/portraits/women/68.jpg",
    }
  ];

  return (
    <div className="about">
      <Header />
      <div className="about__hero">
        <div className="container">
          <h1 className="about__hero-title">Наша місія — зробити освіту доступною для всіх</h1>
          <p className="about__hero-subtitle">Ми створюємо інноваційні освітні рішення з 2020 року</p>
        </div>
      </div>

      <div className="about__container container mt-5">
        <div className="about__intro">
          <h2 className="about__section-title">Хто ми</h2>
          <p className="about__description">
            Наша освітня платформа створена з метою об'єднати найкращих викладачів та студентів з усього світу. 
            Ми віримо, що якісна освіта повинна бути доступною для кожного, незалежно від місця проживання чи фінансових можливостей.
            <br /><br />
            Починаючи з 2020 року, ми допомогли тисячам студентів здобути нові навички, знайти роботу своєї мрії та змінити своє життя на краще. 
            Наша платформа постійно розвивається, додаючи нові курси, інструменти та можливості для ефективного навчання.
          </p>
        </div>

        <div className="about__stats">
          <div className="about__stat-item">
            <span className="about__stat-number">10,000+</span>
            <span className="about__stat-text">Студентів</span>
          </div>
          <div className="about__stat-item">
            <span className="about__stat-number">500+</span>
            <span className="about__stat-text">Курсів</span>
          </div>
          <div className="about__stat-item">
            <span className="about__stat-number">100+</span>
            <span className="about__stat-text">Викладачів</span>
          </div>
          <div className="about__stat-item">
            <span className="about__stat-number">95%</span>
            <span className="about__stat-text">Задоволених студентів</span>
          </div>
        </div>

        <div className="about__cards">
          <div className="about__card">
            <i className="bi bi-rocket-takeoff about__card-icon"></i>
            <h2 className="about__card-title">Наша місія</h2>
            <p className="about__card-description">
              Наша місія полягає в тому, щоб зробити високоякісну освіту доступною для кожного, 
              хто прагне навчатися. Ми створюємо інноваційне середовище, де студенти можуть 
              розвиватися в своєму темпі, отримувати персоналізований досвід навчання та 
              здобувати практичні навички, які цінуються на ринку праці.
            </p>
          </div>
          <div className="about__card">
            <i className="bi bi-eye about__card-icon"></i>
            <h2 className="about__card-title">Наше бачення</h2>
            <p className="about__card-description">
              Ми прагнемо створити освітню екосистему, де навчання стає захоплюючою подорожжю, 
              а не рутинним процесом. Наша мета — підготувати людей до викликів майбутнього, 
              надаючи їм інструменти та знання, які допоможуть адаптуватися до швидко змінюваного світу.
            </p>
          </div>
          <div className="about__card">
            <i className="bi bi-star about__card-icon"></i>
            <h2 className="about__card-title">Наші цінності</h2>
            <p className="about__card-description">
              Ми цінуємо інноваційність, доступність, інклюзивність та високу якість навчання. 
              Ми вважаємо, що освіта повинна бути відкритою для всіх, незалежно від віку, 
              соціального статусу чи географічного розташування. Ми постійно працюємо над тим, 
              щоб зробити наші курси ще кращими.
            </p>
          </div>
        </div>

        <div className="about__team-section">
          <h2 className="about__section-title">Наша команда</h2>
          <p className="about__description mb-4">
            Знайомтеся з людьми, які стоять за нашою платформою. Наша команда складається з 
            професіоналів у сфері освіти, технологій та дизайну, об'єднаних спільною метою.
          </p>
          
          <div className="about__team">
            {teamMembers.map((member, index) => (
              <Card key={index} className="about__team-card">
                <CardContent className="p-0">
                  <div className="about__team-photo">
                    <img src={member.photo} alt={member.name} />
                  </div>
                  <div className="about__team-info p-4">
                    <h3 className="about__team-name">{member.name}</h3>
                    <p className="about__team-position">{member.position}</p>
                    <p className="about__team-bio">{member.bio}</p>
                    <div className="about__team-social">
                      <a href="#" className="about__team-social-link"><i className="bi bi-linkedin"></i></a>
                      <a href="#" className="about__team-social-link"><i className="bi bi-twitter"></i></a>
                      <a href="#" className="about__team-social-link"><i className="bi bi-envelope"></i></a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="about__contact-section">
          <h2 className="about__section-title">Зв'яжіться з нами</h2>
          <p className="about__description mb-4">
            Маєте питання чи пропозиції? Зв'яжіться з нами будь-яким зручним способом:
          </p>
          
          <div className="about__contact-info">
            <div className="about__contact-item">
              <i className="bi bi-envelope-fill"></i>
              <span>info@educationplatform.com</span>
            </div>
            <div className="about__contact-item">
              <i className="bi bi-telephone-fill"></i>
              <span>+380 44 123 45 67</span>
            </div>
            <div className="about__contact-item">
              <i className="bi bi-geo-alt-fill"></i>
              <span>вул. Хрещатик 1, Київ, Україна</span>
            </div>
          </div>
          
          <div className="about__social-links">
            <a href="#" className="about__social-link"><i className="bi bi-facebook"></i></a>
            <a href="#" className="about__social-link"><i className="bi bi-instagram"></i></a>
            <a href="#" className="about__social-link"><i className="bi bi-youtube"></i></a>
            <a href="#" className="about__social-link"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;