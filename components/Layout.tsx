
'use client';

import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (page: any) => void;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, onNavigate, hideNav }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideNav && (
        <Navbar 
          role={userRole} 
          userName={userName}
          onLogout={onLogout} 
          onNavigate={onNavigate} 
        />
      )}
      <main className={`flex-grow container mx-auto max-w-6xl ${hideNav ? 'p-0' : 'px-4 py-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
