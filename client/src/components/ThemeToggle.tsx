
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { MoonIcon, SunIcon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div 
      onClick={toggleTheme}
      className="cursor-pointer p-2 rounded-full hover:bg-accent"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
    </div>
  );
};

export default ThemeToggle;
