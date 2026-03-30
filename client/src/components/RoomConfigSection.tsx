import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDesignContext } from "@/context/DesignContext";


const RoomConfigSection = () => {
  const { currentDesign, updateRoomConfig } = useDesignContext();

  const [roomWidth, setRoomWidth] = useState("4.5");
  const [roomLength, setRoomLength] = useState("6.0");
  const [roomHeight, setRoomHeight] = useState("2.8");
  const [wallColor, setWallColor] = useState("#F5F5F5");
  const [floorColor, setFloorColor] = useState("#8B4513");
  const [lightIntensity, setLightIntensity] = useState(70);
  const [lightWarmth, setLightWarmth] = useState(50);
  const [furnitureDensity, setFurnitureDensity] = useState(50);
  const [furnitureStyle, setFurnitureStyle] = useState("exact");

  useEffect(() => {
    if (currentDesign?.config) {
      const { dimensions, colors, floor, lighting } = currentDesign.config;

      if (dimensions) {
        setRoomWidth(dimensions.width?.toString() || "4.5");
        setRoomLength(dimensions.length?.toString() || "6.0");
        setRoomHeight(dimensions.height?.toString() || "2.8");
      }

      if (colors) {
        setWallColor(colors.walls || "#F5F5F5");
        setFloorColor(colors.floor || "#8B4513");
      } else if (floor?.color) {
        setFloorColor(floor.color);
      }

      if (lighting) {
        setLightIntensity(typeof lighting.intensity === "number" ? lighting.intensity : 70);
        setLightWarmth(typeof lighting.warmth === "number" ? lighting.warmth : 50);
      }
    }
  }, [currentDesign]);

  const getLightWarmthLabel = () => {
    if (lightWarmth <= 33) return "Cool";
    if (lightWarmth <= 66) return "Neutral";
    return "Warm";
  };

  const getFurnitureDensityLabel = () => {
    if (furnitureDensity <= 33) return "Sparse";
    if (furnitureDensity <= 66) return "Medium";
    return "Dense";
  };

  const handleUpdateRoom = () => {
    const width = parseFloat(roomWidth);
    const length = parseFloat(roomLength);
    const height = parseFloat(roomHeight);

    const existingConfig = currentDesign?.config || {};

    const updatedConfig = {
      ...existingConfig,
      dimensions: {
        width: isNaN(width) ? 4.5 : width,
        length: isNaN(length) ? 6.0 : length,
        height: isNaN(height) ? 2.8 : height,
      },
      colors: {
        walls: wallColor,
        floor: floorColor,
      },
      walls: (existingConfig.walls || []).map((wall: any) => ({
        ...wall,
        color: wallColor,
      })),
      floor: {
        ...(existingConfig.floor || {}),
        color: floorColor,
      },
      lighting: {
        intensity: lightIntensity,
        warmth: lightWarmth,
      },
      furniture: existingConfig.furniture || [],
      style: existingConfig.style || "modern",
      styleMatch: furnitureStyle,
      furnitureDensity: furnitureDensity,
    };

    updateRoomConfig(updatedConfig);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-medium text-lg flex items-center">
        <span className="material-icons mr-2 text-primary">settings</span>
        Room Configuration
      </h2>

      <div className="space-y-4">
        {/* Dimensions */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="material-icons text-sm mr-1">straighten</span>
            Dimensions
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="room-width" className="text-xs">Width (m)</Label>
              <Input type="number" id="room-width" min="1" max="20" step="0.1" value={roomWidth} onChange={(e) => setRoomWidth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="room-length" className="text-xs">Length (m)</Label>
              <Input type="number" id="room-length" min="1" max="20" step="0.1" value={roomLength} onChange={(e) => setRoomLength(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="room-height" className="text-xs">Height (m)</Label>
              <Input type="number" id="room-height" min="2" max="10" step="0.1" value={roomHeight} onChange={(e) => setRoomHeight(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="material-icons text-sm mr-1">palette</span>
            Color Scheme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wall-color" className="text-xs">Wall Color</Label>
              <div className="flex space-x-2">
                <input type="color" id="wall-color" value={wallColor} onChange={(e) => setWallColor(e.target.value)} className="h-10 w-10 p-1 border border-input rounded" />
                <Input type="text" value={wallColor} onChange={(e) => setWallColor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="floor-color" className="text-xs">Floor Color</Label>
              <div className="flex space-x-2">
                <input type="color" id="floor-color" value={floorColor} onChange={(e) => setFloorColor(e.target.value)} className="h-10 w-10 p-1 border border-input rounded" />
                <Input type="text" value={floorColor} onChange={(e) => setFloorColor(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Lighting */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="material-icons text-sm mr-1">light_mode</span>
            Lighting
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <Label htmlFor="light-intensity">Intensity</Label>
                <span>{lightIntensity}%</span>
              </div>
              <input type="range" id="light-intensity" min="0" max="100" value={lightIntensity} onChange={(e) => setLightIntensity(parseInt(e.target.value))} className="slider w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <Label htmlFor="light-warmth">Warmth</Label>
                <span>{getLightWarmthLabel()}</span>
              </div>
              <input type="range" id="light-warmth" min="0" max="100" value={lightWarmth} onChange={(e) => setLightWarmth(parseInt(e.target.value))} className="slider w-full" />
            </div>
          </div>
        </div>

        {/* Furniture Settings */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="material-icons text-sm mr-1">chair</span>
            Furniture
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <Label htmlFor="furniture-density">Density</Label>
                <span>{getFurnitureDensityLabel()}</span>
              </div>
              <input type="range" id="furniture-density" min="0" max="100" value={furnitureDensity} onChange={(e) => setFurnitureDensity(parseInt(e.target.value))} className="slider w-full" />
            </div>
            <div>
              <Label htmlFor="furniture-style" className="text-xs">Style Match</Label>
              <Select value={furnitureStyle} onValueChange={setFurnitureStyle}>
                <SelectTrigger id="furniture-style" className="w-full">
                  <SelectValue placeholder="Select furniture style match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Match Room Style Exactly</SelectItem>
                  <SelectItem value="similar">Similar Styles</SelectItem>
                  <SelectItem value="mixed">Mix of Styles</SelectItem>
                  <SelectItem value="contrast">Contrasting Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={handleUpdateRoom} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Apply Changes
        </Button>
      </div>
    </div>
  );
};

export default RoomConfigSection;
