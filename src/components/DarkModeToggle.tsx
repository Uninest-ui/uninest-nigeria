import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DarkModeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'header';
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  variant = 'default' 
}) => {
  const { isDark, toggleTheme } = useTheme();

  const isHeader = variant === 'header';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="btn-toggle-dark-mode"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        isHeader
          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15 active:scale-95 shadow-xs'
          : isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="flex items-center gap-1.5">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
        ) : (
          <Moon className={`w-4 h-4 transition-transform -rotate-12 hover:rotate-0 ${isHeader ? 'text-white' : 'text-slate-700'}`} />
        )}
        {showLabel && (
          <span className="text-xs font-bold whitespace-nowrap">
            {isDark ? 'Light' : 'Dark'}
          </span>
        )}
      </div>
    </button>
  );
};
