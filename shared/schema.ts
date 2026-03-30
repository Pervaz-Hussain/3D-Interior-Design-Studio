import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Room Designs table
export const roomDesigns = pgTable("room_designs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  thumbnail: text("thumbnail"), // Base64 encoded image
  config: jsonb("config").notNull(), // Room configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoomDesignSchema = createInsertSchema(roomDesigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRoomDesign = z.infer<typeof insertRoomDesignSchema>;
export type RoomDesign = typeof roomDesigns.$inferSelect;

// Furniture Items table
export const furnitureItems = pgTable("furniture_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  model: text("model").notNull(), // Path to 3D model file
  thumbnail: text("thumbnail"), // Base64 encoded image
  dimensions: jsonb("dimensions").notNull(), // width, height, depth
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFurnitureItemSchema = createInsertSchema(furnitureItems).omit({
  id: true,
  createdAt: true,
});
export type InsertFurnitureItem = z.infer<typeof insertFurnitureItemSchema>;
export type FurnitureItem = typeof furnitureItems.$inferSelect;

// Schema for window objects
export const windowSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
  rotation: z.number().optional().default(0),
});

// Schema for door objects
export const doorSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
  rotation: z.number().optional().default(0),
  isOpen: z.boolean().optional().default(false),
});

// Room Configuration Schema
export const roomConfigSchema = z.object({
  dimensions: z.object({
    width: z.number(),
    length: z.number(),
    height: z.number(),
  }),
  walls: z.array(
    z.object({
      id: z.string(),
      start: z.object({ x: z.number(), z: z.number() }),
      end: z.object({ x: z.number(), z: z.number() }),
      height: z.number(),
      color: z.string().optional(),
      texture: z.string().optional(),
    })
  ),
  floor: z.object({
    color: z.string().optional(),
    texture: z.string().optional(),
  }),
  ceiling: z.object({
    color: z.string().optional(),
    texture: z.string().optional(),
  }),
  windows: z.array(windowSchema).optional(),
  doors: z.array(doorSchema).optional(),
  furniture: z.array(
    z.object({
      id: z.string(),
      furnitureId: z.number().optional(), // Reference to furniture item
      name: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
      rotation: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
      scale: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
      color: z.string().optional(),
      texture: z.string().optional(),
      model: z.string().optional(), // Path to 3D model or reference
    })
  ).optional(),
  roomType: z.enum([
    'living_room', 
    'bedroom', 
    'bathroom', 
    'kitchen', 
    'dining_room', 
    'home_office',
    'children_room',
    'guest_room'
  ]), 
  style: z.string(), // modern, scandinavian, industrial, etc.
});

export type RoomConfig = z.infer<typeof roomConfigSchema>;

// Room Generation API Schemas
// Define the room type enum separately for reuse
export const roomTypeEnum = z.enum([
  'living_room', 
  'bedroom', 
  'bathroom', 
  'kitchen', 
  'dining_room', 
  'home_office',
  'children_room',
  'guest_room'
]);

export type RoomType = z.infer<typeof roomTypeEnum>;

export const roomGenerationRequestSchema = z.object({
  prompt: z.string(),
  roomType: roomTypeEnum,
  style: z.string(),
});

export type RoomGenerationRequest = z.infer<typeof roomGenerationRequestSchema>;

export const roomGenerationResponseSchema = z.object({
  config: roomConfigSchema,
  thumbnail: z.string().optional(), // Base64 encoded image
});

export type RoomGenerationResponse = z.infer<typeof roomGenerationResponseSchema>;