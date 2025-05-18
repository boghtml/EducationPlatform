import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Award, Book, CheckCircle, Clock, AlertTriangle, 
  FileText, TrendingUp, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import '../css/WorkingWithCourse.css';
import '../css/Grades.css';

function GradesTab() {
  const { course, getCsrfToken } = useOutletContext();
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchGradeData = async () => {
      try {
        setLoading(true);
        await getCsrfToken();
        
        const response = await axios.get(`${API_URL}/analytics/student/grades/${course.id}/`, {
          withCredentials: true
        });
        
        setGradeData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching grade data:', err);
        setError('Не вдалося завантажити дані оцінок. Спробуйте пізніше.');
        setLoading(false);
      }
    };

    if (course?.id) {
      fetchGradeData();
    }
  }, [course, getCsrfToken]);

  if (loading) {
    return (
      <div className="course-wc-loading-spinner">
        <div className="course-wc-spinner"></div>
        <p>Завантаження оцінок...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-wc-error-container">
        <div className="course-wc-error-icon">!</div>
        <h3>Помилка завантаження</h3>
        <p>{error}</p>
        <button className="course-wc-btn-primary" onClick={() => window.location.reload()}>
          Спробувати знову
        </button>
      </div>
    );
  }

  if (!gradeData) {
    return (
      <div className="course-wc-no-content-message">
        <h3>Немає даних про оцінки</h3>
        <p>Для цього курсу поки немає доступних оцінок.</p>
      </div>
    );
  }

  const { overall_statistics, assignments, progress_over_time } = gradeData;
  
  // Convert grades by category to array for charts
  const categoryData = Object.entries(gradeData.grades_by_category || {}).map(([name, data]) => ({
    name,
    average: data.average
  }));
  
  // Prepare data for assignment status chart
  const assignmentStatusCount = {
    not_submitted: 0,
    submitted: 0,
    graded: 0,
    returned: 0
  };
  
  assignments.forEach(assignment => {
    if (assignmentStatusCount[assignment.status] !== undefined) {
      assignmentStatusCount[assignment.status]++;
    } else {
      assignmentStatusCount.not_submitted++;
    }
  });
  
  const assignmentStatusData = Object.entries(assignmentStatusCount).map(([status, count]) => ({
    name: status === 'not_submitted' ? 'Не виконано' :
          status === 'submitted' ? 'Надіслано' :
          status === 'graded' ? 'Оцінено' : 'Повернено',
    value: count
  }));

  // Colors for charts
  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
  const STATUS_COLORS = {
    'Не виконано': '#F44336',
    'Надіслано': '#2196F3',
    'Оцінено': '#4CAF50',
    'Повернено': '#FF9800'
  };

  // Format due date
  const formatDate = (dateString) => {
    if (!dateString) return 'Не встановлено';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate overall grade status
  const getGradeStatus = (grade) => {
    if (grade >= 90) return 'excellent';
    if (grade >= 75) return 'good';
    if (grade >= 60) return 'average';
    return 'poor';
  };

  return (
    <div className="course-wc-grades-tab">
      <div className="course-wc-content-header">
        <h2>Оцінки та Прогрес</h2>
        <div className="grades-tabs">
          <button 
            className={`grades-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Award size={16} /> Огляд
          </button>
          <button 
            className={`grades-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <FileText size={16} /> Завдання
          </button>
          <button 
            className={`grades-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <TrendingUp size={16} /> Прогрес
          </button>
          <button 
            className={`grades-tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <BarChart2 size={16} /> Діаграми
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grades-overview-tab">
          <div className="grades-summary-cards">
            <div className="grades-summary-card">
              <div className={`grades-summary-circle ${getGradeStatus(overall_statistics.average_grade)}`}>
                <span className="grades-summary-value">{overall_statistics.average_grade}</span>
                <span className="grades-summary-label">/ 100</span>
              </div>
              <h3>Загальна оцінка</h3>
              <p className={`grades-summary-status ${getGradeStatus(overall_statistics.average_grade)}`}>
                {overall_statistics.average_grade >= 90 ? 'Відмінно!' : 
                 overall_statistics.average_grade >= 75 ? 'Добре!' : 
                 overall_statistics.average_grade >= 60 ? 'Задовільно' : 'Потребує покращення'}
              </p>
            </div>

            <div className="grades-stats-card">
              <div className="grades-stats-item">
                <div className="grades-stats-header">
                  <h4>Виконання завдань</h4>
                  <span className="grades-stats-value">
                    {overall_statistics.completed_assignments}/{overall_statistics.total_assignments}
                  </span>
                </div>
                <div className="grades-progress-bar">
                  <div 
                    className="grades-progress-fill" 
                    style={{ 
                      width: `${overall_statistics.total_assignments > 0 
                        ? (overall_statistics.completed_assignments / overall_statistics.total_assignments) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="grades-stats-item">
                <div className="grades-stats-header">
                  <h4>Завершені модулі</h4>
                  <span className="grades-stats-value">
                    {overall_statistics.completed_modules}/{overall_statistics.total_modules}
                  </span>
                </div>
                <div className="grades-progress-bar">
                  <div 
                    className="grades-progress-fill" 
                    style={{ width: `${overall_statistics.module_completion_percent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grades-stats-item">
                <div className="grades-stats-header">
                  <h4>Завершені уроки</h4>
                  <span className="grades-stats-value">
                    {overall_statistics.completed_lessons}/{overall_statistics.total_lessons}
                  </span>
                </div>
                <div className="grades-progress-bar">
                  <div 
                    className="grades-progress-fill" 
                    style={{ width: `${overall_statistics.lesson_completion_percent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grades-chart-section">
            <h3>
              <BarChart2 className="chart-icon" />
              Розподіл оцінок по категоріях
            </h3>
            {categoryData.length > 0 ? (
              <div className="grades-chart-container" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" name="Середня оцінка" fill="#FF6600" barSize={40} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grades-no-data">
                <p>Немає даних для відображення</p>
              </div>
            )}
          </div>

          <div className="grades-status-section">
            <h3>
              <PieChartIcon className="chart-icon" />
              Статус завдань
            </h3>
            <div className="grades-chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assignmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assignmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grades-assignments-tab">
          <h3>
            <FileText className="section-icon" />
            Деталі оцінок по завданнях
          </h3>
          
          <div className="grades-assignment-filters">
            <div className="grades-search-container">
              <input 
                type="text" 
                className="grades-search-input" 
                placeholder="Пошук завдань..." 
              />
            </div>
            <div className="grades-filter-group">
              <label>Статус:</label>
              <select className="grades-filter-select">
                <option value="all">Всі статуси</option>
                <option value="graded">Оцінені</option>
                <option value="submitted">Надіслані</option>
                <option value="not_submitted">Не виконані</option>
              </select>
            </div>
          </div>
          
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Завдання</th>
                  <th>Категорія</th>
                  <th>Термін</th>
                  <th>Статус</th>
                  <th>Оцінка</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className={`grade-row status-${assignment.status}`}>
                    <td>{assignment.title}</td>
                    <td>{assignment.category}</td>
                    <td>{formatDate(assignment.due_date)}</td>
                    <td>
                      <span className={`assignment-status ${assignment.status}`}>
                        {assignment.status === 'not_submitted' && <AlertTriangle size={14} />}
                        {assignment.status === 'submitted' && <Clock size={14} />}
                        {assignment.status === 'graded' && <CheckCircle size={14} />}
                        {assignment.status === 'returned' && <AlertTriangle size={14} />}
                        {assignment.status === 'not_submitted' && 'Не виконано'}
                        {assignment.status === 'submitted' && 'Надіслано'}
                        {assignment.status === 'graded' && 'Оцінено'}
                        {assignment.status === 'returned' && 'Повернено'}
                      </span>
                    </td>
                    <td className="grade-cell">
                      {assignment.grade !== null 
                        ? `${assignment.grade}/${assignment.max_points}`
                        : '—'}
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-data-cell">Завдання не знайдено</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="grades-progress-tab">
          <h3>
            <TrendingUp className="section-icon" />
            Динаміка прогресу
          </h3>
          
          <div className="grades-stats-cards">
            <div className="grades-progress-card">
              <div className="progress-card-icon module-icon">
                <Book size={24} />
              </div>
              <div className="progress-card-content">
                <h4>Модулі</h4>
                <div className="progress-card-value">
                  {overall_statistics.completed_modules}/{overall_statistics.total_modules}
                </div>
                <div className="grades-progress-bar">
                  <div 
                    className="grades-progress-fill" 
                    style={{ width: `${overall_statistics.module_completion_percent}%` }}
                  ></div>
                </div>
                <div className="progress-card-percentage">
                  {overall_statistics.module_completion_percent}% завершено
                </div>
              </div>
            </div>
            
            <div className="grades-progress-card">
              <div className="progress-card-icon lesson-icon">
                <FileText size={24} />
              </div>
              <div className="progress-card-content">
                <h4>Уроки</h4>
                <div className="progress-card-value">
                  {overall_statistics.completed_lessons}/{overall_statistics.total_lessons}
                </div>
                <div className="grades-progress-bar">
                  <div 
                    className="grades-progress-fill" 
                    style={{ width: `${overall_statistics.lesson_completion_percent}%` }}
                  ></div>
                </div>
                <div className="progress-card-percentage">
                  {overall_statistics.lesson_completion_percent}% завершено
                </div>
              </div>
            </div>
            
            <div className="grades-progress-card">
              <div className="progress-card-icon assignment-icon">
                <Award size={24} />
              </div>
              <div className="progress-card-content">
                <h4>Завдання</h4>
                <div className="progress-card-value">
                  {overall_statistics.completed_assignments}/{overall_statistics.total_assignments}
                </div>
                <div className="grades-progress-bar">
                  <div 
                    className="grades-progress-fill" 
                    style={{ 
                      width: `${overall_statistics.total_assignments > 0 
                        ? (overall_statistics.completed_assignments / overall_statistics.total_assignments) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="progress-card-percentage">
                  {overall_statistics.total_assignments > 0 
                    ? Math.round((overall_statistics.completed_assignments / overall_statistics.total_assignments) * 100) 
                    : 0}% завершено
                </div>
              </div>
            </div>
          </div>
          
          <div className="grades-progress-chart">
            <h3>Динаміка завершення уроків</h3>
            
            {progress_over_time && progress_over_time.length > 0 ? (
              <div className="grades-chart-container" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progress_over_time}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" domain={[0, overall_statistics.total_lessons]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="completed_count" 
                      name="Завершені уроки" 
                      stroke="#FF6600" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="completion_percent" 
                      name="Відсоток завершення" 
                      stroke="#4CAF50" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grades-no-data">
                <p>Недостатньо даних для відображення динаміки прогресу</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="grades-charts-tab">
          <div className="grades-chart-section">
            <h3>
              <BarChart2 className="chart-icon" />
              Розподіл оцінок по категоріях
            </h3>
            {categoryData.length > 0 ? (
              <div className="grades-chart-container" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" name="Середня оцінка" fill="#FF6600" barSize={40} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grades-no-data">
                <p>Немає даних для відображення</p>
              </div>
            )}
          </div>
          
          <div className="grades-chart-section">
            <h3>
              <PieChartIcon className="chart-icon" />
              Статус завдань
            </h3>
            <div className="grades-chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assignmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assignmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grades-chart-section">
            <h3>
              <TrendingUp className="chart-icon" />
              Динаміка завершення модулів і уроків
            </h3>
            
            <div className="grades-chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { 
                      name: 'Модулі', 
                      completed: overall_statistics.completed_modules, 
                      total: overall_statistics.total_modules 
                    },
                    { 
                      name: 'Уроки', 
                      completed: overall_statistics.completed_lessons, 
                      total: overall_statistics.total_lessons 
                    },
                    { 
                      name: 'Завдання', 
                      completed: overall_statistics.completed_assignments, 
                      total: overall_statistics.total_assignments 
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Завершено" stackId="a" fill="#4CAF50" />
                  <Bar dataKey="total" name="Всього" stackId="a" fill="#EEEEEE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GradesTab;