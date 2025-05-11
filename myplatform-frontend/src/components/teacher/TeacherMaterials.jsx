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
  FaTimesCircle,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaInfoCircle
} from 'react-icons/fa';

// Константы и перечисления
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

// Вспомогательные компоненты
const MaterialCard = ({ material, courses, handleDownload, downloading, setConfirmDelete, getFileIcon, getFileSize, formatDate }) => {
  // Получение названия курса
  const getCourseTitle = (courseId) => {
    if (!courseId) return 'Без курсу';
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? course.title : 'Невідомий курс';
  };

  return (
    <div className="tm-material-card">
      <div className="tm-material-header">
        <h3 className="tm-material-title">{material.title}</h3>
        <div className="tm-material-course">
          <FaGraduationCap />
          <span>{getCourseTitle(material.course?.id)}</span>
        </div>
        <div className="tm-material-date">
          <FaCalendarAlt />
          <span>{formatDate(material.created_at)}</span>
        </div>
      </div>

      <p className="tm-material-description">
        {material.description || 'Без опису'}
      </p>

      {material.files && material.files.length > 0 && (
        <div className="tm-material-files">
          <h4>Файли ({material.totalFiles})</h4>
          <ul className="tm-files-list">
            {material.files.slice(0, 3).map((file, index) => (
              <li key={index} className="tm-file-item">
                <div className="tm-file-icon">
                  {getFileIcon(material.fileTypes[index])}
                </div>
                <div className="tm-file-info">
                  <div className="tm-file-name">{file.file_name}</div>
                  <div className="tm-file-size">{getFileSize(file.file_size)}</div>
                </div>
                <button 
                  className="tm-file-download"
                  onClick={() => handleDownload(material.id, file.file_name)}
                  disabled={downloading[`${material.id}-${index}`]}
                >
                  {downloading[`${material.id}-${index}`] ? 
                    <FaSpinner className="tm-loading-spinner-sm" /> : 
                    <FaDownload />
                  }
                </button>
              </li>
            ))}
          </ul>
          {material.files.length > 3 && (
            <div className="tm-files-more">
              +{material.files.length - 3} файлів. Перегляньте деталі матеріалу.
            </div>
          )}
        </div>
      )}

      <div className="tm-material-actions">
        <Link
          to={`/teacher/materials/${material.id}`}
          className="tm-btn-action tm-view"
          title="Переглянути матеріал"
        >
          <FaEye />
        </Link>
        
        <button 
          className="tm-btn-action tm-download"
          onClick={() => handleDownload(material.id, material.title)}
          disabled={downloading[material.id]}
          title="Завантажити всі файли"
        >
          {downloading[material.id] ? 
            <FaSpinner className="tm-loading-spinner-sm" /> : 
            <FaDownload />
          }
        </button>
        
        <Link
          to={`/teacher/materials/${material.id}/edit`}
          className="tm-btn-action tm-edit"
          title="Редагувати матеріал"
        >
          <FaEdit />
        </Link>
        
        <button 
          className="tm-btn-action tm-delete"
          onClick={() => setConfirmDelete(material)}
          title="Видалити матеріал"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// Модальное окно подтверждения удаления
const DeleteConfirmationModal = ({ material, onCancel, onConfirm }) => (
  <div className="tm-delete-confirmation-modal">
    <div className="tm-delete-confirmation-content">
      <h2>Видалення матеріалу</h2>
      <p>
        Ви впевнені, що хочете видалити матеріал <strong>"{material.title}"</strong>?
        Всі файли та дані пов'язані з цим матеріалом будуть видалені назавжди.
      </p>
      <div className="tm-delete-confirmation-actions">
        <button 
          className="tm-btn-cancel"
          onClick={onCancel}
        >
          Скасувати
        </button>
        <button 
          className="tm-btn-delete"
          onClick={() => onConfirm(material.id)}
        >
          <FaTrash /> Видалити матеріал
        </button>
      </div>
    </div>
  </div>
);

// Состояние загрузки
const LoadingState = () => (
  <div className="tm-teacher-materials-wrapper">
    <TeacherHeader />
    <div className="tm-teacher-materials-container">
      <TeacherSidebar />
      <div className="tm-teacher-materials-loading">
        <FaSpinner className="tm-loading-spinner" />
        <p>Завантаження матеріалів...</p>
      </div>
    </div>
  </div>
);

// Состояние ошибки
const ErrorState = ({ error, onRetry }) => (
  <div className="tm-teacher-materials-wrapper">
    <TeacherHeader />
    <div className="tm-teacher-materials-container">
      <TeacherSidebar />
      <div className="tm-teacher-materials-error">
        <FaExclamationTriangle />
        <h3>Помилка завантаження</h3>
        <p>{error}</p>
        <button 
          className="tm-btn-primary"
          onClick={onRetry}
        >
          Спробувати знову
        </button>
      </div>
    </div>
  </div>
);

// Пустое состояние (нет материалов)
const EmptyState = ({ isEmpty, onClearFilters }) => (
  <div className="tm-no-materials-found">
    <div className="tm-no-materials-icon"><FaFileAlt /></div>
    <h3>
      {isEmpty 
        ? 'Матеріали відсутні'
        : 'Немає матеріалів за вашим запитом'
      }
    </h3>
    <p>
      {isEmpty 
        ? 'У вас поки немає навчальних матеріалів. Натисніть кнопку "Додати матеріал" щоб створити перший матеріал.'
        : 'Спробуйте змінити параметри пошуку або очистити фільтри.'
      }
    </p>
    {isEmpty ? (
      <Link to="/teacher/materials/create" className="tm-btn-primary">
        <FaPlus /> Додати перший матеріал
      </Link>
    ) : (
      <button className="tm-btn-primary" onClick={onClearFilters}>
        <FaTimesCircle /> Очистити фільтри
      </button>
    )}
  </div>
);

// Основной компонент
function TeacherMaterials() {
  // Состояние компонента
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(FILE_TYPES.ALL);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.DATE_DESC);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const navigate = useNavigate();

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  // Debounced search - отложенное обновление поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  // Функция загрузки данных
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получение CSRF-токена
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Параллельная загрузка курсов и материалов
      const [coursesResponse, materialsResponse] = await Promise.all([
        axios.get(`${API_URL}/courses/`, {
          withCredentials: true,
          params: { teacher_id: sessionStorage.getItem('userId') }
        }),
        axios.get(`${API_URL}/materials/`, {
          withCredentials: true
        })
      ]);
      
      // Обработка данных о курсах
      setCourses(coursesResponse.data || []);
      
      // Обработка данных о материалах, расширение информацией о файлах
      const processedMaterials = (materialsResponse.data || []).map(material => ({
        ...material,
        totalFiles: material.files?.length || 0,
        totalSize: material.files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0,
        fileTypes: material.files?.map(file => {
          const type = file.file_type?.toLowerCase() || '';
          if (type.includes('pdf')) return FILE_TYPES.PDF;
          if (type.includes('doc') || type.includes('docx')) return FILE_TYPES.DOC;
          if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg')) return FILE_TYPES.IMAGE;
          if (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi')) return FILE_TYPES.VIDEO;
          if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) return FILE_TYPES.ARCHIVE;
          if (type.includes('js') || type.includes('py') || type.includes('java') || 
             type.includes('html') || type.includes('css') || type.includes('php')) return FILE_TYPES.CODE;
          return FILE_TYPES.OTHER;
        }) || [],
        // Добавляем сгруппированную информацию о типах файлов для фильтрации
        hasFileType: (fileType) => {
          if (!material.files || material.files.length === 0) return false;
          return material.files.some(file => {
            const type = file.file_type?.toLowerCase() || '';
            switch (fileType) {
              case FILE_TYPES.PDF: return type.includes('pdf');
              case FILE_TYPES.DOC: return type.includes('doc') || type.includes('docx');
              case FILE_TYPES.IMAGE: return type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg');
              case FILE_TYPES.VIDEO: return type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi');
              case FILE_TYPES.ARCHIVE: return type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar');
              case FILE_TYPES.CODE: return type.includes('js') || type.includes('py') || type.includes('java') || 
                                         type.includes('html') || type.includes('css') || type.includes('php');
              default: return true;
            }
          });
        }
      }));
      
      setMaterials(processedMaterials);
    } catch (error) {
      console.error("Error fetching teacher materials data:", error);
      setError("Не вдалося завантажити дані. Будь ласка, спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  // Мемоизированная отфильтрованная и отсортированная коллекция материалов
  const filteredAndSortedMaterials = useMemo(() => {
    let results = [...materials];

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(material => {
        const courseTitle = getCourseTitle(material.course?.id);
        return material.title?.toLowerCase().includes(query) || 
               material.description?.toLowerCase().includes(query) ||
               courseTitle.toLowerCase().includes(query) ||
               material.files?.some(file => file.file_name?.toLowerCase().includes(query));
      });
    }

    // Фильтрация по курсу
    if (courseFilter && courseFilter !== 'all') {
      results = results.filter(material => 
        material.course?.id?.toString() === courseFilter
      );
    }

    // Фильтрация по типу файлов
    if (typeFilter && typeFilter !== FILE_TYPES.ALL) {
      results = results.filter(material => 
        material.hasFileType(typeFilter)
      );
    }

    // Сортировка с учетом выбранного параметра
    results.sort((a, b) => {
      const aCourse = getCourseTitle(a.course?.id);
      const bCourse = getCourseTitle(b.course?.id);
      
      switch (sortOption) {
        case SORT_OPTIONS.TITLE_ASC:
          return (a.title || '').localeCompare(b.title || '');
        case SORT_OPTIONS.TITLE_DESC:
          return (b.title || '').localeCompare(a.title || '');
        case SORT_OPTIONS.DATE_ASC:
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case SORT_OPTIONS.DATE_DESC:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case SORT_OPTIONS.COURSE_ASC:
          return aCourse.localeCompare(bCourse);
        case SORT_OPTIONS.COURSE_DESC:
          return bCourse.localeCompare(aCourse);
        case SORT_OPTIONS.SIZE_ASC:
          return (a.totalSize || 0) - (b.totalSize || 0);
        case SORT_OPTIONS.SIZE_DESC:
          return (b.totalSize || 0) - (a.totalSize || 0);
        default:
          return 0;
      }
    });

    return results;
  }, [materials, searchQuery, courseFilter, typeFilter, sortOption]);

  // Функция удаления материала
  const deleteMaterial = async (materialId) => {
    try {
      setLoading(true);
      
      // Получение CSRF-токена
      await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      
      // Запрос на удаление материала
      await axios.delete(`${API_URL}/materials/${materialId}/delete/`, {
        withCredentials: true
      });
      
      // Обновление состояния
      setMaterials(materials.filter(material => material.id !== materialId));
      setConfirmDelete(null);
      
      // Отображение уведомления об успешном удалении
      alert("Матеріал успішно видалено");
    } catch (error) {
      console.error("Error deleting material:", error);
      setError("Не вдалося видалити матеріал. Будь ласка, спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки файла
  const handleDownload = async (materialId, fileName, fileIndex) => {
    const downloadId = fileIndex !== undefined ? `${materialId}-${fileIndex}` : materialId;
    
    try {
      setDownloading(prev => ({ ...prev, [downloadId]: true }));
      
      // Запрос на загрузку файла
      const response = await axios.get(`${API_URL}/materials/files/${materialId}/download/`, {
        responseType: 'blob',
        withCredentials: true,
        params: { file_name: fileName }
      });
      
      // Создание и активация ссылки для загрузки
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
      alert("Не вдалося завантажити файл. Будь ласка, спробуйте пізніше.");
    } finally {
      setDownloading(prev => ({ ...prev, [downloadId]: false }));
    }
  };

  // Очистка фильтров
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCourseFilter('all');
    setTypeFilter(FILE_TYPES.ALL);
    setSortOption(SORT_OPTIONS.DATE_DESC);
  }, []);

  // Форматирование даты
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Не вказано';
    
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Получение названия курса
  const getCourseTitle = useCallback((courseId) => {
    if (!courseId) return 'Без курсу';
    const course = courses.find(c => c.id === parseInt(courseId));
    return course ? course.title : 'Невідомий курс';
  }, [courses]);

  // Получение иконки для типа файла
  const getFileIcon = useCallback((type) => {
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
  }, []);

  // Форматирование размера файла
  const getFileSize = useCallback((bytes) => {
    if (!bytes) return '0 Б';
    
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    if (bytes === 0) return '0 Б';
    
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  // Если данные загружаются, отображаем состояние загрузки
  if (loading) {
    return <LoadingState />;
  }

  // Если есть ошибка, отображаем состояние ошибки
  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  // Проверка активных фильтров
  const isFilterActive = searchQuery || courseFilter !== 'all' || typeFilter !== FILE_TYPES.ALL || sortOption !== SORT_OPTIONS.DATE_DESC;

  // Основной рендер
  return (
    <div className="tm-teacher-materials-wrapper">
      <TeacherHeader />
      <div className="tm-teacher-materials-container">
        <TeacherSidebar />
        
        <div className="tm-teacher-materials-content">
          {/* Шапка с заголовком и кнопкой создания */}
          <div className="tm-teacher-materials-header">
            <h1>Навчальні матеріали</h1>
            <Link to="/teacher/materials/create" className="tm-btn-create-material">
              <FaPlus /> Додати матеріал
            </Link>
          </div>

          {/* Фильтры и поиск */}
          <div className="tm-teacher-materials-filters">
            <div className="tm-search-filter">
              <div className="tm-search-input-container">
                <FaSearch className="tm-search-icon" />
                <input
                  type="text"
                  className="tm-search-input"
                  placeholder="Пошук матеріалів за назвою, описом або курсом..."
                  value={debouncedSearch}
                  onChange={(e) => setDebouncedSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="tm-course-filter">
              <FaGraduationCap className="tm-filter-icon" />
              <select 
                className="tm-filter-select"
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

            <div className="tm-type-filter">
              <FaFileAlt className="tm-filter-icon" />
              <select 
                className="tm-filter-select"
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value={FILE_TYPES.ALL}>Всі типи файлів</option>
                <option value={FILE_TYPES.PDF}>PDF документи</option>
                <option value={FILE_TYPES.DOC}>Word документи</option>
                <option value={FILE_TYPES.IMAGE}>Зображення</option>
                <option value={FILE_TYPES.VIDEO}>Відео</option>
                <option value={FILE_TYPES.ARCHIVE}>Архіви</option>
                <option value={FILE_TYPES.CODE}>Код</option>
                <option value={FILE_TYPES.OTHER}>Інше</option>
              </select>
            </div>

            <div className="tm-sort-filter">
              <FaSort className="tm-filter-icon" />
              <select 
                className="tm-filter-select"
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value={SORT_OPTIONS.DATE_DESC}>За датою (найновіші)</option>
                <option value={SORT_OPTIONS.DATE_ASC}>За датою (найстаріші)</option>
                <option value={SORT_OPTIONS.TITLE_ASC}>За назвою (А-Я)</option>
                <option value={SORT_OPTIONS.TITLE_DESC}>За назвою (Я-А)</option>
                <option value={SORT_OPTIONS.COURSE_ASC}>За курсом (А-Я)</option>
                <option value={SORT_OPTIONS.COURSE_DESC}>За курсом (Я-А)</option>
                <option value={SORT_OPTIONS.SIZE_ASC}>За розміром (найменші)</option>
                <option value={SORT_OPTIONS.SIZE_DESC}>За розміром (найбільші)</option>
              </select>
            </div>

            {isFilterActive && (
              <button 
                className="tm-btn-clear-filters"
                onClick={clearFilters}
              >
                <FaTimesCircle /> Очистити фільтри
              </button>
            )}
          </div>

          {/* Информация о количестве найденных материалов */}
          <div className="tm-filter-summary">
            <div className="tm-filter-count">
              <FaInfoCircle />
              <span>
                Знайдено: <strong>{filteredAndSortedMaterials.length}</strong> з {materials.length} матеріалів
              </span>
            </div>
            {isFilterActive && (
              <div className="tm-filter-active">
                <FaFilter />
                <span>Активні фільтри</span>
              </div>
            )}
          </div>

          {/* Отображение материалов или пустого состояния */}
          {filteredAndSortedMaterials.length > 0 ? (
            <div className="tm-teacher-materials-grid">
              {filteredAndSortedMaterials.map(material => (
                <MaterialCard 
                  key={material.id}
                  material={material}
                  courses={courses}
                  handleDownload={handleDownload}
                  downloading={downloading}
                  setConfirmDelete={setConfirmDelete}
                  getFileIcon={getFileIcon}
                  getFileSize={getFileSize}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              isEmpty={materials.length === 0}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {confirmDelete && (
        <DeleteConfirmationModal 
          material={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={deleteMaterial}
        />
      )}
    </div>
  );
}

export default TeacherMaterials;