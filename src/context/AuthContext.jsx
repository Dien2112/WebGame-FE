import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const data = await api.get('/api/auth/me');
            setUser(data.user);
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
