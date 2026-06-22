"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Float } from "@react-three/drei";
import * as THREE from "three";

const PHOTO_PATHS = [
  "/abishek_insta/007_DUV3jLtk-KY.jpg",
  "/abishek_insta/005_DWOW12mk6fz.jpg",
  "/abishek_insta/012_DS4oJGMDHZS.jpg",
  "/abishek_insta/016_DOVi391k7UG.jpg",
  "/abishek_insta/019_DLev6B6TS03.jpg",
  "/abishek_insta/015_DOse3DZE5Hw.jpg",
];

interface PhotoPlaneProps {
  src: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  floatSpeed?: number;
  floatIntensity?: number;
}

function PhotoPlane({
  src,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  floatSpeed = 1,
  floatIntensity = 0.5,
}: PhotoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(src);

  // Calculate aspect ratio from the texture
  const aspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img && img.width && img.height) {
      return img.width / img.height;
    }
    return 4 / 3;
  }, [texture]);

  const baseWidth = 2.2 * scale;
  const baseHeight = baseWidth / aspect;

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.3}
      floatIntensity={floatIntensity}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
      >
        <planeGeometry args={[baseWidth, baseHeight]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

export function FloatingPhotosScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth mouse following
    targetRotation.current.y = pointer.x * 0.15;
    targetRotation.current.x = -pointer.y * 0.1;

    groupRef.current.rotation.y +=
      (targetRotation.current.y - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x +=
      (targetRotation.current.x - groupRef.current.rotation.x) * 0.05;
  });

  // Photo positions arranged in a pleasing 3D layout
  const photos = useMemo(
    () => [
      { src: PHOTO_PATHS[0], position: [-2.8, 1.2, -1] as [number, number, number], rotation: [0, 0.15, -0.05] as [number, number, number], scale: 0.9, floatSpeed: 1.2, floatIntensity: 0.4 },
      { src: PHOTO_PATHS[1], position: [1.5, 1.6, -2] as [number, number, number], rotation: [0, -0.1, 0.08] as [number, number, number], scale: 0.8, floatSpeed: 0.8, floatIntensity: 0.6 },
      { src: PHOTO_PATHS[2], position: [-1.2, -0.5, 0.5] as [number, number, number], rotation: [0.05, 0.2, 0.03] as [number, number, number], scale: 1.1, floatSpeed: 1.0, floatIntensity: 0.5 },
      { src: PHOTO_PATHS[3], position: [2.8, -0.3, -0.5] as [number, number, number], rotation: [0, -0.2, -0.06] as [number, number, number], scale: 0.85, floatSpeed: 1.5, floatIntensity: 0.3 },
      { src: PHOTO_PATHS[4], position: [0.3, -1.8, -1.5] as [number, number, number], rotation: [0.08, 0.05, 0.1] as [number, number, number], scale: 0.75, floatSpeed: 0.9, floatIntensity: 0.7 },
      { src: PHOTO_PATHS[5], position: [-3.2, -1.5, -2] as [number, number, number], rotation: [0, 0.12, -0.04] as [number, number, number], scale: 0.7, floatSpeed: 1.1, floatIntensity: 0.45 },
    ],
    []
  );

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[-3, 2, 3]} intensity={0.3} color="#E8632B" />
      <pointLight position={[3, -2, 2]} intensity={0.2} color="#3B5DAA" />

      {photos.map((photo, i) => (
        <PhotoPlane
          key={i}
          src={photo.src}
          position={photo.position}
          rotation={photo.rotation}
          scale={photo.scale}
          floatSpeed={photo.floatSpeed}
          floatIntensity={photo.floatIntensity}
        />
      ))}
    </group>
  );
}
