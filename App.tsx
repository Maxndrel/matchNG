
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from './types';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuthPage from './pages/auth/AuthPage';
import About from './pages/info/About';
import EmployersInfo from './pages/info/EmployersInfo';
import Training from './pages/info/Training';
import Contact from './pages/info/Contact';
import { initializeStorage, getActiveUser, setActiveUser as setStorageActiveUser, saveUser } from './services/storage';

type Page = 'LANDING' | 'DASHBOARD' | 'ADMIN' | 'LOGIN' | 'REGISTER' | 'ABOUT' | 'EMPLOYERS' | 'TRAINING' | 'CONTACT';

const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('LANDING');
  const [isHydrated, setIsHydrated] = useState(false);

  // Synchronize internal state with storage service notifications
  useEffect(() => {
    const handleSync = () => {
      if (typeof window === 'undefined') return;
      const session = getActiveUser();
      // Use a more stable comparison
      if (session?.id !== activeUser?.id) {
        setActiveUser(session);
      }
    };

    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, [activeUser?.id]);

  // Root Client-Only Hydration Hook
  useEffect(() => {
    // 1. Initialize data layer
    initializeStorage();
    
    // 2. Hydrate session
    const session = getActiveUser();
    if (session) {
      setActiveUser(session);
      // Auto-redirect to dashboard if session exists and user is on entry pages
      setCurrentPage(prev => (prev === 'LANDING' || prev === 'LOGIN' || prev === 'REGISTER') ? 'DASHBOARD' : prev);
    }
    
    // 3. Signal app is ready for client-side interaction
    setIsHydrated(true);
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    saveUser(user);
    setStorageActiveUser(user);
    setActiveUser(user);
    setCurrentPage('DASHBOARD');
  };

  const handleLogout = () => {
    setStorageActiveUser(null);
    setActiveUser(null);
    setCurrentPage('LANDING');
  };

  const handleUpdateUser = useCallback((updated: UserProfile) => {
    saveUser(updated);
    setActiveUser(updated);
  }, []);

  // Protected route logic
  useEffect(() => {
    if (!isHydrated) return;

    const isDashboardRoute = currentPage === 'DASHBOARD';
    const isAdminRoute = currentPage === 'ADMIN';

    if ((isDashboardRoute || isAdminRoute) && !activeUser) {
      setCurrentPage('LOGIN');
    }
  }, [currentPage, activeUser, isHydrated]);

  // Resilience: Show a visible loader if hydration is stuck
  if (!isHydrated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #10b981',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#6b7280', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
          MATCHNG ENGINE BOOTING...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'LANDING':
        return <Landing onStart={() => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
      case 'ABOUT':
        return <About />;
      case 'EMPLOYERS':
        return <EmployersInfo onStart={() => setCurrentPage('REGISTER')} />;
      case 'TRAINING':
        return <Training />;
      case 'CONTACT':
        return <Contact />;
      case 'LOGIN':
        return <AuthPage initialMode="LOGIN" onAuthSuccess={handleAuthSuccess} />;
      case 'REGISTER':
        return <AuthPage initialMode="REGISTER" onAuthSuccess={handleAuthSuccess} />;
      case 'DASHBOARD':
        if (!activeUser) return <Landing onStart={() => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
        return activeUser.role === UserRole.SEEKER 
          ? <SeekerDashboard user={activeUser} onUpdateUser={handleUpdateUser} />
          : <EmployerDashboard user={activeUser} onUpdateUser={handleUpdateUser} />;
      case 'ADMIN':
        return activeUser?.role === UserRole.ADMIN ? <AdminDashboard /> : <Landing onStart={() => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
      default:
        return <Landing onStart={() => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout 
      userRole={activeUser?.role}
      userName={activeUser?.fullName}
      onLogout={handleLogout}
      onNavigate={setCurrentPage}
    >
      <div className="fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default App;
