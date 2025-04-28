import React from 'react';
import { useOutletContext } from 'react-router-dom';
import '../css/WorkingWithCourse.css';
import {MessageCircle, Clock } from 'lucide-react';

function TestsTab() {
  const { course } = useOutletContext();

  return (
    <div className="course-wc-discussions-tab">
        <div className="course-wc-content-header">
        <h2>Обговорення курсу</h2>
        </div>
        
        <div className="course-wc-discussion-forums">
        <div className="course-wc-forum-card">
            <h3>Загальне обговорення</h3>
            <p>Ставте запитання, діліться ідеями та спілкуйтеся з іншими студентами в цьому загальному форумі.</p>
            <div className="course-wc-forum-meta">
            <div className="course-wc-meta-item">
                <MessageCircle className="course-wc-meta-icon" />
                <span>15 тем</span>
            </div>
            <div className="course-wc-meta-item">
                <Clock className="course-wc-meta-icon" />
                <span>Останній пост: 2 дні тому</span>
            </div>
            </div>
            <button className="course-wc-btn-forum">Перейти до форуму</button>
        </div>
        
        <div className="course-wc-forum-card">
            <h3>Допомога з завданнями</h3>
            <p>Отримайте допомогу з завданнями від викладачів та інших студентів.</p>
            <div className="course-wc-forum-meta">
            <div className="course-wc-meta-item">
                <MessageCircle className="course-wc-meta-icon" />
                <span>8 тем</span>
            </div>
            <div className="course-wc-meta-item">
                <Clock className="course-wc-meta-icon" />
                <span>Останній пост: 5 днів тому</span>
            </div>
            </div>
            <button className="course-wc-btn-forum">Перейти до форуму</button>
        </div>
        
        <div className="course-wc-forum-card">
            <h3>Навчальні групи</h3>
            <p>Координуйтеся з іншими студентами для формування навчальних груп та спільного навчання.</p>
            <div className="course-wc-forum-meta">
            <div className="course-wc-meta-item">
                <MessageCircle className="course-wc-meta-icon" />
                <span>3 теми</span>
            </div>
            <div className="course-wc-meta-item">
                <Clock className="course-wc-meta-icon" />
                <span>Останній пост: 1 тиждень тому</span>
            </div>
            </div>
            <button className="course-wc-btn-forum">Перейти до форуму</button>
        </div>
        </div>
    </div>
  );
}

export default TestsTab;