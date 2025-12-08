import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      setToast({ message: 'Error al cargar usuarios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      await adminService.updateUserRole(userId, newRoleId);
      setToast({ message: 'Rol actualizado correctamente', type: 'success' });
      loadUsers();
    } catch (error) {
      setToast({ message: 'Error al actualizar rol', type: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await adminService.deleteUser(deleteUserId);
      setToast({ message: 'Usuario eliminado', type: 'success' });
      loadUsers();
    } catch (error) {
      setToast({ message: 'Error al eliminar usuario', type: 'error' });
    } finally {
      setDeleteUserId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestionar Usuarios</h1>
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">No hay usuarios registrados</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="form-select"
                      value={user.role_id}
                      onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                      style={{ width: 'auto' }}
                    >
                      <option value={1}>Admin</option>
                      <option value={2}>Usuario</option>
                    </select>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteUserId(user.id)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Confirmar Eliminación"
      >
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={() => setDeleteUserId(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleDeleteUser}>
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
