import { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { 
  insertUserSchema, 
  insertRoomDesignSchema, 
  insertFurnitureItemSchema,
  roomGenerationRequestSchema,
  RoomGenerationResponse
} from '../shared/schema';
import { storage } from './storage';
import { generateRoomDesign } from './ai/model';
import { log } from './vite';
import * as fs from 'fs';
import * as path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userInput.username);
      
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      const user = await storage.createUser(userInput);
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      log(`User creation error: ${error}`, 'routes');
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  // Room design routes
  app.get('/api/designs', async (req: Request, res: Response) => {
    try {
      const designs = await storage.getAllRoomDesigns();
      res.json(designs);
    } catch (error) {
      log(`Error fetching designs: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to fetch designs' });
    }
  });

  app.get('/api/designs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const design = await storage.getRoomDesign(id);
      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }
      
      res.json(design);
    } catch (error) {
      log(`Error fetching design: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to fetch design' });
    }
  });

  app.post('/api/designs', async (req: Request, res: Response) => {
    try {
      const designInput = insertRoomDesignSchema.parse(req.body);
      const design = await storage.createRoomDesign(designInput);
      res.status(201).json(design);
    } catch (error) {
      log(`Design creation error: ${error}`, 'routes');
      res.status(400).json({ error: 'Invalid design data' });
    }
  });

  app.put('/api/designs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const designInput = insertRoomDesignSchema.parse(req.body);
      const updatedDesign = await storage.updateRoomDesign(id, designInput);
      
      if (!updatedDesign) {
        return res.status(404).json({ error: 'Design not found' });
      }
      
      res.json(updatedDesign);
    } catch (error) {
      log(`Design update error: ${error}`, 'routes');
      res.status(400).json({ error: 'Invalid design data' });
    }
  });

  app.delete('/api/designs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const success = await storage.deleteRoomDesign(id);
      if (!success) {
        return res.status(404).json({ error: 'Design not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      log(`Design deletion error: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to delete design' });
    }
  });

  // Furniture routes
  app.get('/api/furniture', async (req: Request, res: Response) => {
    try {
      const furniture = await storage.getAllFurnitureItems();
      res.json(furniture);
    } catch (error) {
      log(`Error fetching furniture: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to fetch furniture' });
    }
  });

  app.get('/api/furniture/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const item = await storage.getFurnitureItem(id);
      if (!item) {
        return res.status(404).json({ error: 'Furniture item not found' });
      }
      
      res.json(item);
    } catch (error) {
      log(`Error fetching furniture item: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to fetch furniture item' });
    }
  });

  app.post('/api/furniture', async (req: Request, res: Response) => {
    try {
      const itemInput = insertFurnitureItemSchema.parse(req.body);
      const item = await storage.createFurnitureItem(itemInput);
      res.status(201).json(item);
    } catch (error) {
      log(`Furniture creation error: ${error}`, 'routes');
      res.status(400).json({ error: 'Invalid furniture data' });
    }
  });
  
  // Route to get furniture 3D model
  app.get('/api/furniture/:id/model', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const item = await storage.getFurnitureItem(id);
      if (!item) {
        return res.status(404).json({ error: 'Furniture item not found' });
      }
      
      // Send the furniture model file - for now use a basic placeholder 3D model
      // In a real implementation, we'd retrieve the actual model file
      const modelPath = `public/models/${item.model}.gltf`;
      const fallbackPath = 'public/models/fallback.gltf';
      
      // Check if the file exists
      
      if (fs.existsSync(modelPath)) {
        res.sendFile(path.resolve(modelPath));
      } else {
        console.log(`Model file not found: ${modelPath}, using fallback`);
        if (fs.existsSync(fallbackPath)) {
          res.sendFile(path.resolve(fallbackPath));
        } else {
          console.error(`Fallback model not found: ${fallbackPath}`);
          return res.status(500).json({ error: 'Model file not available' });
        }
      }
    } catch (error) {
      log(`Error fetching furniture model: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to fetch furniture model' });
    }
  });

  // AI Room generation route
  app.post('/api/generate-room', async (req: Request, res: Response) => {
    try {
      const generationInput = roomGenerationRequestSchema.parse(req.body);
      
      log(`Generating room with prompt: ${generationInput.prompt}`, 'routes');
      
      // Call the AI model to generate a room design
      const designResponse: RoomGenerationResponse = await generateRoomDesign(
        generationInput.prompt,
        generationInput.roomType,
        generationInput.style
      );
      
      res.json(designResponse);
    } catch (error) {
      log(`Room generation error: ${error}`, 'routes');
      res.status(500).json({ error: 'Failed to generate room design' });
    }
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    log(`Server error: ${err.message}`, 'routes');
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}