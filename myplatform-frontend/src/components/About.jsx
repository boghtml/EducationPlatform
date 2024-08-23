// src/components/About.js

import React from 'react';
import Header from './Header';
import '../css/About.css'; // Підключіть ваш CSS файл

function About() {
  return (
    <div className="about">
      <Header />
      <div className="about__container container mt-5">
        <h1 className="about__title">About Us</h1>
        <p className="about__description">
          Welcome to the About Us page of our application. Here, we share information about our mission, values, and the team behind the project.
          <br />
          We are dedicated to providing the best experience for our users and constantly improving our services. Stay tuned for updates and feel free to reach out with any questions or feedback!
        </p>
        <div className="about__cards">
          <div className="about__card">
            <i className="bi bi-gear about__card-icon"></i>
            <h2 className="about__card-title">Our Mission</h2>
            <p className="about__card-description">
              Our mission is to innovate and provide exceptional service, helping you achieve your goals with ease and efficiency.
            </p>
          </div>
          <div className="about__card">
            <i className="bi bi-people about__card-icon"></i>
            <h2 className="about__card-title">Our Team</h2>
            <p className="about__card-description">
              Meet the talented individuals who make it all happen. Our team is passionate, dedicated, and skilled in their respective fields.
            </p>
          </div>
          <div className="about__card">
            <i className="bi bi-heart about__card-icon"></i>
            <h2 className="about__card-title">Our Values</h2>
            <p className="about__card-description">
              We value integrity, innovation, and customer satisfaction. Our commitment to these values drives us to deliver excellence every day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
