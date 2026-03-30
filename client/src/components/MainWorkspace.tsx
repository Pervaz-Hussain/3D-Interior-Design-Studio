import { useState, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SceneManager } from "@/lib/three/SceneManager";


type Tool = "move" | "rotate" | "scale";
type ViewMode = "3D" | "top";

interface MainWorkspaceProps {
  isLoading: boolean;
  design: any;
}

const MainWorkspace: React.FC<MainWorkspaceProps> = ({ 
  isLoading,
  design
}) => {
  // State for selected tools and view modes
  const [selectedTool, setSelectedTool] = useState<Tool>("move");
  const [viewMode, setViewMode] = useState<ViewMode>("3D");
  const [wireframe, setWireframe] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Processing room layout...");
  const [selectionInfo, setSelectionInfo] = useState<any>(null);

  // Refs for Three.js
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Update loading animation
  useEffect(() => {
    if (isLoading) {
      const messages = [
        "Analyzing room requirements...",
        "Generating 3D room structure...",
        "Creating furniture layout...",
        "Applying materials and textures...",
        "Optimizing lighting conditions...",
        "Finalizing design..."
      ];

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }

        const messageIndex = Math.min(Math.floor(progress / 20), messages.length - 1);
        setLoadingMessage(messages[messageIndex]);
        setLoadingProgress(progress);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Initialize Three.js scene
  useEffect(() => {
    if (canvasRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(canvasRef.current);

      // Set selection change callback
      sceneManagerRef.current.setSelectionChangeCallback(handleSelectionUpdate);
    }

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
      }
    };
  }, []);

  // Update scene when design changes
  useEffect(() => {
    if (sceneManagerRef.current && design?.config) {
      sceneManagerRef.current.updateScene(design.config);
    }
  }, [design]);

  // Update view mode
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setViewMode(viewMode);
    }
  }, [viewMode]);

  // Update wireframe mode
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setWireframe(wireframe);
    }
  }, [wireframe]);

  // Handle tool selection
  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setActiveTool(tool);
    }
  };

  // Camera controls
  const handleZoomIn = () => {
    sceneManagerRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    sceneManagerRef.current?.zoomOut();
  };

  const handleResetCamera = () => {
    sceneManagerRef.current?.resetCamera();
  };

  const handleToggleOrbit = () => {
    sceneManagerRef.current?.toggleOrbitControls();
  };

  // Handle selected item changes
  const handleRemoveFurniture = () => {
    if (selectionInfo && sceneManagerRef.current) {
      sceneManagerRef.current.removeSelectedObject();
      setSelectionInfo(null);
    }
  };

  // Update selection info
  const handleSelectionUpdate = (selection: any) => {
    setSelectionInfo(selection);
  };

  return (
    <div className="flex-grow bg-gray-100 dark:bg-gray-900 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="material-icons animate-spin text-5xl mb-4">refresh</div>
            <p className="text-xl font-medium">Generating Your Design</p>
            <p className="text-sm mt-2">{loadingMessage}</p>
            <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}


      {/* 3D Viewer */}
      <div className="absolute inset-0">
        {/* Canvas Container */}
        <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full relative three-canvas"
          ></div>
        </div>
      </div>



      {/* View Options */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl shadow-xl controls-appear border border-border/40">
        <div className="p-2 flex">
          <Button 
            variant={viewMode === "3D" ? "default" : "ghost"}
            className={cn(
              "p-2 flex flex-col items-center text-xs rounded-lg transition-all duration-200 hover:scale-105 min-w-[70px]",
              viewMode === "3D" && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
            )}
            onClick={() => setViewMode("3D")}
          >
            <span className="material-icons mb-1">view_in_ar</span>
            <span>3D View</span>
          </Button>
          <Button 
            variant={viewMode === "top" ? "default" : "ghost"}
            className={cn(
              "p-2 flex flex-col items-center text-xs rounded-lg transition-all duration-200 hover:scale-105 min-w-[70px]",
              viewMode === "top" && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
            )}
            onClick={() => setViewMode("top")}
          >
            <span className="material-icons mb-1">grid_view</span>
            <span>Top View</span>
          </Button>
          <div className="border-l border-border mx-2"></div>
          <Button 
            variant="ghost"
            className={cn(
              "p-2 flex flex-col items-center text-xs rounded-lg transition-all duration-200 hover:scale-105 min-w-[70px]",
              wireframe && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
            )}
            onClick={() => setWireframe(!wireframe)}
          >
            <span className="material-icons mb-1">grid_3x3</span>
            <span>Wireframe</span>
          </Button>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-full shadow-xl p-2 controls-appear border border-border/40">
        <div className="flex space-x-2">
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
            onClick={handleZoomIn}
          >
            <span className="material-icons text-primary">add</span>
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
            onClick={handleZoomOut}
          >
            <span className="material-icons text-primary">remove</span>
          </Button>
          <div className="border-l border-border mx-1"></div>
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
            onClick={handleResetCamera}
          >
            <span className="material-icons text-primary">fit_screen</span>
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
            onClick={handleToggleOrbit}
          >
            <span className="material-icons text-primary">3d_rotation</span>
          </Button>
        </div>
      </div>

      {/* Selection Info */}
      {selectionInfo && (
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl shadow-xl controls-appear border border-border/40 p-4 max-w-xs">
          <h3 className="font-medium text-base mb-3 text-primary">{selectionInfo.name}</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">X Position</label>
              <Input 
                type="number" 
                value={selectionInfo.position.x} 
                step="0.1" 
                className="w-full p-1 rounded-md border-border/60 focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  sceneManagerRef.current?.updateSelectedObject({
                    ...selectionInfo,
                    position: {
                      ...selectionInfo.position,
                      x: parseFloat(e.target.value)
                    }
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Y Position</label>
              <Input 
                type="number" 
                value={selectionInfo.position.y} 
                step="0.1" 
                className="w-full p-1 rounded-md border-border/60 focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  sceneManagerRef.current?.updateSelectedObject({
                    ...selectionInfo,
                    position: {
                      ...selectionInfo.position,
                      y: parseFloat(e.target.value)
                    }
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Z Position</label>
              <Input 
                type="number" 
                value={selectionInfo.position.z} 
                step="0.1" 
                className="w-full p-1 rounded-md border-border/60 focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  sceneManagerRef.current?.updateSelectedObject({
                    ...selectionInfo,
                    position: {
                      ...selectionInfo.position,
                      z: parseFloat(e.target.value)
                    }
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Rotation (°)</label>
              <Input 
                type="number" 
                value={selectionInfo.rotation} 
                step="15" 
                className="w-full p-1 rounded-md border-border/60 focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => {
                  sceneManagerRef.current?.updateSelectedObject({
                    ...selectionInfo,
                    rotation: parseFloat(e.target.value)
                  });
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-muted-foreground mb-1">Scale</label>
              <div className="flex items-center">
                <Input 
                  type="range" 
                  value={selectionInfo.scale} 
                  min="0.1" 
                  max="3.0" 
                  step="0.1" 
                  className="w-full p-1 h-2 rounded-md accent-primary"
                  onChange={(e) => {
                    sceneManagerRef.current?.updateSelectedObject({
                      ...selectionInfo,
                      scale: parseFloat(e.target.value)
                    });
                  }}
                />
                <span className="ml-2 w-8 text-center">{selectionInfo.scale.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Furniture Color Customization */}
          <div className="mt-3 border-t border-border/40 pt-3">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Appearance</h4>
            <div className="flex flex-wrap gap-2">
             {[
  '#5D4037',  // Dark Walnut
  '#8D6E63',  // Light Walnut
  '#A1887F',  // Taupe
  '#D7CCC8',  // Fabric Beige
  '#B0BEC5',  // Cool Metal
  '#757575',  // Industrial Grey
  '#212121',  // Charcoal Black
  '#C5E1A5',  // Light Sage
  '#FFE082',  // Pine Wood
  '#FFAB91',  // Terracotta
].map((color) => (

                <button 
                  key={color}
                  className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (sceneManagerRef.current?.selectedObject) {
                      // Update color of the selected furniture
                      sceneManagerRef.current.updateFurnitureColor(color);
                    }
                  }}
                  title={`Apply ${color} color`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainWorkspace;