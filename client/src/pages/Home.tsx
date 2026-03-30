import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainWorkspace from "@/components/MainWorkspace";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import SaveDesignModal from "@/components/SaveDesignModal";
import LoadDesignModal from "@/components/LoadDesignModal";
import { useDesignContext } from "@/context/DesignContext";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [loadModalVisible, setLoadModalVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { currentDesign } = useDesignContext();

  // Check if this is the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedInteriorAI');
    if (hasVisited) {
      setWelcomeVisible(true);
    }
  }, []);

  const closeWelcome = () => {
    setWelcomeVisible(false);
    localStorage.setItem('hasVisitedInteriorAI', 'true');
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Query saved designs on component mount
  const { data: savedDesigns } = useQuery({
    queryKey: ['/api/designs'],
    enabled: !welcomeVisible, // Only fetch after welcome screen is closed
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onToggleSidebar={handleToggleSidebar}
        onSaveDesign={() => setSaveModalVisible(true)}
        onLoadDesign={() => setLoadModalVisible(true)}
      />
      
      <main className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={handleToggleSidebar}
          onGenerateStart={() => setIsLoading(true)}
          onGenerateComplete={() => setIsLoading(false)}
        />
        
        <MainWorkspace 
          isLoading={isLoading}
          design={currentDesign}
        />
      </main>

      {welcomeVisible && (
        <WelcomeOverlay onClose={closeWelcome} />
      )}

      {saveModalVisible && (
        <SaveDesignModal 
          onClose={() => setSaveModalVisible(false)} 
        />
      )}

      {loadModalVisible && (
        <LoadDesignModal 
          designs={savedDesigns || []}
          onClose={() => setLoadModalVisible(false)} 
        />
      )}
    </div>
  );
};

export default Home;
