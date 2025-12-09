import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';

interface Author {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface FieldErrors {
  title?: string;
  pdf?: string;
}

export default function UploadBook() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ title: boolean; pdf: boolean }>({ title: false, pdf: false });

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [authorsData, genresData] = await Promise.all([
        adminService.getAuthorsPublic(),
        adminService.getGenresPublic()
      ]);
      setAuthors(authorsData);
      setGenres(genresData);
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  // Validaciones
  const validateTitle = (value: string): string | null => {
    if (!value.trim()) return 'El título es obligatorio';
    if (value.trim().length < 2) return 'El título debe tener al menos 2 caracteres';
    if (value.trim().length > 255) return 'El título no puede exceder 255 caracteres';
    return null;
  };

  const validatePdf = (file: File | null): string | null => {
    if (!file) return 'El archivo PDF es obligatorio';
    if (file.type !== 'application/pdf') return 'El archivo debe ser un PDF';
    if (file.size > 50 * 1024 * 1024) return 'El archivo no puede exceder 50MB';
    return null;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    
    const titleError = validateTitle(title);
    if (titleError) errors.title = titleError;

    const pdfError = validatePdf(pdf);
    if (pdfError) errors.pdf = pdfError;

    setFieldErrors(errors);
    setTouched({ title: true, pdf: true });
    return Object.keys(errors).length === 0;
  };

  // Handlers para validación en tiempo real
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (touched.title) {
      const error = validateTitle(value);
      setFieldErrors(prev => ({ ...prev, title: error || undefined }));
    }
  };

  const handleTitleBlur = () => {
    setTouched(prev => ({ ...prev, title: true }));
    const error = validateTitle(title);
    setFieldErrors(prev => ({ ...prev, title: error || undefined }));
  };

  const handlePdfChange = (file: File | null) => {
    setPdf(file);
    setTouched(prev => ({ ...prev, pdf: true }));
    const error = validatePdf(file);
    setFieldErrors(prev => ({ ...prev, pdf: error || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (authorId) formData.append('author_id', authorId);
      if (genreId) formData.append('genre_id', genreId);
      if (cover) formData.append('cover_image', cover);
      if (pdf) formData.append('pdf_file', pdf);

      await adminService.uploadBook(formData);
      setToast({ message: 'Libro subido exitosamente', type: 'success' });
      
      setTimeout(() => navigate('/books'), 1500);
    } catch (error) {
      setToast({ message: 'Error al subir el libro', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ justifyContent: 'center' }}>
        <h1 className="page-title">Subir Nuevo Libro</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input
              type="text"
              className={`form-input ${touched.title && fieldErrors.title ? 'input-error' : ''}`}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Título del libro"
            />
            {touched.title && fieldErrors.title && (
              <span className="error-text">{fieldErrors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Autor</label>
            <select
              className="form-select"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
            >
              <option value="">Sin autor</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Género</label>
            <select
              className="form-select"
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
            >
              <option value="">Sin género</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Imagen de Portada</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              style={{ padding: '0.5rem' }}
            />
            {cover && (
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                📷 {cover.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Archivo PDF *</label>
            <input
              type="file"
              className={`form-input ${touched.pdf && fieldErrors.pdf ? 'input-error' : ''}`}
              accept="application/pdf"
              onChange={(e) => handlePdfChange(e.target.files?.[0] || null)}
              style={{ padding: '0.5rem' }}
            />
            {touched.pdf && fieldErrors.pdf && (
              <span className="error-text">{fieldErrors.pdf}</span>
            )}
            {pdf && !fieldErrors.pdf && (
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                📄 {pdf.name}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/books')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? '⏳ Subiendo...' : '⬆️ Subir Libro'}
            </button>
          </div>
        </form>
        </div>
      </div>

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
