import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

interface Author {
  id: number;
  name: string;
}

export default function ManageAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      const data = await adminService.getAuthors();
      setAuthors(data);
    } catch (error) {
      setToast({ message: 'Error al cargar autores', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = async () => {
    if (!authorName.trim()) return;

    try {
      await adminService.createAuthor(authorName);
      setToast({ message: 'Autor creado', type: 'success' });
      setShowAddModal(false);
      setAuthorName('');
      loadAuthors();
    } catch (error) {
      setToast({ message: 'Error al crear autor', type: 'error' });
    }
  };

  const handleEditAuthor = async () => {
    if (!selectedAuthor || !authorName.trim()) return;

    try {
      await adminService.updateAuthor(selectedAuthor.id, authorName);
      setToast({ message: 'Autor actualizado', type: 'success' });
      setShowEditModal(false);
      setSelectedAuthor(null);
      setAuthorName('');
      loadAuthors();
    } catch (error) {
      setToast({ message: 'Error al actualizar autor', type: 'error' });
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este autor?')) return;

    try {
      await adminService.deleteAuthor(id);
      setToast({ message: 'Autor eliminado', type: 'success' });
      loadAuthors();
    } catch (error) {
      setToast({ message: 'Error al eliminar autor', type: 'error' });
    }
  };

  const openEditModal = (author: Author) => {
    setSelectedAuthor(author);
    setAuthorName(author.name);
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestionar Autores</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Nuevo Autor
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando autores...</p>
        ) : authors.length === 0 ? (
          <div className="empty-state">No hay autores registrados</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id}>
                  <td>{author.id}</td>
                  <td><strong>{author.name}</strong></td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(author)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteAuthor(author.id)}
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

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setAuthorName(''); }}
        title="Nuevo Autor"
      >
        <div className="form-group">
          <label className="form-label">Nombre del autor</label>
          <input
            type="text"
            className="form-input"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Ej: Gabriel García Márquez"
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => { setShowAddModal(false); setAuthorName(''); }}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleAddAuthor}>
            Crear
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedAuthor(null); setAuthorName(''); }}
        title="Editar Autor"
      >
        <div className="form-group">
          <label className="form-label">Nombre del autor</label>
          <input
            type="text"
            className="form-input"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => { setShowEditModal(false); setSelectedAuthor(null); setAuthorName(''); }}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleEditAuthor}>
            Guardar
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
