import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const isAuthPage = ['/login', '/register', '/verify', '/verify-request'].includes(location.pathname);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        let ws = null;

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Fetch unread count
                fetch('/api/tells/unread-count', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.count !== undefined) {
                        setUnreadCount(data.count);
                    }
                })
                .catch(err => console.error('Failed to fetch unread count:', err));

                // WebSocket for real-time updates
                ws = new WebSocket(`ws://localhost:8080/ws/${parsedUser.id}`);
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new_tell') {
                        setUnreadCount(prev => prev + 1);
                    }
                };

            } catch (e) {
                console.error('Failed to parse user data:', e);
                setUser(null);
            }
        } else {
            setUser(null);
            setUnreadCount(0);
        }

        return () => {
            if (ws) ws.close();
        };
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    if (isAuthPage) return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-end">
            <LanguageSwitcher />
        </nav>
    );

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <img src="/app_icon.png" alt="PemBlle" className="w-9 h-9 rounded-xl object-cover" />
                        <span className="text-lg font-semibold text-dark-100 hidden sm:block">
                            PemBlle
                        </span>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                <Link to="/" className="p-2.5 text-dark-400 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition-colors hidden sm:flex" title={t('home')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </Link>

                                <Link to="/notifications" className="relative p-2.5 text-dark-400 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/chat" className="p-2.5 text-dark-400 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition-colors" title={t('messages')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-semibold text-white">{user.username[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <svg className="w-4 h-4 text-dark-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                                            <div className="absolute end-0 mt-2 w-56 bg-dark-900 border border-dark-800 rounded-xl shadow-xl z-20 overflow-hidden">
                                                <div className="p-4 border-b border-dark-800">
                                                    <p className="font-semibold text-dark-100">{user.full_name || user.username}</p>
                                                    <p className="text-sm text-dark-500">@{user.username}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setShowDropdown(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:bg-dark-800 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        {t('my_profile')}
                                                    </Link>
                                                    <Link
                                                        to="/notifications"
                                                        onClick={() => setShowDropdown(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:bg-dark-800 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                                        {t('inbox')}
                                                    </Link>
                                                    <Link
                                                        to="/users"
                                                        onClick={() => setShowDropdown(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:bg-dark-800 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                        {t('all_users')}
                                                    </Link>
                                                    <Link
                                                        to="/policy"
                                                        onClick={() => setShowDropdown(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:bg-dark-800 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                        {t('privacy_policy')}
                                                    </Link>
                                                    <Link
                                                        to="/terms"
                                                        onClick={() => setShowDropdown(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:bg-dark-800 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293V19a2 2 0 01-2 2z" /></svg>
                                                        {t('terms_conditions')}
                                                    </Link>
                                                    <div className="border-t border-dark-800 mt-1 pt-1">
                                                        <button
                                                            onClick={() => {
                                                                setShowDropdown(false);
                                                                handleLogout();
                                                            }}
                                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-dark-800 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                            {t('log_out')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="px-4 py-2 text-dark-300 hover:text-dark-100 transition-colors font-medium">
                                        {t('sign_in')}
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="btn-primary">
                                        {t('sign_up')}
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
