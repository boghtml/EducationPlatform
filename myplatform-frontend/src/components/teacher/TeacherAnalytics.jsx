import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';
import '../../css/teacher/TeacherAnalytics.css';

import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaUsers, 
  FaBook, 
  FaCheckCircle, 
  FaTasks, 
  FaGraduationCap,
  FaCalendarAlt,
  FaTag,
  FaFilter,
  FaDownload,
  FaSyncAlt,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

// Компонент для відображення лінійного графіка
const LineChart = ({ data, title, height = 300 }) => {
  if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
    return (
      <div className="chart-placeholder" style={{ height }}>
        <p>Недостатньо даних для відображення графіка</p>
      </div>
    );
  }

  // В реальному додатку тут був би справжній компонент графіка
  return (
    <div className="chart-container" style={{ height }}>
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-visualization">
        <div className="chart-labels">
          {data.labels.map((label, index) => (
            <div key={index} className="chart-label">
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="chart-content">
          {data.datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex} className="chart-dataset">
              <div className="dataset-info">
                <span className="dataset-color" style={{ backgroundColor: dataset.borderColor || '#4a6cf7' }}></span>
                <span className="dataset-label">{dataset.label}</span>
              </div>
              <div className="dataset-line">
                {dataset.data.map((value, index) => (
                  <div 
                    key={index} 
                    className="data-point" 
                    style={{ 
                      height: `${(value / Math.max(...dataset.data)) * 100}%`,
                      backgroundColor: dataset.borderColor || '#4a6cf7' 
                    }}
                    title={`${data.labels[index]}: ${value}`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Компонент для відображення стовпчастого графіка
const BarChart = ({ data, title, height = 300 }) => {
  if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
    return (
      <div className="chart-placeholder" style={{ height }}>
        <p>Недостатньо даних для відображення графіка</p>
      </div>
    );
  }

  // В реальному додатку тут був би справжній компонент графіка
  return (
    <div className="chart-container" style={{ height }}>
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-visualization">
        <div className="chart-labels">
          {data.labels.map((label, index) => (
            <div key={index} className="chart-label">
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="chart-content">
          {data.datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex} className="chart-dataset">
              <div className="dataset-info">
                <span className="dataset-color" style={{ backgroundColor: dataset.backgroundColor?.[0] || '#4a6cf7' }}></span>
                <span className="dataset-label">{dataset.label}</span>
              </div>
              <div className="dataset-bars">
                {dataset.data.map((value, index) => (
                  <div 
                    key={index} 
                    className="data-bar" 
                    style={{ 
                      height: `${(value / Math.max(...dataset.data)) * 100}%`,
                      backgroundColor: Array.isArray(dataset.backgroundColor) 
                        ? dataset.backgroundColor[index % dataset.backgroundColor.length] 
                        : dataset.backgroundColor || '#4a6cf7' 
                    }}
                    title={`${data.labels[index]}: ${value}`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Компонент для відображення кругової діаграми
const PieChart = ({ data, title }) => {
  if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Недостатньо даних для відображення діаграми</p>
      </div>
    );
  }

  const dataset = data.datasets[0];
  const total = dataset.data.reduce((sum, value) => sum + value, 0);

  // В реальному додатку тут був би справжній компонент діаграми
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="pie-chart-container">
        <div className="pie-chart-visualization">
          <div className="pie-chart">
            {dataset.data.map((value, index) => {
              const percentage = (value / total) * 100;
              const color = dataset.backgroundColor[index % dataset.backgroundColor.length];
              return (
                <div 
                  key={index} 
                  className="pie-slice" 
                  style={{ 
                    backgroundColor: color,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    margin: '5px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  title={`${data.labels[index]}: ${value} (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 10 && `${percentage.toFixed(0)}%`}
                </div>
              );
            })}
          </div>
        </div>
        <div className="pie-chart-legend">
          {data.labels.map((label, index) => (
            <div key={index} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: dataset.backgroundColor[index % dataset.backgroundColor.length] }}
              ></span>
              <span className="legend-label">{label}</span>
              <span className="legend-value">{((dataset.data[index] / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Компонент для відображення таблиці
const DataTable = ({ data, columns, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-placeholder">
        <p>Немає даних для відображення</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <h3>{title}</h3>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function TeacherAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedChartType, setSelectedChartType] = useState('enrollment_trends');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    if (!userId) {
      navigate('/login');
      return;
    }

    if (userRole !== 'teacher' && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchCourses(userId);
    fetchDashboardData();
  }, [navigate]);

  const fetchCourses = async (userId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/teacher/${userId}/courses/`, {
        withCredentials: true
      });
      
      if (response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const response = await axios.get(`${API_URL}/analytics/dashboard/`, {
        withCredentials: true
      });
      
      if (response.data) {
        setAnalyticsData(response.data);
      }
      
      // Отримуємо дані для графіків
      fetchChartData(selectedChartType);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Не вдалося завантажити аналітичні дані. Будь ласка, спробуйте пізніше.");
      setIsLoading(false);
    }
  };

  const fetchChartData = async (chartType) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/charts/`, {
        params: {
          type: chartType,
          period: selectedTimeframe,
          course_id: selectedCourse !== 'all' ? selectedCourse : undefined
        },
        withCredentials: true
      });
      
      if (response.data) {
        setChartData(response.data);
        setSelectedChartType(chartType);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    fetchChartData(selectedChartType);
  };

  const handleTimeframeChange = (e) => {
    setSelectedTimeframe(e.target.value);
    fetchChartData(selectedChartType);
  };

  const handleChartTypeChange = (chartType) => {
    fetchChartData(chartType);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const formatPercentage = (num) => {
    return `${num}%`;
  };

  if (isLoading) {
    return (
      <div className="teacher-analytics-wrapper">
        <TeacherHeader />
        <div className="teacher-analytics-container">
          <TeacherSidebar />
          <div className="analytics-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження аналітичних даних...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-analytics-wrapper">
        <TeacherHeader />
        <div className="teacher-analytics-container">
          <TeacherSidebar />
          <div className="analytics-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={handleRefresh}
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Підготовка даних для відображення
  const userData = analyticsData?.users || {};
  const coursesData = analyticsData?.courses || {};
  const progressData = analyticsData?.progress || {};
  const assignmentsData = analyticsData?.assignments || {};

  // Колонки для таблиць
  const popularCoursesColumns = [
    { key: 'title', label: 'Назва курсу' },
    { key: 'student_count', label: 'Кількість студентів' },
    { key: 'teacher', label: 'Викладач' }
  ];

  const recentCoursesColumns = [
    { key: 'title', label: 'Назва курсу' },
    { 
      key: 'created_at', 
      label: 'Дата створення',
      render: (row) => formatDate(row.created_at)
    },
    { key: 'status', label: 'Статус' },
    { key: 'enrollment_count', label: 'Кількість студентів' }
  ];

  const teachersCoursesColumns = [
    { key: 'name', label: 'Ім\'я викладача' },
    { key: 'course_count', label: 'Кількість курсів' },
    { key: 'student_count', label: 'Кількість студентів' }
  ];

  const assignmentDetailsColumns = [
    { key: 'title', label: 'Назва завдання' },
    { key: 'course', label: 'Курс' },
    { key: 'total_submissions', label: 'Всього відправлень' },
    { 
      key: 'status_breakdown', 
      label: 'Статус',
      render: (row) => (
        <div className="status-breakdown">
          <span className="status-item">Здано: {row.status_breakdown.submitted || 0}</span>
          <span className="status-item">Оцінено: {row.status_breakdown.graded || 0}</span>
        </div>
      )
    },
    { 
      key: 'average_grade', 
      label: 'Середня оцінка',
      render: (row) => row.average_grade ? row.average_grade.toFixed(1) : '-'
    }
  ];

  return (
    <div className="teacher-analytics-wrapper">
      <TeacherHeader />
      
      <div className="teacher-analytics-container">
        <TeacherSidebar />
        
        <div className="teacher-analytics-content">
          <div className="analytics-header">
            <div>
              <h1>Аналітика та звіти</h1>
              <p>Детальна статистика вашої викладацької діяльності та курсів</p>
            </div>
            <div className="analytics-actions">
              <button className="refresh-btn" onClick={handleRefresh}>
                <FaSyncAlt /> Оновити
              </button>
              <button className="export-btn">
                <FaDownload /> Експорт звіту
              </button>
            </div>
          </div>
          
          <div className="analytics-filters">
            <div className="filter-group">
              <label htmlFor="course-select">
                <FaGraduationCap /> Курс:
              </label>
              <select 
                id="course-select" 
                value={selectedCourse}
                onChange={handleCourseChange}
              >
                <option value="all">Всі курси</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="timeframe-select">
                <FaCalendarAlt /> Період:
              </label>
              <select 
                id="timeframe-select" 
                value={selectedTimeframe}
                onChange={handleTimeframeChange}
              >
                <option value="7">Останні 7 днів</option>
                <option value="30">Останні 30 днів</option>
                <option value="90">Останні 3 місяці</option>
                <option value="180">Останні 6 місяців</option>
              </select>
            </div>
          </div>
          
          {/* Статистика */}
          <div className="analytics-stats-section">
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon students">
                <FaUsers />
              </div>
              <div className="analytics-stat-content">
                <h3>{formatNumber(userData.total_students || 0)}</h3>
                <p>Всього студентів</p>
              </div>
            </div>
            
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon courses">
                <FaGraduationCap />
              </div>
              <div className="analytics-stat-content">
                <h3>{formatNumber(coursesData.total_courses || 0)}</h3>
                <p>Всього курсів</p>
              </div>
            </div>
            
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon completed">
                <FaCheckCircle />
              </div>
              <div className="analytics-stat-content">
                <h3>{formatNumber(progressData.total_lessons_completed || 0)}</h3>
                <p>Уроків завершено</p>
              </div>
            </div>
            
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon assignments">
                <FaTasks />
              </div>
              <div className="analytics-stat-content">
                <h3>{formatNumber(assignmentsData.total_assignments || 0)}</h3>
                <p>Всього завдань</p>
              </div>
            </div>
            
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon submissions">
                <FaBook />
              </div>
              <div className="analytics-stat-content">
                <h3>{formatNumber(assignmentsData.submissions?.total || 0)}</h3>
                <p>Всього відправлень</p>
              </div>
            </div>
          </div>
          
          {/* Графіки */}
          <div className="analytics-charts-section">
            <div className="chart-types">
              <button 
                className={`chart-type-btn ${selectedChartType === 'enrollment_trends' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('enrollment_trends')}
              >
                <FaChartLine /> Тренди зарахувань
              </button>
              <button 
                className={`chart-type-btn ${selectedChartType === 'course_popularity' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('course_popularity')}
              >
                <FaChartBar /> Популярність курсів
              </button>
              <button 
                className={`chart-type-btn ${selectedChartType === 'student_progress' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('student_progress')}
              >
                <FaChartPie /> Прогрес студентів
              </button>
              <button 
                className={`chart-type-btn ${selectedChartType === 'assignment_completion' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('assignment_completion')}
              >
                <FaChartBar /> Завершення завдань
              </button>
              <button 
                className={`chart-type-btn ${selectedChartType === 'user_activity' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('user_activity')}
              >
                <FaChartLine /> Активність користувачів
              </button>
            </div>
            
            <div className="analytics-charts">
              {selectedChartType === 'enrollment_trends' && (
                <LineChart 
                  data={chartData} 
                  title="Тренди зарахувань на курси"
                  height={350}
                />
              )}
              
              {selectedChartType === 'course_popularity' && (
                <BarChart 
                  data={chartData} 
                  title="Популярність курсів"
                  height={350}
                />
              )}
              
              {selectedChartType === 'student_progress' && (
                <PieChart 
                  data={chartData} 
                  title="Розподіл прогресу студентів"
                />
              )}
              
              {selectedChartType === 'assignment_completion' && (
                <div className="assignments-completion-charts">
                  <div className="assignment-chart-row">
                    <div className="assignment-chart-card">
                      <div className="assignment-chart-header">
                        <h3>Огляд завдань</h3>
                      </div>
                      <div className="assignment-overview">
                        <div className="assignment-stat">
                          <h4>Всього завдань</h4>
                          <span>{chartData?.overview?.total_assignments || 0}</span>
                        </div>
                        <div className="assignment-stat">
                          <h4>Всього відправлень</h4>
                          <span>{chartData?.overview?.total_submissions || 0}</span>
                        </div>
                        <div className="assignment-stat">
                          <h4>Рівень завершення</h4>
                          <span>{formatPercentage(chartData?.overview?.completion_rate || 0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="assignment-chart-card">
                      <PieChart 
                        data={chartData?.submission_status?.data} 
                        title="Статус відправлень"
                      />
                    </div>
                  </div>
                  
                  <div className="assignment-chart-row">
                    <div className="assignment-chart-card">
                      <PieChart 
                        data={chartData?.submission_timing?.data} 
                        title="Своєчасність відправлень"
                      />
                    </div>
                    
                    <div className="assignment-chart-card">
                      <div className="assignment-chart-header">
                        <h3>Оцінки</h3>
                      </div>
                      <div className="assignment-grades">
                        <div className="grade-stat">
                          <h4>Середня оцінка</h4>
                          <span>{chartData?.grades?.average || 0}</span>
                        </div>
                        <div className="grade-stat">
                          <h4>Найвища оцінка</h4>
                          <span>{chartData?.grades?.highest || 0}</span>
                        </div>
                        <div className="grade-stat">
                          <h4>Найнижча оцінка</h4>
                          <span>{chartData?.grades?.lowest || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedChartType === 'user_activity' && (
                <div className="user-activity-charts">
                  <div className="activity-chart-row">
                    <LineChart 
                      data={chartData?.daily_activity} 
                      title="Щоденна активність користувачів"
                      height={300}
                    />
                  </div>
                  
                  <div className="activity-chart-row">
                    <PieChart 
                      data={chartData?.role_activity} 
                      title="Активність за ролями"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Таблиці */}
          <div className="analytics-tables-section">
            <div className="tables-header">
              <h2>Детальні дані</h2>
            </div>
            
            <div className="tables-grid">
              <DataTable 
                data={coursesData.most_popular_courses || []}
                columns={popularCoursesColumns}
                title="Найпопулярніші курси"
              />
              
              <DataTable 
                data={coursesData.recent_courses || []}
                columns={recentCoursesColumns}
                title="Нещодавно створені курси"
              />
              
              <DataTable 
                data={coursesData.courses_by_teacher || []}
                columns={teachersCoursesColumns}
                title="Курси за викладачами"
              />
              
              <DataTable 
                data={assignmentsData.assignment_details || []}
                columns={assignmentDetailsColumns}
                title="Деталі завдань"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherAnalytics;