
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, UserRole } from './types.ts';
import Layout from './components/Layout.tsx';
import Landing from './pages/Landing.tsx';
import SeekerDashboard from './pages/seeker/SeekerDashboard.tsx';
import EmployerDashboard from './pages/employer/EmployerDashboard.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AuthPage from './pages/auth/AuthPage.tsx';
import OnboardingFlow from './pages/onboarding/OnboardingFlow.tsx';
import About from './pages/info/About.tsx';
import EmployersInfo from './pages/info/EmployersInfo.tsx';
import Training from './pages/info/Training.tsx';
import Contact from './pages/info/Contact.tsx';
import { initializeStorage, saveUser, getActiveUser, setActiveUser } from './services/storage.ts';
import { usePersistentState } from './hooks/usePersistentState.ts';

type Page = 'LANDING' | 'DASHBOARD' | 'ADMIN' | 'LOGIN' | 'REGISTER' | 'ABOUT' | 'EMPLOYERS' | 'TRAINING' | 'CONTACT' | 'ONBOARDING';

const App: React.FC = () => {
  const [activeUser, setActiveUserInternal] = usePersistentState<UserProfile | null>('session', null);
  const [currentPage, setCurrentPage] = useState<Page>('LANDING');
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * PROFILE VALIDATION ENGINE
   * Hard-enforced criteria for Job Seekers
   */
  const isProfileIncomplete = useMemo(() => {
    if (!activeUser || activeUser.role !== UserRole.SEEKER) return false;
    // Seekers MUST have: City, Industry, and a Primary Skill
    const hasCity = !!activeUser.location.city && activeUser.location.city.trim().length > 0;
    const hasIndustry = !!activeUser.primaryIndustry;
    const hasSkill = !!activeUser.primarySkill;
    
    return !hasCity || !hasIndustry || !hasSkill;
  }, [activeUser]);

  // Core initialization and routing gate
  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;

      await initializeStorage();
      
      const session = getActiveUser();
      if (session) {
        setActiveUserInternal(session);
        
        // BOOT-TIME GUARD: If seeker is incomplete, force them into the onboarding flow immediately
        if (session.role === UserRole.SEEKER && (
          !session.location.city || !session.primaryIndustry || !session.primarySkill
        )) {
          setCurrentPage('ONBOARDING');
        } else {
          setCurrentPage(prev => (prev === 'LANDING' || prev === 'LOGIN' || prev === 'REGISTER') ? 'DASHBOARD' : prev);
        }
      }
      
      setIsHydrated(true);

      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }
    };

    init();
  }, [setActiveUserInternal]);

  const handleAuthSuccess = async (user: UserProfile) => {
    await saveUser(user);
    setActiveUser(user);
    setActiveUserInternal(user);
    
    // REDIRECTION FIREWALL: New seekers or those with empty profiles are diverted to onboarding
    const needsOnboarding = user.role === UserRole.SEEKER && (
      !user.location.city || !user.primaryIndustry || !user.primarySkill
    );
    
    if (needsOnboarding) {
      setCurrentPage('ONBOARDING');
    } else {
      setCurrentPage('DASHBOARD');
    }
  };

  const handleOnboardingComplete = async (industry: string, skill: string, location: { state: string, city: string }) => {
    if (!activeUser) return;
    
    const updated: UserProfile = {
      ...activeUser,
      primaryIndustry: industry,
      primarySkill: skill,
      skills: Array.from(new Set([...activeUser.skills, skill])),
      location: {
        ...activeUser.location,
        state: location.state,
        city: location.city,
        lga: location.city
      }
    };
    
    await saveUser(updated);
    setActiveUserInternal(updated);
    setCurrentPage('DASHBOARD');
  };

  const handleLogout = () => {
    setActiveUser(null);
    setActiveUserInternal(null);
    setCurrentPage('LANDING');
  };

  const handleUpdateUser = useCallback(async (updated: UserProfile) => {
    await saveUser(updated);
    setActiveUserInternal(updated);
  }, [setActiveUserInternal]);

  if (!isHydrated) return null; 

  /**
   * ROUTE RENDERER WITH GATED ACCESS
   */
  const renderPage = () => {
    // 1. SYSTEM-WIDE GATE: If seeker profile is incomplete, block all protected routes
    const isRestrictedPage = !['LANDING', 'LOGIN', 'REGISTER', 'ABOUT', 'EMPLOYERS', 'TRAINING', 'CONTACT'].includes(currentPage);
    
    if (activeUser && isProfileIncomplete && isRestrictedPage) {
      return <OnboardingFlow user={activeUser} onComplete={handleOnboardingComplete} />;
    }

    // 2. STANDARD ROUTING
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
      case 'ONBOARDING':
        if (!activeUser) return <AuthPage initialMode="LOGIN" onAuthSuccess={handleAuthSuccess} />;
        return <OnboardingFlow user={activeUser} onComplete={handleOnboardingComplete} />;
      case 'DASHBOARD':
        if (!activeUser) return <AuthPage initialMode="LOGIN" onAuthSuccess={handleAuthSuccess} />;
        
        // Fail-safe check: If somehow a seeker bypasses the guard and hits the dashboard
        if (activeUser.role === UserRole.SEEKER && isProfileIncomplete) {
          return <OnboardingFlow user={activeUser} onComplete={handleOnboardingComplete} />;
        }

        return activeUser.role === UserRole.SEEKER 
          ? <SeekerDashboard user={activeUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
          : <EmployerDashboard user={activeUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />;
      case 'ADMIN':
        return activeUser?.role === UserRole.ADMIN ? <AdminDashboard /> : <Landing onStart={() => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
      default:
        return <Landing onStart={() => setCurrentPage('REGISTER')} onNavigate={setCurrentPage} />;
    }
  };

  // Hide Navbar during onboarding or if profile is incomplete to ensure focus
  const hideGlobalNav = currentPage === 'ONBOARDING' || (!!activeUser && isProfileIncomplete && currentPage !== 'LANDING');

  return (
    <Layout 
      userRole={!hideGlobalNav ? activeUser?.role : undefined}
      userName={!hideGlobalNav ? activeUser?.fullName : undefined}
      onLogout={handleLogout}
      onNavigate={setCurrentPage}
      hideNav={hideGlobalNav}
    >
      <div className={`min-h-[70vh] fade-in ${hideGlobalNav ? 'pt-0' : ''}`}>
        {renderPage()}
      </div>
    </Layout>
  );
};

export default App;
