import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import { furnitureModelMap } from "../furnitureModelMap";



interface Furniture {
  itemId?: number;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  scale: number;
}

export class FurnitureManager {
  private scene: THREE.Scene;
  private furniture: THREE.Group;
  private loader: GLTFLoader;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.furniture = new THREE.Group();
    this.scene.add(this.furniture);
    this.loader = new GLTFLoader();
  }

public async addFurniture(furnitureItem: Furniture): Promise<void> {
  const placeholder = this.createPlaceholder(furnitureItem);
  this.furniture.add(placeholder);

  try {
    const model = await this.loadModel(furnitureItem.name);

    if (!model) {
      console.warn("Model loading failed, keeping placeholder");
      placeholder.visible = true;
      return;
    }

    // ✅ Apply scale FIRST
    model.scale.setScalar(furnitureItem.scale);

    // ✅ Save original scale for future scaling operations
model.userData.originalScale = model.scale.clone();


    // ✅ Compute bounding box AFTER scaling
    const box = new THREE.Box3().setFromObject(model);
    const yOffset = box.min.y;

    // ✅ Set final position with Y adjustment
    model.position.set(
      furnitureItem.position.x,
      furnitureItem.position.y - yOffset,
      furnitureItem.position.z
    );

    model.rotation.y = furnitureItem.rotation * (Math.PI / 180);

    model.visible = true;
    model.traverse((child) => {
      child.visible = true;
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true;
        child.userData.originalMaterial = child.material.clone();
      }
    });

    model.userData = {
      type: "furniture",
      id: furnitureItem.itemId,
      name: furnitureItem.name,
    };

    // Replace placeholder
    this.furniture.remove(placeholder);
    placeholder.geometry.dispose();
    if (placeholder.material instanceof THREE.Material) {
      placeholder.material.dispose();
    }

    this.furniture.add(model);

    if (this.scene.userData.render) {
      this.scene.userData.render();
    }

  } catch (error) {
    console.error("Error loading furniture model:", error);
    placeholder.visible = true;
  }
}


  private createPlaceholder(furnitureItem: Furniture): THREE.Mesh {
    // Create a simple box as placeholder
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      opacity: 0.7,
      transparent: true,
    });

    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    // Apply position, rotation, and scale
    box.position.set(
      furnitureItem.position.x,
      furnitureItem.position.y,
      furnitureItem.position.z,
    );
    box.rotation.y = furnitureItem.rotation * (Math.PI / 180);
    box.scale.set(
      furnitureItem.scale,
      furnitureItem.scale,
      furnitureItem.scale,
    );

    // Set userData for identification
    box.userData = {
      type: "furniture",
      id: furnitureItem.itemId,
      name: furnitureItem.name,
    };

    return box;
  }


private async loadModel(name?: string): Promise<THREE.Group | null> {
  if (!name) return null;

  // Resolve correct model path from map
  const key = name.toLowerCase().replace(/\s+/g, "_"); // e.g., "Sofa 1" → "sofa_1"
  const modelUrl = furnitureModelMap[key];

  if (!modelUrl) {
    console.warn(`No model found for furniture name: ${name}`);
    return this.createEnhancedPlaceholder(name);
  }

  try {
    const gltf = await new Promise<GLTF>((resolve, reject) => {
  this.loader.load(
    modelUrl,
    (gltf) => {
      // Model loaded successfully
      resolve(gltf);
    },
    undefined,
    (error) => {
      console.error(`Model not found or invalid: ${modelUrl}`, error);
      reject(error);
    }
  );
});
console.log("Attempting to load model for key:", key, " → ", modelUrl);





    const model = gltf.scene;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return model;
  } catch (err) {
    console.error(`Failed to load model ${modelUrl}:`, err);
    return this.createEnhancedPlaceholder(name);
  }
}


  private createEnhancedPlaceholder(furnitureName: string): THREE.Group {
    const group = new THREE.Group();
    
    // Basic dimensions for different furniture types
    const dimensions = {
      sofa: { width: 2, height: 0.8, depth: 0.9 },
      chair: { width: 0.6, height: 0.9, depth: 0.6 },
      table: { width: 1.2, height: 0.75, depth: 0.8 },
      default: { width: 1, height: 1, depth: 1 }
    };

    let size = dimensions.default;
    if (furnitureName.toLowerCase().includes('sofa')) size = dimensions.sofa;
    if (furnitureName.toLowerCase().includes('chair')) size = dimensions.chair;
    if (furnitureName.toLowerCase().includes('table')) size = dimensions.table;

    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Add wireframe for better visibility
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
    );
    group.add(wireframe);

    return group;
  }

  public clearFurniture(): void {
    // Remove all children from the furniture group
    while (this.furniture.children.length > 0) {
      this.furniture.remove(this.furniture.children[0]);
    }
  }

  public setWireframe(wireframe: boolean): void {
    // Set wireframe mode for all furniture materials
    this.furniture.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.wireframe = wireframe;
            }
          });
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.wireframe = wireframe;
        }
      }
    });
  }
}
