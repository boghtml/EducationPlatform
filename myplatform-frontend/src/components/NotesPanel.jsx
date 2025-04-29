import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Edit,
  Save,
  Trash2,
  Plus,
  X,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
  RefreshCw,
} from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';
import API_URL from '../api';
import '../css/NotesPanel.css';

const NotesPanel = ({ lessonId, courseId, isOpen, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const notePanelRef = useRef(null);

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-csrf-token/`, { withCredentials: true });
      if (response.data && response.data.csrftoken) {
        axios.defaults.headers.common['X-CSRFToken'] = response.data.csrftoken;
        return response.data.csrftoken;
      }
    } catch (error) {
      console.error('Помилка отримання CSRF-токену:', error);
    }
    return null;
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotesAndFolders();
    }
  }, [isOpen, lessonId]);

  const fetchNotesAndFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      await getCsrfToken();

      const [foldersResponse, notesResponse] = await Promise.all([
        axios.get(`${API_URL}/notes/folders/`, { withCredentials: true }),
        axios.get(`${API_URL}/notes/`, { withCredentials: true }),
      ]);

      const filteredNotes = lessonId
        ? notesResponse.data.filter((note) => note.lesson_id === parseInt(lessonId))
        : notesResponse.data;

      setFolders(foldersResponse.data || []);
      setNotes(filteredNotes || []);

      const expanded = {};
      foldersResponse.data.forEach((folder) => {
        expanded[folder.id] = true;
      });
      setExpandedFolders(expanded);

      setLoading(false);
    } catch (error) {
      console.error('Помилка завантаження нотаток:', error);
      setError('Не вдалося завантажити нотатки. Спробуйте знову.');
      setLoading(false);
    }
  };

  const createNewNote = async () => {
    if (!isCreatingNote) {
      setIsCreatingNote(true);
      setActiveNote(null);
      setEditTitle('Нова нотатка');
      setEditContent('');
      setIsEditing(true);
      return;
    }

    if (!editTitle.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }

    try {
      setSaveStatus('saving');
      await getCsrfToken();

      const noteData = {
        title: editTitle,
        content: editContent,
        folder_id: activeFolder,
        lesson_id: lessonId,
      };

      const response = await axios.post(`${API_URL}/notes/create/`, noteData, {
        withCredentials: true,
      });

      setNotes((prevNotes) => [...prevNotes, response.data]);
      setActiveNote(response.data.id);
      setIsCreatingNote(false);
      setIsEditing(false);
      setSaveStatus('saved');

      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Помилка створення нотатки:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const updateNote = async () => {
    if (!activeNote) return;

    if (!editTitle.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
      return;
    }

    try {
      setSaveStatus('saving');
      await getCsrfToken();

      const noteData = {
        title: editTitle,
        content: editContent,
        folder_id: activeFolder,
      };

      const response = await axios.put(`${API_URL}/notes/${activeNote}/`, noteData, {
        withCredentials: true,
      });

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === activeNote
            ? { ...note, title: editTitle, content: editContent, folder_id: activeFolder }
            : note
        )
      );

      setIsEditing(false);
      setSaveStatus('saved');

      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Помилка оновлення нотатки:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const deleteNote = async () => {
    if (!itemToDelete) return;

    try {
      await getCsrfToken();
      await axios.delete(`${API_URL}/notes/${itemToDelete}/`, {
        withCredentials: true,
      });

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== itemToDelete));

      if (activeNote === itemToDelete) {
        setActiveNote(null);
        setIsEditing(false);
      }
      setShowDeleteNoteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Помилка видалення нотатки:', error);
      alert('Не вдалося видалити нотатку. Спробуйте знову.');
    }
  };

  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Назва папки не може бути порожньою');
      return;
    }

    try {
      await getCsrfToken();

      const folderData = {
        name: newFolderName,
      };

      const response = await axios.post(`${API_URL}/notes/folders/create/`, folderData, {
        withCredentials: true,
      });

      setFolders((prevFolders) => [...prevFolders, response.data]);
      setIsCreatingFolder(false);
      setNewFolderName('');

      setExpandedFolders((prev) => ({
        ...prev,
        [response.data.id]: true,
      }));
    } catch (error) {
      console.error('Помилка створення папки:', error);
      alert('Не вдалося створити папку. Спробуйте знову.');
    }
  };

  const deleteFolder = async () => {
    if (!itemToDelete) return;

    try {
      await getCsrfToken();
      await axios.delete(`${API_URL}/notes/folders/${itemToDelete}/`, {
        withCredentials: true,
      });

      setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== itemToDelete));

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.folder_id === itemToDelete ? { ...note, folder_id: null } : note
        )
      );

      if (activeFolder === itemToDelete) {
        setActiveFolder(null);
      }
      setShowDeleteFolderDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Помилка видалення папки:', error);
      alert('Не вдалося видалити папку. Спробуйте знову.');
    }
  };

  const selectNote = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNote(noteId);
      setEditTitle(note.title);
      setEditContent(note.content);
      setActiveFolder(note.folder_id);
      setIsEditing(false);
      setIsCreatingNote(false);
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      if (isCreatingNote) {
        createNewNote();
      } else {
        updateNote();
      }
    } else {
      setIsEditing(true);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const moveNoteToFolder = async (noteId, folderId) => {
    try {
      await getCsrfToken();

      const noteData = {
        folder_id: folderId,
      };

      await axios.put(`${API_URL}/notes/${noteId}/`, noteData, {
        withCredentials: true,
      });

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, folder_id: folderId } : note
        )
      );

      if (activeNote === noteId) {
        setActiveFolder(folderId);
      }
    } catch (error) {
      console.error('Помилка переміщення нотатки:', error);
      alert('Не вдалося перемістити нотатку. Спробуйте знову.');
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUngroupedNotes = () => {
    return filteredNotes.filter((note) => !note.folder_id);
  };

  const getNotesForFolder = (folderId) => {
    return filteredNotes.filter((note) => note.folder_id === folderId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notePanelRef.current && !notePanelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="notes-panel-overlay">
      <div className="notes-panel" ref={notePanelRef}>
        <div className="notes-panel-header">
          <h2>
            <BookOpen size={20} /> Мої нотатки
          </h2>
          <button className="notes-panel-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="notes-panel-content">
          <div className="notes-panel-sidebar">
            <div className="notes-panel-actions">
              <div className="notes-search">
                <input
                  type="text"
                  placeholder="Пошук нотаток..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="notes-actions-buttons">
                <button
                  className="notes-action-btn"
                  onClick={() => setIsCreatingNote(true)}
                  title="Нова нотатка"
                >
                  <Plus size={16} />
                </button>
                <button
                  className="notes-action-btn"
                  onClick={() => setIsCreatingFolder(true)}
                  title="Нова папка"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
            </div>

            {isCreatingFolder && (
              <div className="create-folder-form">
                <input
                  type="text"
                  placeholder="Назва папки"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
                <div className="create-folder-actions">
                  <button className="create-folder-btn" onClick={createNewFolder}>
                    Створити
                  </button>
                  <button
                    className="cancel-folder-btn"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }}
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="notes-loading">
                <RefreshCw className="loading-icon" size={20} />
                <span>Завантаження...</span>
              </div>
            ) : error ? (
              <div className="notes-error">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            ) : (
              <div className="notes-list-container">
                {folders.length > 0 && (
                  <div className="notes-folders">
                    {folders.map((folder) => {
                      const folderNotes = getNotesForFolder(folder.id);
                      return (
                        <div key={folder.id} className="notes-folder">
                          <div className="folder-header" onClick={() => toggleFolder(folder.id)}>
                            {expandedFolders[folder.id] ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            <Folder size={16} />
                            <span className="folder-name">{folder.name}</span>
                            <button
                              className="folder-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(folder.id);
                                setShowDeleteFolderDialog(true);
                              }}
                              title="Видалити папку"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {expandedFolders[folder.id] && (
                            <div className="folder-notes">
                              {folderNotes.length > 0 ? (
                                folderNotes.map((note) => (
                                  <div
                                    key={note.id}
                                    className={`note-item ${activeNote === note.id ? 'active' : ''}`}
                                    onClick={() => selectNote(note.id)}
                                  >
                                    <div className="note-item-content">
                                      <span className="note-title">{note.title}</span>
                                      <span className="note-date">{formatDate(note.updated_at)}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="no-notes-message">
                                  <span>Немає нотаток у цій папці</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="ungrouped-notes">
                  <div className="ungrouped-header">
                    <span>Всі нотатки</span>
                  </div>
                  {getUngroupedNotes().length > 0 ? (
                    <div className="ungrouped-list">
                      {getUngroupedNotes().map((note) => (
                        <div
                          key={note.id}
                          className={`note-item ${activeNote === note.id ? 'active' : ''}`}
                          onClick={() => selectNote(note.id)}
                        >
                          <div className="note-item-content">
                            <span className="note-title">{note.title}</span>
                            <span className="note-date">{formatDate(note.updated_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-notes-message">
                      <span>Немає некатегоризованих нотаток</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="notes-panel-editor">
            {isCreatingNote || activeNote ? (
              <>
                <div className="editor-header">
                  {isEditing ? (
                    <input
                      type="text"
                      className="note-title-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Назва нотатки"
                    />
                  ) : (
                    <h3>{editTitle}</h3>
                  )}

                  <div className="editor-actions">
                    {!isCreatingNote && activeNote && (
                      <div className="folder-select-container">
                        <select
                          value={activeFolder || ''}
                          onChange={(e) =>
                            moveNoteToFolder(activeNote, e.target.value === '' ? null : parseInt(e.target.value))
                          }
                          disabled={isEditing}
                        >
                          <option value="">Без папки</option>
                          {folders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      className="editor-action-btn"
                      onClick={toggleEditing}
                      title={isEditing ? 'Зберегти' : 'Редагувати'}
                    >
                      {isEditing ? <Save size={16} /> : <Edit size={16} />}
                    </button>

                    {!isCreatingNote && activeNote && (
                      <button
                        className="editor-action-btn delete"
                        onClick={() => {
                          setItemToDelete(activeNote);
                          setShowDeleteNoteDialog(true);
                        }}
                        title="Видалити"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="editor-content">
                  {isEditing ? (
                    <textarea
                      className="note-content-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Вміст нотатки"
                    />
                  ) : (
                    <div className="note-content">{editContent}</div>
                  )}
                </div>

                {saveStatus && (
                  <div className={`save-status ${saveStatus}`}>
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Збереження...</span>
                      </>
                    )}
                    {saveStatus === 'saved' && (
                      <>
                        <Check size={14} />
                        <span>Збережено</span>
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <AlertTriangle size={14} />
                        <span>Помилка збереження</span>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="no-note-selected">
                <BookOpen size={48} />
                <h3>Немає вибраної нотатки</h3>
                <p>Виберіть існуючу або створіть нову нотатку</p>
                <button className="create-note-btn" onClick={() => setIsCreatingNote(true)}>
                  <Plus size={16} />
                  Створити нотатку
                </button>
              </div>
            )}
          </div>
        </div>

        <ConfirmationDialog
          isOpen={showDeleteNoteDialog}
          onClose={() => {
            setShowDeleteNoteDialog(false);
            setItemToDelete(null);
          }}
          onConfirm={deleteNote}
          title="Видалити нотатку"
          message="Ви впевнені, що хочете видалити цю нотатку?"
        />

        <ConfirmationDialog
          isOpen={showDeleteFolderDialog}
          onClose={() => {
            setShowDeleteFolderDialog(false);
            setItemToDelete(null);
          }}
          onConfirm={deleteFolder}
          title="Видалити папку"
          message="Ви впевнені, що хочете видалити цю папку? Усі нотатки в цій папці будуть переміщені до загального списку."
        />
      </div>
    </div>
  );
};

export default NotesPanel;