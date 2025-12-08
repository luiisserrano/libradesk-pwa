import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  users: number;
  books: number;
  genres: number;
  authors: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ users: 0, books: 0, genres: 0, authors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, books, genres, authors] = await Promise.all([
        adminService.getUsers(),
        adminService.getBooks(),
        adminService.getGenres(),
        adminService.getAuthors()
      ]);

      setStats({
        users: users.length,
        books: books.length,
        genres: genres.length,
        authors: authors.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await adminService.sendTestNotification();
      alert('Notificación de prueba enviada');
    } catch (error) {
      alert('Error al enviar notificación');
    }
  };

  const statCards = [
    { label: 'Usuarios', value: stats.users, icon: '👥', color: '#4f46e5' },
    { label: 'Libros', value: stats.books, icon: '📚', color: '#22c55e' },
    { label: 'Géneros', value: stats.genres, icon: '🏷️', color: '#f59e0b' },
    { label: 'Autores', value: stats.authors, icon: '✍️', color: '#ef4444' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">¡Bienvenido, {user?.username}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Panel de administración de LibraDesk</p>
        </div>
      </div>

      {loading ? (
        <p>Cargando estadísticas...</p>
      ) : (
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          {statCards.map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Acciones Rápidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/upload" className="btn btn-primary">
              ⬆️ Subir Nuevo Libro
            </a>
            <a href="/users" className="btn btn-outline">
              👥 Gestionar Usuarios
            </a>
            <button className="btn btn-outline" onClick={handleTestNotification}>
              🔔 Enviar Notificación de Prueba
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Información del Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <p>📅 Fecha: {new Date().toLocaleDateString('es-ES')}</p>
            <p>👤 Usuario: {user?.email}</p>
            <p>🔑 Rol: Administrador</p>
            <p>✅ Estado: Activo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
