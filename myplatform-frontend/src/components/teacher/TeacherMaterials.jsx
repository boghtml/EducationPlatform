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
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(material => 
        material.title.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query)
      );
    }
    
    if (courseFilter !== 'all') {
      results = results.filter(material => material.course.toString() === courseFilter);
    }
    
    if (typeFilter !== 'all') {
      results = results.filter(material => {
        
        return material.files?.some(file => {
          const fileType = file.file_type?.toLowerCase() || '';
          
          switch (typeFilter) {
            case 'document':
              return fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt');
            case 'image':
              return fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('gif');
            case 'video':
              return fileType.includes('mp4') || fileType.includes('avi') || fileType.includes('mov') || fileType.includes('video');
            case 'audio':
              return fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('audio');
            case 'archive':
              return fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z');
            default:
              return true;
          }
        });
      });
    }
    
    setFilteredMaterials(results);
  }, [materials, searchQuery, courseFilter, typeFilter]);

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

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    
    if (type.includes('pdf')) return <FaFilePdf />;
    if (type.includes('doc')) return <FaFileWord />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <FaFileImage />;
    if (type.includes('video') || type.includes('mp4')) return <FaFileVideo />;
    if (type.includes('zip') || type.includes('rar')) return <FaFileArchive />;
    if (type.includes('html') || type.includes('js') || type.includes('css')) return <FaFileCode />;
    
    return <FaFile />;
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
          <div className="teacher-materials-header">
            <h1>Управління матеріалами</h1>
            
            <Link to="/teacher/materials/create" className="btn-create-material">
              <FaPlus /> Додати нові матеріали
            </Link>
          </div>
          
          <div className="teacher-materials-filters">
            <div className="search-filter">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Пошук матеріалів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="course-filter">
              <FaGraduationCap className="filter-icon" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Всі курси</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="type-filter">
              <FaFilter className="filter-icon" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Всі типи</option>
                <option value="document">Документи</option>
                <option value="image">Зображення</option>
                <option value="video">Відео</option>
                <option value="audio">Аудіо</option>
                <option value="archive">Архіви</option>
              </select>
            </div>
          </div>
          
          {filteredMaterials.length === 0 ? (
            <div className="no-materials-found">
              <FaFileAlt className="no-materials-icon" />
              <h3>Матеріали не знайдено</h3>
              <p>
                {materials.length === 0
                  ? "У вас поки немає матеріалів. Додайте нові матеріали для своїх курсів."
                  : "Не знайдено матеріалів за вашим запитом. Спробуйте змінити параметри пошуку."}
              </p>
              {materials.length === 0 && (
                <Link to="/teacher/materials/create" className="btn-primary">
                  Додати матеріали
                </Link>
              )}
            </div>
          ) : (
            <div className="teacher-materials-grid">
              {filteredMaterials.map(material => (
                <div className="material-card" key={material.id}>
                  <div className="material-header">
                    <h3 className="material-title">{material.title}</h3>
                  </div>
                  
                  <div className="material-course">
                    <FaGraduationCap />
                    <span>{getCourseTitle(material.course)}</span>
                  </div>
                  
                  <div className="material-date">
                    <FaCalendarAlt />
                    <span>Додано: {formatDate(material.created_at)}</span>
                  </div>
                  
                  <div className="material-description">
                    {material.description
                      ? material.description.length > 100
                        ? `${material.description.substring(0, 100)}...`
                        : material.description
                      : 'Опис відсутній'}
                  </div>
                  
                  <div className="material-files">
                    <h4>Файли ({material.files?.length || 0})</h4>
                    <ul className="files-list">
                      {material.files?.slice(0, 3).map((file, index) => (
                        <li key={index} className="file-item">
                          <div className="file-icon">
                            {getFileIcon(file.file_type)}
                          </div>
                          <div className="file-info">
                            <div className="file-name" title={getFileName(file.file_url)}>
                              {getFileName(file.file_url)}
                            </div>
                            <div className="file-size">
                              {getFileSize(file.file_size)}
                            </div>
                          </div>
                          <a 
                            href={file.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="file-download"
                            title="Завантажити файл"
                          >
                            <FaDownload />
                          </a>
                        </li>
                      ))}
                      {material.files?.length > 3 && (
                        <li className="files-more">
                          ...і ще {material.files.length - 3} файл(ів)
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="material-actions">
                    <Link 
                      to={`/teacher/materials/${material.id}/edit`}
                      className="btn-action edit"
                      title="Редагувати матеріал"
                    >
                      <FaEdit />
                    </Link>
                    
                    <Link 
                      to={`/teacher/materials/${material.id}`}
                      className="btn-action view"
                      title="Переглянути матеріал"
                    >
                      <FaEye />
                    </Link>
                    
                    <button
                      className="btn-action delete"
                      onClick={() => setConfirmDelete(material.id)}
                      title="Видалити матеріал"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {confirmDelete && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h2>Видалити матеріал?</h2>
            <p>Ви впевнені, що хочете видалити цей матеріал? Ця дія не може бути скасована. Всі файли, пов'язані з цим матеріалом, також будуть видалені.</p>
            
            <div className="delete-confirmation-actions">
              <button 
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Скасувати
              </button>
              
              <button 
                className="btn-delete"
                onClick={() => deleteMaterial(confirmDelete)}
              >
                Видалити матеріал
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherMaterials;