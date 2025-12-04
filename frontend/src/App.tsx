import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminUpload from './pages/AdminUpload';
import MyLibrary from './pages/MyLibrary';
import Reader from './pages/Reader';
import Profile from './pages/Profile';
import OfflineLogin from './pages/OfflineLogin';
import MainLayout from './pages/MainLayout';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './contexts/ThemeContext';
import { notificationService } from './services/notificationService';

// Admin Pages
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageBooks from './pages/Admin/ManageBooks';
import ManageGenres from './pages/Admin/ManageGenres';
import ManageAuthors from './pages/Admin/ManageAuthors';

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
      <IonReactRouter>
        <NotificationInitializer />
        <IonRouterOutlet>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/offline-login" component={OfflineLogin} />
          <Route exact path="/" render={() => <Redirect to="/login" />} />

          {/* Admin Routes */}
          <AdminRoute exact path="/admin" component={AdminDashboard} />
          <AdminRoute exact path="/admin/users" component={ManageUsers} />
          <AdminRoute exact path="/admin/books" component={ManageBooks} />
          <AdminRoute exact path="/admin/genres" component={ManageGenres} />
          <AdminRoute exact path="/admin/authors" component={ManageAuthors} />

          <Route path={['/home', '/profile', '/admin-upload', '/my-library', '/reader/:id']} render={() => {
            // Simple guard for offline access
            if (!navigator.onLine && !sessionStorage.getItem('offline_authenticated')) {
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
