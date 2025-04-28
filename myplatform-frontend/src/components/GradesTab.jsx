import React from 'react';
import { useOutletContext } from 'react-router-dom';
import '../css/WorkingWithCourse.css';

function GradesTab() {
  const { course } = useOutletContext();

  return (
    <div className="course-wc-grades-tab">
      <div className="course-wc-content-header">
        <h2>Оцінки курсу</h2>
      </div>

      <div className="course-wc-grades-summary">
        <div className="course-wc-grade-summary-card">
          <h3>Загальна оцінка</h3>
          <div className="course-wc-grade-circle">
            <span className="course-wc-grade-value">85%</span>
          </div>
          <p className="course-wc-grade-status">Добрий прогрес!</p>
        </div>

        <div className="course-wc-grade-stats">
          <div className="course-wc-grade-stat-item">
            <h4>Завдання</h4>
            <div className="course-wc-grade-stat-value">80%</div>
            <div className="course-wc-grade-progress-bar">
              <div className="course-wc-grade-progress-fill" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div className="course-wc-grade-stat-item">
            <h4>Тести</h4>
            <div className="course-wc-grade-stat-value">90%</div>
            <div className="course-wc-grade-progress-bar">
              <div className="course-wc-grade-progress-fill" style={{ width: '90%' }}></div>
            </div>
          </div>

          <div className="course-wc-grade-stat-item">
            <h4>Фінальний проект</h4>
            <div className="course-wc-grade-stat-value">85%</div>
            <div className="course-wc-grade-progress-bar">
              <div className="course-wc-grade-progress-fill" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="course-wc-grades-details">
        <h3>Деталі оцінок</h3>
        <table className="course-wc-grades-table">
          <thead>
            <tr>
              <th>Завдання</th>
              <th>Категорія</th>
              <th>Термін</th>
              <th>Бали</th>
              <th>Оцінка</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Завдання 1: Вступ</td>
              <td>Завдання</td>
              <td>15 Жовт, 2023</td>
              <td>18/20</td>
              <td>90%</td>
            </tr>
            <tr>
              <td>Тест 1: Основи</td>
              <td>Тест</td>
              <td>22 Жовт, 2023</td>
              <td>9/10</td>
              <td>90%</td>
            </tr>
            <tr>
              <td>Завдання 2: Аналіз</td>
              <td>Завдання</td>
              <td>5 Лист, 2023</td>
              <td>35/50</td>
              <td>70%</td>
            </tr>
            <tr>
              <td>Фінальний проект: Впровадження</td>
              <td>Проект</td>
              <td>10 Груд, 2023</td>
              <td>85/100</td>
              <td>85%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GradesTab;