import {Navigate, useLocation} from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import api from "../api";
import {REFRESH_TOKEN, ACCESS_TOKEN} from "../Constants";
import {useState, useEffect, useCallback} from "react";


function ProtectedRoute({children}) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
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
            console.error('Token refresh failed:', e);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthenticated(false);
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
            console.error('Token validation failed:', error);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthenticated(false);
        }
    }, [refreshToken]);

    useEffect(() => {
        auth().catch(()=>{setIsAuthenticated(false)})
    }, [auth]);

    if(isAuthenticated===null){
        return <div>Loading</div>
    }

    // If not authenticated, redirect to login with intended destination
    if (!isAuthenticated) {
        // If the user is trying to access /customer-info, always redirect there after login
        const redirectTo = location.pathname === '/customer-info' ? '/customer-info' : location.pathname;
        return <Navigate to="/login" state={{ redirectTo }} />;
    }

    return children; // Simplified return
}

export default ProtectedRoute;