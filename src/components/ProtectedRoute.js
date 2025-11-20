import {Navigate, useLocation} from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import api from "../api";
import {REFRESH_TOKEN, ACCESS_TOKEN, USER_ROLE, USER_PROFILE} from "../Constants";
import {useState, useEffect, useCallback} from "react";
import {getDefaultRouteForRole} from "../utils/roleUtils";


function ProtectedRoute({children, allowedRoles}) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(localStorage.getItem(USER_ROLE));
    const [roleLoading, setRoleLoading] = useState(Boolean(allowedRoles) && !userRole);
    const location = useLocation();

    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthenticated(false);
            return;
        }
        
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (e) {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthenticated(false);
        }
    }, []);

    const loadUserRole = useCallback(async () => {
        setRoleLoading(true);
        try {
            const response = await api.get('/api/profile/');
            const profile = response.data;
            if (profile?.role) {
                localStorage.setItem(USER_ROLE, profile.role);
                localStorage.setItem(USER_PROFILE, JSON.stringify(profile));
                setUserRole(profile.role);
            } else {
                setUserRole(null);
            }
        } catch (error) {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            localStorage.removeItem(USER_ROLE);
            localStorage.removeItem(USER_PROFILE);
            setIsAuthenticated(false);
        } finally {
            setRoleLoading(false);
        }
    }, []);

    const auth = useCallback(async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now()/1000;

            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthenticated(false);
        }
    }, [refreshToken]);

    useEffect(() => {
        auth().catch(()=>{setIsAuthenticated(false)})
    }, [auth]);

    useEffect(() => {
        if (isAuthenticated) {
            const storedRole = localStorage.getItem(USER_ROLE);
            if (!storedRole || storedRole !== userRole) {
                loadUserRole().catch(() => {
                    setRoleLoading(false);
                });
            }
        }
    }, [isAuthenticated, userRole, loadUserRole]);

    if(isAuthenticated===null){
        return <div>Loading</div>
    }

    // If not authenticated, redirect to login with intended destination
    if (!isAuthenticated) {
        // If the user is trying to access /customer-info, always redirect there after login
        const redirectTo = location.pathname === '/customer-info' ? '/customer-info' : location.pathname;
        return <Navigate to="/login" state={{ redirectTo }} />;
    }

    if (allowedRoles) {
        if (roleLoading) {
            return <div>Loading</div>;
        }
        if (!userRole) {
            return <Navigate to="/login" replace />;
        }
        if (!allowedRoles.includes(userRole)) {
            const fallback = getDefaultRouteForRole(userRole);
            return <Navigate to={fallback} replace />;
        }
    }

    return children; // Simplified return
}

export default ProtectedRoute;