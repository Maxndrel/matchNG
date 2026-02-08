
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  Users, 
  Settings, 
  Inbox, 
  Search,
  ChevronRight
} from 'lucide-react';

export type EmployerTabId = 'OVERVIEW' | 'POST_JOB' | 'LISTINGS' | 'CANDIDATES' | 'APPLICATIONS' | 'SETTINGS';

interface EmployerBottomNavProps {
  activeTab: EmployerTabId;
  onSelect: (id: EmployerTabId) => void;
  isPublishing?: boolean;
}

export interface NavConfig {
  id: EmployerTabId | 'TALENT_GROUP';
  label: string;
  icon: any;
  subItems?: EmployerTabId[];
}

export const EMPLOYER_NAV_CONFIG: NavConfig[] = [
  { id: 'OVERVIEW', label: 'Home', icon: LayoutDashboard },
  { id: 'POST_JOB', label: 'Post', icon: PlusCircle },
  { id: 'LISTINGS', label: 'Jobs', icon: ListFilter },
  { id: 'TALENT_GROUP', label: 'People', icon: Users, subItems: ['CANDIDATES', 'APPLICATIONS'] },
  { id: 'SETTINGS', label: 'More', icon: Settings },
];

const TALENT_SUB_ITEMS = [
  { id: 'CANDIDATES' as EmployerTabId, label: 'Discover Talent', icon: Search, desc: 'Find compatible seekers' },
  { id: 'APPLICATIONS' as EmployerTabId, label: 'Applications', icon: Inbox, desc: 'Review incoming intent' },
];

const EmployerBottomNav: React.FC<EmployerBottomNavProps> = ({ activeTab, onSelect, isPublishing }) => {
  const [isTalentOpen, setIsTalentOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsTalentOpen(false);
      }
    };
    if (isTalentOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTalentOpen]);

  const handleNavClick = (config: NavConfig) => {
    if (isPublishing) return;
    
    if (config.id === 'TALENT_GROUP') {
      setIsTalentOpen(!isTalentOpen);
    } else {
      setIsTalentOpen(false);
      onSelect(config.id as EmployerTabId);
    }
  };

  const isTalentActive = TALENT_SUB_ITEMS.some(item => item.id === activeTab);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none px-4 pb-4">
      {/* Sub-menu for Talent Group */}
      {isTalentOpen && (
        <div 
          ref={menuRef}
          className="mb-4 w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-2 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div className="p-3">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Talent Management</h4>
             <div className="space-y-1">
                {TALENT_SUB_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      setIsTalentOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-[10px] opacity-60 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'text-emerald-400' : 'text-gray-200'}`} />
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className={`w-full max-w-md bg-gray-900 rounded-[2rem] h-20 px-2 shadow-2xl pointer-events-auto border border-white/10 flex items-center justify-between transition-all ${isPublishing ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        {EMPLOYER_NAV_CONFIG.map((item) => {
          const isActive = item.id === 'TALENT_GROUP' ? isTalentActive : activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all relative ${
                isActive ? 'text-emerald-400' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-emerald-400/10 scale-110' : 'hover:bg-white/5'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-400 rounded-t-full shadow-[0_-4px_10px_rgba(52,211,153,0.5)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default EmployerBottomNav;
