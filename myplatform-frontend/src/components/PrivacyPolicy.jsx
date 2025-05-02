import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import '../css/PrivacyPolicy.css';
import { FaShieldAlt, FaUserLock, FaFileAlt, FaCookieBite, FaGlobe, 
  FaChild, FaExchangeAlt, FaHistory, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const PrivacyPolicy = () => {
  useEffect(() => {
    // Update the document title
    document.title = "Privacy Policy | Education Platform";
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-policy-page">
      
      <div className="policy-hero">
        <div className="container">
          <h1 className="policy-hero-title">
            <FaShieldAlt className="policy-hero-icon" /> Privacy Policy
          </h1>
          <p className="policy-hero-subtitle">Last updated: May 2, 2025</p>
        </div>
      </div>
      
      <div className="container policy-container">
        <div className="policy-sidebar">
          <div className="policy-toc">
            <h3 className="toc-title">Table of Contents</h3>
            <ul className="toc-list">
              <li><a href="#introduction">Introduction</a></li>
              <li><a href="#information-we-collect">Information We Collect</a></li>
              <li><a href="#how-we-use">How We Use Your Information</a></li>
              <li><a href="#information-sharing">Information Sharing and Disclosure</a></li>
              <li><a href="#data-security">Data Security</a></li>
              <li><a href="#your-rights">Your Data Protection Rights</a></li>
              <li><a href="#cookies">Cookies and Similar Technologies</a></li>
              <li><a href="#third-party">Third-Party Links</a></li>
              <li><a href="#childrens-privacy">Children's Privacy</a></li>
              <li><a href="#international">International Data Transfers</a></li>
              <li><a href="#changes">Changes to This Privacy Policy</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="policy-content">
          <section id="introduction" className="policy-section">
            <h2>Introduction</h2>
            <p>
              Welcome to the Education Platform. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using our platform, you acknowledge that you have read, 
              understood, and agree to be bound by all the terms outlined in this Privacy Policy.
            </p>
          </section>
          
          <section id="information-we-collect" className="policy-section">
            <h2><FaUserLock className="section-icon" /> Information We Collect</h2>
            
            <h3>Personal Information</h3>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="policy-list">
              <li>Create an account or profile</li>
              <li>Enroll in courses</li>
              <li>Submit assignments or take tests</li>
              <li>Participate in forums or discussions</li>
              <li>Contact customer support</li>
              <li>Respond to surveys or promotions</li>
            </ul>
            
            <p>This information may include:</p>
            <ul className="policy-list">
              <li>Name, email address, and contact details</li>
              <li>User credentials (username and password)</li>
              <li>Profile information (biography, profile picture)</li>
              <li>Payment and billing information</li>
              <li>Educational background and course preferences</li>
              <li>Communications with us and other users</li>
            </ul>
            
            <h3>Usage Information</h3>
            <p>
              We automatically collect certain information about your use of our platform, including:
            </p>
            <ul className="policy-list">
              <li>Log data (IP address, browser type, pages visited, time spent)</li>
              <li>Device information (hardware model, operating system)</li>
              <li>Performance data (crash reports, system activity)</li>
              <li>Location information (with your consent)</li>
              <li>Learning activity and progress within courses</li>
            </ul>
            
            <h3>Information from Third Parties</h3>
            <p>
              We may receive information about you from third parties, such as:
            </p>
            <ul className="policy-list">
              <li>Social media platforms (if you connect your account)</li>
              <li>Educational institutions you're affiliated with</li>
              <li>Payment processors</li>
              <li>Other educational service providers</li>
            </ul>
          </section>
          
          <section id="how-we-use" className="policy-section">
            <h2><FaFileAlt className="section-icon" /> How We Use Your Information</h2>
            
            <p>We use the information we collect for various purposes, including to:</p>
            
            <div className="policy-grid">
              <div className="policy-grid-item">
                <h3>Provide, maintain, and improve our services</h3>
                <ul className="policy-list">
                  <li>Deliver course content and educational materials</li>
                  <li>Process enrollments and track progress</li>
                  <li>Issue certificates and credentials</li>
                  <li>Facilitate communication between students and instructors</li>
                </ul>
              </div>
              
              <div className="policy-grid-item">
                <h3>Personalize your experience</h3>
                <ul className="policy-list">
                  <li>Recommend courses based on your interests and history</li>
                  <li>Customize learning paths and content</li>
                  <li>Remember your preferences and settings</li>
                </ul>
              </div>
              
              <div className="policy-grid-item">
                <h3>Communicate with you</h3>
                <ul className="policy-list">
                  <li>Send administrative notifications (course updates, policy changes)</li>
                  <li>Provide customer support</li>
                  <li>Deliver marketing communications (with your consent)</li>
                  <li>Respond to your inquiries</li>
                </ul>
              </div>
              
              <div className="policy-grid-item">
                <h3>Analyze and improve our platform</h3>
                <ul className="policy-list">
                  <li>Conduct research and analytics</li>
                  <li>Monitor usage patterns and trends</li>
                  <li>Test and develop new features</li>
                  <li>Ensure technical functionality and security</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section id="information-sharing" className="policy-section">
            <h2><FaExchangeAlt className="section-icon" /> Information Sharing and Disclosure</h2>
            
            <p>We may share your information in the following circumstances:</p>
            
            <div className="policy-card">
              <h3>With service providers</h3>
              <p>
                We work with trusted third parties who provide services such as hosting, payment processing, 
                analytics, and customer support. These providers have access to your information only to perform 
                these tasks on our behalf.
              </p>
            </div>
            
            <div className="policy-card">
              <h3>With educational partners</h3>
              <p>
                If you enroll in a course offered in partnership with another institution, we may share 
                information with that partner to facilitate your learning experience.
              </p>
            </div>
            
            <div className="policy-card">
              <h3>For legal reasons</h3>
              <p>
                We may disclose information if required by law, regulation, or legal process, or if we believe 
                it's necessary to protect our rights, property, or safety, or that of our users or others.
              </p>
            </div>
            
            <div className="policy-card">
              <h3>Business transfers</h3>
              <p>
                If we are involved in a merger, acquisition, or sale of assets, your information may be 
                transferred as part of that transaction.
              </p>
            </div>
            
            <p className="policy-highlight">
              We do not sell, rent, or lease your personal information to third parties for their marketing 
              purposes without your explicit consent.
            </p>
          </section>
          
          <section id="data-security" className="policy-section">
            <h2><FaShieldAlt className="section-icon" /> Data Security</h2>
            
            <p>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
            </p>
            <p>
              We regularly review our security practices and update them as necessary to maintain appropriate 
              levels of protection.
            </p>
          </section>
          
          <section id="your-rights" className="policy-section">
            <h2><FaUserLock className="section-icon" /> Your Data Protection Rights</h2>
            
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            
            <div className="policy-rights-grid">
              <div className="policy-right-item">
                <h3>Access</h3>
                <p>Request access to your personal information.</p>
              </div>
              <div className="policy-right-item">
                <h3>Rectification</h3>
                <p>Request correction of inaccurate or incomplete data.</p>
              </div>
              <div className="policy-right-item">
                <h3>Erasure</h3>
                <p>Request deletion of your personal information in certain circumstances.</p>
              </div>
              <div className="policy-right-item">
                <h3>Restriction</h3>
                <p>Request limited use of your personal information.</p>
              </div>
              <div className="policy-right-item">
                <h3>Data portability</h3>
                <p>Request transfer of your information to another service.</p>
              </div>
              <div className="policy-right-item">
                <h3>Objection</h3>
                <p>Object to processing of your personal information.</p>
              </div>
            </div>
            
            <p>
              To exercise these rights, please contact us using the details provided in the "Contact Us" section.
            </p>
          </section>
          
          <section id="cookies" className="policy-section">
            <h2><FaCookieBite className="section-icon" /> Cookies and Similar Technologies</h2>
            
            <p>
              We use cookies and similar technologies to enhance your experience on our platform. These technologies 
              help us authenticate users, remember preferences, analyze usage patterns, and deliver personalized content.
            </p>
            <p>
              You can control cookie settings through your browser preferences. However, disabling cookies may limit 
              your ability to use certain features of our platform.
            </p>
          </section>
          
          <section id="third-party" className="policy-section">
            <h2>Third-Party Links</h2>
            
            <p>
              Our platform may contain links to third-party websites or services that are not owned or controlled by us. 
              This Privacy Policy applies only to our platform. We have no control over and assume no responsibility for 
              the content, privacy policies, or practices of any third-party sites or services.
            </p>
          </section>
          
          <section id="childrens-privacy" className="policy-section">
            <h2><FaChild className="section-icon" /> Children's Privacy</h2>
            
            <p>
              Our platform is not directed to children under the age of 16. We do not knowingly collect personal 
              information from children under 16. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us. If we become aware that we have collected personal 
              information from children without verification of parental consent, we will take steps to remove that 
              information from our servers.
            </p>
          </section>
          
          <section id="international" className="policy-section">
            <h2><FaGlobe className="section-icon" /> International Data Transfers</h2>
            
            <p>
              Your information may be transferred to and processed in countries other than the one in which you reside. 
              These countries may have different data protection laws than your country of residence.
            </p>
            <p>
              We have implemented appropriate safeguards to protect your personal information when transferred 
              internationally, including using standard contractual clauses approved by relevant regulatory authorities.
            </p>
          </section>
          
          <section id="changes" className="policy-section">
            <h2><FaHistory className="section-icon" /> Changes to This Privacy Policy</h2>
            
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
              updated Privacy Policy on this page with a new effective date.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting 
              your information.
            </p>
          </section>
          
          <section id="contact" className="policy-section">
            <h2>Contact Us</h2>
            
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            
            <div className="contact-info">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span><strong>Email:</strong> <a href="mailto:privacy@educationplatform.com">privacy@educationplatform.com</a></span>
              </div>
              
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span><strong>Phone:</strong> <a href="tel:+380441234567">+380 44 123 45 67</a></span>
              </div>
              
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>
                  <strong>Postal Address:</strong><br />
                  Education Platform<br />
                  Privacy Department<br />
                  вул. Степана Бандери, 1/1<br />
                  Хмельницький, 29000<br />
                  Україна
                </span>
              </div>
            </div>
            
            <p>
              We will respond to your inquiry as soon as possible and within the timeframe specified by applicable law.
            </p>
          </section>
          
          <div className="policy-footer">
            <p>This Privacy Policy was last updated on May 2, 2025.</p>
            <p>
              <Link to="/terms-of-service">Terms of Service</Link> • 
              <Link to="/"> Home</Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;