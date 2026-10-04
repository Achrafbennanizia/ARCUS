"use client";

import * as THREE from "three";

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function finishTexture(
  tex: THREE.Texture,
  repeat: [number, number] = [1, 1],
  srgb = false,
) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Horizontal-brush anodized aluminum albedo. */
export function brushedShellMap(hex: string) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y++) {
    const a = 0.025 + hash(y * 1.7) * 0.08;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(0, y, size, 1);
    ctx.fillStyle = `rgba(0,0,0,${a * 0.55})`;
    ctx.fillRect(hash(y * 3.1) * 8, y, size * 0.7, 1);
  }
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + hash(i) * 0.05})`;
    ctx.fillRect(hash(i * 2.2) * size, hash(i * 5.7) * size, 1 + hash(i) * 2, 1);
  }

  return finishTexture(new THREE.CanvasTexture(canvas), [1.2, 2.8], true);
}

export function brushedRoughnessMap() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = Math.floor((0.32 + hash(x * 0.7 + y * 12.3) * 0.28) * 255);
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  return finishTexture(tex, [1.2, 2.8]);
}
