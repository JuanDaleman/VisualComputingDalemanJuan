import React from 'react';
import { Canvas } from '@react-three/fiber';
import CanvasScene from './components/CanvasScene';

const App: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ 
        position: [6, 4, 8], 
        fov: 50,
        near: 0.1,
        far: 100
      }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}
    >
      <CanvasScene />
    </Canvas>
  );
};

export default App;