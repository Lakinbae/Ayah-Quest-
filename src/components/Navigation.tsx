import React from 'react';
import { Home, Headphones, BookOpen, BarChart3, User, Swords } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'hifz' as TabType, label: 'Hifz', icon: Headphones },
    { id: 'quran' as TabType, label: 'Quran', icon: BookOpen },
    { id: 'quiz' as TabType, label: 'Duel', icon: Swords },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 py-1.5 px-2 max-w-lg mx-auto">
      <div className="grid grid-cols-6 gap-0.5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 rounded-xl font-medium text-[10.5px] transition-all ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-105'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="truncate max-w-[48px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
