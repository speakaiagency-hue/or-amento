
import React from 'react';
import { ArrowLeft, Wrench, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3">
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft size={24} className="text-orange-500" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Wrench size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">Serralheria Pro</h1>
            </div>
          </div>
          
          {activeTab === 'dashboard' && (
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
            >
              <User size={24} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      <footer className="p-4 text-center text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} Serralheria Pro - Orçamentos Profissionais
      </footer>
    </div>
  );
};
