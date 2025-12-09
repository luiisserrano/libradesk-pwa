import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyLibrary from './pages/MyLibrary';
import Reader from './pages/Reader';
import Profile from './pages/Profile';
import OfflineLogin from './pages/OfflineLogin';
import VerifyEmail from './pages/VerifyEmail';
import MainLayout from './pages/MainLayout';
import UpdatePrompt from './components/UpdatePrompt';
import ServerUpdatePrompt from './components/ServerUpdatePrompt';
import { ThemeProvider } from './contexts/ThemeContext';
import { notificationService } from './services/notificationService';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

setupIonicReact();

const NotificationInitializer: React.FC = () => {
  React.useEffect(() => {
    notificationService.subscribeToPush();
  }, []);
  return null;
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <UpdatePrompt />
      <ServerUpdatePrompt />
      <IonReactRouter>
        <NotificationInitializer />
        <IonRouterOutlet>
          <Route exact path="/login" render={() => {
            if (localStorage.getItem('token')) {
              return <Redirect to="/my-library" />;
            }
            return <Login />;
          }} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/verify-email" component={VerifyEmail} />
          <Route exact path="/offline-login" component={OfflineLogin} />
          <Route exact path="/" render={() => <Redirect to="/login" />} />

          <Route path={['/home', '/profile', '/my-library', '/reader/:id']} render={() => {
            // Simple guard for offline access
            const hasToken = localStorage.getItem('token');
            const isOfflineAuth = sessionStorage.getItem('offline_authenticated');

            if (!navigator.onLine && !hasToken && !isOfflineAuth) {
              return <Redirect to="/offline-login" />;
            }
            return <MainLayout />;
          }} />
        </IonRouterOutlet>
      </IonReactRouter>
    </ThemeProvider>
  </IonApp>
);

export default App;
