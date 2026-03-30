import { RoomType } from '@shared/schema';

// Define furniture configurations for different room types
interface FurnitureConfig {
  name: string;
  model: string;
  minCount: number;
  maxCount: number;
  positions?: { x: number; y: number; z: number }[];
}

// Map of room types to furniture and configurations specific to each room type
const roomTypeFurniture: Record<RoomType, FurnitureConfig[]> = {
  'living_room': [
    { name: 'Sofa', model: 'sofa', minCount: 1, maxCount: 2 },
    { name: 'Coffee Table', model: 'table', minCount: 1, maxCount: 1 },
    { name: 'Chair', model: 'chair', minCount: 1, maxCount: 3 },
    { name: 'TV Stand', model: 'table', minCount: 0, maxCount: 1 },
    { name: 'Bookshelf', model: 'table', minCount: 0, maxCount: 2 },
  ],
  'bedroom': [
    { name: 'Bed', model: 'sofa', minCount: 1, maxCount: 1 }, // Using sofa as a placeholder for bed
    { name: 'Bedside Table', model: 'table', minCount: 1, maxCount: 2 },
    { name: 'Wardrobe', model: 'table', minCount: 0, maxCount: 1 },
    { name: 'Dresser', model: 'table', minCount: 0, maxCount: 1 },
    { name: 'Chair', model: 'chair', minCount: 0, maxCount: 1 },
  ],
  'bathroom': [
    { name: 'Sink', model: 'table', minCount: 1, maxCount: 2 },
    { name: 'Toilet', model: 'chair', minCount: 1, maxCount: 1 }, // Using chair as a placeholder for toilet
    { name: 'Shower', model: 'table', minCount: 0, maxCount: 1 },
    { name: 'Bathtub', model: 'sofa', minCount: 0, maxCount: 1 }, // Using sofa as a placeholder for bathtub
  ],
  'kitchen': [
    { name: 'Kitchen Counter', model: 'table', minCount: 1, maxCount: 3 },
    { name: 'Kitchen Island', model: 'table', minCount: 0, maxCount: 1 },
    { name: 'Refrigerator', model: 'table', minCount: 1, maxCount: 1 },
    { name: 'Stove', model: 'table', minCount: 1, maxCount: 1 },
    { name: 'Kitchen Chair', model: 'chair', minCount: 0, maxCount: 4 },
  ],
  'dining_room': [
    { name: 'Dining Table', model: 'table', minCount: 1, maxCount: 1 },
    { name: 'Dining Chair', model: 'chair', minCount: 4, maxCount: 8 },
    { name: 'Sideboard', model: 'table', minCount: 0, maxCount: 1 },
  ],
  'home_office': [
    { name: 'Desk', model: 'table', minCount: 1, maxCount: 1 },
    { name: 'Office Chair', model: 'chair', minCount: 1, maxCount: 2 },
    { name: 'Bookshelf', model: 'table', minCount: 0, maxCount: 2 },
    { name: 'Filing Cabinet', model: 'table', minCount: 0, maxCount: 1 },
  ],
  'children_room': [
    { name: 'Small Bed', model: 'sofa', minCount: 1, maxCount: 2 }, // Using sofa as a placeholder for bed
    { name: 'Small Table', model: 'table', minCount: 1, maxCount: 1 },
    { name: 'Small Chair', model: 'chair', minCount: 1, maxCount: 2 },
    { name: 'Toy Box', model: 'table', minCount: 0, maxCount: 1 },
  ],
  'guest_room': [
    { name: 'Guest Bed', model: 'sofa', minCount: 1, maxCount: 1 }, // Using sofa as a placeholder for bed
    { name: 'Side Table', model: 'table', minCount: 1, maxCount: 2 },
    { name: 'Chair', model: 'chair', minCount: 0, maxCount: 1 },
    { name: 'Small Wardrobe', model: 'table', minCount: 0, maxCount: 1 },
  ],
};

// Define color schemes for different room types
interface ColorScheme {
  walls: string;
  floor: string;
  ceiling: string;
  accent: string;
}

const roomTypeColors: Record<RoomType, ColorScheme> = {
  'living_room': {
    walls: '#f5f5f5',
    floor: '#a0522d',
    ceiling: '#ffffff',
    accent: '#4682b4',
  },
  'bedroom': {
    walls: '#e6e6fa',
    floor: '#8b4513',
    ceiling: '#f8f8ff',
    accent: '#9370db',
  },
  'bathroom': {
    walls: '#e0ffff',
    floor: '#708090',
    ceiling: '#f0ffff',
    accent: '#87ceeb',
  },
  'kitchen': {
    walls: '#fffaf0',
    floor: '#696969',
    ceiling: '#ffffff',
    accent: '#228b22',
  },
  'dining_room': {
    walls: '#f5f5dc',
    floor: '#8b4513',
    ceiling: '#fffaf0',
    accent: '#cd853f',
  },
  'home_office': {
    walls: '#f0f8ff',
    floor: '#2f4f4f',
    ceiling: '#f5f5f5',
    accent: '#4169e1',
  },
  'children_room': {
    walls: '#ffe4e1',
    floor: '#deb887',
    ceiling: '#fffafa',
    accent: '#ff69b4',
  },
  'guest_room': {
    walls: '#f0fff0',
    floor: '#a0522d',
    ceiling: '#f5fffa',
    accent: '#556b2f',
  },
};

// Define room dimensions for different room types
interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

const roomTypeDimensions: Record<RoomType, RoomDimensions> = {
  'living_room': { width: 5, length: 6, height: 2.8 },
  'bedroom': { width: 4, length: 5, height: 2.7 },
  'bathroom': { width: 2.5, length: 3, height: 2.5 },
  'kitchen': { width: 3.5, length: 4, height: 2.7 },
  'dining_room': { width: 4, length: 4, height: 2.8 },
  'home_office': { width: 3, length: 3.5, height: 2.7 },
  'children_room': { width: 3.5, length: 4, height: 2.7 },
  'guest_room': { width: 3.5, length: 4.5, height: 2.7 },
};

// Function to get furniture configuration for a specific room type
export function getFurnitureForRoomType(roomType: RoomType): FurnitureConfig[] {
  return roomTypeFurniture[roomType] || roomTypeFurniture['living_room'];
}

// Function to get color scheme for a specific room type
export function getColorSchemeForRoomType(roomType: RoomType): ColorScheme {
  return roomTypeColors[roomType] || roomTypeColors['living_room'];
}

// Function to get dimensions for a specific room type
export function getDimensionsForRoomType(roomType: RoomType): RoomDimensions {
  return roomTypeDimensions[roomType] || roomTypeDimensions['living_room'];
}

// Function to generate random furniture layout for a room type
export function generateFurnitureForRoomType(
  roomType: RoomType,
  width: number,
  length: number
): any[] {
  const furnitureConfigs = getFurnitureForRoomType(roomType);
  const furniture = [];
  
  // For each furniture type
  for (const config of furnitureConfigs) {
    // Decide how many of this furniture to add
    const count = Math.floor(
      Math.random() * (config.maxCount - config.minCount + 1) + config.minCount
    );
    
    // Add each furniture item
    for (let i = 0; i < count; i++) {
      // Calculate position - adjust this for more intelligent positioning based on room type
      // For now, position randomly within the room boundaries with some margin
      const margin = 0.5; // Margin from walls
      const x = (Math.random() * (width - 2 * margin)) - (width / 2) + margin;
      const z = (Math.random() * (length - 2 * margin)) - (length / 2) + margin;
      
      // Y position (height) depends on the furniture type
      let y = 0;
      if (config.name.toLowerCase().includes('chair')) {
        y = 0.2; // Typical chair height
      } else if (config.name.toLowerCase().includes('table')) {
        y = 0.4; // Typical table height
      } else if (config.name.toLowerCase().includes('bed')) {
        y = 0.3; // Bed height
      }
      
      // Add furniture to layout
      furniture.push({
        id: `${config.name.toLowerCase().replace(' ', '_')}_${i}`,
        name: config.name,
        model: config.model,
        position: { x, y, z },
        rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      });
    }
  }
  
  return furniture;
}