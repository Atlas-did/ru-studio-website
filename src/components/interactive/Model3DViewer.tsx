/**
 * Model3DViewer — 3D模型交互查看器
 * 使用 @react-three/fiber + drei 加载 GLB/GLTF 模型
 * 支持自动旋转 + 鼠标拖拽旋转 + 滚轮缩放
 */
import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, ContactShadows } from '@react-three/drei';
import type * as THREE from 'three';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

interface Model3DViewerProps {
  modelUrl: string;
  className?: string;
  height?: string;
  autoRotate?: boolean;
  /** Background color (hex) */
  bgColor?: string;
}

export default function Model3DViewer({
  modelUrl,
  className = '',
  height = '500px',
  autoRotate = true,
  bgColor = '#0A0A0A',
}: Model3DViewerProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height, backgroundColor: bgColor }}
      data-cursor={isDragging ? 'drag' : 'default'}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: bgColor }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={0.5}
            intensity={1}
            castShadow
          />
          <Model url={modelUrl} />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
          />
          <OrbitControls
            enableZoom
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            minDistance={2}
            maxDistance={10}
            onStart={() => setIsDragging(true)}
            onEnd={() => setIsDragging(false)}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>

      {/* Hint text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-caption-s text-white/30 font-sans tracking-overline pointer-events-none">
        拖拽旋转 · 滚轮缩放
      </div>
    </div>
  );
}
