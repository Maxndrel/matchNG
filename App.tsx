
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Central Sync Listener: This is the ONLY place that should react to 'storage-sync'
  // to prevent circular dependency crashes.
  useEffect(() => {
    const handleSync = () => {
      const session = getActiveUser();
      if (JSON.stringify(session) !== JSON.stringify(activeUser)) {
        setActiveUser(session);
      }
    };

    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, [activeUser]);

  useEffect(() => {
    initializeStorage();
    const session = getActiveUser();
    if (session) {
      setActiveUser(session);
      // Ensure we stay on dashboard if logged in
      if (currentPage === 'LANDING' || currentPage === 'LOGIN' || currentPage === 'REGISTER') {
        setCurrentPage('DASHBOARD');
      }
    }
    setIsInitialized(true);
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
    // Standard data flow: update storage, wait for storage-sync or manual state update
    saveUser(updated);
    setActiveUser(updated);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const isDashboardRoute = currentPage === 'DASHBOARD';
    const isAdminRoute = currentPage === 'ADMIN';

    if ((isDashboardRoute || isAdminRoute) && !activeUser) {
      setCurrentPage('LOGIN');
      return;
    }

    if (isAdminRoute && activeUser?.role !== UserRole.ADMIN) {
      setCurrentPage('LANDING');
    }
  }, [currentPage, activeUser, isInitialized]);

  if (!isInitialized) return null;

  const renderPage = () => {
    switch (currentPage) {
      case 'LANDING':
        return <Landing onStart={(role) => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
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
        if (!activeUser) return null;
        return activeUser.role === UserRole.SEEKER 
          ? <SeekerDashboard user={activeUser} onUpdateUser={handleUpdateUser} />
          : <EmployerDashboard user={activeUser} onUpdateUser={handleUpdateUser} />;
      case 'ADMIN':
        return activeUser?.role === UserRole.ADMIN ? <AdminDashboard /> : null;
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
