import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from './store/index.js';
import AppRoutes from './routes/AppRoutes.js';

const App: React.FC = () => {
  
  const { mode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }, [mode]);

  return (
    <div className="antialiased font-sans transition-colors duration-300">
      <AppRoutes />
    </div>
  );
};

export default App;
