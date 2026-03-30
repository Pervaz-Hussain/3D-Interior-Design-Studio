import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RoomBuilder } from './RoomBuilder';
import { FurnitureManager } from './FurnitureManager';
import { RoomConfig } from '@shared/schema';

type Tool = 'move' | 'rotate' | 'scale';
type ViewMode = '3D' | 'top';

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private transformControls: TransformControls;
  private roomBuilder: RoomBuilder;
  private furnitureManager: FurnitureManager;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private activeTool: Tool = 'move';
  private viewMode: ViewMode = '3D';
  public selectedObject: THREE.Object3D | null = null;
  private onSelectionChange: ((selection: any) => void) | null = null;
  private minZoom: number = 1;
  private maxZoom: number = 10;
  private zoomStep: number = 0.5;

  private isDragging: boolean = false;
  private dragPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private dragOffset: THREE.Vector3 = new THREE.Vector3();


  constructor(container: HTMLElement) {
    this.container = container;
    


    
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Initialize renderer with advanced settings for realistic rendering
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    // Use modern Three.js rendering features that improve visual quality
    // Note: These are properly supported even if TypeScript shows errors
    (this.renderer as any).outputColorSpace = THREE.SRGBColorSpace; // Modern replacement for outputEncoding
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Film-like tone mapping
    this.renderer.toneMappingExposure = 1.2; // Slightly brighter exposure
    (this.renderer as any).useLegacyLights = false; // Modern replacement for physicallyCorrectLights
    container.appendChild(this.renderer.domElement);

    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));

    
    // Initialize controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
    });
    this.scene.add(this.transformControls as any);
    
    // Initialize managers
    this.roomBuilder = new RoomBuilder(this.scene);
    this.furnitureManager = new FurnitureManager(this.scene);
    
    // Initialize raycaster for object selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Add event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    container.addEventListener('click', this.onContainerClick.bind(this));
    
    // Add lights
    this.addLights();
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
    
    // Start animation loop
    this.animate();
  }


  private onMouseDown = (event: MouseEvent): void => {
  if (!this.selectedObject) return;

  const rect = this.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  this.raycaster.setFromCamera(mouse, this.camera);
  this.dragPlane.set(new THREE.Vector3(0, 1, 0), -this.selectedObject.position.y);

  const intersection = new THREE.Vector3();
  if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
    this.isDragging = true;
    this.dragOffset.copy(intersection).sub(this.selectedObject.position);

    // Disable orbit control while dragging
    if (this.orbitControls) this.orbitControls.enabled = false;
  }
};

private onMouseMove = (event: MouseEvent): void => {
  if (!this.isDragging || !this.selectedObject) return;

  const rect = this.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  this.raycaster.setFromCamera(mouse, this.camera);

  const intersection = new THREE.Vector3();
  if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
    const newPosition = intersection.sub(this.dragOffset);
    this.selectedObject.position.set(
      newPosition.x,
      this.selectedObject.position.y,
      newPosition.z
    );

    if (this.scene.userData.render) this.scene.userData.render();

    // Optional: update UI
    if (this.onSelectionChange && this.selectedObject.userData) {
      this.onSelectionChange({
        ...this.selectedObject.userData,
        position: {
          x: this.selectedObject.position.x,
          y: this.selectedObject.position.y,
          z: this.selectedObject.position.z
        },
        rotation: THREE.MathUtils.radToDeg(this.selectedObject.rotation.y),
        scale: this.selectedObject.scale.x,
      });
    }
  }
};

private onMouseUp = (): void => {
  this.isDragging = false;

  // Re-enable orbit controls
  if (this.orbitControls) this.orbitControls.enabled = true;
};

  
  private addLights(): void {
    // Ambient light for general illumination - increased intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased from 0.6 to 0.8
    this.scene.add(ambientLight);
    
    // Directional light (sun) - increased intensity and adjusted color
    const directionalLight = new THREE.DirectionalLight(0xffffeb, 1.0); // Increased from 0.8 to 1.0
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.bias = -0.001;
    this.scene.add(directionalLight);
    
    // Add multiple point lights for more realistic interior lighting
    // Warm main light for a cozy feel - increased intensity
    const pointLight1 = new THREE.PointLight(0xffe3c3, 1.5, 15); // Increased from 1.0 to 1.5
    pointLight1.position.set(0, 3, 0); // Lowered from 5 to 3 to better illuminate the room
    pointLight1.castShadow = true;
    pointLight1.shadow.bias = -0.0005;
    this.scene.add(pointLight1);
    
    // Additional accent lights for better scene illumination - increased intensity
    const pointLight2 = new THREE.PointLight(0xffeecc, 0.8, 10); // Increased from 0.6 to 0.8
    pointLight2.position.set(4, 3, 4);
    this.scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xffeecc, 0.8, 10); // Increased from 0.6 to 0.8
    pointLight3.position.set(-4, 3, -4);
    this.scene.add(pointLight3);
    
    // Special ceiling illumination light - NEW
    const ceilingLight = new THREE.PointLight(0xffffff, 0.8, 8);
    ceilingLight.position.set(0, 1.2, 0); // Lower position to cast light upward
    this.scene.add(ceilingLight);
    
    // Blue-ish fill light to simulate ambient window light
    const pointLight4 = new THREE.PointLight(0xe0e8ff, 0.6, 15); // Increased from 0.4 to 0.6
    pointLight4.position.set(6, 4, 0);
    this.scene.add(pointLight4);
  }
  
  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  private onContainerClick(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
const intersects = this.raycaster.intersectObjects(this.scene.children, true);

if (intersects.length > 0) {
  const hit = intersects[0].object;

  // Traverse up until we find the object with type === 'furniture'
  let selected: THREE.Object3D | null = hit;
  while (selected && selected.parent && !selected.userData.type) {
    selected = selected.parent;
  }

  if (selected?.userData.type === 'furniture') {
    this.selectObject(selected);
  } else {
    this.deselectObject();
  }
} else {
  this.deselectObject();
}
  }
  private selectObject(object: THREE.Object3D): void {
    this.selectedObject = object;
    this.transformControls.attach(object);
    
    // Update mode based on active tool
    this.transformControls.setMode(this.getTransformMode() as any);
    
    // Call selection change callback if available
    if (this.onSelectionChange) {
      const selectionInfo = {
        id: object.userData.id,
        name: object.userData.name,
        position: {
          x: object.position.x,
          y: object.position.y,
          z: object.position.z
        },
        rotation: object.rotation.y * (180 / Math.PI),
        scale: object.scale.x
      };
      
      this.onSelectionChange(selectionInfo);
    }
  }
  
  private deselectObject(): void {
    if (this.selectedObject) {
      this.transformControls.detach();
      this.selectedObject = null;
      
      // Call selection change callback with null to indicate deselection
      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
    }
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
this.orbitControls.update();
this.renderer.render(this.scene, this.camera);


  }
  
  public updateScene(roomConfig: RoomConfig): void {
    if (!roomConfig) {
      console.error("Invalid room configuration provided");
      return;
    }
    
    try {
      // Clear existing room
      this.roomBuilder.clearRoom();
      
      // Build new room
      this.roomBuilder.buildRoom(roomConfig);
      
      // Add furniture
      this.furnitureManager.clearFurniture();
      if (roomConfig.furniture && Array.isArray(roomConfig.furniture) && roomConfig.furniture.length > 0) {
        roomConfig.furniture.forEach(furniture => {
          if (furniture && typeof furniture === 'object') {
            this.furnitureManager.addFurniture(furniture as any);
          } else {
            console.warn("Invalid furniture item:", furniture);
          }
        });
      }
      
      // Create a lighting object based on colors if lighting is not provided
      let lighting = { intensity: 70, warmth: 50 };
      
      // Try to extract colors information from various possible places in the config
      let wallColor: string | undefined;
      
      // Try to get wall color from different possible locations in the data structure
      if ((roomConfig as any).colors && typeof (roomConfig as any).colors === 'object' && (roomConfig as any).colors.walls) {
        wallColor = (roomConfig as any).colors.walls;
      } else if (roomConfig.walls && roomConfig.walls.length > 0 && roomConfig.walls[0].color) {
        wallColor = roomConfig.walls[0].color;
      }
      
      // Derive lighting brightness from wall colors if available
      if (wallColor) {
        const threeColor = new THREE.Color(wallColor);
        const brightness = (threeColor.r + threeColor.g + threeColor.b) / 3; // Simple average brightness
        lighting.intensity = Math.min(100, Math.max(30, brightness * 100));
      }
      
      // Update lighting
      this.updateLighting(lighting);
    } catch (error) {
      console.error("Error updating scene:", error);
    }
  }
  
  public setActiveTool(tool: Tool): void {
    this.activeTool = tool;
    
    if (this.selectedObject) {
      this.transformControls.setMode(this.getTransformMode() as any);
    }
  }
  
  private getTransformMode(): string {
    switch (this.activeTool) {
      case 'move': return 'translate';
      case 'rotate': return 'rotate';
      case 'scale': return 'scale';
      default: return 'translate';
    }
  }
  
  public setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    
    if (mode === '3D') {
      // Set to perspective camera position
      this.camera.position.set(5, 5, 5);
      this.camera.lookAt(0, 0, 0);
    } else if (mode === 'top') {
      // Set to top-down view
      this.camera.position.set(0, 10, 0);
      this.camera.lookAt(0, 0, 0);
    }
  }
  
  public setWireframe(wireframe: boolean): void {
    this.roomBuilder.setWireframe(wireframe);
    this.furnitureManager.setWireframe(wireframe);
  }
  
  public updateRoomColors(colors: { walls?: string, floor?: string }): void {
    // Update wall color if provided
    if (colors.walls) {
      this.roomBuilder.updateWallColor(colors.walls);
    }
    
    // Update floor color if provided
    if (colors.floor) {
      this.roomBuilder.updateFloorColor(colors.floor);
    }
  }
  
  public updateFurnitureColor(color: string): void {
    if (this.selectedObject) {
      // Get all meshes of the selected furniture
      this.selectedObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            // Handle arrays of materials
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial || 
                    mat instanceof THREE.MeshPhongMaterial ||
                    mat instanceof THREE.MeshLambertMaterial) {
                  mat.color.set(color);
                  mat.needsUpdate = true;
                }
              });
            } 
            // Handle single material
            else if (child.material instanceof THREE.MeshStandardMaterial || 
                     child.material instanceof THREE.MeshPhongMaterial ||
                     child.material instanceof THREE.MeshLambertMaterial) {
              child.material.color.set(color);
              child.material.needsUpdate = true;
            }
          }
        }
      });
      
      // Update the internal object data
      if (this.selectedObject.userData) {
        this.selectedObject.userData.color = color;
        
        // Notify about the update
        if (this.onSelectionChange) {
          this.onSelectionChange({
            ...this.selectedObject.userData,
            position: {
              x: this.selectedObject.position.x,
              y: this.selectedObject.position.y,
              z: this.selectedObject.position.z
            },
            rotation: THREE.MathUtils.radToDeg(this.selectedObject.rotation.y),
            scale: this.selectedObject.scale.x, // Assuming uniform scaling
          });
        }
      }
    }
  }
  
  public updateLighting(lighting: { intensity: number, warmth: number }): void {
    // Implementation for updating lighting
    const lights = this.scene.children.filter(child => 
      child instanceof THREE.Light
    ) as THREE.Light[];
    
    if (lights.length > 0) {
      const intensityFactor = lighting.intensity / 100;
      
      // Update lights
      lights.forEach(light => {
        if (light instanceof THREE.AmbientLight) {
          light.intensity = 0.3 * intensityFactor;
        } else if (light instanceof THREE.DirectionalLight) {
          light.intensity = 0.7 * intensityFactor;
        } else if (light instanceof THREE.PointLight) {
          light.intensity = 0.5 * intensityFactor;
          
          // Adjust color temperature based on warmth
          const warmth = lighting.warmth / 100;
          const colorTemp = 6500 - (warmth * 3000); // 3500K (warm) to 6500K (cool)
          light.color = this.kelvinToRGB(colorTemp);
        }
      });
    }
  }
  
    
  
  private kelvinToRGB(kelvin: number): THREE.Color {
    // Simplified color temperature to RGB conversion
    const temp = kelvin / 100;
    let r, g, b;
    
    if (temp <= 66) {
      r = 255;
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
      
      if (temp <= 19) {
        b = 0;
      } else {
        b = temp - 10;
        b = 138.5177312231 * Math.log(b) - 305.0447927307;
      }
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
      b = 255;
    }
    
    return new THREE.Color(
      Math.min(Math.max(r, 0), 255) / 255,
      Math.min(Math.max(g, 0), 255) / 255,
      Math.min(Math.max(b, 0), 255) / 255
    );
  }
  
  // Camera Controls
  public resetCamera(): void {
    // Reset to default view
    if (this.viewMode === '3D') {
      // Position the camera centrally in the room at eye level
      this.camera.position.set(0, 1.6, 0);
      
      // Look slightly towards the front wall
      this.camera.lookAt(0, 1.6, -2);
      
      // Set very strict camera constraints
      this.orbitControls.maxPolarAngle = Math.PI * 0.85; // Allow looking down 
      this.orbitControls.minPolarAngle = Math.PI * 0.15; // Allow looking up to ceiling
      this.orbitControls.minDistance = 0.5; // Don't get too close to objects
      this.orbitControls.maxDistance = 2.5; // Very restricted to ensure staying inside
      
      // Make controls slower and more stable
      this.orbitControls.dampingFactor = 0.15;
      this.orbitControls.rotateSpeed = 0.4;
      
      // Completely disable panning
      this.orbitControls.enablePan = false;
      
      // Force update to apply settings
      this.orbitControls.update();
    } else {
      // Top-down view from above
      this.camera.position.set(0, 3.5, 0);
      this.camera.lookAt(0, 0, 0);
      
      // Reset constraints for top view
      this.orbitControls.maxPolarAngle = Math.PI / 2;
      this.orbitControls.minPolarAngle = 0;
      this.orbitControls.minDistance = 1.5;
      this.orbitControls.maxDistance = 4;
      this.orbitControls.enablePan = false;
      
      // Force update
      this.orbitControls.update();
    }
  }
  
  // Camera zoom controls
  public cameraZoomIn(): void {
    // Check if we're already at minimum distance
    if (this.camera.position.length() <= this.orbitControls.minDistance + 0.5) {
      return; // Don't zoom in further
    }
    
    // Implementation for zooming in - with less aggressive scaling
    this.camera.position.multiplyScalar(0.92);
    this.orbitControls.update();
  }
  
  public cameraZoomOut(): void {
    // Check if we're already at maximum distance
    if (this.camera.position.length() >= this.orbitControls.maxDistance - 0.5) {
      return; // Don't zoom out further
    }
    
    // Implementation for zooming out - with less aggressive scaling
    this.camera.position.multiplyScalar(1.08);
    this.orbitControls.update();
  }
  
  // Furniture zoom controls (for when furniture is selected)
  public zoomIn(): void {
    if (this.selectedObject) {
      // Get current scale
      const currentScale = this.selectedObject.scale.x;
      // Calculate new scale (increase by zoomStep but don't exceed maxZoom)
      const newScale = Math.min(this.maxZoom, currentScale + this.zoomStep);
      
      // Apply uniform scaling to maintain proportions
      this.selectedObject.scale.set(newScale, newScale, newScale);
      
      // Update selection info if needed
      if (this.onSelectionChange && this.selectedObject.userData) {
        this.onSelectionChange({
          ...this.selectedObject.userData,
          position: {
            x: this.selectedObject.position.x,
            y: this.selectedObject.position.y,
            z: this.selectedObject.position.z
          },
          rotation: THREE.MathUtils.radToDeg(this.selectedObject.rotation.y),
          scale: newScale
        });
      }
    } else {
      // If no object is selected, zoom the camera instead
      this.cameraZoomIn();
    }
  }
  
  public zoomOut(): void {
    if (this.selectedObject) {
      // Get current scale
      const currentScale = this.selectedObject.scale.x;
      // Calculate new scale (decrease by zoomStep but don't go below minZoom)
      const newScale = Math.max(this.minZoom, currentScale - this.zoomStep);
      
      // Apply uniform scaling to maintain proportions
      this.selectedObject.scale.set(newScale, newScale, newScale);
      
      // Update selection info if needed
      if (this.onSelectionChange && this.selectedObject.userData) {
        this.onSelectionChange({
          ...this.selectedObject.userData,
          position: {
            x: this.selectedObject.position.x,
            y: this.selectedObject.position.y,
            z: this.selectedObject.position.z
          },
          rotation: THREE.MathUtils.radToDeg(this.selectedObject.rotation.y),
          scale: newScale
        });
      }
    } else {
      // If no object is selected, zoom the camera instead
      this.cameraZoomOut();
    }
  }

  
  
  public toggleOrbitControls(): void {
    this.orbitControls.enabled = !this.orbitControls.enabled;
  }
  
  public removeSelectedObject(): void {
    if (this.selectedObject) {
      const objectId = this.selectedObject.userData.id;
      this.transformControls.detach();
      this.scene.remove(this.selectedObject);
      this.selectedObject = null;
      
      // Notify about removal
      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
      
      return objectId;
    }
    return;
  }
  
  public updateSelectedObject(updates: any): void {
  if (!this.selectedObject) return;

  // ✅ Update position
  if (updates.position) {
    this.selectedObject.position.set(
      updates.position.x,
      updates.position.y,
      updates.position.z
    );
    this.selectedObject.userData.position = updates.position;
  }

  // ✅ Update rotation (store both radian & degree)
  if (typeof updates.rotation === "number") {
    this.selectedObject.rotation.y = THREE.MathUtils.degToRad(updates.rotation);
    this.selectedObject.userData.rotation = updates.rotation;
  }

  // ✅ Update scale relative to original
  if (typeof updates.scale === "number") {
    const original = this.selectedObject.userData.originalScale || new THREE.Vector3(1, 1, 1);
    this.selectedObject.scale.set(
      original.x * updates.scale,
      original.y * updates.scale,
      original.z * updates.scale
    );
    this.selectedObject.userData.scale = updates.scale;
  }
}

  public setSelectionChangeCallback(callback: (selection: any) => void): void {
    this.onSelectionChange = callback;
  }
  
  public dispose(): void {
    // Clean up resources
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.container.removeEventListener('click', this.onContainerClick.bind(this));
    
    this.renderer.dispose();
    this.orbitControls.dispose();
    
    // Remove renderer from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}