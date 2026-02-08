
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from './types.ts';
import Layout from './components/Layout.tsx';
import Landing from './pages/Landing.tsx';
import SeekerDashboard from './pages/seeker/SeekerDashboard.tsx';
import EmployerDashboard from './pages/employer/EmployerDashboard.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AuthPage from './pages/auth/AuthPage.tsx';
import About from './pages/info/About.tsx';
import EmployersInfo from './pages/info/EmployersInfo.tsx';
import Training from './pages/info/Training.tsx';
import Contact from './pages/info/Contact.tsx';
import { initializeStorage, getActiveUser, setActiveUser as setStorageActiveUser, saveUser } from './services/storage.ts';

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
      if (session?.id !== activeUser?.id) {
        setActiveUser(session);
      }
    };

    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, [activeUser?.id]);

  // Root Initialization - Runs only once on mount
  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;

      // 1. Setup local storage and initial data (Simulated DB connection)
      await initializeStorage();
      
      // 2. Hydrate session state
      const session = getActiveUser();
      if (session) {
        setActiveUser(session);
        // Auto-redirect to dashboard if user hits root pages with an active session
        setCurrentPage(prev => (prev === 'LANDING' || prev === 'LOGIN' || prev === 'REGISTER') ? 'DASHBOARD' : prev);
      }
      
      // 3. Mark app as ready
      setIsHydrated(true);

      // Remove the static fallback loader from index.html
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }
    };

    init();
  }, []);

  const handleAuthSuccess = async (user: UserProfile) => {
    await saveUser(user);
    setStorageActiveUser(user);
    setActiveUser(user);
    setCurrentPage('DASHBOARD');
  };

  const handleLogout = () => {
    setStorageActiveUser(null);
    setActiveUser(null);
    setCurrentPage('LANDING');
  };

  const handleUpdateUser = useCallback(async (updated: UserProfile) => {
    await saveUser(updated);
    setActiveUser(updated);
  }, []);

  // Protected route logic
  useEffect(() => {
    if (!isHydrated) return;
    const isProtectedRoute = currentPage === 'DASHBOARD' || currentPage === 'ADMIN';
    if (isProtectedRoute && !activeUser) {
      setCurrentPage('LOGIN');
    }
  }, [currentPage, activeUser, isHydrated]);

  if (!isHydrated) {
    return null; 
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
