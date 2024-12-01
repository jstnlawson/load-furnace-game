import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarfield from "./functions/starfield.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
  import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('./assets/house.glb', (gltf) => {
  const house = gltf.scene;
  house.position.set(0, 0.5, 0); // Adjust position
  scene.add(house);
});

//colors

const darkGreen = 0x006400;
const skyColor = 0x87ceeb; // Sky blue
const blackSkyColor = 0x000000; // Black

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stars = getStarfield({ numStars: 1000, radius: 500 });

// Add Sky

scene.background = new THREE.Color(blackSkyColor);
scene.add(stars);
// stars.renderOrder = 0;

// Add Ground
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
// const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 }); // Grass green
// Custom Shader Material
const groundMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(0x228b22) }, // Grass green
      color2: { value: new THREE.Color(darkGreen) }, // Dark green
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv; // Pass UV coordinates to the fragment shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main() {
        float mixFactor = smoothstep(0.0, 1.0, vUv.y); // Create gradient using UV.y
        gl_FragColor = vec4(mix(color1, color2, mixFactor), 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to make it flat
ground.position.set(0, 0, 0); // Ensure it's positioned at the center and flat along the x-z plane
ground.receiveShadow = true; // Allow shadows on the ground
scene.add(ground);
// ground.renderOrder = 1;

// Add Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 50, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
scene.add(ambientLight);

// Camera Position and Initial Rotation
camera.position.set(0, 10, 30); // Set the camera above the ground
camera.rotation.order = "YXZ"; 

// Movement Variables
const moveSpeed = 10; // Movement speed
const rotateSpeed = 0.05; // Rotation speed
const keys = {};

// Camera Rotation Angles
let pitch = 0; // Rotation around the x-axis (up/down)
let yaw = 0; // Rotation around the y-axis (left/right)

// Event Listeners for Keyboard Controls
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Create a clock for delta time (smooth and frame-rate independent)
const clock = new THREE.Clock();

// Animate Loop
function animate() {
  requestAnimationFrame(animate);

  // Delta Time
  const delta = clock.getDelta();

  // Movement Logic
  const moveVector = new THREE.Vector3(0, 0, 0);
  if (keys["arrowup"]) moveVector.z = -1; // Move forward
  if (keys["arrowdown"]) moveVector.z = 1; // Move backward
  if (keys["arrowleft"]) moveVector.x = -1; // Strafe left
  if (keys["arrowright"]) moveVector.x = 1; // Strafe right

  // Calculate forward and right vectors
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

  // Combine movement directions
  const movement = forward.multiplyScalar(-moveVector.z).add(right.multiplyScalar(moveVector.x));
  movement.multiplyScalar(moveSpeed * delta);
  camera.position.add(movement);

  camera.position.y = 2; // Keep camera at 2 meters above the ground


  // Camera Rotation Logic
  if (keys["s"]) pitch = Math.max(pitch - rotateSpeed, -Math.PI / 2); 
  if (keys["w"]) pitch = Math.min(pitch + rotateSpeed, Math.PI / 2); 
  if (keys["a"]) yaw += rotateSpeed; // Rotate left
  if (keys["d"]) yaw -= rotateSpeed; // Rotate right

  // Apply rotation based on yaw and pitch
  camera.rotation.set(pitch, yaw, 0);

  // Render the scene
  renderer.render(scene, camera);
}




// Handle Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


animate();
