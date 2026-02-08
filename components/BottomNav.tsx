
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  User, 
  Target, 
  FileText, 
  MoreHorizontal, 
  Star, 
  GraduationCap, 
  Settings,
  ChevronRight
} from 'lucide-react';

export type NavTabId = 'OVERVIEW' | 'PROFILE' | 'MATCHES' | 'APPLICATIONS' | 'SAVED' | 'TRAINING' | 'SETTINGS';

interface BottomNavProps {
  activeTab: NavTabId;
  onSelect: (id: NavTabId) => void;
  disabled?: boolean;
}

export interface NavConfig {
  id: NavTabId | 'MORE';
  label: string;
  icon: any;
  subItems?: NavTabId[];
}

export const BOTTOM_NAV_CONFIG: NavConfig[] = [
  { id: 'OVERVIEW', label: 'Home', icon: Home },
  { id: 'PROFILE', label: 'Profile', icon: User },
  { id: 'MATCHES', label: 'Matches', icon: Target },
  { id: 'APPLICATIONS', label: 'Apps', icon: FileText },
  { id: 'MORE', label: 'More', icon: MoreHorizontal, subItems: ['SAVED', 'TRAINING', 'SETTINGS'] },
];

const MORE_ITEMS = [
  { id: 'SAVED' as NavTabId, label: 'Saved Jobs', icon: Star },
  { id: 'TRAINING' as NavTabId, label: 'Training', icon: GraduationCap },
  { id: 'SETTINGS' as NavTabId, label: 'Settings', icon: Settings },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelect, disabled }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close "More" menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  // Determine if the "More" item is effectively active
  const isMoreActive = MORE_ITEMS.some(item => item.id === activeTab);

  const handleNavClick = (config: NavConfig) => {
    if (disabled) return;
    
    if (config.id === 'MORE') {
      setIsMoreOpen(!isMoreOpen);
    } else {
      setIsMoreOpen(false);
      onSelect(config.id as NavTabId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none">
      {/* More Menu Overlay */}
      {isMoreOpen && (
        <div 
          ref={menuRef}
          className="mb-4 w-[calc(100%-2rem)] max-w-sm bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-3 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div className="space-y-1">
            {MORE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  setIsMoreOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="font-bold text-sm uppercase tracking-wider">{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'text-emerald-400' : 'text-gray-200'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 h-20 px-2 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pointer-events-auto">
        <div className="max-w-xl mx-auto h-full flex items-center justify-between">
          {BOTTOM_NAV_CONFIG.map((item) => {
            const isActive = item.id === 'MORE' ? isMoreActive : activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                disabled={disabled}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all relative ${
                  disabled ? 'opacity-30 cursor-not-allowed' : ''
                } ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-emerald-50 scale-110' : ''}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 rounded-b-full shadow-[0_2px_10px_rgba(16,185,129,0.3)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
