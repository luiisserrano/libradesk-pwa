import React, { useState } from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonToggle, IonAvatar } from '@ionic/react';
import { personOutline, libraryOutline, bookOutline, cloudUploadOutline, logOutOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import UserAvatar from './UserAvatar';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const history = useHistory();
    const { isDark, toggleTheme } = useTheme();
    const [user] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

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
                    <IonTitle>LibraDesk</IonTitle>
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
                        <IonItem button onClick={() => history.push('/admin-upload')}>
                            <IonIcon icon={cloudUploadOutline} slot="start" />
                            <IonLabel>Subir Libros</IonLabel>
                        </IonItem>
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
