import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

interface Genre {
  id: number;
  name: string;
}

export default function ManageGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreName, setGenreName] = useState('');

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const data = await adminService.getGenres();
      setGenres(data);
    } catch (error) {
      setToast({ message: 'Error al cargar géneros', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = async () => {
    if (!genreName.trim()) return;

    try {
      await adminService.createGenre(genreName);
      setToast({ message: 'Género creado', type: 'success' });
      setShowAddModal(false);
      setGenreName('');
      loadGenres();
    } catch (error) {
      setToast({ message: 'Error al crear género', type: 'error' });
    }
  };

  const handleEditGenre = async () => {
    if (!selectedGenre || !genreName.trim()) return;

    try {
      await adminService.updateGenre(selectedGenre.id, genreName);
      setToast({ message: 'Género actualizado', type: 'success' });
      setShowEditModal(false);
      setSelectedGenre(null);
      setGenreName('');
      loadGenres();
    } catch (error) {
      setToast({ message: 'Error al actualizar género', type: 'error' });
    }
  };

  const handleDeleteGenre = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este género?')) return;

    try {
      await adminService.deleteGenre(id);
      setToast({ message: 'Género eliminado', type: 'success' });
      loadGenres();
    } catch (error) {
      setToast({ message: 'Error al eliminar género', type: 'error' });
    }
  };

  const openEditModal = (genre: Genre) => {
    setSelectedGenre(genre);
    setGenreName(genre.name);
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestionar Géneros</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Nuevo Género
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando géneros...</p>
        ) : genres.length === 0 ? (
          <div className="empty-state">No hay géneros registrados</div>
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
              {genres.map((genre) => (
                <tr key={genre.id}>
                  <td>{genre.id}</td>
                  <td><strong>{genre.name}</strong></td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(genre)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteGenre(genre.id)}
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
        onClose={() => { setShowAddModal(false); setGenreName(''); }}
        title="Nuevo Género"
      >
        <div className="form-group">
          <label className="form-label">Nombre del género</label>
          <input
            type="text"
            className="form-input"
            value={genreName}
            onChange={(e) => setGenreName(e.target.value)}
            placeholder="Ej: Ciencia Ficción"
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => { setShowAddModal(false); setGenreName(''); }}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleAddGenre}>
            Crear
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedGenre(null); setGenreName(''); }}
        title="Editar Género"
      >
        <div className="form-group">
          <label className="form-label">Nombre del género</label>
          <input
            type="text"
            className="form-input"
            value={genreName}
            onChange={(e) => setGenreName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => { setShowEditModal(false); setSelectedGenre(null); setGenreName(''); }}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleEditGenre}>
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
