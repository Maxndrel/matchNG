
import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (page: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        role={userRole} 
        userName={userName}
        onLogout={onLogout} 
        onNavigate={onNavigate} 
      />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
