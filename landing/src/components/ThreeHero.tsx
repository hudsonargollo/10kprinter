import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#d64520";

function Globe() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={group} position={[0, -0.6, -2]}>
      <mesh>
        <icosahedronGeometry args={[2.1, 2]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[0.4, 0.6, 0]}>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

/** Small glowing markers that fade in/out on the globe's surface, evoking businesses being found. */
function DiscoveryPoints() {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const arr: { position: [number, number, number]; phase: number; speed: number }[] = [];
    for (let i = 0; i < 34; i++) {
      const phi = Math.acos(-1 + (2 * i) / 34);
      const theta = Math.sqrt(34 * Math.PI) * phi;
      const r = 2.15;
      arr.push({
        position: [
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi),
        ],
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.08;
    group.current.children.forEach((child, i) => {
      const p = points[i];
      const s = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * p.speed + p.phase);
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + s * 0.45;
      const scale = 0.6 + s * 0.7;
      mesh.scale.setScalar(scale);
    });
  });

  return (
    <group ref={group} position={[0, -0.6, -2]}>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export function ThreeHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(214,69,32,0.22), transparent 55%), #0a0a0a",
        }}
      />
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]} className="absolute inset-0">
        <Globe />
        <DiscoveryPoints />
      </Canvas>
    </div>
  );
}
