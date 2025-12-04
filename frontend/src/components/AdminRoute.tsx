import React from 'react';
import { Route, Redirect } from 'react-router-dom';

interface AdminRouteProps {
    component: React.ComponentType<any>;
    path: string;
    exact?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component, ...rest }) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const isAdmin = user && user.role_id === 1;

    return (
        <Route
            {...rest}
            render={props =>
                isAdmin ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/my-library" />
                )
            }
        />
    );
};

export default AdminRoute;
