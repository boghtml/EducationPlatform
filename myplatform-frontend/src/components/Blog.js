// Blog.js
import React from 'react';
import Header from '../components/Header';
import '../css/style.css';


function Blog() {
  return (
    <div>
      <Header />
      <div className="container mt-5">
        <h1>Блог</h1>
        <p>Контент для блогу...</p>
    </div>
    </div>
  );
}

export default Blog;