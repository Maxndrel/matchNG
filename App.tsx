
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
      const session = getActiveUser();
      if (session?.id !== activeUser?.id) {
        setActiveUser(session);
      }
    };

    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, [activeUser?.id]);

  // Root Initialization
  useEffect(() => {
    initializeStorage();
    const session = getActiveUser();
    if (session) {
      setActiveUser(session);
      // Auto-redirect if session is active
      setCurrentPage(prev => (prev === 'LANDING' || prev === 'LOGIN' || prev === 'REGISTER') ? 'DASHBOARD' : prev);
    }
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
    const isProtected = currentPage === 'DASHBOARD' || currentPage === 'ADMIN';
    if (isProtected && !activeUser) {
      setCurrentPage('LOGIN');
    }
  }, [currentPage, activeUser, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">Initializing Engine...</p>
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
      <div className="min-h-[65vh] fade-in">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default App;
