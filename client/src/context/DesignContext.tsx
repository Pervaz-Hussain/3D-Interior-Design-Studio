import { createContext, useContext, ReactNode, useState } from "react";
import { RoomConfig, RoomDesign } from "@shared/schema";

export interface RecentGeneration {
  id: string;
  thumbnail: string;
  prompt: string;
}

interface DesignContextType {
  currentDesign: RoomDesign | null;
  recentGenerations: RecentGeneration[];
  updateDesign: (design: RoomDesign) => void;
  updateRoomConfig: (config: RoomConfig) => void;
  addFurnitureToRoom: (furniture: any) => void;
  removeFurnitureFromRoom: (furnitureId: number) => void;
  updateFurniture: (furnitureId: number, updates: any) => void;
  loadDesign: (design: RoomDesign) => void;
  addRecentGeneration: (generation: RecentGeneration) => void;
}

// Create a context with default values
const initialContextValue: DesignContextType = {
  currentDesign: null,
  recentGenerations: [],
  updateDesign: () => {},
  updateRoomConfig: () => {},
  addFurnitureToRoom: () => {},
  removeFurnitureFromRoom: () => {},
  updateFurniture: () => {},
  loadDesign: () => {},
  addRecentGeneration: () => {}
};

const DesignContext = createContext<DesignContextType>(initialContextValue);

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [currentDesign, setCurrentDesign] = useState<RoomDesign | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);

  // Update the entire design
  const updateDesign = (design: RoomDesign) => {
    setCurrentDesign(design);
  };

  // Update only the room configuration
  const updateRoomConfig = (config: RoomConfig) => {
    if (!currentDesign) return;
    
    setCurrentDesign({
      ...currentDesign,
      config: config
    });
  };

  // Add furniture to the room
  const addFurnitureToRoom = (furniture: any) => {
    if (!currentDesign || !currentDesign.config) return;
    
    const currentConfig = currentDesign.config as any;
    const currentFurniture = currentConfig.furniture || [];
    
    const updatedConfig = {
      ...currentConfig,
      furniture: [...currentFurniture, furniture]
    };
    
    setCurrentDesign({
      ...currentDesign,
      config: updatedConfig
    });
  };

  // Remove furniture from the room
  const removeFurnitureFromRoom = (furnitureId: number) => {
    if (!currentDesign || !currentDesign.config) return;
    
    const currentConfig = currentDesign.config as any;
    if (!currentConfig.furniture) return;
    
    const updatedFurniture = currentConfig.furniture.filter(
      (item: any) => item.id !== furnitureId
    );
    
    const updatedConfig = {
      ...currentConfig,
      furniture: updatedFurniture
    };
    
    setCurrentDesign({
      ...currentDesign,
      config: updatedConfig
    });
  };

  // Update furniture position/rotation/scale
  const updateFurniture = (furnitureId: number, updates: any) => {
    if (!currentDesign || !currentDesign.config) return;
    
    const currentConfig = currentDesign.config as any;
    if (!currentConfig.furniture) return;
    
    const updatedFurniture = currentConfig.furniture.map((item: any) => {
      if (item.id === furnitureId) {
        return { ...item, ...updates };
      }
      return item;
    });
    
    const updatedConfig = {
      ...currentConfig,
      furniture: updatedFurniture
    };
    
    setCurrentDesign({
      ...currentDesign,
      config: updatedConfig
    });
  };

  // Load a saved design
  const loadDesign = (design: RoomDesign) => {
    setCurrentDesign(design);
  };

  // Add a generation to recent generations
  const addRecentGeneration = (generation: RecentGeneration) => {
    // Limit to 6 recent generations
    const updatedGenerations = [generation, ...recentGenerations.slice(0, 5)];
    setRecentGenerations(updatedGenerations);
  };

  return (
    <DesignContext.Provider value={{
      currentDesign,
      recentGenerations,
      updateDesign,
      updateRoomConfig,
      addFurnitureToRoom,
      removeFurnitureFromRoom,
      updateFurniture,
      loadDesign,
      addRecentGeneration
    }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesignContext = () => {
  return useContext(DesignContext);
};
