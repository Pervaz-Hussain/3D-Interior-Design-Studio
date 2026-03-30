import { 
  User, InsertUser, 
  RoomDesign, InsertRoomDesign,
  FurnitureItem, InsertFurnitureItem
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Storage interface to abstract data access
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Room design operations
  getRoomDesign(id: number): Promise<RoomDesign | undefined>;
  getAllRoomDesigns(): Promise<RoomDesign[]>;
  createRoomDesign(design: InsertRoomDesign): Promise<RoomDesign>;
  updateRoomDesign(id: number, design: InsertRoomDesign): Promise<RoomDesign | undefined>;
  deleteRoomDesign(id: number): Promise<boolean>;
  
  // Furniture operations
  getFurnitureItem(id: number): Promise<FurnitureItem | undefined>;
  getAllFurnitureItems(): Promise<FurnitureItem[]>;
  createFurnitureItem(item: InsertFurnitureItem): Promise<FurnitureItem>;
  updateFurnitureItem(id: number, item: InsertFurnitureItem): Promise<FurnitureItem | undefined>;
  deleteFurnitureItem(id: number): Promise<boolean>;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roomDesigns: Map<number, RoomDesign>;
  private furnitureItems: Map<number, FurnitureItem>;
  private currentUserId: number;
  private currentDesignId: number;
  private currentFurnitureId: number;
  
  constructor() {
    this.users = new Map();
    this.roomDesigns = new Map();
    this.furnitureItems = new Map();
    this.currentUserId = 1;
    this.currentDesignId = 1;
    this.currentFurnitureId = 1;
    
    // Initialize with some default furniture
    this.initializeFurnitureItems();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Room design operations
  async getRoomDesign(id: number): Promise<RoomDesign | undefined> {
    return this.roomDesigns.get(id);
  }
  
  async getAllRoomDesigns(): Promise<RoomDesign[]> {
    return Array.from(this.roomDesigns.values());
  }
  
  async createRoomDesign(design: InsertRoomDesign): Promise<RoomDesign> {
    const id = this.currentDesignId++;
    const now = new Date();
    const roomDesign: RoomDesign = { 
      ...design, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.roomDesigns.set(id, roomDesign);
    return roomDesign;
  }
  
  async updateRoomDesign(id: number, design: InsertRoomDesign): Promise<RoomDesign | undefined> {
    const existingDesign = this.roomDesigns.get(id);
    if (!existingDesign) {
      return undefined;
    }
    
    const now = new Date();
    const updatedDesign: RoomDesign = { 
      ...design, 
      id, 
      createdAt: existingDesign.createdAt,
      updatedAt: now
    };
    this.roomDesigns.set(id, updatedDesign);
    return updatedDesign;
  }
  
  async deleteRoomDesign(id: number): Promise<boolean> {
    return this.roomDesigns.delete(id);
  }
  
  // Furniture operations
  async getFurnitureItem(id: number): Promise<FurnitureItem | undefined> {
    return this.furnitureItems.get(id);
  }
  
  async getAllFurnitureItems(): Promise<FurnitureItem[]> {
    return Array.from(this.furnitureItems.values());
  }
  
  async createFurnitureItem(item: InsertFurnitureItem): Promise<FurnitureItem> {
    const id = this.currentFurnitureId++;
    const now = new Date();
    const furnitureItem: FurnitureItem = { 
      ...item, 
      id, 
      createdAt: now 
    };
    this.furnitureItems.set(id, furnitureItem);
    return furnitureItem;
  }
  
  async updateFurnitureItem(id: number, item: InsertFurnitureItem): Promise<FurnitureItem | undefined> {
    const existingItem = this.furnitureItems.get(id);
    if (!existingItem) {
      return undefined;
    }
    
    const updatedItem: FurnitureItem = { 
      ...item, 
      id, 
      createdAt: existingItem.createdAt 
    };
    this.furnitureItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteFurnitureItem(id: number): Promise<boolean> {
    return this.furnitureItems.delete(id);
  }

  // Initialize some default furniture items
  private initializeFurnitureItems() {
    const defaultFurniture = [
      {
        name: "Modern Sofa",
        category: "seating",
        model: "/furniture/sofa.glb",
        thumbnail: null,
        dimensions: { width: 2.0, height: 0.8, depth: 0.8 }
      },
      {
        name: "Coffee Table",
        category: "tables",
        model: "/furniture/coffee_table.glb",
        thumbnail: null,
        dimensions: { width: 1.2, height: 0.4, depth: 0.6 }
      },
      {
        name: "Floor Lamp",
        category: "lighting",
        model: "/furniture/floor_lamp.glb",
        thumbnail: null,
        dimensions: { width: 0.3, height: 1.5, depth: 0.3 }
      },
      {
        name: "Bookshelf",
        category: "storage",
        model: "/furniture/bookshelf.glb",
        thumbnail: null,
        dimensions: { width: 1.0, height: 1.8, depth: 0.35 }
      },
      {
        name: "Dining Chair",
        category: "seating",
        model: "/furniture/dining_chair.glb",
        thumbnail: null,
        dimensions: { width: 0.5, height: 0.9, depth: 0.5 }
      },
      {
        name: "Dining Table",
        category: "tables",
        model: "/furniture/dining_table.glb",
        thumbnail: null,
        dimensions: { width: 1.6, height: 0.75, depth: 0.9 }
      },
      {
        name: "TV Stand",
        category: "storage",
        model: "/furniture/tv_stand.glb",
        thumbnail: null,
        dimensions: { width: 1.8, height: 0.5, depth: 0.45 }
      },
      {
        name: "Plant",
        category: "decoration",
        model: "/furniture/plant.glb",
        thumbnail: null,
        dimensions: { width: 0.5, height: 1.1, depth: 0.5 }
      },
      {
        name: "Rug",
        category: "decoration",
        model: "/furniture/rug.glb",
        thumbnail: null,
        dimensions: { width: 2.0, height: 0.02, depth: 1.5 }
      },
      {
        name: "Bed",
        category: "bedroom",
        model: "/furniture/bed.glb",
        thumbnail: null,
        dimensions: { width: 1.8, height: 0.6, depth: 2.0 }
      }
    ];
    
    defaultFurniture.forEach((item, index) => {
      const id = index + 1;
      const now = new Date();
      const furnitureItem: FurnitureItem = { 
        ...item, 
        id, 
        createdAt: now 
      };
      this.furnitureItems.set(id, furnitureItem);
      this.currentFurnitureId = id + 1;
    });
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();