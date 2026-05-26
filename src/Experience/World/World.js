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

    // SOG cycling state
    this.sogFiles = [
      "./coral005-01.sog",
      "./coral005-02.sog",
      "./coral005-03.sog",
    ];
    this.currentSogIndex = 0;
    this.splatMesh = null;

    // Wait for resources
    this.ready = false;
    this.resources.on("ready", () => {
      this.floor = new Floor();
      this.environment = new Environment();

      try {
        this.createSplatMesh(this.sogFiles[this.currentSogIndex]);
        this.configureRenderer();
      } catch (error) {
        console.error("Error creating SplatMesh:", error);
      }

      this.sky = new Sky();
      this.ready = true;
    });
  }

  createSplatMesh(url) {
    console.log("loading splat mesh:", url);

    const splatMesh = new SplatMesh({
      url,
      maxSplats: 500000,
      editable: true,
    });

    splatMesh.rotation.x = -Math.PI;
    this.scene.add(splatMesh);
    this.splatMesh = splatMesh;

    console.log("SplatMesh added to scene:", url);
  }

  cycleSplat(direction = 1) {
    if (!this.ready || !this.sogFiles.length) return;

    this.currentSogIndex =
      (this.currentSogIndex + direction + this.sogFiles.length) %
      this.sogFiles.length;

    const nextUrl = this.sogFiles[this.currentSogIndex];

    if (this.splatMesh) {
      this.scene.remove(this.splatMesh);
      if (typeof this.splatMesh.dispose === "function") {
        this.splatMesh.dispose();
      }
      this.splatMesh = null;
    }

    this.createSplatMesh(nextUrl);
    this.ensureSparkRenderer();
    this.configureRenderer();
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
    renderer.maxStdDev = 2.83; // default: sqrt(8) ≈ 2.83, reduce for faster rendering

    // Blur amount for anti-aliasing - lower = less processing
    renderer.blurAmount = 0.3; // default: 0.3, reduce for performance

    // Pre-blur for covariance - disable for performance
    renderer.preBlurAmount = 0; // default: 0

    // Minimum pixel radius - skip very tiny splats
    renderer.minPixelRadius = 2; // default: 1, increase to skip small splats

    // Maximum pixel radius - cap splat size
    renderer.maxPixelRadius = 32; // default: 256, reduce to limit overdraw

    // Minimum alpha - skip very transparent splats
    renderer.minAlpha = 1 / 255; // default: 0.5 * (1/255), less aggressive culling

    // Enable 2D gaussian rendering for flatter models (test if helpful)
    renderer.enable2DGS = true; // default: false

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
