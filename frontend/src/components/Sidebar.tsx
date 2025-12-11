import React, { useState, useRef, useEffect } from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonToggle, IonAvatar } from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { personOutline, libraryOutline, bookOutline, logOutOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import UserAvatar from './UserAvatar';
import './Sidebar.css';

import logo from '../img/logo.png';

const Sidebar: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const menuRef = useRef<HTMLIonMenuElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [user] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Rehabilitar menú cada vez que cambia la ruta
    useEffect(() => {
        const enableMenu = async () => {
            await menuController.enable(true);
        };
        enableMenu();
    }, [location.pathname]);

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

    // Navegación con cierre de menú controlado
    const handleNavigation = async (path: string) => {
        if (isAnimating) return; // Prevenir navegación durante animación

        if (menuRef.current) {
            await menuRef.current.close();
        }
        history.push(path);
    };

    return (
        <IonMenu
            contentId="main-content"
            type="overlay"
            ref={menuRef}
            onIonWillOpen={() => setIsAnimating(true)}
            onIonDidOpen={() => setIsAnimating(false)}
            onIonWillClose={() => setIsAnimating(true)}
            onIonDidClose={() => setIsAnimating(false)}
        >

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
                    <IonItem>
                        <IonIcon icon={isDark ? moonOutline : sunnyOutline} slot="start" />
                        <IonLabel>Modo {isDark ? 'Oscuro' : 'Claro'}</IonLabel>
                        <IonToggle checked={isDark} onIonChange={toggleTheme} slot="end" />
                    </IonItem>
                    
                    <IonItem button onClick={() => handleNavigation('/profile')} disabled={isAnimating}>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>Mi Perfil</IonLabel>
                    </IonItem>

                    <IonItem button onClick={() => handleNavigation('/my-library')} disabled={isAnimating}>
                        <IonIcon icon={libraryOutline} slot="start" />
                        <IonLabel>Mi Biblioteca</IonLabel>
                    </IonItem>

                    <IonItem button onClick={() => handleNavigation('/home')} disabled={isAnimating}>
                        <IonIcon icon={bookOutline} slot="start" />
                        <IonLabel>Explorar Libros</IonLabel>
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
