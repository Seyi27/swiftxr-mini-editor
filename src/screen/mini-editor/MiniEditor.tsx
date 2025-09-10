import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import "./MiniEditor.css";

interface HotspotProps {
  position: [number, number, number];
  label: string;
}

interface ModelProps {
  url: string;
  hotspots: HotspotProps[];
  onAddHotspot: (point: THREE.Vector3) => void;
}

const Model = ({ url, hotspots, onAddHotspot }: ModelProps) => {
  const { scene } = useGLTF(url);

  return (
    <primitive
      object={scene}
      onClick={(e: any) => {
        e.stopPropagation();
        onAddHotspot(e.point);
      }}
    >
      {hotspots.map((hotspot, idx) => (
        <Html key={idx} position={hotspot.position} className="hotspot-label">
          {hotspot.label}
        </Html>
      ))}
    </primitive>
  );
};

const MiniEditor = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<HotspotProps[]>([]);
  const [label, setLabel] = useState<string>("");

  /* handle uploading a .glb file */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  };

  /* add a hotspot at the clicked point of the model */
  const handleAddHotspot = (point: THREE.Vector3) => {
    if (!label) return;
    setHotspots([
      ...hotspots,
      { position: point.toArray() as [number, number, number], label },
    ]);
    setLabel("");
  };

  /* activate hotspot mode on submit */
  const handleSubmitLabel = () => {
    if (!label.trim() || !modelUrl) return;

    // Place hotspot at model origin (0,0,0)
    const newHotspot: HotspotProps = {
      position: [0, 0, 0],
      label,
    };

    setHotspots((prev) => [...prev, newHotspot]);
    setLabel("");
  };

  return (
    <div className="editor-container">
      {/* Controls */}
      <div className="editor-controls">
        <input type="file" accept=".glb" onChange={handleFileUpload} />
        <input
          type="text"
          placeholder="Enter hotspot label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="hotspot-input"
        />
        <button onClick={handleSubmitLabel} className="submit-hotspot">Submit Label</button>
      </div>

      {/* 3D Canvas */}
      <div className="editor-canvas">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls enablePan enableRotate enableZoom />
          {modelUrl && (
            <Model
              url={modelUrl}
              hotspots={hotspots}
              onAddHotspot={handleAddHotspot}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
};

export default MiniEditor;
