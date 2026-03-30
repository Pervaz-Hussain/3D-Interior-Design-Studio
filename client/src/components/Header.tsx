import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

interface HeaderProps {
  onToggleSidebar: () => void;
  onSaveDesign: () => void;
  onLoadDesign: () => void;
}

const Header = ({ onToggleSidebar, onSaveDesign, onLoadDesign }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [saveMenuVisible, setSaveMenuVisible] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSaveMenu = () => {
    setSaveMenuVisible(!saveMenuVisible);
  };

  const handleSaveDesign = () => {
    onSaveDesign();
    setSaveMenuVisible(false);
  };

  const handleLoadDesign = () => {
    onLoadDesign();
    setSaveMenuVisible(false);
  };

  const handleExportDesign = () => {
    // Implementation for export functionality
    setSaveMenuVisible(false);
  };

  const handleToggleHelp = () => {
    // Implementation for help overlay
  };

  return (
    <header className="w-full bg-card shadow-md z-10 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary">view_in_ar</span>
          <h1 className="font-heading font-bold text-xl md:text-2xl">3D Interior Design Studio</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Save/Load Menu */}
          <div className="relative inline-block">
            <button 
              onClick={toggleSaveMenu} 
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <span className="material-icons">save</span>
            </button>
            {saveMenuVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-card shadow-lg rounded-md py-1 z-20">
                <button 
                  onClick={handleSaveDesign} 
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center"
                >
                  <span className="material-icons mr-2 text-sm">save</span>
                  Save Design
                </button>
                <button 
                  onClick={handleLoadDesign} 
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center"
                >
                  <span className="material-icons mr-2 text-sm">folder_open</span>
                  Load Design
                </button>
                <button 
                  onClick={handleExportDesign} 
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center"
                >
                  <span className="material-icons mr-2 text-sm">ios_share</span>
                  Export
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleToggleHelp} 
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <span className="material-icons">help_outline</span>
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <span className="material-icons">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
