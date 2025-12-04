import React, { useState } from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonToggle, IonAvatar } from '@ionic/react';
import { personOutline, libraryOutline, bookOutline, cloudUploadOutline, logOutOutline, moonOutline, sunnyOutline, settingsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import UserAvatar from './UserAvatar';
import './Sidebar.css';

import logo from '../img/logo.png';

const Sidebar: React.FC = () => {
    const history = useHistory();
    const { isDark, toggleTheme } = useTheme();
    const [user] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    React.useEffect(() => {
        const handleStatusChange = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);

        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        history.push('/login');
    };

    const isAdmin = user?.role_id == 1;

    return (
        <IonMenu contentId="main-content" type="overlay">
            <IonHeader>
                <IonToolbar color="primary">
                    <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                        <img src={logo} alt="LibraDesk Logo" style={{ height: '40px' }} loading="lazy" decoding="async" />
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent className="sidebar-content">
                {/* User Profile Section */}
                <div className="user-profile">
                    <UserAvatar
                        userId={user?.id}
                        name={user?.username}
                        size="medium"
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h3>{user?.username || 'User'}</h3>
                        <p>{user?.email || ''}</p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: isOnline ? 'rgba(var(--ion-color-success-rgb), 0.1)' : 'rgba(var(--ion-color-danger-rgb), 0.1)',
                    margin: '0 16px 10px 16px',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: isOnline ? 'var(--ion-color-success)' : 'var(--ion-color-danger)'
                    }} />
                    <IonLabel color={isOnline ? 'success' : 'danger'} style={{ fontSize: '0.9em', fontWeight: '500' }}>
                        {isOnline ? 'Online' : 'Offline'}
                    </IonLabel>
                </div>

                {/* Navigation Menu */}
                <IonList>
                    <IonItem button onClick={() => history.push('/profile')}>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>Mi Perfil</IonLabel>
                    </IonItem>

                    <IonItem button onClick={() => history.push('/my-library')}>
                        <IonIcon icon={libraryOutline} slot="start" />
                        <IonLabel>Mi Biblioteca</IonLabel>
                    </IonItem>

                    <IonItem button onClick={() => history.push('/home')}>
                        <IonIcon icon={bookOutline} slot="start" />
                        <IonLabel>Explorar Libros</IonLabel>
                    </IonItem>

                    {isAdmin && (
                        <>
                            <IonItem button onClick={() => history.push('/admin')}>
                                <IonIcon icon={settingsOutline} slot="start" />
                                <IonLabel>Panel Admin</IonLabel>
                            </IonItem>
                            <IonItem button onClick={() => history.push('/admin-upload')}>
                                <IonIcon icon={cloudUploadOutline} slot="start" />
                                <IonLabel>Subir Libros</IonLabel>
                            </IonItem>
                        </>
                    )}

                    <IonItem>
                        <IonIcon icon={isDark ? moonOutline : sunnyOutline} slot="start" />
                        <IonLabel>Modo {isDark ? 'Oscuro' : 'Claro'}</IonLabel>
                        <IonToggle checked={isDark} onIonChange={toggleTheme} slot="end" />
                    </IonItem>

                    <IonItem button onClick={handleLogout} className="logout-item">
                        <IonIcon icon={logOutOutline} slot="start" color="danger" />
                        <IonLabel color="danger">Cerrar Sesión</IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonMenu>
    );
};

export default Sidebar;
