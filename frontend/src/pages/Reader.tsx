import React, { useEffect, useState, useRef } from 'react';
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
    IonFooter
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { arrowBack, chevronBack, chevronForward, add, remove } from 'ionicons/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../services/api';
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

    useEffect(() => {
        loadPdf();

        const handleResize = () => {
            setContainerWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);

    const loadPdf = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/books/${id}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setLoading(false);
        } catch (err: any) {
            console.error('Error loading PDF:', err);
            setError('Error al cargar el PDF');
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
            return Math.min(Math.max(1, newPage), numPages || 1);
        });
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
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
                        <IonButton routerLink="/my-library">Volver</IonButton>
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
