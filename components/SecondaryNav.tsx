
import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SecondaryNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: any) => void;
}

const SecondaryNav: React.FC<SecondaryNavProps> = ({ items, activeId, onSelect }) => {
  return (
    <nav className="fixed bottom-0 lg:top-20 lg:bottom-auto left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t lg:border-t-0 lg:border-b border-gray-200 lg:shadow-sm h-16 lg:h-14">
      <div className="container mx-auto px-4 max-w-6xl h-full">
        <div className="flex justify-around lg:justify-center items-center h-full overflow-x-auto no-scrollbar gap-1 lg:gap-10">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2.5 px-3 py-1 lg:py-4 h-full transition-all whitespace-nowrap relative group ${
                  activeId === item.id 
                    ? 'text-emerald-600' 
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 lg:w-4 lg:h-4 transition-transform ${activeId === item.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className={`text-[9px] lg:text-xs font-black uppercase tracking-[0.05em] ${activeId === item.id ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
                {activeId === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 lg:h-1 bg-emerald-600 rounded-t-full hidden lg:block" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
};

export default SecondaryNav;
