// Blog.js
import React from 'react';
import Header from './Header';
import Footer from './Footer';


function Blog() {
  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h1>Блог</h1>
        <p>Контент для блогу...</p>
    </div>
      <Footer />
    </div>

  );
}

export default Blog;