import React from 'react';
import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Home from './Home';
import Profile from './Profile';
import AdminUpload from './AdminUpload';
import MyLibrary from './MyLibrary';
import Reader from './Reader';

const MainLayout: React.FC = () => {
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
