import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedBox: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const elapsedTime = clock.elapsedTime;
      
      // Trayectoria senoidal en X y circular en Y-Z
      meshRef.current.position.x = Math.sin(elapsedTime * 0.8) * 3;
      meshRef.current.position.y = Math.cos(elapsedTime * 0.6) * 1.5;
      meshRef.current.position.z = Math.sin(elapsedTime * 0.6) * 1.5;
      
      // Rotación sobre múltiples ejes con velocidades diferentes
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.z += 0.008;
      
      // Escalado suave usando función temporal senoidal
      const scaleValue = 0.8 + Math.sin(elapsedTime * 2) * 0.3;
      meshRef.current.scale.setScalar(scaleValue);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#4a90e2" 
        roughness={0.3} 
        metalness={0.1}
      />
    </mesh>
  );
};

// Componente adicional para demostrar múltiples objetos animados
const OrbitingSphere: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (sphereRef.current) {
      const time = clock.elapsedTime;
      
      // Órbita circular alrededor del centro
      const radius = 4;
      sphereRef.current.position.x = Math.cos(time * 0.5) * radius;
      sphereRef.current.position.z = Math.sin(time * 0.5) * radius;
      sphereRef.current.position.y = Math.sin(time * 0.3) * 0.5;
      
      // Rotación propia
      sphereRef.current.rotation.y += 0.02;
    }
  });
  
  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial 
        color="#e74c3c" 
        emissive="#330000"
        roughness={0.2}
      />
    </mesh>
  );
};

const CanvasScene: React.FC = () => {
  return (
    <>
      {/* Iluminación mejorada */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 8, 3]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, -3, 3]} intensity={0.8} color="#ff6b6b" />
      
      {/* Objetos animados */}
      <AnimatedBox />
      <OrbitingSphere />
      
      {/* Plano de referencia */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.8} />
      </mesh>
      
      {/* OrbitControls para navegación */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
};export default CanvasScene;