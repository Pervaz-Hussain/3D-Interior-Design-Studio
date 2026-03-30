import { z } from 'zod';
import { 
  RoomGenerationRequest, 
  RoomGenerationResponse, 
  roomConfigSchema, 
  RoomType, 
  roomTypeEnum 
} from '../../shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from '../vite';
import { 
  getFurnitureForRoomType, 
  getColorSchemeForRoomType, 
  getDimensionsForRoomType,
  generateFurnitureForRoomType
} from './room-types';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a room design based on user prompt
 * 
 * @param prompt Text description of the desired room
 * @param roomType Type of room (living_room, bedroom, etc.)
 * @param style Design style (modern, scandinavian, etc.)
 * @returns Generated room design
 */
export async function generateRoomDesign(
  prompt: string,
  roomType: string,
  style: string
): Promise<RoomGenerationResponse> {
  try {
    log(`Generating room design with prompt: ${prompt}`, 'ai');
    
    // Validate roomType against our enum
    const validatedRoomType = validateRoomType(roomType);
    
    // Try to generate the room using the local Python model first
    const enhancedDesign = await runEnhancedLocalModel(prompt, validatedRoomType, style);
    if (enhancedDesign) {
      return enhancedDesign;
    }
    
    // Fallback to the JavaScript implementation if Python fails
    log('Python model failed, using fallback JavaScript implementation', 'ai');
    return generateFallbackDesign(prompt, validatedRoomType, style);
  } catch (error) {
    log(`Error in generateRoomDesign: ${error}`, 'ai');
    return generateFallbackDesign(prompt, validateRoomType(roomType), style);
  }
}

/**
 * Validate and convert the room type string to a valid RoomType enum value
 */
function validateRoomType(roomType: string): RoomType {
  const result = roomTypeEnum.safeParse(roomType);
  if (result.success) {
    return result.data;
  }
  // Default to living_room if invalid
  return 'living_room';
}

/**
 * Run the enhanced local model for more sophisticated room generation
 * 
 * @param prompt Text description of the desired room
 * @param roomType Type of room
 * @param style Design style
 * @returns Generated room design or null if failed
 */
async function runEnhancedLocalModel(
  prompt: string,
  roomType: RoomType,
  style: string
): Promise<RoomGenerationResponse | null> {
  return new Promise((resolve) => {
    try {
      const runnerScriptPath = path.resolve(__dirname, './simple_model.py');
      
      log(`Running Python script: ${runnerScriptPath}`, 'ai');
      
      const options = {
        mode: 'json' as const,
        args: [prompt, roomType, style],
        pythonPath: 'python3'
      };
      
      PythonShell.run(runnerScriptPath, options)
        .then((results) => {
          if (results && results.length > 0) {
            log('Received response from Python model', 'ai');
            const pythonResponse = results[0] as any;
            
            // Convert the Python response to our expected format if needed
            if (pythonResponse.config && pythonResponse.thumbnail) {
              try {
                // Ensure roomType is a valid enum value
                if (pythonResponse.config && pythonResponse.config.roomType) {
                  // If validation fails, use the original requested roomType
                  if (!roomTypeEnum.safeParse(pythonResponse.config.roomType).success) {
                    pythonResponse.config.roomType = roomType;
                  }
                } else {
                  // If no roomType in config, add it
                  pythonResponse.config.roomType = roomType;
                }
                
                // If we don't have furniture, add room-type specific furniture
                if (!pythonResponse.config.furniture || pythonResponse.config.furniture.length === 0) {
                  const dimensions = pythonResponse.config.dimensions || { 
                    width: 5, 
                    length: 5, 
                    height: 2.7 
                  };
                  pythonResponse.config.furniture = generateFurnitureForRoomType(
                    roomType, 
                    dimensions.width, 
                    dimensions.length
                  );
                }
                
                // Validate the config with our schema
                const config = roomConfigSchema.parse(pythonResponse.config);
                const responseObj: RoomGenerationResponse = {
                  config,
                  thumbnail: pythonResponse.thumbnail
                };
                resolve(responseObj);
              } catch (error) {
                log(`Error parsing Python model response: ${error}`, 'ai');
                resolve(null);
              }
            } else {
              log('Invalid response format from Python model', 'ai');
              resolve(null);
            }
          } else {
            log('No results from Python model', 'ai');
            resolve(null);
          }
        })
        .catch((error) => {
          log(`Error running Python model: ${error}`, 'ai');
          resolve(null);
        });
    } catch (error) {
      log(`Exception running Python model: ${error}`, 'ai');
      resolve(null);
    }
  });
}

/**
 * Fallback method to generate a room design when Python is unavailable
 * 
 * @param prompt Text description of the desired room
 * @param roomType Type of room (living_room, bedroom, etc.)
 * @param style Design style (modern, scandinavian, etc.)
 * @returns Generated room design
 */
export function generateFallbackDesign(
  _prompt: string,
  roomType: RoomType,
  style: string
): RoomGenerationResponse {
  // Get room-specific dimensions
  const dimensions = getDimensionsForRoomType(roomType);
  const width = dimensions.width;
  const length = dimensions.length;
  const height = dimensions.height;
  
  // Get room-specific color scheme
  const colorScheme = getColorSchemeForRoomType(roomType);
  
  // Generate wall segments
  const walls = [
    {
      id: uuidv4(),
      start: { x: 0, z: 0 },
      end: { x: width, z: 0 },
      height,
      color: colorScheme.walls
    },
    {
      id: uuidv4(),
      start: { x: width, z: 0 },
      end: { x: width, z: length },
      height,
      color: colorScheme.walls
    },
    {
      id: uuidv4(),
      start: { x: width, z: length },
      end: { x: 0, z: length },
      height,
      color: colorScheme.walls
    },
    {
      id: uuidv4(),
      start: { x: 0, z: length },
      end: { x: 0, z: 0 },
      height,
      color: colorScheme.walls
    }
  ];
  
  // Generate furniture specific to this room type
  const furniture = generateFurnitureForRoomType(roomType, width, length);
  
  // Generate simple room
  const config = {
    dimensions: { width, length, height },
    walls,
    floor: {
      color: colorScheme.floor,
      texture: style === 'modern' ? 'wood_floor' : 'carpet'
    },
    ceiling: {
      color: colorScheme.ceiling
    },
    roomType,
    style,
    furniture
  };
  
  const thumbnail = generateThumbnail(config);
  
  return {
    config,
    thumbnail
  };
}

/**
 * Generate a simple thumbnail for the room design
 * This is a fallback when Python is unavailable
 */
function generateThumbnail(
  config: any
): string {
  // In a real implementation, this would render a proper image
  // For our prototype, return a data URL with a colored rectangle
  
  const colorMap: Record<string, string> = {
    'modern': '#CCCCCC',
    'scandinavian': '#FFFFFF',
    'industrial': '#A9A9A9',
    'minimalist': '#F5F5F5',
    'traditional': '#D2B48C',
    'bohemian': '#DEB887',
    'coastal': '#B0E0E6',
    'farmhouse': '#F5FFFA'
  };
  
  const bgColor = colorMap[config.style] || '#EEEEEE';
  
  // Create a very simple SVG as a thumbnail placeholder
  // In a real app, you'd render this with Three.js or a proper renderer
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="200" fill="${bgColor}" />
      <rect x="20" y="20" width="260" height="160" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
      <text x="150" y="100" font-family="Arial" font-size="16" text-anchor="middle">${config.roomType} (${config.style})</text>
    </svg>
  `;
  
  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}