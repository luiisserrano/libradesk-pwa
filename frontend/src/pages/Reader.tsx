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
    IonSpinner
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { arrowBack } from 'ionicons/icons';
import api from '../services/api';

const Reader: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        loadPdf();
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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Lector de PDF</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                {loading && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <IonSpinner />
                        <p>Cargando PDF...</p>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <p>{error}</p>
                        <IonButton routerLink="/my-library">
                            Volver a Mi Biblioteca
                        </IonButton>
                    </div>
                )}

                {!loading && !error && pdfUrl && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        backgroundColor: '#525659'
                    }}>
                        <iframe
                            ref={iframeRef}
                            src={`${pdfUrl}#view=FitH`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            title="PDF Reader"
                        />
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Reader;
