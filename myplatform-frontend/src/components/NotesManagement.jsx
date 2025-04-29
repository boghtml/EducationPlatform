import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen,
  FolderPlus,
  Plus,
  Search,
  Folder,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationDialog from './ConfirmationDialog';
import API_URL from '../api';
import Header from './Header';
import '../css/NotesManagement.css';

function NotesManagement() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFolder, setFilterFolder] = useState('all');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [activeFolder, setActiveFolder] = useState(null);
  const [sortBy, setSortBy] = useState('updated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditingFolder, setIsEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');

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
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await getCsrfToken();

        const [foldersResponse, notesResponse] = await Promise.all([
          axios.get(`${API_URL}/notes/folders/`, { withCredentials: true }),
          axios.get(`${API_URL}/notes/`, { withCredentials: true }),
        ]);

        setFolders(foldersResponse.data || []);
        setNotes(notesResponse.data || []);

        const expanded = {};
        foldersResponse.data.forEach((folder) => {
          expanded[folder.id] = true;
        });
        setExpandedFolders(expanded);

        setLoading(false);
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
        setError('Не вдалося завантажити нотатки. Спробуйте знову.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAndSortedNotes = React.useMemo(() => {
    let result = [...notes];

    if (searchTerm) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterFolder !== 'all') {
      if (filterFolder === 'uncategorized') {
        result = result.filter((note) => !note.folder_id);
      } else {
        result = result.filter((note) => note.folder_id === parseInt(filterFolder));
      }
    }

    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'created') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else {
        comparison = new Date(a.updated_at) - new Date(b.updated_at);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [notes, searchTerm, filterFolder, sortBy, sortDirection]);

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
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

  const editFolder = async (folderId) => {
    if (!editFolderName.trim()) {
      alert('Назва папки не може бути порожньою');
      return;
    }

    try {
      await getCsrfToken();

      const folderData = {
        name: editFolderName,
      };

      const response = await axios.put(`${API_URL}/notes/folders/${folderId}/`, folderData, {
        withCredentials: true,
      });

      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId ? { ...folder, name: editFolderName } : folder
        )
      );
      setIsEditingFolder(null);
      setEditFolderName('');
    } catch (error) {
      console.error('Помилка редагування папки:', error);
      alert('Не вдалося відредагувати папку. Спробуйте знову.');
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

      if (filterFolder === itemToDelete.toString()) {
        setFilterFolder('all');
      }
      setShowDeleteFolderDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Помилка видалення папки:', error);
      alert('Не вдалося видалити папку. Спробуйте знову.');
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
    setActiveFolder(note.folder_id);
    setIsEditingNote(false);
  };

  const createNewNote = async () => {
    setSelectedNote(null);
    setEditNoteTitle('Нова нотатка');
    setEditNoteContent('');
    setActiveFolder(
      filterFolder !== 'all' && filterFolder !== 'uncategorized' ? parseInt(filterFolder) : null
    );
    setIsEditingNote(true);
  };

  const saveNote = async () => {
    try {
      await getCsrfToken();

      const noteData = {
        title: editNoteTitle,
        content: editNoteContent,
        folder_id: activeFolder,
      };

      if (selectedNote) {
        const response = await axios.put(`${API_URL}/notes/${selectedNote.id}/`, noteData, {
          withCredentials: true,
        });

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === selectedNote.id
              ? {
                  ...note,
                  title: editNoteTitle,
                  content: editNoteContent,
                  folder_id: activeFolder,
                  updated_at: new Date().toISOString(),
                }
              : note
          )
        );

        setSelectedNote({
          ...selectedNote,
          title: editNoteTitle,
          content: editNoteContent,
          folder_id: activeFolder,
          updated_at: new Date().toISOString(),
        });
      } else {
        const response = await axios.post(`${API_URL}/notes/create/`, noteData, {
          withCredentials: true,
        });

        setNotes((prevNotes) => [...prevNotes, response.data]);
        setSelectedNote(response.data);
      }

      setIsEditingNote(false);
    } catch (error) {
      console.error('Помилка збереження нотатки:', error);
      alert('Не вдалося зберегти нотатку. Спробуйте знову.');
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

      if (selectedNote && selectedNote.id === itemToDelete) {
        setSelectedNote(null);
        setIsEditingNote(false);
      }
      setShowDeleteNoteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Помилка видалення нотатки:', error);
      alert('Не вдалося видалити нотатку. Спробуйте знову.');
    }
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

      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote((prev) => ({ ...prev, folder_id: folderId }));
        setActiveFolder(folderId);
      }
    } catch (error) {
      console.error('Помилка переміщення нотатки:', error);
      alert('Не вдалося перемістити нотатку. Спробуйте знову.');
    }
  };

  return (
    <div className="notes-management-page">
      <Header />

      <div className="container mt-4">
        <div className="notes-management-header">
          <div className="notes-management-title">
            <h1>
              <BookOpen size={24} /> Управління нотатками
            </h1>
            <Link to="/dashboard" className="back-to-dashboard">
              <ArrowLeft size={16} /> Назад до панелі
            </Link>
          </div>

          <div className="notes-management-actions">
            <button className="create-note-button" onClick={createNewNote}>
              <Plus size={16} /> Нова нотатка
            </button>
            <button className="create-folder-button" onClick={() => setIsCreatingFolder(true)}>
              <FolderPlus size={16} /> Нова папка
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
            <RefreshCw className="loading-icon" size={32} />
            <h3>Завантаження нотаток...</h3>
          </div>
        ) : error ? (
          <div className="notes-error">
            <AlertTriangle size={32} />
            <h3>Помилка завантаження</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Спробувати знову
            </button>
          </div>
        ) : (
          <div className="notes-management-content">
            <div className="notes-sidebar">
              <div className="notes-search-filter">
                <div className="notes-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Пошук нотаток..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="notes-filter">
                  <Filter size={16} />
                  <select value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)}>
                    <option value="all">Всі нотатки</option>
                    <option value="uncategorized">Без папки</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="notes-sort">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="updated">За датою оновлення</option>
                    <option value="created">За датою створення</option>
                    <option value="title">За назвою</option>
                  </select>
                  <button
                    className="sort-direction-btn"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              <div className="notes-list">
                {filteredAndSortedNotes.length > 0 ? (
                  filteredAndSortedNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`note-list-item ${selectedNote && selectedNote.id === note.id ? 'active' : ''}`}
                      onClick={() => selectNote(note)}
                    >
                      <div className="note-list-item-content">
                        <h3 className="note-list-title">{note.title}</h3>
                        <div className="note-list-meta">
                          {note.folder_id && (
                            <span className="note-folder-badge">
                              <Folder size={12} />
                              {folders.find((f) => f.id === note.folder_id)?.name || 'Папка'}
                            </span>
                          )}
                          <span className="note-update-date">{formatDate(note.updated_at)}</span>
                        </div>
                        <p className="note-list-preview">
                          {note.content.length > 120 ? note.content.substring(0, 120) + '...' : note.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notes-message">
                    <p>Немає нотаток для відображення</p>
                    <button className="create-note-button" onClick={createNewNote}>
                      <Plus size={16} /> Створити нотатку
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="note-details">
              {selectedNote || isEditingNote ? (
                <>
                  <div className="note-details-header">
                    {isEditingNote ? (
                      <input
                        type="text"
                        className="note-title-input"
                        value={editNoteTitle}
                        onChange={(e) => setEditNoteTitle(e.target.value)}
                        placeholder="Назва нотатки"
                      />
                    ) : (
                      <h2>{selectedNote?.title}</h2>
                    )}

                    <div className="note-details-actions">
                      <div className="folder-select-container">
                        <select
                          value={activeFolder || ''}
                          onChange={(e) => {
                            const newFolderId = e.target.value === '' ? null : parseInt(e.target.value);
                            if (selectedNote) {
                              moveNoteToFolder(selectedNote.id, newFolderId);
                            } else {
                              setActiveFolder(newFolderId);
                            }
                          }}
                          disabled={!isEditingNote && !selectedNote}
                        >
                          <option value="">Без папки</option>
                          {folders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedNote && !isEditingNote ? (
                        <>
                          <button
                            className="note-action-btn"
                            onClick={() => setIsEditingNote(true)}
                            title="Редагувати"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="note-action-btn delete"
                            onClick={() => {
                              setItemToDelete(selectedNote.id);
                              setShowDeleteNoteDialog(true);
                            }}
                            title="Видалити"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button className="note-action-btn save" onClick={saveNote} title="Зберегти">
                          Зберегти
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="note-details-content">
                    {isEditingNote ? (
                      <textarea
                        className="note-content-textarea"
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        placeholder="Вміст нотатки"
                      />
                    ) : (
                      <div className="note-content">{selectedNote?.content}</div>
                    )}
                  </div>

                  {selectedNote && !isEditingNote && (
                    <div className="note-details-footer">
                      <span>Створено: {formatDate(selectedNote.created_at)}</span>
                      <span>Оновлено: {formatDate(selectedNote.updated_at)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-note-selected">
                  <BookOpen size={64} />
                  <h2>Немає вибраної нотатки</h2>
                  <p>Виберіть нотатку для перегляду або створіть нову</p>
                  <button className="create-note-button" onClick={createNewNote}>
                    <Plus size={16} /> Створити нотатку
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
}

export default NotesManagement;