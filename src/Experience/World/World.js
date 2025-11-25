import * as THREE from "three";
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import { SplatMesh } from "./spark.module.js";
import Agent from "./Agent.js";
import MagnifyingGlass from "./MagnifyingGlass.js";
export default class World {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.ready = false;
    this.resources.on("ready", () => {
      this.agent = new Agent();
      // this.magnifyingGlass = new MagnifyingGlass();
      this.floor = new Floor();
      this.axesHelper = new THREE.AxesHelper(5);
      this.scene.add(this.axesHelper);
      this.environment = new Environment();

      // const viewer = new GaussianSplats3D.DropInViewer({
      //   webXRMode: GaussianSplats3D.WebXRMode.VR,
      // });
      // viewer.addSplatScene("/5x5%23-10_-10_-5_-5%23-2_-2.ply").then(() => {
      //   // viewer.start();
      //   console.log("gaussian splat loaded");
      //   // hide the axes helper
      //   this.axesHelper.visible = false;
      //   viewer.splatMesh.rotation.x -= Math.PI / 2;
      //   viewer.splatMesh.position.set(7, 6.8, -6);
      // });
      // viewer.position.x -= 1;
      // viewer.rotation.y += Math.PI / 2;
      // viewer.position.z -= 2;
      // this.scene.add(viewer);
      console.log("loading splat mesh");
      try {
        const splatMesh = new SplatMesh({
          url: "./coral001.sog",
        });
        console.log("SplatMesh created:", splatMesh);

        // Position and rotate similar to the commented GaussianSplats3D setup
        splatMesh.rotation.x = -Math.PI / 2;
        splatMesh.position.set(7, 6.8, -6);
        splatMesh.scale.set(1, 1, 1);

        console.log("SplatMesh position:", splatMesh.position);
        console.log("SplatMesh rotation:", splatMesh.rotation);
        console.log("SplatMesh scale:", splatMesh.scale);

        // Add event listeners if available
        if (splatMesh.addEventListener) {
          splatMesh.addEventListener("load", () => {
            console.log("Splat mesh loaded successfully");
          });
          splatMesh.addEventListener("error", (error) => {
            console.error("Splat mesh error:", error);
          });
        }

        this.scene.add(splatMesh);
        this.splatMesh = splatMesh; // Store reference
        console.log("SplatMesh added to scene");
      } catch (error) {
        console.error("Error creating SplatMesh:", error);
      }

      this.ready = true;
    });
  }
  update() {
    if (this.ready) {
      // this.magnifyingGlass.update();
    }
  }
}
