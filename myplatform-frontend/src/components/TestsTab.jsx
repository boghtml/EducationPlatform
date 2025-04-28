import React from 'react';
import { useOutletContext } from 'react-router-dom';
import '../css/WorkingWithCourse.css';

function TestsTab() {
  const { course } = useOutletContext();

  return (
    <div className="course-wc-tests-tab">
      <div className="course-wc-content-header">
        <h2>Тести курсу</h2>
      </div>

      <div className="course-wc-no-content-message">
        <h3>Немає доступних тестів</h3>
        <p>У цьому курсі поки що немає тестів. Перевірте пізніше або зв'яжіться з викладачем.</p>
      </div>
    </div>
  );
}

export default TestsTab;