import * as THREE from "three";
import Experience from "../Experience.js";

export default class MagnifyingGlass {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.geometry = new THREE.PlaneGeometry(0.25, 0.25);
    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x88ccff),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = 1.5;
    this.plane.position.z = -1;
    this.scene.add(this.plane);
    this.raycaster = new THREE.Raycaster();

    // Setup click event to download screenshot
    this.setupClickHandler();
  }

  setupClickHandler() {
    // Add click event listener to the canvas
    const canvas =
      this.experience.canvas || document.querySelector("canvas.webgl");
    if (canvas) {
      canvas.addEventListener("click", (event) => {
        this.downloadImage();
      });
    }
  }

  downloadImage() {
    // Hide the magnifying glass plane temporarily
    this.plane.visible = false;

    // Force a render to ensure the canvas has current content without the plane
    this.experience.renderer.instance.render(
      this.scene,
      this.experience.camera.instance
    );

    const canvas =
      this.experience.canvas || document.querySelector("canvas.webgl");
    if (!canvas) {
      console.error("Canvas not found for screenshot");
      // Make sure to show the plane again even if we error out
      this.plane.visible = true;
      return;
    }

    // Project the plane center to screen coordinates
    const planeCenter = this.plane.position.clone();
    planeCenter.project(this.experience.camera.instance);

    // Convert to screen coordinates
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const screenX = ((planeCenter.x + 1) * canvasWidth) / 2;
    const screenY = ((1 - planeCenter.y) * canvasHeight) / 2;

    // Estimate screen size of the plane based on distance
    const distance = this.experience.camera.instance.position.distanceTo(
      this.plane.position
    );
    const screenSize =
      (0.25 / distance) * Math.min(canvasWidth, canvasHeight) * 300; // scale factor

    // Create crop bounds around the plane center
    const cropSize = Math.max(50, Math.min(200, screenSize)); // clamp between 50-200 pixels
    const minX = Math.max(0, screenX - cropSize / 2);
    const maxX = Math.min(canvasWidth, screenX + cropSize / 2);
    const minY = Math.max(0, screenY - cropSize / 2);
    const maxY = Math.min(canvasHeight, screenY + cropSize / 2);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    // Get the full canvas image
    const fullImageData = canvas.toDataURL("image/png");

    // Show the plane again immediately after capturing
    this.plane.visible = true;

    // Create a new canvas for cropping
    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;

    // Load the full image and crop it
    const img = new Image();
    img.onload = async () => {
      // Draw the cropped portion
      cropCtx.drawImage(
        img,
        minX,
        minY,
        cropWidth,
        cropHeight, // source rectangle
        0,
        0,
        cropWidth,
        cropHeight // destination rectangle
      );

      // Get the cropped image data for the agent
      const croppedImageData = cropCanvas.toDataURL("image/png");

      // Call agent's identify function if available
      if (
        window.experience &&
        window.experience.world &&
        window.experience.world.agent
      ) {
        try {
          console.log("Calling agent to identify coral species...");
          await window.experience.world.agent.identify(croppedImageData);
        } catch (error) {
          console.error("Error calling agent identify:", error);
        }
      }

      // Create download link for cropped image
      // const link = document.createElement("a");
      // link.download = `magnified-view-${Date.now()}.png`;
      // link.href = croppedImageData;

      // // Trigger download
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

      // console.log(
      //   `Magnified view downloaded - cropped to ${cropWidth}x${cropHeight} pixels at (${Math.round(
      //     minX
      //   )}, ${Math.round(minY)})`
      // );
    };

    img.src = fullImageData;
  }
  update() {
    this.raycaster.setFromCamera(
      this.experience.mouse,
      this.experience.camera.instance
    );
    this.raycaster.ray.at(4, this.plane.position);
    this.plane.lookAt(this.experience.camera.instance.position);
  }
}
