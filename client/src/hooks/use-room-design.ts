import { useState } from "react";
import { RoomConfig, RoomDesign } from "@shared/schema";

export interface RecentGeneration {
  id: string;
  thumbnail: string;
  prompt: string;
}

interface SafeRoomDesign extends Omit<RoomDesign, 'configuration'> {
  configuration: RoomConfig;
}

export function useRoomDesign() {
  const [currentDesign, setCurrentDesign] = useState<SafeRoomDesign | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);

  // Update the entire design
  const updateDesign = (design: RoomDesign) => {
    setCurrentDesign(design as SafeRoomDesign);
  };

  // Update only the room configuration
  const updateRoomConfig = (config: RoomConfig) => {
    if (!currentDesign) return;
    
    setCurrentDesign({
      ...currentDesign,
      configuration: config
    });
  };

  // Add furniture to the room
  const addFurnitureToRoom = (furniture: any) => {
    if (!currentDesign || !currentDesign.configuration) return;
    
    const currentFurniture = currentDesign.configuration.furniture || [];
    
    const updatedConfig = {
      ...currentDesign.configuration,
      furniture: [...currentFurniture, furniture]
    };
    
    setCurrentDesign({
      ...currentDesign,
      configuration: updatedConfig
    });
  };

  // Remove furniture from the room
  const removeFurnitureFromRoom = (furnitureId: number) => {
    if (!currentDesign || !currentDesign.configuration.furniture) return;
    
    const updatedFurniture = currentDesign.configuration.furniture.filter(
      (item: any) => item.id !== furnitureId
    );
    
    const updatedConfig = {
      ...currentDesign.configuration,
      furniture: updatedFurniture
    };
    
    setCurrentDesign({
      ...currentDesign,
      configuration: updatedConfig
    });
  };

  // Update furniture position/rotation/scale
  const updateFurniture = (furnitureId: number, updates: any) => {
    if (!currentDesign || !currentDesign.configuration || !currentDesign.configuration.furniture) return;
    
    const updatedFurniture = currentDesign.configuration.furniture.map((item: any) => {
      if (item.id === furnitureId) {
        return { ...item, ...updates };
      }
      return item;
    });
    
    const updatedConfig = {
      ...currentDesign.configuration,
      furniture: updatedFurniture
    };
    
    setCurrentDesign({
      ...currentDesign,
      configuration: updatedConfig
    });
  };

  // Load a saved design
  const loadDesign = (design: RoomDesign) => {
    setCurrentDesign(design as SafeRoomDesign);
  };

  // Add a generation to recent generations
  const addRecentGeneration = (generation: RecentGeneration) => {
    // Limit to 6 recent generations
    const updatedGenerations = [generation, ...recentGenerations.slice(0, 5)];
    setRecentGenerations(updatedGenerations);
  };

  return {
    currentDesign,
    recentGenerations,
    updateDesign,
    updateRoomConfig,
    addFurnitureToRoom,
    removeFurnitureFromRoom,
    updateFurniture,
    loadDesign,
    addRecentGeneration
  };
}
