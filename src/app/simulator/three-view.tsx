import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Building {
  position: [number, number, number];
  dimensions: [number, number, number];
  color: string;
}

interface Road {
  points: [number, number, number][];
  width: number;
  direction: number;
}

interface Vehicle {
  position: [number, number, number];
  direction: [number, number, number];
  type: string;
  path: [number, number, number][];
}

interface SimulationData {
  buildings: Building[];
  roads: Road[];
  vehicles: Vehicle[];
  hotspots: [number, number, number][];
}

const ThreeView = ({ simulationData }: { simulationData: SimulationData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const vehiclesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 20);
    scene.add(gridHelper);

    // Add buildings
    simulationData.buildings.forEach((building) => {
      const geometry = new THREE.BoxGeometry(
        building.dimensions[0],
        building.dimensions[1],
        building.dimensions[2]
      );
      const material = new THREE.MeshPhongMaterial({
        color: building.color,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...building.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Add roads with direction indicators
    simulationData.roads.forEach((road) => {
      const points = road.points.map((point) => new THREE.Vector3(...point));
      const roadGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const roadMaterial = new THREE.LineBasicMaterial({
        color: road.direction === 2 ? 0x4444ff : 0x44ff44,
        linewidth: road.width,
      });
      const roadLine = new THREE.Line(roadGeometry, roadMaterial);
      scene.add(roadLine);
    });

    // Add hotspots
    simulationData.hotspots.forEach((position) => {
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...position);
      scene.add(sphere);
    });

    // Vehicle movement
    const updateVehicles = () => {
      // Remove old vehicles
      vehiclesRef.current.forEach((vehicle) => scene.remove(vehicle));
      vehiclesRef.current = [];

      // Add new vehicles with animation along their paths
      simulationData.vehicles.forEach((vehicle, index) => {
        const time = (Date.now() * 0.001) % 10; // 10-second loop
        const pathIndex = Math.floor((time / 10) * vehicle.path.length);
        const currentPos = vehicle.path[pathIndex];
        const nextPos = vehicle.path[(pathIndex + 1) % vehicle.path.length];

        const geometry = new THREE.BoxGeometry(2, 1, 4);
        const material = new THREE.MeshPhongMaterial({
          color: vehicle.type === "car" ? 0x00ff00 : 0x0000ff,
        });
        const mesh = new THREE.Mesh(geometry, material);

        if (currentPos && nextPos) {
          mesh.position.set(...currentPos);
          mesh.lookAt(new THREE.Vector3(...nextPos));
        }

        scene.add(mesh);
        vehiclesRef.current.push(mesh);
      });
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      updateVehicles();
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [simulationData]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default ThreeView;
