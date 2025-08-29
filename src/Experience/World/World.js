import * as THREE from "three";
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    console.log("hello");

    // Wait for resources
    this.ready = false;
    this.resources.on("ready", () => {
      // Setup
      console.log("resources ready");
      this.floor = new Floor();
      this.axesHelper = new THREE.AxesHelper(5);
      this.scene.add(this.axesHelper);
      this.environment = new Environment();
      const viewer = new GaussianSplats3D.Viewer({
        threeScene: this.scene,
        webXRMode: GaussianSplats3D.WebXRMode.VR,
      });
      viewer.addSplatScene("/5x5%23-10_-10_-5_-5%23-2_-2.ply").then(() => {
        viewer.start();
        console.log("done");
        viewer.splatMesh.rotation.x -= Math.PI / 2;
        viewer.splatMesh.position.set(7, 7, -6);
      });
      // const viewer = new GaussianSplats3D.DropInViewer({
      //   gpuAcceleratedSort: true,
      // });
      // viewer.addSplatScenes([
      //   {
      //     path: "./5x5%23-10_-10_-5_-5%23-2_-2.ply",
      //     splatAlphaRemovalThreshold: 5,
      //   },
      //   {
      //     path: "./5x5%23-10_-15_-5_-10%23-2_-3.ply",
      //     rotation: [0, -0.857, -0.514495, 6.123233995736766e-17],
      //     scale: [1.5, 1.5, 1.5],
      //     position: [0, 0, 0],
      //   },
      // ]);
      console.log(viewer);
      this.scene.add(viewer);

      this.ready = true;
    });
  }
  update() {
    if (this.ready) {
    }
  }
}
