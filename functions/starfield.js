import * as THREE from "three";

export default function getStarfield({ numStars = 500, radius = 1000 } = {}) {
    const verts = [];
    const colors = [];
    
    for (let i = 0; i < numStars; i++) {
      // Random spherical distribution
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
  
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
  
      verts.push(x, y, z);
  
      // Star color
      const hue = Math.random() * 0.1 + 0.55; // Slight hue variation
      const color = new THREE.Color().setHSL(hue, 0.5, 0.9);
      colors.push(color.r, color.g, color.b);
    }
  
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
    const mat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 1, // Larger size for visibility
      depthTest: false, // Ensure stars are always in the background
    });
  
    return new THREE.Points(geo, mat);
  }