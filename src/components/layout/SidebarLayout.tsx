import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, TrendingUp, TrendingDown, Landmark, Calculator, Clock, Heart, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { Theme } from '../../App';
import { Language } from '../../lib/i18n';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: string;
  onLogout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
}

export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'income', label: 'Income Tracker', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses Tracker', icon: TrendingDown },
  { id: 'networth', label: 'Net Worth Tracker', icon: Landmark },
  { id: 'timevalue', label: 'Time Value Calc', icon: Calculator },
  { id: 'realwage', label: 'Real Wage Estimator', icon: Clock },
  { id: 'gratitude', label: 'Gratitude Journal', icon: Heart },
];

export default function SidebarLayout({ children, activeTab, setActiveTab, user, onLogout, theme, setTheme, language }: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dim:bg-[#1e1e1e] dark:bg-[#0a0a0a]">
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white dim:bg-[#2d2d2d] dark:bg-[#141414] border-r border-gray-200 dim:border-gray-800 dark:border-gray-800 transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dim:border-gray-800 dark:border-gray-800">
            <span className="text-xl font-bold text-gray-900 dim:text-white dark:text-white">Kraft</span>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 dim:bg-blue-900/30 dim:text-blue-400 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-gray-700 hover:bg-gray-100 dim:text-gray-300 dim:hover:bg-[#3d3d3d] dark:text-gray-300 dark:hover:bg-[#242424]'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-700 dim:text-blue-400 dark:text-blue-400' : 'text-gray-400 dim:text-gray-500 dark:text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 dim:border-gray-800 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dim:text-gray-300 dark:text-gray-300 truncate">{user}</span>
              <button onClick={onLogout} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-between bg-gray-100 dim:bg-[#1e1e1e] dark:bg-black rounded-lg p-1">
              <button onClick={() => setTheme('light')} className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><Sun className="h-4 w-4" /></button>
              <button onClick={() => setTheme('dim')} className={`p-1.5 rounded-md ${theme === 'dim' ? 'bg-[#2d2d2d] shadow-sm text-blue-400' : 'text-gray-500'}`}><Monitor className="h-4 w-4" /></button>
              <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-[#141414] shadow-sm text-blue-400' : 'text-gray-500'}`}><Moon className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 dim:border-gray-800 dark:border-gray-800 bg-white dim:bg-[#2d2d2d] dark:bg-[#141414] px-4 lg:px-8">
          <button onClick={() => setIsOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dim:text-white dark:text-white lg:block hidden">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <h1 className="text-lg font-semibold text-gray-900 dim:text-white dark:text-white lg:hidden">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="w-6 lg:hidden"></div> {/* Spacer for centering on mobile */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
