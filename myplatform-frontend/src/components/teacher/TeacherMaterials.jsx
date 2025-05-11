import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import '../../css/teacher/TeacherMaterials.css';

import { 
  FaFileAlt, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaGraduationCap, 
  FaDownload, 
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaCalendarAlt
} from 'react-icons/fa';

function TeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        
        const coursesResponse = await axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        });
        
        if (coursesResponse.data) {
          setCourses(coursesResponse.data);
        }
        
        const materialsResponse = await axios.get(`${API_URL}/materials/`, {
          withCredentials: true
        });
        
        if (materialsResponse.data) {
          setMaterials(materialsResponse.data);
          setFilteredMaterials(materialsResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher materials data:", error);
        setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!materials.length) return;

    let results = [...materials];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(material => 
        material.title.toLowerCase().includes(query) || 
        material.description.toLowerCase().includes(query)
      );
    }

    // Apply course filter
    if (courseFilter !== 'all') {
      results = results.filter(material => 
        material.course && material.course.id.toString() === courseFilter
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      results = results.filter(material => material.type === typeFilter);
    }

    // Apply sorting
    results.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'created_at':
          return direction * (new Date(a.created_at) - new Date(b.created_at));
        case 'course':
          return direction * (a.course?.title || '').localeCompare(b.course?.title || '');
        default:
          return 0;
      }
    });

    setFilteredMaterials(results);
  }, [materials, searchQuery, courseFilter, typeFilter, sortField, sortDirection]);

  const deleteMaterial = async (materialId) => {
    try {
        
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/materials/${materialId}/delete/`, {
        withCredentials: true
      });
      
      setMaterials(materials.filter(material => material.id !== materialId));
      setConfirmDelete(null);
      
    } catch (error) {
      console.error("Error deleting material:", error);
      setError("Не вдалося видалити матеріал. Будь ласка, спробуйте пізніше.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? course.title : 'Невідомий курс';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FaFilePdf />;
      case 'doc':
      case 'docx':
        return <FaFileWord />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FaFileVideo />;
      case 'zip':
      case 'rar':
        return <FaFileArchive />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'py':
      case 'java':
        return <FaFileCode />;
      default:
        return <FaFile />;
    }
  };

  const getFileSize = (bytes) => {
    if (!bytes) return 'Невідомо';
    
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    if (bytes === 0) return '0 Б';
    
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileName = (fileUrl) => {
    if (!fileUrl) return 'Файл';
    
    const parts = fileUrl.split('/');
    let fileName = parts[parts.length - 1];
    
    try {
      fileName = decodeURIComponent(fileName);
    } catch (e) {
      console.error("Error decoding file name:", e);
    }
    
    return fileName;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (materialId) => {
    try {
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
        await axios.delete(`${API_URL}/materials/${materialId}/delete/`, {
        withCredentials: true
      });
      
      setMaterials(materials.filter(material => material.id !== materialId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting material:", error);
      setError("Не вдалося видалити матеріал. Будь ласка, спробуйте пізніше.");
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {      const response = await axios.get(`${API_URL}/materials/files/${materialId}/download/`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading material:", error);
      setError("Не вдалося завантажити матеріал. Будь ласка, спробуйте пізніше.");
    }
  };

  if (loading) {
    return (
      <div className="teacher-materials-wrapper">
        <TeacherHeader />
        <div className="teacher-materials-container">
          <TeacherSidebar />
          <div className="teacher-materials-loading">
            <FaSpinner className="loading-spinner" />
            <p>Завантаження матеріалів...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-materials-wrapper">
        <TeacherHeader />
        <div className="teacher-materials-container">
          <TeacherSidebar />
          <div className="teacher-materials-error">
            <FaExclamationTriangle />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-materials-wrapper">
      <TeacherHeader />
      <div className="teacher-materials-container">
        <TeacherSidebar />
        
        <div className="teacher-materials-content">
          <div className="materials-header">
            <h1>Навчальні матеріали</h1>
            <Link to="/teacher/materials/create" className="btn-create-material">
              <FaPlus /> Додати матеріал
            </Link>
          </div>

          <div className="materials-tools">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Пошук матеріалів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <FaFilter />
                <select 
                  value={courseFilter} 
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="all">Всі курси</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <FaFileAlt />
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Всі типи</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Word</option>
                  <option value="image">Зображення</option>
                  <option value="video">Відео</option>
                  <option value="archive">Архів</option>
                  <option value="code">Код</option>
                  <option value="other">Інше</option>
                </select>
              </div>
            </div>
          </div>

          {filteredMaterials.length > 0 ? (
            <div className="materials-grid">
              {filteredMaterials.map(material => (
                <div key={material.id} className="material-card">
                  <div className="material-icon">
                    {getFileIcon(material.type)}
                  </div>
                  
                  <div className="material-info">
                    <h3>{material.title}</h3>
                    <p className="material-description">{material.description}</p>
                    
                    <div className="material-meta">
                      <span className="course-info">
                        <FaGraduationCap />
                        {material.course?.title || 'Без курсу'}
                      </span>
                      <span className="date-info">
                        <FaCalendarAlt />
                        {formatDate(material.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="material-actions">
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/teacher/materials/${material.id}`)}
                    >
                      <FaEye /> Перегляд
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => handleDownload(material.id, material.file_name)}
                    >
                      <FaDownload /> Завантажити
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => navigate(`/teacher/materials/${material.id}/edit`)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => setConfirmDelete(material)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-materials">
              <FaFileAlt />
              <h3>Матеріали відсутні</h3>
              <p>У вас поки немає навчальних матеріалів. Натисніть кнопку "Додати матеріал" щоб створити перший матеріал.</p>
            </div>
          )}
        </div>

        {confirmDelete && (
          <div className="delete-confirmation-modal">
            <div className="delete-confirmation-content">
              <h2>Видалення матеріалу</h2>
              <p>Ви впевнені, що хочете видалити матеріал "{confirmDelete.title}"?</p>
              <div className="delete-confirmation-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Скасувати
                </button>
                <button 
                  className="btn-confirm-delete"
                  onClick={() => handleDelete(confirmDelete.id)}
                >
                  Видалити
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherMaterials;