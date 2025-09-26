// A reusable hook to compute a uniform scale that fits the viewport
// while maintaining a fixed design width/height ratio. This helps keep
// complex pixel-based layouts visually stable across browser zoom levels.

import { useEffect, useMemo, useState } from "react";

export function useScale({ baseWidth = 1920, baseHeight = 1080 } = {}) {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : baseWidth,
    height: typeof window !== "undefined" ? window.innerHeight : baseHeight,
    dpr: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  });

  useEffect(() => {
    let rafId = 0;
    const handleResize = () => {
      // Use rAF to avoid layout thrash on rapid resizes/zoom changes
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio || 1,
        });
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const { scale, scaleX, scaleY, canvasWidth, canvasHeight } = useMemo(() => {
    const widthScale = viewport.width / baseWidth;
    const heightScale = viewport.height / baseHeight;
    // uniform scale to keep aspect ratio (contain behavior)
    const s = Math.min(widthScale, heightScale);
    const rounded = Math.max(0.1, Math.round(s * 1000) / 1000);
    const sx = Math.max(0.1, Math.round(widthScale * 1000) / 1000);
    const sy = Math.max(0.1, Math.round(heightScale * 1000) / 1000);
    return {
      scale: rounded,
      scaleX: sx,
      scaleY: sy,
      canvasWidth: baseWidth,
      canvasHeight: baseHeight,
    };
  }, [viewport.width, viewport.height, baseWidth, baseHeight]);

  return { scale, scaleX, scaleY, canvasWidth, canvasHeight, viewport };
}
