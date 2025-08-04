// auth/ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

export const ProtectedRoute = ({
    children,
    requireAuth = true,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <h1>Loading...</h1>;
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate
            to={redirectTo}
            state={{ from: location.pathname }}
            replace
        />;
    }

    return children;
};
