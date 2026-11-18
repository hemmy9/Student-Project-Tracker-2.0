import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useTheme } from '../../context/ThemeContext';

const SOFTWARE_RENDERER_REGEX =
  /SwiftShader|llvmpipe|softpipe|Software|Basic Render|Microsoft Basic/i;

/**
 * Probes WebGL2 / WebGL support and inspects unmasked renderer strings to detect
 * software rasterizers (e.g., SwiftShader / llvmpipe). Immediately releases the
 * temporary probe context so GPU slots are never leaked.
 */
export function detectWebGLCapability() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { supported: false, isWebGL2: false, isSoftware: false, rendererName: 'ssr' };
  }

  let canvas;
  let gl = null;
  let isWebGL2 = false;

  try {
    canvas = document.createElement('canvas');
    const attrs = { alpha: true, antialias: true, powerPreference: 'high-performance' };
    gl = canvas.getContext('webgl2', attrs);
    if (gl) {
      isWebGL2 = true;
    } else {
      gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    }

    if (!gl) {
      return { supported: false, isWebGL2: false, isSoftware: false, rendererName: 'none' };
    }

    let rendererName = '';
    const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugExt) {
      rendererName = String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || '');
    }
    if (!rendererName) {
      rendererName = String(gl.getParameter(gl.RENDERER) || '');
    }

    const isSoftware = SOFTWARE_RENDERER_REGEX.test(rendererName);
    return {
      supported: true,
      isWebGL2,
      isSoftware,
      rendererName: rendererName || 'WebGL',
    };
  } catch {
    return { supported: false, isWebGL2: false, isSoftware: false, rendererName: 'error' };
  } finally {
    if (gl) {
      const loseExt = gl.getExtension('WEBGL_lose_context');
      loseExt?.loseContext();
    }
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

export function StaticAcademicShowcase({ reason = 'static' }) {
  const { isDark } = useTheme();

  return (
    <div
      className="relative flex h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      role="img"
      aria-label="Grace Polytechnic three-portal academic supervision architecture illustration"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 68% 34%, rgba(37, 99, 235, 0.22), transparent 55%), radial-gradient(circle at 28% 72%, rgba(20, 184, 166, 0.16), transparent 52%)'
            : 'radial-gradient(circle at 68% 34%, rgba(37, 99, 235, 0.12), transparent 55%), radial-gradient(circle at 28% 72%, rgba(13, 148, 136, 0.10), transparent 52%)',
        }}
      />

      <div className="relative flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <span>GRACE POLYTECHNIC · SUPERVISION ENGINE</span>
        <span className="tabular-nums">
          {reason === 'reduced-motion' ? 'STATIC VIEW' : '3-PORTAL CORE'}
        </span>
      </div>

      <div className="relative my-auto flex items-center justify-center py-4">
        <svg
          viewBox="0 0 320 220"
          className="h-48 w-full max-w-[320px] sm:h-56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <ellipse
            cx="160"
            cy="110"
            rx="118"
            ry="44"
            transform="rotate(-14 160 110)"
            stroke="#3B82F6"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <ellipse
            cx="160"
            cy="110"
            rx="104"
            ry="38"
            transform="rotate(24 160 110)"
            stroke="#14B8A6"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <ellipse
            cx="160"
            cy="110"
            rx="84"
            ry="32"
            transform="rotate(64 160 110)"
            stroke="#8B5CF6"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />

          <polygon
            points="160,54 206,82 206,138 160,166 114,138 114,82"
            fill={isDark ? '#16223B' : '#EFF6FF'}
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <polygon
            points="160,72 190,90 190,130 160,148 130,130 130,90"
            fill={isDark ? '#1E3A8A' : '#DBEAFE'}
            stroke="#60A5FA"
            strokeWidth="1.4"
          />

          <circle cx="268" cy="84" r="9" fill="#3B82F6" />
          <circle cx="72" cy="70" r="8" fill="#14B8A6" />
          <circle cx="196" cy="184" r="8" fill="#8B5CF6" />
          <circle cx="160" cy="110" r="10" fill="#F8FAFC" stroke="#2563EB" strokeWidth="3" />
        </svg>
      </div>

      <div className="relative grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 text-[11px]">
        <div>
          <p className="font-mono font-semibold text-[#3B82F6]">STUDENT</p>
          <p className="text-[var(--text-muted)] truncate">Milestones &amp; drafts</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-[#14B8A6]">SUPERVISOR</p>
          <p className="text-[var(--text-muted)] truncate">Reviews &amp; office hours</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-[#8B5CF6]">ADMIN</p>
          <p className="text-[var(--text-muted)] truncate">Departments &amp; approvals</p>
        </div>
      </div>
    </div>
  );
}

export default function Academic3DScene() {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const themeRef = useRef(isDark);
  themeRef.current = isDark;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [fallbackReason, setFallbackReason] = useState(null);
  const sceneHooksRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  // Update lighting & material palette smoothly when theme toggles
  useEffect(() => {
    const hooks = sceneHooksRef.current;
    if (!hooks) return;
    hooks.applyTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setFallbackReason('reduced-motion');
      return undefined;
    }

    const container = containerRef.current;
    if (!container) return undefined;

    const capability = detectWebGLCapability();
    if (!capability.supported) {
      setFallbackReason('no-webgl');
      return undefined;
    }

    setFallbackReason(null);

    let renderer;
    let pmremGenerator = null;
    let envRenderTarget = null;
    let roomEnv = null;
    let rafId = 0;
    let timeoutId = 0;
    let disposed = false;
    let isVisible = true;
    let isTabHidden = typeof document !== 'undefined' ? document.hidden : false;

    const scene = new THREE.Scene();

    const width = Math.max(container.clientWidth || 420, 260);
    const height = Math.max(container.clientHeight || 380, 280);
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 40);
    camera.position.set(0, 0.35, 6.2);

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !capability.isSoftware,
        alpha: true,
        powerPreference: capability.isSoftware ? 'low-power' : 'high-performance',
      });
    } catch {
      setFallbackReason('no-webgl');
      return undefined;
    }

    const dpr = capability.isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = themeRef.current ? 1.05 : 1.0;

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.setAttribute('aria-hidden', 'true');
    container.innerHTML = '';
    container.appendChild(canvasEl);

    if (!capability.isSoftware) {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      roomEnv = new RoomEnvironment();
      envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRenderTarget.texture;
    }

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, themeRef.current ? 0.6 : 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x93c5fd, themeRef.current ? 1.85 : 1.55);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x14b8a6, themeRef.current ? 1.45 : 1.15);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    const accentPoint = new THREE.PointLight(0x8b5cf6, themeRef.current ? 2.2 : 1.3, 14);
    accentPoint.position.set(2.4, -2.1, 3.2);
    scene.add(accentPoint);

    // Composite architectural sculpture
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(0.95, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: themeRef.current ? 0x1e3a8a : 0x2563eb,
      metalness: 0.45,
      roughness: 0.25,
      emissive: themeRef.current ? 0x0f172a : 0x1e3a8a,
      emissiveIntensity: themeRef.current ? 0.45 : 0.22,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    const latticeGeo = new THREE.IcosahedronGeometry(1.28, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: themeRef.current ? 0x60a5fa : 0x1d4ed8,
      wireframe: true,
      transparent: true,
      opacity: themeRef.current ? 0.34 : 0.28,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    coreGroup.add(latticeMesh);

    const pillarGeo = new THREE.OctahedronGeometry(0.32, 0);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      metalness: 0.35,
      roughness: 0.2,
      emissive: 0x0d9488,
      emissiveIntensity: 0.35,
    });
    const crownMesh = new THREE.Mesh(pillarGeo, pillarMat);
    crownMesh.position.set(0, 1.56, 0);
    crownMesh.scale.set(0.85, 1.15, 0.85);
    coreGroup.add(crownMesh);

    // Three tilted orbital rings representing Student (Blue), Supervisor (Teal), Admin (Purple)
    const ringConfigs = [
      {
        radius: 1.72,
        tube: 0.024,
        color: 0x3b82f6,
        tiltX: 1.05,
        tiltY: 0.28,
        tiltZ: -0.2,
        speed: 0.36,
        phase: 0.2,
      },
      {
        radius: 2.02,
        tube: 0.022,
        color: 0x14b8a6,
        tiltX: 1.25,
        tiltY: -0.45,
        tiltZ: 0.35,
        speed: -0.28,
        phase: 2.1,
      },
      {
        radius: 2.3,
        tube: 0.02,
        color: 0x8b5cf6,
        tiltX: 0.72,
        tiltY: 0.18,
        tiltZ: 0.55,
        speed: 0.22,
        phase: 4.2,
      },
    ];

    const orbitNodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.115, 18, 18);
    const haloGeo = new THREE.TorusGeometry(0.175, 0.012, 10, 28);

    ringConfigs.forEach((cfg) => {
      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.set(cfg.tiltX, cfg.tiltY, cfg.tiltZ);

      const torusGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 14, 88);
      const torusMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: 0.4,
        roughness: 0.28,
        emissive: cfg.color,
        emissiveIntensity: 0.18,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      orbitGroup.add(torusMesh);

      const nodeGroup = new THREE.Group();
      const nodeMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: 0.25,
        roughness: 0.2,
        emissive: cfg.color,
        emissiveIntensity: 0.48,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeGroup.add(nodeMesh);

      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(haloMesh);

      orbitGroup.add(nodeGroup);
      rootGroup.add(orbitGroup);

      orbitNodes.push({
        radius: cfg.radius,
        speed: cfg.speed,
        phase: cfg.phase,
        nodeGroup,
        haloMesh,
        torusMat,
      });
    });

    // Subtle grounding equatorial ring
    const baseRingGeo = new THREE.TorusGeometry(2.55, 0.012, 8, 96);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: themeRef.current ? 0x64748b : 0x94a3b8,
      transparent: true,
      opacity: themeRef.current ? 0.24 : 0.3,
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.rotation.x = Math.PI / 2 - 0.16;
    baseRing.position.y = -1.45;
    rootGroup.add(baseRing);

    sceneHooksRef.current = {
      applyTheme: (dark) => {
        ambientLight.intensity = dark ? 0.6 : 0.85;
        keyLight.intensity = dark ? 1.85 : 1.55;
        rimLight.intensity = dark ? 1.45 : 1.15;
        accentPoint.intensity = dark ? 2.2 : 1.3;
        coreMat.color.setHex(dark ? 0x1e3a8a : 0x2563eb);
        coreMat.emissive.setHex(dark ? 0x0f172a : 0x1e3a8a);
        coreMat.emissiveIntensity = dark ? 0.45 : 0.22;
        latticeMat.color.setHex(dark ? 0x60a5fa : 0x1d4ed8);
        latticeMat.opacity = dark ? 0.34 : 0.28;
        baseRingMat.color.setHex(dark ? 0x64748b : 0x94a3b8);
        baseRingMat.opacity = dark ? 0.24 : 0.3;
        renderer.toneMappingExposure = dark ? 1.05 : 1.0;
      },
    };

    const pointerTarget = { x: 0, y: 0 };
    const isFinePointer =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: fine) and (hover: hover)').matches;

    const handlePointerMove = (e) => {
      if (!isFinePointer) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      pointerTarget.x = THREE.MathUtils.clamp(nx, -1, 1) * 0.24;
      pointerTarget.y = THREE.MathUtils.clamp(ny, -1, 1) * 0.16;
    };

    const handlePointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    if (isFinePointer) {
      container.addEventListener('pointermove', handlePointerMove, { passive: true });
      container.addEventListener('pointerleave', handlePointerLeave);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (disposed) return;
      const entry = entries[0];
      if (!entry) return;
      const nextW = Math.max(Math.round(entry.contentRect.width), 240);
      const nextH = Math.max(Math.round(entry.contentRect.height), 260);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH, false);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        if (isVisible && !isTabHidden && !disposed) {
          scheduleNextFrame();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden && isVisible && !disposed) {
        scheduleNextFrame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const clock = new THREE.Clock();
    const gl = renderer.getContext();
    let activeLoopPending = false;

    const afterDraw = () => {
      if (disposed || !isVisible || isTabHidden) {
        activeLoopPending = false;
        return;
      }

      if (capability.isSoftware && capability.isWebGL2 && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (sync) {
          gl.flush();
          gl.deleteSync(sync);
        }
        timeoutId = window.setTimeout(() => {
          if (!disposed && isVisible && !isTabHidden) {
            rafId = window.requestAnimationFrame(tick);
          } else {
            activeLoopPending = false;
          }
        }, 80);
        return;
      }

      if (capability.isSoftware) {
        timeoutId = window.setTimeout(() => {
          if (!disposed && isVisible && !isTabHidden) {
            rafId = window.requestAnimationFrame(tick);
          } else {
            activeLoopPending = false;
          }
        }, 80);
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      if (disposed || !isVisible || isTabHidden) {
        activeLoopPending = false;
        return;
      }

      const elapsed = clock.getElapsedTime();

      coreGroup.rotation.y = elapsed * 0.24;
      coreGroup.rotation.x = Math.sin(elapsed * 0.45) * 0.12;
      crownMesh.rotation.y = -elapsed * 0.55;
      crownMesh.position.y = 1.54 + Math.sin(elapsed * 1.4) * 0.06;

      rootGroup.rotation.y = THREE.MathUtils.lerp(
        rootGroup.rotation.y,
        pointerTarget.x + Math.sin(elapsed * 0.25) * 0.08,
        0.05
      );
      rootGroup.rotation.x = THREE.MathUtils.lerp(
        rootGroup.rotation.x,
        pointerTarget.y + 0.08,
        0.05
      );

      for (let i = 0; i < orbitNodes.length; i += 1) {
        const item = orbitNodes[i];
        const angle = elapsed * item.speed + item.phase;
        item.nodeGroup.position.set(
          Math.cos(angle) * item.radius,
          Math.sin(angle) * item.radius,
          0
        );
        item.haloMesh.rotation.z = elapsed * 0.9;
      }

      renderer.render(scene, camera);
      afterDraw();
    };

    function scheduleNextFrame() {
      if (activeLoopPending || disposed || !isVisible || isTabHidden) return;
      activeLoopPending = true;
      rafId = window.requestAnimationFrame(tick);
    }

    scheduleNextFrame();

    return () => {
      disposed = true;
      sceneHooksRef.current = null;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (isFinePointer) {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
      }

      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      envRenderTarget?.dispose();
      pmremGenerator?.dispose();
      roomEnv?.dispose?.();
      renderer.dispose();
      if (canvasEl.parentNode === container) {
        container.removeChild(canvasEl);
      }
    };
  }, [prefersReducedMotion]);

  if (fallbackReason) {
    return <StaticAcademicShowcase reason={fallbackReason} />;
  }

  return (
    <div className="relative flex h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 65% 32%, rgba(37, 99, 235, 0.2), transparent 55%), radial-gradient(circle at 30% 72%, rgba(20, 184, 166, 0.14), transparent 52%)'
            : 'radial-gradient(circle at 65% 32%, rgba(37, 99, 235, 0.1), transparent 55%), radial-gradient(circle at 30% 72%, rgba(13, 148, 136, 0.09), transparent 52%)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5 text-[11px] font-mono text-[var(--text-muted)]">
        <span>GRACE POLYTECHNIC · 3D WORKSPACE MODEL</span>
        <span className="tabular-nums text-[var(--text-secondary)]">ND &amp; HND SUPERVISION</span>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[230px] sm:min-h-[280px] w-full"
        aria-label="Interactive 3D academic supervision orbit representing Student, Supervisor, and Institution Admin portals"
      />

      <div className="relative z-10 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-[11px]">
        <div>
          <p className="font-mono font-semibold text-[#3B82F6]">STUDENT</p>
          <p className="text-[var(--text-muted)] truncate">Milestones &amp; drafts</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-[#14B8A6]">SUPERVISOR</p>
          <p className="text-[var(--text-muted)] truncate">Reviews &amp; office hours</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-[#8B5CF6]">ADMIN</p>
          <p className="text-[var(--text-muted)] truncate">Governance &amp; approvals</p>
        </div>
      </div>
    </div>
  );
}
