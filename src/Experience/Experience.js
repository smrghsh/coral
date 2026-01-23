import * as THREE from "three";
import {
  Debug,
  Sizes,
  Time,
  Resources,
  Camera,
  Renderer,
  Networking,
  User,
  Controller,
} from "./brahma/Brahma.js";
import EventEmitter from "./brahma/utilities/EventEmitter.js";
import World from "./World/World.js";
import sources from "./sources.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

let instance = null;

export default class Experience {
  //if you are new to javascript, I understand how the following lines look like witchcraft
  constructor(canvas) {
    if (instance) {
      return instance;
    }
    instance = this;
    window.experience = this;

    this.canvas = canvas;
    this.debug = new Debug();
    this.user = new User();
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    // console.log("sources", sources);
    this.resources = new Resources(sources);
    this.world = new World();
    this.cameraGroup = new THREE.Group();

    this.camera = new Camera();
    this.renderer = new Renderer();

    /**
     * Clock
     */
    this.clock = new THREE.Clock();
    this.clock.start();

    this.scene.add(this.cameraGroup);
    this.controller = new Controller();
    this.renderer.instance.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(this.renderer.instance));
    // samir believes this gets hit when we're in XR
    this.renderer.instance.setAnimationLoop(() => {
      this.controller.update();
      if (this.networking?.canSendEmbodiment) {
        this.networking.sendEmbodiment(
          this.camera.instance.matrixWorld,
          this.controller.controller1.matrixWorld,
          this.controller.controller2.matrixWorld,
        );
      }

      this.renderer.instance.render(this.scene, this.camera.instance);
    });

    this.sizes.on("resize", () => {
      this.resize();
      this.camera.resize();
      this.renderer.resize();
    });
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    console.log("resized occured");
    this.camera.resize();
  }
  update() {
    this.camera.update();
    if (!this.isXRActive()) {
      // this is executed when out of XR i.e. desktop
      this.cameraGroup.updateMatrixWorld();
      this.camera.instance.updateMatrixWorld();
      this.pointer.hover();
    } else {
      console.log("im in headset");
    }
    this.world.update();
  }
  isXRActive() {
    return this.renderer.instance.xr.isPresenting;
  }
}
