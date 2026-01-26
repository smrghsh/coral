# coral
![coralXR.png](coralXR.png)

[link to application](smrghsh.github.io/coral)

[WebXR](https://immersiveweb.dev/) based exploration of point cloud rendering of a coral reef. Uses a [dataset](https://huggingface.co/datasets/wildflow/sweet-corals) from [wildflow.ai](https://wildflow.ai/) with a recent rendering [technique](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/) and [implementation](https://github.com/sparkjsdev/spark). 

## How to Use

_Phone and Tablet devices_- Use touch controls to navigate by swipping. Pinch-to-zoom too.

_Desktop devices_ - Click and drag to navigate.

_HMDs, such as Meta Quest 3S_ - Use a grab-and-pull motion with the right controller to move. (note: we are currently working on the Apple Vision Pro implementation and restoring ambidextrous controls. If you would like to help with either of these, please see the development and contribution docs.)

## Local Installation
The source code relies on packages and development tooling using npm.

`npm install` to install dependencies.

## Development and Contribution
Source code consists of assets and small engine built using an Experience.js singleton model, largely structured and extended from a Bruno Simon approach (see [Lesson 26](https://threejs-journey.com/lessons/code-structuring-for-bigger-projects)). It leverages an alpha version of a the brahma library (imported as a submodule). Feel free to email @smrghsh for contribution opportunities.

## Attributions

Dataset - [wildflow/sweet-corals](https://huggingface.co/datasets/wildflow/sweet-corals) on Hugging Face

Skybox - [TODO, it's CC 2.0]

[Goggle](https://skfb.ly/6Upwp) - Snorkel mask for Spark AR by inboundingbox.
