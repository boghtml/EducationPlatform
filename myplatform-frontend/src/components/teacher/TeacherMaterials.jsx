import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FaCalendarAlt,
  FaTimesCircle
} from 'react-icons/fa';

const SORT_OPTIONS = {
  TITLE_ASC: 'title_asc',
  TITLE_DESC: 'title_desc',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  COURSE_ASC: 'course_asc',
  COURSE_DESC: 'course_desc',
  SIZE_ASC: 'size_asc',
  SIZE_DESC: 'size_desc'
};

const FILE_TYPES = {
  ALL: 'all',
  PDF: 'pdf',
  DOC: 'doc',
  IMAGE: 'image',
  VIDEO: 'video',
  ARCHIVE: 'archive',
  CODE: 'code',
  OTHER: 'other'
};

function TeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(FILE_TYPES.ALL);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.DATE_DESC);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [deletingFile, setDeletingFile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      const [coursesResponse, materialsResponse] = await Promise.all([
        axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        }),
        axios.get(`${API_URL}/materials/`, {
          withCredentials: true
        })
      ]);
      
      setCourses(coursesResponse.data || []);
      
      // Обробка матеріалів з розширеною інформацією про файли
      const processedMaterials = materialsResponse.data?.map(material => ({
        ...material,
        totalFiles: material.files?.length || 0,
        totalSize: material.files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0,
        fileTypes: material.files?.map(file => {
          const type = file.file_type || '';
          if (type.includes('pdf')) return FILE_TYPES.PDF;
          if (type.includes('doc') || type.includes('docx')) return FILE_TYPES.DOC;
          if (type.includes('image') || type.includes('jpg') || type.includes('png')) return FILE_TYPES.IMAGE;
          if (type.includes('video') || type.includes('mp4')) return FILE_TYPES.VIDEO;
          if (type.includes('zip') || type.includes('rar')) return FILE_TYPES.ARCHIVE;
          if (type.includes('js') || type.includes('py') || type.includes('java')) return FILE_TYPES.CODE;
          return FILE_TYPES.OTHER;
        }) || []
      }));
      
      setMaterials(processedMaterials || []);
    } catch (error) {
      console.error("Error fetching teacher materials data:", error);
      setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  // Оптимізована логіка фільтрації з використанням useMemo
  const filteredAndSortedMaterials = useMemo(() => {
    let results = [...materials];

    // Пошук
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(material => 
        material.title.toLowerCase().includes(query) || 
        material.description?.toLowerCase().includes(query) ||
        getCourseTitle(material.course?.id).toLowerCase().includes(query)
      );
    }

    // Фільтр по курсу
    if (courseFilter && courseFilter !== 'all') {
      results = results.filter(material => 
        material.course?.id?.toString() === courseFilter
      );
    }

    // Фільтр по типу файлів
    if (typeFilter && typeFilter !== FILE_TYPES.ALL) {
      results = results.filter(material => 
        material.fileTypes?.includes(typeFilter)
      );
    }

    // Сортування
    results.sort((a, b) => {
      switch (sortOption) {
        case SORT_OPTIONS.TITLE_ASC:
          return a.title.localeCompare(b.title);
        case SORT_OPTIONS.TITLE_DESC:
          return b.title.localeCompare(a.title);
        case SORT_OPTIONS.DATE_ASC:
          return new Date(a.created_at) - new Date(b.created_at);
        case SORT_OPTIONS.DATE_DESC:
          return new Date(b.created_at) - new Date(a.created_at);
        case SORT_OPTIONS.COURSE_ASC:
          return getCourseTitle(a.course?.id).localeCompare(getCourseTitle(b.course?.id));
        case SORT_OPTIONS.COURSE_DESC:
          return getCourseTitle(b.course?.id).localeCompare(getCourseTitle(a.course?.id));
        case SORT_OPTIONS.SIZE_ASC:
          return a.totalSize - b.totalSize;
        case SORT_OPTIONS.SIZE_DESC:
          return b.totalSize - a.totalSize;
        default:
          return 0;
      }
    });

    return results;
  }, [materials, searchQuery, courseFilter, typeFilter, sortOption]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const deleteMaterial = async (materialId) => {
    try {
      setLoading(true);
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      await axios.delete(`${API_URL}/materials/${materialId}/delete/`, {
        withCredentials: true
      });
      
      setMaterials(materials.filter(material => material.id !== materialId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting material:", error);
      setError("Не вдалося видалити матеріал. Будь ласка, спробуйте пізніше.");
    } finally {
      setLoading(false);
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
    if (!courseId) return 'Без курсу';
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? course.title : 'Невідомий курс';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case FILE_TYPES.PDF:
        return <FaFilePdf />;
      case FILE_TYPES.DOC:
        return <FaFileWord />;
      case FILE_TYPES.IMAGE:
        return <FaFileImage />;
      case FILE_TYPES.VIDEO:
        return <FaFileVideo />;
      case FILE_TYPES.ARCHIVE:
        return <FaFileArchive />;
      case FILE_TYPES.CODE:
        return <FaFileCode />;
      default:
        return <FaFile />;
    }
  };

  const getFileSize = (bytes) => {
    if (!bytes) return '0 Б';
    
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    if (bytes === 0) return '0 Б';
    
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      setDownloading(prev => ({ ...prev, [materialId]: true }));
      
      const response = await axios.get(`${API_URL}/materials/files/${materialId}/download/`, {
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
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading material:", error);
      setError("Не вдалося завантажити файл. Будь ласка, спробуйте пізніше.");
    } finally {
      setDownloading(prev => ({ ...prev, [materialId]: false }));
    }
  };

  const handleSort = (newSortOption) => {
    setSortOption(newSortOption);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCourseFilter('all');
    setTypeFilter(FILE_TYPES.ALL);
    setSortOption(SORT_OPTIONS.DATE_DESC);
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
              onClick={fetchData}
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
                placeholder="       Пошук матеріалів за назвою, описом або курсом..."
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
              />
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <FaGraduationCap />
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
                  <option value={FILE_TYPES.ALL}>Всі типи</option>
                  <option value={FILE_TYPES.PDF}>PDF документи</option>
                  <option value={FILE_TYPES.DOC}>Word документи</option>
                  <option value={FILE_TYPES.IMAGE}>Зображення</option>
                  <option value={FILE_TYPES.VIDEO}>Відео</option>
                  <option value={FILE_TYPES.ARCHIVE}>Архіви</option>
                  <option value={FILE_TYPES.CODE}>Код</option>
                  <option value={FILE_TYPES.OTHER}>Інше</option>
                </select>
              </div>

              <div className="filter-group">
                <FaFilter />
                <select 
                  value={sortOption} 
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value={SORT_OPTIONS.DATE_DESC}>Найновіші</option>
                  <option value={SORT_OPTIONS.DATE_ASC}>Найстаріші</option>
                  <option value={SORT_OPTIONS.TITLE_ASC}>За назвою (А-Я)</option>
                  <option value={SORT_OPTIONS.TITLE_DESC}>За назвою (Я-А)</option>
                  <option value={SORT_OPTIONS.COURSE_ASC}>За курсом (А-Я)</option>
                  <option value={SORT_OPTIONS.COURSE_DESC}>За курсом (Я-А)</option>
                  <option value={SORT_OPTIONS.SIZE_ASC}>За розміром (↑)</option>
                  <option value={SORT_OPTIONS.SIZE_DESC}>За розміром (↓)</option>
                </select>
              </div>

              {(searchQuery || courseFilter !== 'all' || typeFilter !== FILE_TYPES.ALL || sortOption !== SORT_OPTIONS.DATE_DESC) && (
                <button className="btn-clear-filters" onClick={clearFilters}>
                  <FaTimesCircle /> Очистити фільтри
                </button>
              )}
            </div>

            <div className="filter-summary">
              <span>
                Знайдено: <strong>{filteredAndSortedMaterials.length}</strong> з {materials.length} матеріалів
              </span>
              {filteredAndSortedMaterials.length !== materials.length && (
                <span className="filter-active">Фільтри активні</span>
              )}
            </div>
          </div>

          {filteredAndSortedMaterials.length > 0 ? (
            <div className="materials-grid">
              {filteredAndSortedMaterials.map(material => (
                <div key={material.id} className="material-card">
                  <div className="material-icon">
                    {material.files?.length > 0 ? 
                      getFileIcon(material.fileTypes[0]) : 
                      <FaFileAlt />
                    }
                  </div>
                  
                  <div className="material-info">
                    <h3>{material.title}</h3>
                    <p className="material-description">
                      {material.description || 'Без опису'}
                    </p>
                    
                    <div className="material-meta">
                      <div className="course-info">
                        <FaGraduationCap />
                        <span>{getCourseTitle(material.course?.id)}</span>
                      </div>
                      <div className="date-info">
                        <FaCalendarAlt />
                        <span>{formatDate(material.created_at)}</span>
                      </div>
                      <div className="files-info">
                        <FaFile />
                        <span>{material.totalFiles} файл(ів) · {getFileSize(material.totalSize)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="material-actions">
                    <Link
                      to={`/teacher/materials/${material.id}`}
                      className="btn-view"
                      title="Переглянути матеріал"
                    >
                      <FaEye />
                    </Link>
                    
                    <button 
                      className="btn-download"
                      onClick={() => handleDownload(material.id, material.title)}
                      disabled={downloading[material.id]}
                      title="Завантажити всі файли"
                    >
                      {downloading[material.id] ? <FaSpinner className="loading-spinner-small" /> : <FaDownload />}
                    </button>
                    
                    <Link
                      to={`/teacher/materials/${material.id}/edit`}
                      className="btn-edit"
                      title="Редагувати матеріал"
                    >
                      <FaEdit />
                    </Link>
                    
                    <button 
                      className="btn-delete"
                      onClick={() => setConfirmDelete(material)}
                      title="Видалити матеріал"
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
              <h3>
                {materials.length === 0 
                  ? 'Матеріали відсутні'
                  : 'Немає матеріалів за вашим запитом'
                }
              </h3>
              <p>
                {materials.length === 0 
                  ? 'У вас поки немає навчальних матеріалів. Натисніть кнопку "Додати матеріал" щоб створити перший матеріал.'
                  : 'Спробуйте змінити параметри пошуку або очистити фільтри.'
                }
              </p>
              {materials.length === 0 ? (
                <Link to="/teacher/materials/create" className="btn-primary">
                  <FaPlus /> Додати перший матеріал
                </Link>
              ) : (
                <button className="btn-primary" onClick={clearFilters}>
                  <FaTimesCircle /> Очистити фільтри
                </button>
              )}
            </div>
          )}
        </div>

        {confirmDelete && (
          <div className="delete-confirmation-modal">
            <div className="delete-confirmation-content">
              <h2>Видалення матеріалу</h2>
              <p>
                Ви впевнені, що хочете видалити матеріал <strong>"{confirmDelete.title}"</strong>?
                Всі файли та дані пов'язані з цим матеріалом будуть видалені назавжди.
              </p>
              <div className="delete-confirmation-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Скасувати
                </button>
                <button 
                  className="btn-confirm-delete"
                  onClick={() => deleteMaterial(confirmDelete.id)}
                >
                  <FaTrash /> Видалити матеріал
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