"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";

export type BrandShape = "icosahedro" | "nucleo" | "monograma" | "estrutura" | "laco";

type BrandObjectProps = {
  onCharged: () => void;
  shape?: BrandShape;
};

const BASE_ROTATION_SPEED = 0.003;
const CHARGE_ROTATION_SPEED = 0.05;
const HOLD_TO_CHARGE_MS = 900;

// Traço em bloco da letra "Z" — vira o monograma da marca quando extrudado.
// Coordenadas desenhadas à mão, centralizadas perto da origem.
function createZShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const pts: [number, number][] = [
    [-1.2, 1.6],
    [1.2, 1.6],
    [1.2, 0.9],
    [-0.35, 0.9],
    [1.2, -0.9],
    [1.2, -1.6],
    [-1.2, -1.6],
    [-1.2, -0.9],
    [0.35, -0.9],
    [-1.2, 0.9],
  ];
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  return shape;
}

// Estúdio procedural pra gerar reflexo de verdade no vidro — não é uma
// imagem/HDR externa, é geometria simples (só planos claros/escuros em
// posições diferentes ao redor). Um ambiente uniforme (ex.: RoomEnvironment
// do próprio three.js) dá reflexo "chapado"; com contraste entre painéis
// claros e escuros em ângulos distintos, cada faceta reflete algo diferente
// conforme gira — isso que lê como "vidro" de verdade, não a cor em si.
function buildStudioEnvironment(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const panel = (
    width: number,
    height: number,
    intensity: number,
    x: number,
    y: number,
    z: number,
    rotY: number,
    rotX = 0,
  ) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity) });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, rotY, 0);
    scene.add(mesh);
  };

  // painel grande e bem claro acima — luz principal, tipo softbox de estúdio
  panel(6, 6, 3.2, 0, 5, 0, 0, Math.PI / 2);
  // faixa fina e bem brilhante de um lado — cria a "risca" de brilho nítida
  panel(0.6, 8, 6, -4, 0, 2, Math.PI / 3);
  // painel médio do outro lado, mais fraco — contraste, não simétrico
  panel(3, 5, 0.9, 4, -1, -2, -Math.PI / 4);
  // atrás, escuro quase total — pro lado que não pega luz ficar bem escuro
  panel(8, 8, 0.05, 0, 0, -6, 0);
  // chão levemente claro — reflexo sutil por baixo
  panel(8, 8, 0.4, 0, -5, 0, 0, -Math.PI / 2);

  return scene;
}

// Cada forma é intencionalmente diferente na personalidade — nenhuma tenta
// recriar a peça de nenhum outro site, só exploram a identidade
// "monocromática de propósito" da marca em direções distintas.
function buildGeometry(shape: BrandShape): THREE.BufferGeometry {
  switch (shape) {
    case "nucleo":
      // esfera geodésica mais densa — "núcleo" técnico, compacto.
      return new THREE.IcosahedronGeometry(2, 1);
    case "monograma": {
      // bisel mais generoso e com mais segmentos — facetas curvas de
      // verdade nas bordas (não só um chanfro reto) pra pegar luz de um
      // jeito diferente em cada ângulo, em vez de uma borda quase lisa.
      const g = new THREE.ExtrudeGeometry(createZShape(), {
        depth: 0.7,
        bevelEnabled: true,
        bevelThickness: 0.16,
        bevelSize: 0.14,
        bevelSegments: 6,
        curveSegments: 12,
      });
      g.center();
      return g;
    }
    case "estrutura":
      // dodecaedro — usado só pra gerar as arestas (ver wireframe abaixo).
      return new THREE.DodecahedronGeometry(2.1, 0);
    case "laco":
      return new THREE.TorusKnotGeometry(1.3, 0.42, 120, 18, 2, 3);
    case "icosahedro":
    default:
      return new THREE.IcosahedronGeometry(2, 0);
  }
}

export function BrandObject({ onCharged, shape = "icosahedro" }: BrandObjectProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onChargedRef = useRef(onCharged);

  useEffect(() => {
    onChargedRef.current = onCharged;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(buildStudioEnvironment(), 0, 0.1, 100).texture;
    scene.environment = envTexture;

    const geometry = buildGeometry(shape);
    const isWireframeOnly = shape === "estrutura";

    // "Vidro preto" — quase opaco (transmission baixa) mas bem liso
    // (roughness baixo) e com um verniz por cima (clearcoat), pra pegar
    // reflexo forte do ambiente em vez do acabamento fosco de antes. ior
    // mais alto que o padrão (1.5) acentua a refração nas bordas.
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1c1c1c,
      flatShading: true,
      roughness: 0.06,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      reflectivity: 1,
      ior: 1.9,
      transmission: 0.15,
      thickness: 1.4,
      envMapIntensity: 2.2,
      transparent: isWireframeOnly,
      opacity: isWireframeOnly ? 0 : 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const edges = new THREE.EdgesGeometry(geometry, isWireframeOnly ? 1 : 15);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        // vidro preto precisa de aresta clara pra marcar as facetas — a
        // aresta escura de antes sumia contra o material agora escuro.
        color: isWireframeOnly ? 0xf2f2ef : 0xffffff,
        transparent: true,
        opacity: isWireframeOnly ? 0.85 : 0.22,
      }),
    );
    mesh.add(line);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(-5, -3, -4);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    let raf = 0;
    const pointer = { x: 0, y: 0 };
    let holding = false;
    let holdStart = 0;
    let chargeTriggered = false;
    let rotationSpeed = BASE_ROTATION_SPEED;

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const tick = (now: number) => {
      if (holding && !chargeTriggered) {
        const elapsed = now - holdStart;
        const t = Math.min(1, elapsed / HOLD_TO_CHARGE_MS);
        rotationSpeed = BASE_ROTATION_SPEED + t * (CHARGE_ROTATION_SPEED - BASE_ROTATION_SPEED);
        const scale = 1 + t * 0.12;
        mesh.scale.setScalar(scale);
        if (t >= 1) {
          chargeTriggered = true;
          onChargedRef.current();
        }
      } else if (!holding) {
        rotationSpeed += (BASE_ROTATION_SPEED - rotationSpeed) * 0.08;
        mesh.scale.setScalar(1 + (mesh.scale.x - 1) * 0.85);
      }

      mesh.rotation.y += rotationSpeed;
      mesh.rotation.x += rotationSpeed * 0.4;
      mesh.rotation.z += (pointer.x * 0.25 - mesh.rotation.z) * 0.04;
      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.6 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const handleDown = () => {
      holding = true;
      chargeTriggered = false;
      holdStart = performance.now();
    };
    const handleUp = () => {
      holding = false;
    };

    if (!prefersReducedMotion()) {
      raf = requestAnimationFrame(tick);
    } else {
      renderer.render(scene, camera);
    }

    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      geometry.dispose();
      edges.dispose();
      material.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [shape]);

  return <div ref={mountRef} className="brand-object" />;
}
