// src/three/TransformManager.ts

import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

type Mode = "translate" | "rotate" | "scale";

export class TransformManager {
  private transformControls: TransformControls;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private orbitControls: any;
  private selectedObject: THREE.Object3D | null = null;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, orbitControls: any) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.orbitControls = orbitControls;

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.scene.add(this.transformControls as unknown as THREE.Object3D);


    this.transformControls.addEventListener("dragging-changed", (event: any) => {
      this.orbitControls.enabled = !event.value;
    });

    this.initKeyBindings();
  }

  private initKeyBindings() {
    window.addEventListener("keydown", (event) => {
      switch (event.key.toLowerCase()) {
        case "t":
          this.setMode("translate");
          break;
        case "r":
          this.setMode("rotate");
          break;
        case "s":
          this.setMode("scale");
          break;
        case "escape":
          this.detach();
          break;
      }
    });
  }

  public setMode(mode: Mode) {
    this.transformControls.setMode(mode);
  }

  public attach(object: THREE.Object3D) {
    this.selectedObject = object;
    this.transformControls.attach(object);
  }

  public detach() {
    this.selectedObject = null;
    this.transformControls.detach();
  }

  public changeColor(hex: string) {
    if (!this.selectedObject) return;
    this.selectedObject.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.color.set(hex);
        child.material.needsUpdate = true;
      }
    });
  }

  public getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

public update(delta: number) {
  this.transformControls.update(delta);
}

}
