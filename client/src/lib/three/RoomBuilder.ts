import * as THREE from 'three';
import { RoomConfig } from '@shared/schema';
import { TextureLoader } from 'three';

export class RoomBuilder {

  private scene: THREE.Scene;
  private room: THREE.Group;
  private textureLoader: TextureLoader;
  private walls: THREE.Mesh[] = [];
  private floor: THREE.Mesh | null = null;
  private wallColor: string = "#FFFFFF";
  private floorColor: string = "#808080";
  private floorTextures: { [key: string]: string } = {
    wood: '/textures/floor-wood.jpg',
    lightWood: '/textures/floor-light-wood.jpg',
    darkWood: '/textures/floor-dark-wood.jpg',
    tile: '/textures/floor-tile.jpg',
    marble: '/textures/floor-marble.jpg',
    carpet: '/textures/floor-carpet.jpg',
    concrete: '/textures/floor-concrete.jpg',
    default: '/textures/floor-wood.jpg'
  };
  private wallTextures: { [key: string]: string } = {
    paint: '/textures/wall-paint.jpg',
    brick: '/textures/wall-brick.jpg',
    concrete: '/textures/wall-concrete.jpg',
    wood: '/textures/wall-wood.jpg',
    wallpaper: '/textures/wall-wallpaper.jpg',
    default: '/textures/wall-paint.jpg'
  };
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.room = new THREE.Group();
    this.scene.add(this.room);
    this.textureLoader = new TextureLoader();
  }
  
  public buildRoom(config: RoomConfig): void {
    if (!config) {
      console.error("Invalid room configuration");
      return;
    }
    
    // Clear any existing room geometry first
    this.clearRoom();
    
    const { dimensions } = config;
    // Extract colors from config or use defaults
    const colors = {
      walls: "#FFFFFF",
      floor: "#808080",
      ceiling: "#FFFFFF"
    };
    
    // Try to get colors from the config
    if (config.style) {
      // Set colors based on style
      if (config.style === 'modern') {
        colors.walls = "#F5F5F5";
        colors.floor = "#303030";
      } else if (config.style === 'minimalist') {
        colors.walls = "#FFFFFF";
        colors.floor = "#D3D3D3";
      } else if (config.style === 'rustic') {
        colors.walls = "#F5DEB3";
        colors.floor = "#8B4513";
      }
    }
    
// Set wall color fallback
if (config.walls && config.walls.length > 0 && config.walls[0].color) {
  colors.walls = config.walls[0].color;
}

// Set floor color fallback
if (config.floor?.color) {
  colors.floor = config.floor.color;
}





    // Store colors for future reference
    this.wallColor = colors.walls;
    this.floorColor = colors.floor;
    
    if (!dimensions) {
      console.error("Missing dimensions in room configuration");
      return;
    }
    
    try {
      // MODIFIED BUILD SEQUENCE - first walls, then floor, then ceiling
      // 1. Create walls first
      this.createWalls(dimensions, colors.walls);
      
      // 2. Create floor
      this.createFloor(dimensions, colors.floor);
      
      // 3. Create ceiling to complete the room
      //this.createCeiling(dimensions, colors.ceiling);
      
      // Ceiling created by calling createCeiling()
      
      // Add baseboards and trim
      this.createBaseboards(dimensions, "#FFFFFF");
      
      // Add windows if specified in the config
      if (config.windows && Array.isArray(config.windows)) {
        config.windows.forEach(window => {
          this.createWindow(dimensions, window);
        });
      } else {
        // Add default windows
        this.createDefaultWindows(dimensions);
      }
      
      // Add doors if specified in the config
      if (config.doors && Array.isArray(config.doors)) {
        config.doors.forEach(door => {
          this.createDoor(dimensions, door);
        });
      } else {
        // Add a default door
        this.createDefaultDoor(dimensions);
      }
    } catch (error) {
      console.error("Error building room:", error);
    }
  }
  
  private createFloor(dimensions: { width: number, length: number, height: number }, color: string): void {
    const { width, length } = dimensions;
    
    try {
      // Try to determine floor material type from the color
      const floorType = this.getFloorTypeFromColor(color);
      const texturePath = this.floorTextures[floorType] || this.floorTextures.default;
      
      // Create floor geometry
      const floorGeometry = new THREE.PlaneGeometry(length,width);
      
      // Create floor material with texture
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // Try to load texture (will fallback to color if texture loading fails)
      try {
        const texture = this.textureLoader.load(texturePath, 
          // onLoad callback
          (texture) => {
            // Scale texture to avoid repetition
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(width/2, length/2);
            floorMaterial.map = texture;
            floorMaterial.needsUpdate = true;
          },
          // onProgress callback
          undefined,
          // onError callback
          (err) => {
            console.warn('Texture loading failed, using color only:', err);
          }
        );
      } catch (e) {
        console.warn('Failed to load floor texture:', e);
      }
      
      // Create floor mesh
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      floor.position.set(0,0,0);
      floor.receiveShadow = true;
      floor.userData = { type: 'room', part: 'floor' };
      
      this.room.add(floor);
    } catch (error) {
      console.error("Error creating floor:", error);

      
      
      // Create a simple fallback floor if texture loading failed
      const fallbackGeometry = new THREE.PlaneGeometry(width, length);
     
      const fallbackMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        roughness: 0.8
      });
      
      const fallbackFloor = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
      fallbackFloor.rotation.x = -Math.PI / 2;
      fallbackFloor.position.y=0.001;
      fallbackFloor.receiveShadow = true;
      fallbackFloor.userData = { type: 'room', part: 'floor' };
      
      this.room.add(fallbackFloor);
    }
  }
  
  private getFloorTypeFromColor(color: string): string {
    color = color.toLowerCase();
    // Enhanced logic to determine floor type from color
    
    // Wood tones
    if (color === '#8b4513' || color === '#a0522d') {
      return 'darkWood'; // Dark wood for dark brown
    } else if (color === '#cd853f' || color === '#d2b48c' || color === '#bc8f8f') {
      return 'wood'; // Medium wood for medium brown
    } else if (color === '#deb887' || color === '#f5deb3') {
      return 'lightWood'; // Light wood for light brown
    }
    
    // Other materials
    else if (color === '#f5f5f5' || color === '#d3d3d3' || color === '#a9a9a9' || color === '#696969') {
      return 'concrete';
    } else if (color === '#ffffff' || color === '#f0f0f0' || color === '#fffafa') {
      return 'tile';
    } else if (color === '#808080' || color.includes('blue') || color.includes('green')) {
      return 'carpet';
    }
    
    // Default fallback based on common color descriptions
    if (color.includes('brown') || color.includes('wood') || color.includes('oak')) {
      return 'wood';
    }
    
    return 'default';
  }
  
  private getWallTypeFromColor(color: string): string {
    color = color.toLowerCase();
    // Simple logic to determine wall type from color
    if (color === '#d3d3d3' || color === '#696969') {
      return 'concrete';
    } else if (color === '#cd853f' || color === '#8b4513') {
      return 'wood';
    } else if (color === '#bc8f8f' || color === '#cd5c5c') {
      return 'brick';
    } else if (color === '#fff8dc' || color === '#fffaf0' || color.includes('pattern')) {
      return 'wallpaper';
    }
    
    return 'paint';
  }
  
  private createWalls(dimensions: { width: number, length: number, height: number }, color: string): void {
    const { width, length, height } = dimensions;
    
    try {
      // Determine wall material type
      const wallType = this.getWallTypeFromColor(color);
      const texturePath = this.wallTextures[wallType] || this.wallTextures.default;
      
      // Create wall geometries with segments for better lighting
      const wallGeometryX = new THREE.PlaneGeometry(length, height, 10, 10);
      const wallGeometryZ = new THREE.PlaneGeometry(width, height, 10, 10);
      
      // Create wall material with texture
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // Try to load texture
      try {
        const texture = this.textureLoader.load(texturePath,
          // onLoad callback
          (texture) => {
            // Scale texture
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            
            // Set repeat based on wall dimensions
            const repeatX = Math.max(1, Math.round(width / 2));
            const repeatY = Math.max(1, Math.round(height / 2));
            texture.repeat.set(repeatX, repeatY);
            
            wallMaterial.map = texture;
            wallMaterial.needsUpdate = true;
          },
          // onProgress callback
          undefined,
          // onError callback
          (err) => {
            console.warn('Wall texture loading failed, using color only:', err);
          }
        );
      } catch (e) {
        console.warn('Failed to load wall texture:', e);
      }
      
      // Create walls
      const wallLeft = new THREE.Mesh(wallGeometryX, wallMaterial.clone());
      wallLeft.position.set(0, height/2, width/2);
      wallLeft.rotation.y = Math.PI;
      wallLeft.receiveShadow = true;
      
      const wallRight = new THREE.Mesh(wallGeometryX, wallMaterial.clone());
      wallRight.position.set(0, height/2, -width/2);
      wallRight.receiveShadow = true;
      
      const wallBack = new THREE.Mesh(wallGeometryZ, wallMaterial.clone());
      wallBack.position.set(length/2, height/2, 0);
      wallBack.rotation.y = -Math.PI/2;
      wallBack.receiveShadow = true;
      
      const wallFront = new THREE.Mesh(wallGeometryZ, wallMaterial.clone());
      wallFront.position.set(-length/2, height/2, 0);
      wallFront.rotation.y = Math.PI/2;
      wallFront.receiveShadow = true;
      
      // Set userData for identification
      wallLeft.userData = { type: 'room', part: 'wall', side: 'left' };
      wallRight.userData = { type: 'room', part: 'wall', side: 'right' };
      wallBack.userData = { type: 'room', part: 'wall', side: 'back' };
      wallFront.userData = { type: 'room', part: 'wall', side: 'front' };
      
      // Add walls to room group
      this.room.add(wallLeft, wallRight, wallBack, wallFront);
    } catch (error) {
      console.error("Error creating walls:", error);
      
      // Create fallback walls if texture loading failed
      this.createFallbackWalls(dimensions, color);
    }
  }
  
  private createFallbackWalls(dimensions: { width: number, length: number, height: number }, color: string): void {
    const { width, length, height } = dimensions;
    
    // Create basic wall material - simplest possible material
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.FrontSide
    });
    
    // Create walls using BoxGeometry instead of planes for better visibility
    // Left wall
    const wallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(length, height, 0.05),
      wallMaterial.clone()
    );
    wallLeft.position.set(0, height/2, width/2 - 0.025);
    
    // Right wall
    const wallRight = new THREE.Mesh(
      new THREE.BoxGeometry(length, height, 0.05),
      wallMaterial.clone()
    );
    wallRight.position.set(0, height/2, -width/2 + 0.025);
    
    // Back wall
    const wallBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, height, width),
      wallMaterial.clone()
    );
    wallBack.position.set(length/2 - 0.025, height/2, 0);
    
    // Front wall
    const wallFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, height, width),
      wallMaterial.clone()
    );
    wallFront.position.set(-length/2 + 0.025, height/2, 0);
    
    // Set userData for identification
    wallLeft.userData = { type: 'room', part: 'wall', side: 'left' };
    wallRight.userData = { type: 'room', part: 'wall', side: 'right' };
    wallBack.userData = { type: 'room', part: 'wall', side: 'back' };
    wallFront.userData = { type: 'room', part: 'wall', side: 'front' };
    
    // Add walls individually to room group
    this.room.add(wallLeft);
    this.room.add(wallRight);
    this.room.add(wallBack);
    this.room.add(wallFront);
    
    console.log("Fallback walls created successfully");
  }
  
  /*private createCeiling(dimensions: { width: number, length: number, height: number }, color: string): void {
    const { width, length, height } = dimensions;
    
    // EXTREMELY SIMPLE APPROACH - Create ceiling as a basic flat plane
    // A simple plane with proper orientation, placed at the correct height
    const ceilingGeometry = new THREE.PlaneGeometry(width, length);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Create and position the ceiling plane
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.name = "room-ceiling";
    
    // Rotate it to be horizontal (planes are vertical by default)
    ceiling.rotation.x = -Math.PI / 2;
    
    // Position at the top of the room
    ceiling.position.set(0, height, 0); 
    
    // Enable shadows
    ceiling.receiveShadow = true;
    ceiling.userData = { type: 'room', part: 'ceiling' };
    
    // Add to room
    this.room.add(ceiling);
    
    // Add a bright light on the ceiling
    const ceilingLight = new THREE.PointLight(0xFFFFFF, 1.5, 12);
    ceilingLight.position.set(0, height - 0.1, 0);
    ceilingLight.castShadow = true;
    this.room.add(ceilingLight);
    
    // Add a simple decorative light fixture
    try {
      const fixtureGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
      const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDDDDD,
        roughness: 0.2,
        metalness: 0.8
      });
      
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.set(0, height - 0.025, 0);
      this.room.add(fixture);
      
      // Add a light bulb
      const bulbGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.9
      });
      
      const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulb.position.set(0, height - 0.08, 0);
      this.room.add(bulb);
    } catch (error) {
      console.error("Error creating light fixture:", error);
    }
  }
  
  private addLightFixture(dimensions: { width: number, length: number, height: number }): void {
    const { height } = dimensions;
    
    try {
      // Create a simple ceiling light fixture
      const fixtureGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
      const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE,
        roughness: 0.2,
        metalness: 0.8
      });
      
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.set(0, height - 0.05, 0);
      fixture.castShadow = true;
      this.room.add(fixture);
      
      // Add a point light inside the fixture
      const light = new THREE.PointLight(0xFFFFCC, 0.8, 10);
      light.position.set(0, height - 0.2, 0);
      light.castShadow = true;
      this.room.add(light);
      
      // Add a small bulb geometry
      const bulbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const bulbMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFCC,
        transparent: true,
        opacity: 0.9
      });
      
      const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
      bulb.position.set(0, height - 0.15, 0);
      this.room.add(bulb);
      
    } catch (error) {
      console.error("Failed to add light fixture:", error);
    }
  }*/
  
  private createBaseboards(dimensions: { width: number, length: number, height: number }, color: string): void {
    const { width, length } = dimensions;
    
    // Baseboard dimensions
    const baseboardHeight = 0.1;
    const baseboardDepth = 0.02;
    
    // Baseboard material
    const baseboardMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.5,
      metalness: 0.2
    });
    
    // Create baseboards for each wall
    // Left wall
    const leftBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(length, baseboardHeight, baseboardDepth),
      baseboardMaterial
    );
    leftBaseboard.position.set(0, baseboardHeight/2, width/2 - baseboardDepth/2);
    
    // Right wall
    const rightBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(length, baseboardHeight, baseboardDepth),
      baseboardMaterial
    );
    rightBaseboard.position.set(0, baseboardHeight/2, -width/2 + baseboardDepth/2);
    
    // Back wall
    const backBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardDepth, baseboardHeight, width),
      baseboardMaterial
    );
    backBaseboard.position.set(length/2 - baseboardDepth/2, baseboardHeight/2, 0);
    
    // Front wall
    const frontBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardDepth, baseboardHeight, width),
      baseboardMaterial
    );
    frontBaseboard.position.set(-length/2 + baseboardDepth/2, baseboardHeight/2, 0);
    
    // Add baseboards to room
    this.room.add(leftBaseboard, rightBaseboard, backBaseboard, frontBaseboard);
  }
  
  private createDefaultWindows(dimensions: { width: number, length: number, height: number }): void {
    const { width, length, height } = dimensions;
    
    // Create a window on the back wall
    const window1 = {
      wall: 'back',
      width: 1.2,
      height: 1.0,
      position: { x: 0, y: height/2 + 0.2 }
    };
    
    // Create a window on the left wall if the room is large enough
    if (length > 4) {
      const window2 = {
        wall: 'left',
        width: 1.2,
        height: 1.0,
        position: { x: length/4, y: height/2 + 0.2 }
      };
      this.createWindow(dimensions, window2);
    }
    
    this.createWindow(dimensions, window1);
  }
  
  private createWindow(dimensions: { width: number, length: number, height: number }, windowConfig: any): void {
    const { width, length, height } = dimensions;
    const { wall, width: windowWidth, height: windowHeight, position } = windowConfig;
    
    if (!wall || !windowWidth || !windowHeight || !position) {
      console.warn("Invalid window configuration");
      return;
    }
    
    // Window frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.2,
      metalness: 0.1
    });
    
    // Window glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xAACCFF,
      roughness: 0,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      clearcoat: 1.0
    });
    
    // Create window components
    const frameThickness = 0.05;
    const glassOffset = 0.02;
    
    // Frame
    const frameOuter = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + frameThickness*2, windowHeight + frameThickness*2, frameThickness),
      frameMaterial
    );
    
    // Glass
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(windowWidth, windowHeight),
      glassMaterial
    );
    glass.position.z = glassOffset;
    
    // Create a group for the window
    const windowGroup = new THREE.Group();
    windowGroup.add(frameOuter, glass);
    
    // Position window based on wall
    switch(wall) {
      case 'back':
        windowGroup.position.set(length/2 - 0.01, position.y, position.x || 0);
        windowGroup.rotation.y = -Math.PI/2;
        break;
      case 'front':
        windowGroup.position.set(-length/2 + 0.01, position.y, position.x || 0);
        windowGroup.rotation.y = Math.PI/2;
        break;
      case 'left':
        windowGroup.position.set(position.x || 0, position.y, width/2 - 0.01);
        windowGroup.rotation.y = Math.PI;
        break;
      case 'right':
        windowGroup.position.set(position.x || 0, position.y, -width/2 + 0.01);
        break;
      default:
        console.warn("Invalid wall specification for window");
        return;
    }
    
    // Add to room
    this.room.add(windowGroup);
  }
  
  private createDefaultDoor(dimensions: { width: number, length: number, height: number }): void {
    const { width, length, height } = dimensions;
    
    // Create a door on the front wall
    const door = {
      wall: 'front',
      width: 0.9,
      height: 2.0,
      position: { x: width/4, y: 1.0 }
    };
    
    this.createDoor(dimensions, door);
  }
  
  private createDoor(dimensions: { width: number, length: number, height: number }, doorConfig: any): void {
    const { width, length, height } = dimensions;
    const { wall, width: doorWidth, height: doorHeight, position } = doorConfig;
    
    if (!wall || !doorWidth || !doorHeight || !position) {
      console.warn("Invalid door configuration");
      return;
    }
    
    // Door material
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.2,
      metalness: 0.1
    });
    
    // Create door components
    const frameThickness = 0.05;
    const doorThickness = 0.05;
    
    // Frame
    const frameOuter = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth + frameThickness*2, doorHeight + frameThickness, frameThickness),
      frameMaterial
    );
    
    // Door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness),
      doorMaterial
    );
    door.position.z = frameThickness;
    
    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      roughness: 0.2,
      metalness: 0.8
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(doorWidth/3, 0, doorThickness + 0.03);
    
    // Create a group for the door
    const doorGroup = new THREE.Group();
    doorGroup.add(frameOuter, door, handle);
    
    // Position door based on wall
    switch(wall) {
      case 'back':
        doorGroup.position.set(length/2 - 0.01, position.y, position.x || 0);
        doorGroup.rotation.y = -Math.PI/2;
        break;
      case 'front':
        doorGroup.position.set(-length/2 + 0.01, position.y, position.x || 0);
        doorGroup.rotation.y = Math.PI/2;
        break;
      case 'left':
        doorGroup.position.set(position.x || 0, position.y, width/2 - 0.01);
        doorGroup.rotation.y = Math.PI;
        break;
      case 'right':
        doorGroup.position.set(position.x || 0, position.y, -width/2 + 0.01);
        break;
      default:
        console.warn("Invalid wall specification for door");
        return;
    }
    
    // Add to room
    this.room.add(doorGroup);
  }
  
  public clearRoom(): void {
    // Remove all children from the room group
    while (this.room.children.length > 0) {
      const child = this.room.children[0];
      
      // If the child has geometry or materials, dispose them
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => {
              if (material.map) material.map.dispose();
              material.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
      
      this.room.remove(child);
    }
  }
  
  public setWireframe(wireframe: boolean): void {
    // Set wireframe mode for all room materials
    this.room.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial || 
                mat instanceof THREE.MeshPhysicalMaterial) {
              mat.wireframe = wireframe;
            }
          });
        } else if (child.material instanceof THREE.MeshStandardMaterial || 
                   child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.wireframe = wireframe;
        }
      }
    });
  }
  
  public updateWallColor(color: string): void {
    this.wallColor = color;
    
    // Find all wall meshes in the room
    this.room.traverse((object) => {
      if (object instanceof THREE.Mesh && 
          object.userData && 
          object.userData.type === 'room' && 
          object.userData.part === 'wall') {
        
        // Update the material color
        if (object.material instanceof THREE.MeshStandardMaterial) {
          object.material.color.set(color);
          object.material.needsUpdate = true;
        } else if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.color.set(color);
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
  }
  
  public updateFloorColor(color: string): void {
    this.floorColor = color;
    
    // Find the floor mesh in the room
    this.room.traverse((object) => {
      if (object instanceof THREE.Mesh && 
          object.userData && 
          object.userData.type === 'room' && 
          object.userData.part === 'floor') {
        
        // Update the material color
        if (object.material instanceof THREE.MeshStandardMaterial) {
          object.material.color.set(color);
          object.material.needsUpdate = true;
        } else if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.color.set(color);
              mat.needsUpdate = true;
            }
          });
        }
      }
    });
  }
  
  // Duplicate functions have been removed
}
