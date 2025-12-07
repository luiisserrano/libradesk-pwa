import React, { useState, useEffect } from 'react';
import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Home from './Home';
import Profile from './Profile';
import AdminUpload from './AdminUpload';
import MyLibrary from './MyLibrary';
import Reader from './Reader';
import InstallPrompt from '../components/InstallPrompt';

// Detectar si está ejecutándose como PWA instalada
const isRunningAsPWA = (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
};

// Detectar si es dispositivo móvil
const isMobileDevice = (): boolean => {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const MainLayout: React.FC = () => {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [hasSkippedInstall, setHasSkippedInstall] = useState(false);

    useEffect(() => {
        // Verificar si el usuario ya saltó la instalación
        const skipped = localStorage.getItem('pwa_installed') === 'true';
        setHasSkippedInstall(skipped);

        // Mostrar prompt solo si: es móvil + no está instalada como PWA + no ha saltado antes
        const shouldShow = isMobileDevice() && !isRunningAsPWA() && !skipped;
        setShowInstallPrompt(shouldShow);

        // Escuchar cambios en display-mode
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setShowInstallPrompt(false);
            }
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // Si debe mostrar el prompt de instalación en móvil
    if (showInstallPrompt) {
        return <InstallPrompt />;
    }

    return (
        <IonSplitPane contentId="main-content">
            <Sidebar />
            <IonRouterOutlet id="main-content">
                <Route exact path="/home" component={Home} />
                <Route exact path="/profile" component={Profile} />
                <Route exact path="/admin-upload" component={AdminUpload} />
                <Route exact path="/my-library" component={MyLibrary} />
                <Route exact path="/reader/:id" component={Reader} />
                <Route exact path="/">
                    <Redirect to="/my-library" />
                </Route>
            </IonRouterOutlet>
        </IonSplitPane>
    );
};

export default MainLayout;

