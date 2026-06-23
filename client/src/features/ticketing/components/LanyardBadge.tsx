'use client';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

export interface BadgeProps {
  ticket_number: string;
  full_name: string;
  pass_name: string;
  role: string;
  organization: string;
  badge_color?: string;
  qr_token?: string;
}

// --------------------------------------------------------
// 1. GENERATE A MASSIVE, PIXEL-PERFECT TICKET TEXTURE
// --------------------------------------------------------
function createBadgeTexture(props: BadgeProps): THREE.CanvasTexture {
  // Ultra high resolution for "super clear" text
  const w = 2048;
  const h = 2880;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const color = props.badge_color || '#6B7280';

  // Jet Black Background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, w, h);

  // Subtle noise grain
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const a = Math.random() * 0.05;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Top accent bar
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, color);
  grad.addColorStop(1, '#FF9900');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 48);

  // Lanyard hole (simulated visually)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w / 2, 140, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Event branding
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '600 48px monospace';
  ctx.fillText('AWS STUDENT COMMUNITY DAY', 120, 320);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '48px monospace';
  ctx.fillText('DHULE 2026', 120, 390);

  // Pass type badge
  const passText = props.pass_name.toUpperCase();
  ctx.font = 'bold 56px monospace';
  const passW = ctx.measureText(passText).width + 80;
  ctx.fillStyle = color;
  const badgeX = w - passW - 120;
  ctx.beginPath();
  ctx.roundRect(badgeX, 300, passW, 110, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(passText, badgeX + 40, 375);

  // Divider
  ctx.setLineDash([12, 12]);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(120, 500);
  ctx.lineTo(w - 120, 500);
  ctx.stroke();
  ctx.setLineDash([]);

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 136px sans-serif';
  const name = props.full_name.toUpperCase();
  const maxNameW = w - 240;
  const words = name.split(' ');
  let line = '';
  let y = 680;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxNameW && line) {
      ctx.fillText(line.trim(), 120, y);
      line = word + ' ';
      y += 150;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), 120, y);

  // Organization
  if (props.organization) {
    y += 100;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '56px monospace';
    ctx.fillText(props.organization, 120, y);
  }

  // Role
  if (props.role) {
    y += 80;
    ctx.fillStyle = '#FF9900';
    ctx.font = 'bold 56px monospace';
    ctx.fillText(props.role.toUpperCase(), 120, y);
  }

  // Large watermark ticket number
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.font = 'bold 340px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(props.ticket_number || '', w / 2, h / 2 + 250);
  ctx.restore();

  // Bottom divider
  ctx.setLineDash([12, 12]);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(120, h - 500);
  ctx.lineTo(w - 120, h - 500);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ticket number label
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TICKET', w / 2, h - 380);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 100px monospace';
  ctx.fillText(props.ticket_number || 'PENDING', w / 2, h - 260);

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '48px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('14 August 2026', 120, h - 100);
  ctx.fillText("SVKM's IoT, Dhule", 120, h - 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('Show QR at gate', w - 120, h - 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false; // Prevents blurring
  texture.anisotropy = 16;
  return texture;
}

// --------------------------------------------------------
// 2. PROCEDURAL LANYARD BAND TEXTURE
// --------------------------------------------------------
function createBandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 128, 1024);

  // Weave pattern
  for (let y = 0; y < 1024; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, y, 128, 2);
  }

  // AWS Orange stripe
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, 'rgba(255,153,0,0)');
  grad.addColorStop(0.35, 'rgba(255,153,0,0.2)');
  grad.addColorStop(0.5, 'rgba(255,153,0,0.4)');
  grad.addColorStop(0.65, 'rgba(255,153,0,0.2)');
  grad.addColorStop(1, 'rgba(255,153,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

// --------------------------------------------------------
// 3. QR CODE TEXTURE MESH
// --------------------------------------------------------
function QRCodeMesh({ token }: { token: string }) {
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(token)}&size=300&margin=1`;
  const texture = useTexture(qrUrl);
  return (
    <mesh position={[0, -0.05, 0.006]}>
      <planeGeometry args={[0.40, 0.40]} />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
}

// --------------------------------------------------------
// 4. BAND PHYSICS & RENDERING
// --------------------------------------------------------
function Band({ badgeProps }: { badgeProps: BadgeProps }) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { width, height } = useThree((state) => state.size);
  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    (c as any).curveType = 'chordal';
    return c;
  });

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  const badgeTexture = useMemo(() => createBadgeTexture(badgeProps), [badgeProps]);
  const bandTexture = useMemo(() => createBandTexture(), []);

  // Make the lanyard rope shorter so the card sits higher
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.7]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.7]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.7]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.2, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current) return;
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (10 + clampedDistance * 40));
      });

      if (!j3.current || !card.current) return;

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      (band.current as any)?.geometry?.setPoints?.(curve.getPoints(32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation() as any);
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  // Aspect ratio is matching 2048x2880 exactly
  const cardW = 0.71;
  const cardH = 1.0;

  return (
    <>
      <group position={[0, 5, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.35, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.7, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.05, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        
        <RigidBody
          position={[1.4, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          {/* MUCH BIGGER COLLIDER for bigger card */}
          <CuboidCollider args={[1.5, 2.0, 0.05]} />
          
          <group
            scale={3.5} // <--- HUGE CARD SCALE
            position={[0, -1.6, -0.05]} // Anchor offset adjusted for scale
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current!.translation())));
            }}
          >
            {/* Front Card Face - Flat procedural mesh, PERFECT UV mapping */}
            <mesh position={[0, 0, 0.005]}>
              <planeGeometry args={[cardW, cardH]} />
              <meshPhysicalMaterial
                map={badgeTexture}
                clearcoat={0.1} // Reduced from 0.3
                clearcoatRoughness={0.5} // Increased from 0.2
                roughness={0.85} // Increased from 0.7
                metalness={0.05} // Reduced from 0.1
                color="#ffffff"
              />
            </mesh>

            {/* Pure WebGL QR Code Overlay (Fixes clipping issues) */}
            {badgeProps.qr_token && (
              <Suspense fallback={null}>
                <QRCodeMesh token={badgeProps.qr_token} />
              </Suspense>
            )}

            {/* Back Card Face - Black */}
            <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[cardW, cardH]} />
              <meshPhysicalMaterial
                color="#050505"
                clearcoat={0.1}
                clearcoatRoughness={0.5}
                roughness={0.85}
                metalness={0.05}
              />
            </mesh>

            {/* Edge thickness */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[cardW, cardH, 0.009]} />
              <meshStandardMaterial color="#1a1a1a" roughness={1} />
            </mesh>

            {/* Premium Metal Clip */}
            <mesh position={[0, cardH / 2 + 0.06, 0]}>
              <boxGeometry args={[0.15, 0.15, 0.03]} />
              <meshStandardMaterial color="#888888" metalness={1} roughness={0.15} />
            </mesh>
            <mesh position={[0, cardH / 2 + 0.14, 0.01]}>
              <torusGeometry args={[0.04, 0.008, 8, 24]} />
              <meshStandardMaterial color="#777777" metalness={1} roughness={0.15} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        {/* @ts-ignore */}
        <meshLineGeometry />
        {/* @ts-ignore */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={bandTexture}
          repeat={[-3, 1]}
          lineWidth={1.5}
        />
      </mesh>
    </>
  );
}

// --------------------------------------------------------
// 4. MAIN SCENE SETUP
// --------------------------------------------------------
export function LanyardBadge(props: BadgeProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        touchAction: 'none',
        background: '#020202', // Very dark background to pop the card
        overflow: 'hidden',
      }}
    >
      {/* Cool dotted grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 
        CRITICAL: dpr={[1, 2]} tells the 3D renderer to scale up the canvas 
        to match high-res displays, fixing all blurriness!
      */}
      <Canvas
        camera={{ position: [0, 0, 13], fov: 25 }}
        style={{ position: 'relative', zIndex: 1 }}
        dpr={[1, 2]} 
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <Suspense fallback={null}>
          <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band badgeProps={props} />
          </Physics>

          {/* Lighting setup for the clearcoat to pop beautifully */}
          <Environment blur={0.75}>
            <Lightformer intensity={1} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={2} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={2} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={8} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
          </Environment>
        </Suspense>
      </Canvas>

      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          Drag the badge to interact
        </p>
      </div>
    </div>
  );
}