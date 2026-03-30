import { useState } from "react";
import AIPromptSection from "./AIPromptSection";
import RoomConfigSection from "./RoomConfigSection";
import FurnitureLibrary from "./FurnitureLibrary";
import { useDesignContext } from "@/context/DesignContext";
import { apiRequest } from "@/lib/queryClient";
import { RoomGenerationRequest, RoomType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onGenerateStart: () => void;
  onGenerateComplete: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onGenerateStart, 
  onGenerateComplete 
}) => {
  const { toast } = useToast();
  const { updateDesign, recentGenerations, addRecentGeneration } = useDesignContext();
  const [roomPrompt, setRoomPrompt] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("living_room");
  const [roomStyle, setRoomStyle] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRoom = async () => {
    if (roomPrompt.trim().length < 3) {
      toast({
        title: "Invalid Prompt",
        description: "Please enter a more detailed room description",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      onGenerateStart();

      const request: RoomGenerationRequest = {
        prompt: roomPrompt,
        roomType,
        style: roomStyle
      };

      const response = await apiRequest('POST', '/api/generate-room', request);
      const data = await response.json();
      
      if (data && data.config) {
        // Create a proper design object matching RoomDesign type
        const design = {
          id: Date.now(),
          name: `Generated ${roomType} - ${roomStyle}`,
          thumbnail: data.thumbnail,
          config: data.config,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: null
        };
        
        updateDesign(design);
      } else {
        throw new Error("Invalid response from generation API");
      }
      addRecentGeneration({
        id: data.id,
        thumbnail: data.thumbnail,
        prompt: roomPrompt
      });

      toast({
        title: "Room Generated",
        description: "Your room has been successfully created",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate room design",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      onGenerateComplete();
    }
  };

  const handleLoadGeneration = (generationId: string) => {
    // Implementation for loading a previous generation
  };

  return (
    <aside 
      className={`w-full md:w-80 lg:w-96 bg-card shadow-lg flex flex-col z-10 transition-all duration-300 md:h-full overflow-y-auto
        ${!isOpen && "md:w-0 md:min-w-0 md:overflow-hidden"}`}
    >
      {/* Mobile Toggle */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-border">
        <h2 className="font-heading font-medium text-lg">Design Controls</h2>
        <button 
          onClick={onToggle} 
          className="p-1 rounded hover:bg-muted"
        >
          <span className="material-icons">menu</span>
        </button>
      </div>
      
      {/* Sidebar Content */}
      <div className="p-4 space-y-6 flex-grow">
        <AIPromptSection 
          roomPrompt={roomPrompt}
          setRoomPrompt={setRoomPrompt}
          roomType={roomType}
          setRoomType={setRoomType}
          roomStyle={roomStyle}
          setRoomStyle={setRoomStyle}
          onGenerate={handleGenerateRoom}
          isGenerating={isGenerating}
          recentGenerations={recentGenerations}
          onLoadGeneration={handleLoadGeneration}
        />
        
        <div className="border-t border-border pt-4">
          <RoomConfigSection />
        </div>
        
        <div className="border-t border-border pt-4">
          <FurnitureLibrary />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
