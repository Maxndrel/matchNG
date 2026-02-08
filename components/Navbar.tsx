
import React from 'react';
import { UserRole } from '../types.ts';
import { Briefcase, User } from 'lucide-react';
import SyncIndicator from './SyncIndicator.tsx';

interface NavbarProps {
  role?: string;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (page: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, userName, onLogout, onNavigate }) => {
  const getRoleColor = (r?: string) => {
    switch (r) {
      case UserRole.SEEKER: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case UserRole.EMPLOYER: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const navLinks = [
    { label: 'Home', page: 'LANDING' },
    { label: 'About', page: 'ABOUT' },
    { label: 'Employers', page: 'EMPLOYERS' },
    { label: 'Training', page: 'TRAINING' },
    { label: 'Contact', page: 'CONTACT' },
  ];

  const handleLogoClick = () => {
    if (!role) {
      onNavigate?.('LANDING');
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div 
            onClick={handleLogoClick} 
            className={`flex items-center gap-2 text-2xl font-black transition-all ${
              !role 
                ? 'cursor-pointer hover:opacity-90 active:scale-95' 
                : 'cursor-default'
            }`}
            title={role ? "You are currently on your dashboard" : "Go to matchNG Home"}
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Briefcase className="text-white w-6 h-6" />
            </div>
            <span className="text-gray-900 tracking-tighter">match<span className="text-emerald-600">NG</span></span>
          </div>

          {!role && (
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map(link => (
                <button 
                  key={link.page}
                  onClick={() => onNavigate?.(link.page as any)}
                  className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <SyncIndicator />
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          {role ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  {userName && <span className="text-xs font-bold text-gray-900 leading-none hidden sm:block">{userName}</span>}
                  <span className={`text-[10px] ${userName ? 'mt-1' : ''} font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleColor(role)}`}>
                    {role}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onNavigate?.('LOGIN')}
                className="text-sm font-bold text-gray-600 hover:text-emerald-600 px-4 py-2 transition-colors rounded-lg hover:bg-gray-50"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate?.('REGISTER')}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
              >
                Join Now
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
