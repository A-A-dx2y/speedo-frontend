import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/index.js';
import { toggleTheme } from '../../store/slices/themeSlice.js'; // New import path

const ThemeToggle: React.FC = () => {
  const { mode } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 group"
      aria-label="Toggle Theme"
    >
      {mode === 'dark' ? (
        <Sun 
          size={18} 
          className="text-gray-400 group-hover:text-yellow-400 transition-colors animate-in fade-in zoom-in duration-500" 
        />
      ) : (
        <Moon 
          size={18} 
          className="text-slate-600 group-hover:text-blue-600 transition-colors animate-in fade-in zoom-in duration-500" 
        />
      )}
    </button>
  );
};

export default ThemeToggle;
