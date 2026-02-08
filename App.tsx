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
    if (typeof window === 'undefined') return;
    
    const handleSync = () => {
      const session = getActiveUser();
      // Only update if IDs differ to prevent infinite re-renders
      if (session?.id !== activeUser?.id) {
        setActiveUser(session);
      }
    };

    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, [activeUser?.id]);

  // Root Initialization - Runs only once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Setup local storage and initial data
    initializeStorage();
    
    // 2. Hydrate session state
    const session = getActiveUser();
    if (session) {
      setActiveUser(session);
      // Auto-redirect to dashboard if user hits root pages with an active session
      setCurrentPage(prev => (prev === 'LANDING' || prev === 'LOGIN' || prev === 'REGISTER') ? 'DASHBOARD' : prev);
    }
    
    // 3. Mark app as ready for interactive rendering
    setIsHydrated(true);

    // Remove the static fallback loader from index.html if it exists
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
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

  // Protected route logic - check session requirements after hydration
  useEffect(() => {
    if (!isHydrated) return;
    const isProtectedRoute = currentPage === 'DASHBOARD' || currentPage === 'ADMIN';
    if (isProtectedRoute && !activeUser) {
      setCurrentPage('LOGIN');
    }
  }, [currentPage, activeUser, isHydrated]);

  // Don't render the main tree until client-side hydration is complete
  if (!isHydrated) {
    return null; // The loader in index.html will handle this state
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
      <div className="min-h-[70vh] fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default App;