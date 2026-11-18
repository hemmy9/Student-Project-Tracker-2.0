import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

function useFinePointer() {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    const sync = () => setIsFine(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  return isFine;
}

export function PerspectiveCard({
  children,
  className = '',
  maxTilt = 4,
  hoverLift = -4,
}) {
  const prefersReduced = useReducedMotion();
  const isFinePointer = useFinePointer();
  const enable3d = !prefersReduced && isFinePointer;

  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!enable3d) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        rotateX: Number((-py * maxTilt * 2).toFixed(2)),
        rotateY: Number((px * maxTilt * 2).toFixed(2)),
      });
    },
    [enable3d, maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div className="spt-perspective">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={
          enable3d
            ? { rotateX: tilt.rotateX, rotateY: tilt.rotateY }
            : { rotateX: 0, rotateY: 0 }
        }
        whileHover={enable3d ? { y: hoverLift } : undefined}
        transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.7 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`transform-gpu ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function DepthLayer({ children, depth = 18, className = '' }) {
  const prefersReduced = useReducedMotion();
  return (
    <div
      style={prefersReduced ? undefined : { transform: `translateZ(${depth}px)` }}
      className={className}
    >
      {children}
    </div>
  );
}

export function FadeInSection({ children, delay = 0, y = 14, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, stagger = 0.06, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
