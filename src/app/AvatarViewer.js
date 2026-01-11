'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

function Model({ url, isSpeaking }) {
  // 標準のuseGLTFを使用（これでマウス操作の競合が直ります）
  const { scene } = useGLTF(url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });
  
  const [vrm, setVrm] = useState(null);
  const speakingRef = useRef(isSpeaking);

  // しゃべってる状態を常に最新に保つ
  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (scene) {
      const vrmInstance = scene.userData.vrm;
      if (vrmInstance) {
        setVrm(vrmInstance);
        
        // 初期ポーズ
        VRMUtils.removeUnnecessaryVertices(scene);
        VRMUtils.removeUnnecessaryJoints(scene);
        vrmInstance.lookAt.target = { x: 0, y: 1.4, z: 5.0 }; 
        const lArm = vrmInstance.humanoid.getNormalizedBoneNode('leftUpperArm');
        const rArm = vrmInstance.humanoid.getNormalizedBoneNode('rightUpperArm');
        if(lArm) lArm.rotation.z = Math.PI / 2.5; 
        if(rArm) rArm.rotation.z = -Math.PI / 2.5;
      }
    }
  }, [scene]);

  useFrame((state, delta) => {
    if (vrm) {
      const t = state.clock.elapsedTime;
      const currentSpeaking = speakingRef.current;
      
      // 1. 呼吸
      const chest = vrm.humanoid.getNormalizedBoneNode('chest');
      if (chest) {
         chest.rotation.x = Math.sin(t) * 0.05; 
         chest.position.y = Math.sin(t) * 0.005;
      }

      // 2. 表情・口パク
      if (vrm.expressionManager) {
        const blinkValue = Math.sin(t * 2) > 0.95 ? 1 : 0;
        vrm.expressionManager.setValue('blink', blinkValue);

        const targetOpen = currentSpeaking ? (Math.sin(t * 20) * 0.5 + 0.5) : 0;
        const currentOpen = vrm.expressionManager.getValue('aa') || 0;
        vrm.expressionManager.setValue('aa', currentOpen + (targetOpen - currentOpen) * 0.8);
      }

      vrm.update(delta);
    }
  });

  return <primitive object={scene} position={[0, 0, 0]} />;
}

export default function AvatarViewer({ voiceType, isSpeaking }) {
  // キャッシュ対策：URLの末尾に時刻をつけて強制的に「新しいファイル」として読み込ませる
  const vrmUrl = useMemo(() => {
    const baseUrl = voiceType === 'male' ? '/male.vrm' : '/female.vrm';
    return `${baseUrl}?t=${Date.now()}`;
  }, [voiceType]);

  return (
    <div className="w-full h-[420px] bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-300 shadow-md">
      <Canvas camera={{ position: [0, 1.4, 1.6], fov: 24 }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[-1, 1, 1]} intensity={1.5} />
        
        {/* 操作機能：makeDefaultをつけて優先度を上げる */}
        <OrbitControls makeDefault target={[0, 1.35, 0]} enablePan={false} />
        
        {/* Modelを表示 */}
        <Model key={vrmUrl} url={vrmUrl} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}