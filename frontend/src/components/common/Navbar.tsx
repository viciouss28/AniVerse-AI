import React from 'react';
import { Logo } from './Logo';
import { Sparkles, Home as HomeIcon, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'chat';
  onNavigate: (page: 'home' | 'chat') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border/60 bg-dark-900/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo + Title */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 group focus:outline-none"
        >
          <Logo size="md" className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="font-bold text-lg tracking-tight text-appText-main group-hover:text-brand-violet transition-colors">
              AniVerse <span className="text-brand-cyan">AI</span>
            </span>
          </div>
        </button>

        {/* CENTER / RIGHT: Navigation Pills */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-surface-900/80 p-1.5 rounded-full border border-surface-border">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentPage === 'home'
                ? 'bg-surface-700 text-white shadow-sm border border-brand-violet/30'
                : 'text-appText-muted hover:text-white hover:bg-surface-800/50'
            }`}
          >
            <HomeIcon size={15} />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentPage === 'chat'
                ? 'bg-brand-purple/20 text-brand-cyan border border-brand-purple/40 shadow-glow-purple'
                : 'text-appText-muted hover:text-white hover:bg-surface-800/50'
            }`}
          >
            <MessageSquare size={15} />
            <span>AI Chat</span>
          </button>
        </nav>

        {/* RIGHT: AI Ready Indicator + Action Button */}
        <div className="flex items-center space-x-3">
          {/* AI Ready Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            <Sparkles size={12} />
            <span>AI Ready</span>
          </div>

          {/* Dynamic Page Action Button */}
          {currentPage === 'home' ? (
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-surface-800 hover:bg-surface-700 rounded-lg border border-surface-border hover:border-brand-violet/50 transition-all shadow-sm"
            >
              Get Started
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-surface-800 hover:bg-surface-700 rounded-lg border border-surface-border hover:border-brand-violet/50 transition-all shadow-sm"
            >
              Back to Home
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
