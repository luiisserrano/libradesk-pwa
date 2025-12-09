import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonFooter,
    IonBackButton
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { useParams, useHistory } from 'react-router-dom';
import { arrowBack, chevronBack, chevronForward, add, remove } from 'ionicons/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../services/api';
import { offlineBookService } from '../services/offlineBookService';
import './Reader.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Reader: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initialPageLoaded = useRef(false);

    useEffect(() => {
        loadPdf();
        loadSavedProgress();

        const handleResize = () => {
            setContainerWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            // Guardar progreso al salir
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [id]);

    // Cargar el progreso guardado
    const loadSavedProgress = async () => {
        try {
            // Primero intentar desde localStorage (para offline)
            const savedPage = localStorage.getItem(`book_${id}_page`);
            if (savedPage) {
                const page = parseInt(savedPage, 10);
                if (page > 0) {
                    setPageNumber(page);
                    initialPageLoaded.current = true;
                }
            }

            // Si estamos online, obtener desde el servidor
            if (navigator.onLine) {
                const response = await api.get('/library');
                const books = response.data;
                const currentBook = books.find((b: any) => b.id === parseInt(id));
                if (currentBook && currentBook.current_page > 0) {
                    setPageNumber(currentBook.current_page);
                    localStorage.setItem(`book_${id}_page`, currentBook.current_page.toString());
                    initialPageLoaded.current = true;
                }
            }
        } catch (error) {
            console.log('No se pudo cargar el progreso guardado:', error);
        }
    };

    // Guardar progreso con debounce
    const saveProgress = useCallback((page: number) => {
        // Guardar en localStorage inmediatamente (para offline)
        localStorage.setItem(`book_${id}_page`, page.toString());

        // Debounce para guardar en servidor
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            if (navigator.onLine) {
                try {
                    await api.put(`/library/${id}`, { current_page: page });
                    console.log('Progreso guardado:', page);
                } catch (error) {
                    console.error('Error guardando progreso:', error);
                }
            }
        }, 1000); // Esperar 1 segundo después del último cambio
    }, [id]);

    const loadPdf = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Try to get from offline storage first if we know it's downloaded
            // or if we are offline
            const isOffline = !navigator.onLine;
            const offlineBook = await offlineBookService.getBook(Number(id));

            if (isOffline || offlineBook) {
                if (offlineBook) {
                    console.log('Loading book from offline storage');
                    const url = URL.createObjectURL(offlineBook);
                    setPdfUrl(url);
                    setLoading(false);
                    return;
                } else if (isOffline) {
                    throw new Error('No internet connection and book not downloaded');
                }
            }

            // 2. If not offline/downloaded, try fetching from API
            console.log('Fetching book from API');
            const response = await api.get(`/books/${id}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err: any) {
            console.error('Error loading PDF:', err);

            // Fallback: If API failed, try one last check in offline storage
            // (in case we didn't check it first because we thought we were online)
            const offlineBook = await offlineBookService.getBook(Number(id));
            if (offlineBook) {
                console.log('API failed, falling back to offline storage');
                const url = URL.createObjectURL(offlineBook);
                setPdfUrl(url);
                setError('');
            } else {
                setError('No se pudo cargar el libro. Verifica tu conexión o descárgalo para leer offline.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPage = prevPageNumber + offset;
            const validPage = Math.min(Math.max(1, newPage), numPages || 1);
            // Guardar progreso cuando cambia la página
            saveProgress(validPage);
            return validPage;
        });
    };

    const handleGoBack = () => {
        // Guardar progreso antes de salir
        if (pageNumber > 0 && navigator.onLine) {
            api.put(`/library/${id}`, { current_page: pageNumber }).catch(console.error);
        }
        localStorage.setItem(`book_${id}_page`, pageNumber.toString());
        
        // Recargar la página para evitar problemas con el menú
        window.location.href = '/my-library';
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleGoBack}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Lector</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="reader-content">
                {loading && !pdfUrl && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <IonSpinner />
                        <p>Cargando libro...</p>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <p>{error}</p>
                        <IonButton onClick={handleGoBack}>Volver</IonButton>
                    </div>
                )}

                {pdfUrl && (
                    <div className="pdf-container">
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<IonSpinner />}
                            className="pdf-document"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                width={Math.min(containerWidth * 0.95, 600)} // Limitar ancho máximo para mejor lectura
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="pdf-page"
                            />
                        </Document>

                        {/* Controles Flotantes */}
                        <div className="pdf-controls">
                            <IonButton fill="clear" color="light" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>
                                <IonIcon icon={remove} />
                            </IonButton>

                            <IonButton fill="clear" color="light" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
                                <IonIcon icon={chevronBack} />
                            </IonButton>

                            <span className="page-info">
                                {pageNumber} / {numPages || '--'}
                            </span>

                            <IonButton fill="clear" color="light" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)}>
                                <IonIcon icon={chevronForward} />
                            </IonButton>

                            <IonButton fill="clear" color="light" onClick={() => setScale(s => Math.min(3.0, s + 0.2))}>
                                <IonIcon icon={add} />
                            </IonButton>
                        </div>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Reader;
