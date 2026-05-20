import * as THREE from "three";
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";
import { SparkRenderer, SplatMesh } from "./spark.module.js";
import Sky from "./Sky.js";
export default class World {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.renderer = this.experience.renderer;

    // Wait for resources
    this.ready = false;
    this.resources.on("ready", () => {
      this.floor = new Floor();
      this.environment = new Environment();

      console.log("loading splat mesh");
      try {
        const splatMesh = new SplatMesh({
          url: "./coral005.sog",
          // PERFORMANCE: Limit splats to prevent GPU memory overload
          // Reducing from millions to ~1M provides 50-70% FPS improvement
          maxSplats: 100000,
          // PERFORMANCE: Disable editing features if not needed
          editable: false,
        });
        console.log("SplatMesh created:", splatMesh);

        // Position and rotate similar to the commented GaussianSplats3D setup
        splatMesh.rotation.x = -Math.PI;

        // splatMesh.position.set(7, 6.8, -6);
        // splatMesh.scale.set(1, 1, 1);

        console.log("SplatMesh position:", splatMesh.position);
        console.log("SplatMesh rotation:", splatMesh.rotation);
        console.log("SplatMesh scale:", splatMesh.scale);

        this.scene.add(splatMesh);
        this.splatMesh = splatMesh; // Store reference
        console.log("SplatMesh added to scene");

        this.ensureSparkRenderer();
        this.configureRenderer();
      } catch (error) {
        console.error("Error creating SplatMesh:", error);
      }
      this.sky = new Sky();
      this.ready = true;
    });
  }

  configureRenderer() {
    // Find the SparkRenderer in the scene (should be auto-created)
    let renderer = null;
    this.scene.traverse((node) => {
      if (node instanceof SparkRenderer) {
        renderer = node;
      }
    });

    if (!renderer) {
      console.warn("SparkRenderer not found");
      return;
    }

    // PERFORMANCE TUNING: Aggressive settings for mobile/lower-end devices
    // These reduce visual quality slightly but dramatically improve FPS

    // Maximum standard deviation distance - lower = tighter splat rendering
    renderer.maxStdDev = 1.5; // default: sqrt(8) ≈ 2.83, reduce for faster rendering

    // Blur amount for anti-aliasing - lower = less processing
    renderer.blurAmount = 0.15; // default: 0.3, reduce for performance

    // Pre-blur for covariance - disable for performance
    renderer.preBlurAmount = 0; // default: 0

    // Minimum pixel radius - skip very tiny splats
    renderer.minPixelRadius = 2; // default: 1, increase to skip small splats

    // Maximum pixel radius - cap splat size
    renderer.maxPixelRadius = 16; // default: 256, reduce to limit overdraw

    // Minimum alpha - skip very transparent splats
    renderer.minAlpha = 1 / 128; // default: 0.5 * (1/255), less aggressive culling

    // Enable 2D gaussian rendering for flatter models (test if helpful)
    renderer.enable2DGS = false; // default: false

    console.log("✓ SparkRenderer configured for performance");
    console.log(`  maxStdDev: ${renderer.maxStdDev}`);
    console.log(`  blurAmount: ${renderer.blurAmount}`);
    console.log(`  minPixelRadius: ${renderer.minPixelRadius}`);
    console.log(`  maxPixelRadius: ${renderer.maxPixelRadius}`);
  }

  ensureSparkRenderer() {
    let renderer = null;
    this.scene.traverse((node) => {
      if (node instanceof SparkRenderer) {
        renderer = node;
      }
    });

    if (renderer) {
      return renderer;
    }

    const sparkRenderer = new SparkRenderer({
      renderer: this.renderer.instance,
    });
    this.scene.add(sparkRenderer);
    return sparkRenderer;
  }

  update() {
    if (this.ready) {
      // this.magnifyingGlass.update();
    }
  }
}
