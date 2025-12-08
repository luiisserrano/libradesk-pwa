import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

interface Book {
  id: number;
  title: string;
  cover_url?: string;
  author?: { id: number; name: string };
  genre?: { id: number; name: string };
}

interface Author {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteBookId, setDeleteBookId] = useState<number | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAuthorId, setEditAuthorId] = useState<number>(0);
  const [editGenreId, setEditGenreId] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksData, authorsData, genresData] = await Promise.all([
        adminService.getBooks(),
        adminService.getAuthors(),
        adminService.getGenres()
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
      setGenres(genresData);
    } catch (error) {
      setToast({ message: 'Error al cargar datos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditAuthorId(book.author?.id || 0);
    setEditGenreId(book.genre?.id || 0);
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('author_id', editAuthorId.toString());
      formData.append('genre_id', editGenreId.toString());

      await adminService.updateBook(editingBook.id, formData);
      setToast({ message: 'Libro actualizado', type: 'success' });
      setEditingBook(null);
      loadData();
    } catch (error) {
      setToast({ message: 'Error al actualizar libro', type: 'error' });
    }
  };

  const handleDeleteBook = async () => {
    if (!deleteBookId) return;

    try {
      await adminService.deleteBook(deleteBookId);
      setToast({ message: 'Libro eliminado', type: 'success' });
      loadData();
    } catch (error) {
      setToast({ message: 'Error al eliminar libro', type: 'error' });
    } finally {
      setDeleteBookId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestionar Libros</h1>
        <a href="/upload" className="btn btn-primary">
          ⬆️ Subir Libro
        </a>
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando libros...</p>
        ) : books.length === 0 ? (
          <div className="empty-state">No hay libros registrados</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Género</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <img
                      src={book.cover_url || '/placeholder.png'}
                      alt={book.title}
                      className="thumbnail"
                    />
                  </td>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author?.name || 'Sin autor'}</td>
                  <td>{book.genre?.name || 'Sin género'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(book)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteBookId(book.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Editar Libro"
      >
        <div className="form-group">
          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Autor</label>
          <select
            className="form-select"
            value={editAuthorId}
            onChange={(e) => setEditAuthorId(parseInt(e.target.value))}
          >
            <option value={0}>Sin autor</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Género</label>
          <select
            className="form-select"
            value={editGenreId}
            onChange={(e) => setEditGenreId(parseInt(e.target.value))}
          >
            <option value={0}>Sin género</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => setEditingBook(null)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleUpdateBook}>
            Guardar Cambios
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteBookId}
        onClose={() => setDeleteBookId(null)}
        title="Confirmar Eliminación"
      >
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Estás seguro de que deseas eliminar este libro?
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={() => setDeleteBookId(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleDeleteBook}>
            Eliminar
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
