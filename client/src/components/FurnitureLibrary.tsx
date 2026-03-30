import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDesignContext } from "@/context/DesignContext";
import { furnitureModelMap } from "../lib/furnitureModelMap";

type FurnitureItem = {
  id: number;
  name: string;
  category: string;
  thumbnail?: string;
};

const normalizeName = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, "_");

// ✅ Hardcoded furniture matching model map
const hardcodedFurnitureItems: FurnitureItem[] = [
  { id: 1, name: "Bed", category: "seating", thumbnail: "/images/bed.png" },
  { id: 2, name: "Chair", category: "seating", thumbnail: "/images/chair.png" },
  { id: 3, name: "Sofa", category: "seating", thumbnail: "/images/sofa.png" },
  { id: 4, name: "Sofa1", category: "seating", thumbnail: "/images/sofa1.png" },
  { id: 5, name: "Door", category: "decor", thumbnail: "/images/door.png" },
  { id: 6, name: "Window", category: "decor", thumbnail: "/images/window.png" },
  { id: 7, name: "table1", category: "tables", thumbnail: "/images/table1.png" },
  { id: 8, name: "table2", category: "tables", thumbnail: "/images/table2.png" },
  { id: 9, name: "Sala de jantar", category: "tables", thumbnail: "/images/sala_de_jantar.png" }, 
];

const categories = ["All", "Seating", "Tables", "Storage", "Lighting", "Decor"];

const FurnitureLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { addFurnitureToRoom } = useDesignContext();

  const filteredItems = hardcodedFurnitureItems.filter((item) => {
    const normalized = normalizeName(item.name);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const hasModel = furnitureModelMap.hasOwnProperty(normalized);
    return matchesSearch && matchesCategory && hasModel;
  });

const furnitureConfig: Record<string, { scale: number; yOffset: number }> = {
  bed: { scale: 0.5, yOffset: 0 },
  chair: { scale: 0.5, yOffset: 0 },
  sofa: { scale: 0.01, yOffset: 0},
  sofa1: { scale: 0.02, yOffset: 0 },
  door: { scale: 0.8, yOffset: 0 },
  window: { scale: 0.02, yOffset: 0 },
  table1:{ scale: 0.01, yOffset: 0},
  table2:{ scale: 0.01, yOffset: 0},
  Sala_de_jantar:{ scale: 0.03, yOffset: 0},
};


const handleSelectFurniture = (item: FurnitureItem) => {
  const normalizedName = normalizeName(item.name);
  const roomLimit = 1.8;
  const randomX = Math.random() * (roomLimit * 2) - roomLimit;
  const randomZ = Math.random() * (roomLimit * 2) - roomLimit;

  // ✅ Use config map for scale and y-offset
  const config = furnitureConfig[normalizedName] ?? { scale: 0.5, yOffset: 0 };

  addFurnitureToRoom({
    itemId: item.id,
    name: normalizedName,
    position: {
      x: randomX,
      y: config.yOffset,
      z: randomZ
    },
    rotation: 0,
    scale: config.scale
  });
};


  return (
    <div className="space-y-4">
      <h2 className="font-heading font-medium text-lg flex items-center">
        <span className="material-icons mr-2 text-primary">weekend</span>
        Furniture Library
      </h2>

      <div className="space-y-3">
        <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" variant="outline" size="icon">
            <span className="material-icons">search</span>
          </Button>
        </form>

        <div className="flex space-x-2 overflow-x-auto py-1">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              variant={category === activeCategory ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectFurniture(item)}
                className="cursor-pointer bg-card rounded-md shadow-sm hover:shadow transition-shadow card"
              >
                <div className="aspect-square rounded-t-md overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <h4 className="text-xs font-medium truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              No furniture items found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FurnitureLibrary;
