import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Layers,
  Sun,
  Moon,
  Droplets,
  Eye,
  Maximize2,
  Info,
  ShieldAlert,
  Sprout,
  Compass,
  Activity,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Satellite,
} from "lucide-react";
import { CropZone, DigitalTwinFarm, FarmInfrastructure } from "@/lib/agritwin/types";
import { Button } from "@/components/ui/button";
import { fetchCopernicusSentinelImage } from "@/lib/copernicus.functions";

interface Farm3DViewerProps {
  twin: DigitalTwinFarm;
  zones: CropZone[];
  onSelectZone?: (zone: CropZone) => void;
  onSelectInfrastructure?: (item: FarmInfrastructure) => void;
  selectedZoneId?: string | null;
}

export function Farm3DViewer({
  twin,
  zones,
  onSelectZone,
  onSelectInfrastructure,
  selectedZoneId,
}: Farm3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<"standard" | "ndvi" | "moisture" | "copernicus">("standard");
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset" | "night">("day");
  const [selectedEntity, setSelectedEntity] = useState<{
    type: "zone" | "infrastructure";
    data: CropZone | FarmInfrastructure;
  } | null>(() => {
    return zones[0] ? { type: "zone", data: zones[0] } : null;
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const zoneMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const copernicusTextureRef = useRef<THREE.Texture | null>(null);
  const copernicusBboxKey = useRef("");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x14120e);
    scene.fog = new THREE.FogExp2(0x14120e, 0.012);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 36, 44);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 3. LIGHTING
    const hemiLight = new THREE.HemisphereLight(0xe8fbf0, 0x0a1610, 0.9);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff5db, 1.6);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -32;
    dirLight.shadow.camera.right = 32;
    dirLight.shadow.camera.top = 32;
    dirLight.shadow.camera.bottom = -32;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 4. TERRAIN (High-tech Agricultural Topography Grid)
    const groundGeo = new THREE.PlaneGeometry(58, 44, 96, 96);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.12) * Math.cos(y * 0.12) * 0.65;
      posAttr.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x122419,
      roughness: 0.85,
      metalness: 0.08,
      flatShading: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // High-tech GIS Grid overlay
    const gridHelper = new THREE.GridHelper(56, 28, 0x10b981, 0x1b3827);
    gridHelper.position.y = 0.05;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // Glowing Property Perimeter Geofence
    const fenceGeo = new THREE.BufferGeometry();
    const fencePoints = [
      new THREE.Vector3(-26, 0.25, -19),
      new THREE.Vector3(26, 0.25, -19),
      new THREE.Vector3(26, 0.25, 19),
      new THREE.Vector3(-26, 0.25, 19),
      new THREE.Vector3(-26, 0.25, -19),
    ];
    fenceGeo.setFromPoints(fencePoints);
    const fenceMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 2,
    });
    const fenceLine = new THREE.Line(fenceGeo, fenceMat);
    fenceLine.computeLineDistances();
    scene.add(fenceLine);

    // 5. CROPS & ZONES
    const zoneMeshes = new Map<string, THREE.Mesh>();

    // Zone 1: Maize Block (North Plot, 2.2 Acres)
    const z1Geo = new THREE.BoxGeometry(23, 0.35, 21);
    const z1Mat = new THREE.MeshStandardMaterial({
      color: 0x1d4a27,
      roughness: 0.75,
    });
    const z1Mesh = new THREE.Mesh(z1Geo, z1Mat);
    z1Mesh.position.set(-11.5, 0.18, -6.5);
    z1Mesh.receiveShadow = true;
    z1Mesh.userData = { id: "zone-1", type: "zone" };
    scene.add(z1Mesh);
    zoneMeshes.set("zone-1", z1Mesh);

    // Maize Stalk Rows
    const maizeStalkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.5, 6);
    const maizeLeafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const stalkMesh = new THREE.InstancedMesh(maizeStalkGeo, maizeLeafMat, 240);
    stalkMesh.castShadow = true;
    stalkMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 16; c++) {
        const x = -21 + c * 1.3 + (Math.random() - 0.5) * 0.18;
        const z = -15 + r * 1.2 + (Math.random() - 0.5) * 0.18;
        dummy.position.set(x, 0.9, z);
        dummy.scale.set(1, 0.85 + Math.random() * 0.35, 1);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        stalkMesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    stalkMesh.instanceMatrix.needsUpdate = true;
    scene.add(stalkMesh);

    // Zone 2: Rosecoco Beans (East Plot, 1.1 Acres)
    const z2Geo = new THREE.BoxGeometry(17, 0.35, 15);
    const z2Mat = new THREE.MeshStandardMaterial({
      color: 0x2e421e,
      roughness: 0.8,
    });
    const z2Mesh = new THREE.Mesh(z2Geo, z2Mat);
    z2Mesh.position.set(12.5, 0.18, -8.5);
    z2Mesh.receiveShadow = true;
    z2Mesh.userData = { id: "zone-2", type: "zone" };
    scene.add(z2Mesh);
    zoneMeshes.set("zone-2", z2Mesh);

    // Bean Bushes
    const beanGeo = new THREE.DodecahedronGeometry(0.48, 1);
    const beanMat = new THREE.MeshStandardMaterial({ color: 0x4d7c2b, roughness: 0.65 });
    const beanMesh = new THREE.InstancedMesh(beanGeo, beanMat, 130);
    beanMesh.castShadow = true;
    let bIdx = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 13; c++) {
        const x = 5.5 + c * 1.15 + (Math.random() - 0.5) * 0.2;
        const z = -14 + r * 1.15 + (Math.random() - 0.5) * 0.2;
        dummy.position.set(x, 0.5, z);
        dummy.scale.set(1 + Math.random() * 0.25, 0.8 + Math.random() * 0.3, 1 + Math.random() * 0.25);
        dummy.updateMatrix();
        beanMesh.setMatrixAt(bIdx++, dummy.matrix);
      }
    }
    beanMesh.instanceMatrix.needsUpdate = true;
    scene.add(beanMesh);

    // Zone 3: Avocado Orchard (South Plot, 0.5 Acres)
    const z3Geo = new THREE.BoxGeometry(21, 0.35, 11);
    const z3Mat = new THREE.MeshStandardMaterial({
      color: 0x183020,
      roughness: 0.85,
    });
    const z3Mesh = new THREE.Mesh(z3Geo, z3Mat);
    z3Mesh.position.set(-10.5, 0.18, 11.5);
    z3Mesh.receiveShadow = true;
    z3Mesh.userData = { id: "zone-3", type: "zone" };
    scene.add(z3Mesh);
    zoneMeshes.set("zone-3", z3Mesh);

    // Avocado Trees
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.28, 2.0, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
    const foliageGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 });

    const treePositions = [
      [-18, 12],
      [-13, 12],
      [-8, 12],
      [-3, 12],
      [-18, 8],
      [-13, 8],
      [-8, 8],
      [-3, 8],
    ];

    treePositions.forEach(([tx, tz]) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.0;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const crown = new THREE.Mesh(foliageGeo, foliageMat);
      crown.position.y = 2.4;
      crown.scale.set(1.1, 1.25, 1.1);
      crown.castShadow = true;
      crown.receiveShadow = true;
      treeGroup.add(crown);

      treeGroup.position.set(tx, 0, tz);
      scene.add(treeGroup);
    });

    // 6. INFRASTRUCTURE MODELS
    // Main Farmhouse
    const houseGroup = new THREE.Group();
    const wallsGeo = new THREE.BoxGeometry(3.8, 2.4, 3.2);
    const wallsMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const walls = new THREE.Mesh(wallsGeo, wallsMat);
    walls.position.y = 1.2;
    walls.castShadow = true;
    houseGroup.add(walls);

    const roofGeo = new THREE.ConeGeometry(3.1, 1.6, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);

    houseGroup.position.set(13, 0, 8.5);
    scene.add(houseGroup);

    // 10,000L Blue Roto Water Tank
    const tankGeo = new THREE.CylinderGeometry(1.3, 1.3, 2.6, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(6.5, 1.3, 8.5);
    tank.castShadow = true;
    scene.add(tank);

    // Solar Borehole Array
    const solarGeo = new THREE.BoxGeometry(1.6, 0.1, 2.4);
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.85 });
    const solarPanel = new THREE.Mesh(solarGeo, solarMat);
    solarPanel.position.set(6.5, 1.9, 12);
    solarPanel.rotation.x = 0.45;
    solarPanel.castShadow = true;
    scene.add(solarPanel);

    zoneMeshesRef.current = zoneMeshes;

    // 7. RAYCASTING & INTERACTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([
        z1Mesh,
        z2Mesh,
        z3Mesh,
        houseGroup,
        tank,
      ], true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.id && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj?.userData?.type === "zone") {
          const zone = zones.find((z) => z.id === hitObj?.userData.id);
          if (zone) {
            setSelectedEntity({ type: "zone", data: zone });
            onSelectZone?.(zone);
          }
        }
      }
    };

    container.addEventListener("click", handleClick);

    // 8. ORBIT CONTROLS
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 54, theta: 0.12, phi: 0.92 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraFromSpherical();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      spherical.theta -= deltaX * 0.005;
      spherical.phi = Math.max(0.2, Math.min(1.4, spherical.phi - deltaY * 0.005));
      updateCameraFromSpherical();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(22, Math.min(85, spherical.radius + e.deltaY * 0.04));
      updateCameraFromSpherical();
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [zones, twin, onSelectZone]);

  // Update lighting when timeOfDay changes
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;
    if (timeOfDay === "day") {
      sceneRef.current.background = new THREE.Color(0x060c09);
      dirLightRef.current.color.setHex(0xfff5db);
      dirLightRef.current.intensity = 1.6;
      dirLightRef.current.position.set(30, 45, 25);
      hemiLightRef.current.color.setHex(0xe8fbf0);
      hemiLightRef.current.groundColor.setHex(0x0a1610);
      hemiLightRef.current.intensity = 0.9;
    } else if (timeOfDay === "sunset") {
      sceneRef.current.background = new THREE.Color(0x160c07);
      dirLightRef.current.color.setHex(0xf97316);
      dirLightRef.current.intensity = 1.8;
      dirLightRef.current.position.set(45, 18, -15);
      hemiLightRef.current.color.setHex(0xfda4af);
      hemiLightRef.current.groundColor.setHex(0x271911);
      hemiLightRef.current.intensity = 0.65;
    } else {
      sceneRef.current.background = new THREE.Color(0x020504);
      dirLightRef.current.color.setHex(0x38bdf8);
      dirLightRef.current.intensity = 0.35;
      dirLightRef.current.position.set(-20, 35, 20);
      hemiLightRef.current.color.setHex(0x1e293b);
      hemiLightRef.current.groundColor.setHex(0x020617);
      hemiLightRef.current.intensity = 0.25;
    }
  }, [timeOfDay]);

  // Update zone & ground materials on layer toggle
  useEffect(() => {
    // 1. Zone crops
    zoneMeshesRef.current.forEach((mesh, zoneId) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (activeLayer === "ndvi" || activeLayer === "copernicus") {
        if (zone.ndviScore >= 0.8) mat.color.setHex(0x10b981);
        else if (zone.ndviScore >= 0.7) mat.color.setHex(0x84cc16);
        else mat.color.setHex(0xf59e0b);
      } else if (activeLayer === "moisture") {
        if (zone.soilMoisturePercent > 45) mat.color.setHex(0x0284c7);
        else if (zone.soilMoisturePercent >= 35) mat.color.setHex(0x0d9488);
        else mat.color.setHex(0xb45309);
      } else {
        if (zoneId === "zone-1") mat.color.setHex(0x1d4a27);
        else if (zoneId === "zone-2") mat.color.setHex(0x2e421e);
        else mat.color.setHex(0x183020);
      }
    });

    // 2. Terrain ground texture projection
    if (groundMeshRef.current) {
      const groundMat = groundMeshRef.current.material as THREE.MeshStandardMaterial;
      if (activeLayer === "copernicus") {
        const bboxKey = `${twin.latitude.toFixed(4)},${twin.longitude.toFixed(4)}`;
        if (copernicusTextureRef.current && copernicusBboxKey.current === bboxKey) {
          groundMat.map = copernicusTextureRef.current;
          groundMat.color.setHex(0xffffff);
          groundMat.needsUpdate = true;
        } else {
          copernicusBboxKey.current = bboxKey;
          copernicusTextureRef.current = null;
          fetchCopernicusSentinelImage({
            data: {
              bbox: [
                twin.longitude - 0.025,
                twin.latitude - 0.02,
                twin.longitude + 0.025,
                twin.latitude + 0.02,
              ],
              layer: "TRUE_COLOR",
              width: 512,
              height: 384,
            },
          })
            .then((res) => {
              new THREE.TextureLoader().load(res.dataUrl, (tex) => {
                tex.wrapS = THREE.ClampToEdgeWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                copernicusTextureRef.current = tex;
                if (groundMeshRef.current && activeLayer === "copernicus") {
                  const gMat = groundMeshRef.current.material as THREE.MeshStandardMaterial;
                  gMat.map = tex;
                  gMat.color.setHex(0xffffff);
                  gMat.needsUpdate = true;
                }
              });
            })
            .catch((err) => {
              console.warn("Could not load Copernicus texture for 3D terrain:", err);
            });
        }
      } else {
        groundMat.map = null;
        groundMat.color.setHex(0x122419);
        groundMat.needsUpdate = true;
      }
    }
  }, [activeLayer, zones, twin.latitude, twin.longitude]);

  return (
    <div className="relative flex flex-col lg:flex-row h-full min-h-[540px] w-full border border-border bg-card overflow-hidden">
      <div className="relative flex-1 h-[380px] lg:h-auto min-h-[380px] bg-[#14120e] select-none">
        <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

        <div className="absolute top-0 left-0 right-0 flex flex-wrap items-center justify-between gap-2 pointer-events-none border-b border-border bg-[#16130f]/90">
          <div className="pointer-events-auto flex items-center text-[12px]">
            <button
              type="button"
              onClick={() => setActiveLayer("standard")}
              className={`h-9 px-3 ${
                activeLayer === "standard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              RGB
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("ndvi")}
              className={`h-9 px-3 ${
                activeLayer === "ndvi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              NDVI
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("moisture")}
              className={`h-9 px-3 ${
                activeLayer === "moisture" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wet
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("copernicus")}
              className={`h-9 px-3 ${
                activeLayer === "copernicus" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              S2
            </button>
          </div>

          <div className="pointer-events-auto flex items-center pr-1">
            <button
              type="button"
              onClick={() => setTimeOfDay("day")}
              className={`grid size-8 place-items-center ${timeOfDay === "day" ? "text-primary" : "text-muted-foreground"}`}
              title="Day"
            >
              <Sun className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay("sunset")}
              className={`grid size-8 place-items-center ${timeOfDay === "sunset" ? "text-earth" : "text-muted-foreground"}`}
              title="Dusk"
            >
              <Activity className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay("night")}
              className={`grid size-8 place-items-center ${timeOfDay === "night" ? "text-sky" : "text-muted-foreground"}`}
              title="Night"
            >
              <Moon className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between pointer-events-none text-[11px] border-t border-border bg-[#16130f]/85 px-3 py-1.5">
          <span className="num text-muted-foreground">
            {twin.latitude}° {twin.longitude}° · {twin.elevationMeters}m
          </span>
          <span className="hidden sm:inline text-muted-foreground">Drag · scroll · click</span>
        </div>
      </div>

      <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Plot</span>
          <span className="num text-[12px]">{twin.totalAcres} ac</span>
        </div>

        {selectedEntity?.type === "zone" && (
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {(selectedEntity.data as CropZone).name}
                </span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                  {(selectedEntity.data as CropZone).acres} ac
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {(selectedEntity.data as CropZone).cropName} ({(selectedEntity.data as CropZone).variety})
              </p>
            </div>

            {/* Health Score Pill */}
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Health Rating</span>
                <strong className="text-primary font-bold">
                  {(selectedEntity.data as CropZone).healthScore}%
                </strong>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(selectedEntity.data as CropZone).healthScore}%` }}
                />
              </div>
            </div>

            {/* 4 Sensor Micro Tiles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">NDVI</span>
                <p className="text-sm font-bold text-foreground">{(selectedEntity.data as CropZone).ndviScore}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Moisture</span>
                <p className="text-sm font-bold text-foreground">{(selectedEntity.data as CropZone).soilMoisturePercent}%</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Soil Temp</span>
                <p className="text-sm font-bold text-foreground">{(selectedEntity.data as CropZone).soilTemperatureC}°C</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Nitrogen</span>
                <p className="text-sm font-bold text-foreground">{(selectedEntity.data as CropZone).nitrogenStatus}</p>
              </div>
            </div>

            {/* Quick Switcher for Plots */}
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Select Plot</span>
              <div className="space-y-1">
                {zones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => {
                      setSelectedEntity({ type: "zone", data: z });
                      onSelectZone?.(z);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors ${
                      (selectedEntity.data as CropZone).id === z.id
                        ? "border border-primary/40 bg-primary/10 font-bold text-foreground"
                        : "border border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{z.name.split(" ")[0]} ({z.cropName})</span>
                    <span className="text-[11px] font-bold text-primary">{z.healthScore}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
