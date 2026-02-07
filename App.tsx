
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    initializeStorage();
    const session = getActiveUser();
    if (session) {
      setActiveUser(session);
      setCurrentPage(session.role === UserRole.SEEKER ? 'DASHBOARD' : 'DASHBOARD');
    }
    setIsInitialized(true);
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setActiveUser(user);
    setStorageActiveUser(user);
    saveUser(user);
    setCurrentPage('DASHBOARD');
  };

  const handleLogout = () => {
    setActiveUser(null);
    setStorageActiveUser(null);
    setCurrentPage('LANDING');
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setActiveUser(updated);
    saveUser(updated); 
    setStorageActiveUser(updated);
  };

  useEffect(() => {
    if (!isInitialized) return;

    const isDashboardRoute = currentPage === 'DASHBOARD';
    const isAdminRoute = currentPage === 'ADMIN';
    const isAuthRoute = ['LOGIN', 'REGISTER'].includes(currentPage);

    if ((isDashboardRoute || isAdminRoute) && !activeUser) {
      setCurrentPage('LOGIN');
      return;
    }

    if (isAdminRoute && activeUser?.role !== UserRole.ADMIN) {
      setCurrentPage('LANDING');
      return;
    }

    if (isAuthRoute && activeUser) {
      setCurrentPage('DASHBOARD');
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
