import { useRef, useEffect } from "react";

export default function GlobalNoise({
  patternRefreshInterval = 4,
  patternAlpha = 25,
  style = {}
}) {
  const grainRef = useRef(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId;
    const canvasSize = 512; // lower = faster

    const resize = () => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }

      ctx.putImageData(imageData, 0, 0);

const url = canvas.toDataURL();
canvas.style.backgroundImage = `url(${url})`;
canvas.style.backgroundRepeat = "repeat";
canvas.style.backgroundSize = "cover"; // 👈 object-cover feel
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = requestAnimationFrame(loop);
    };

    resize();
    loop();

    return () => cancelAnimationFrame(animationId);
  }, [patternRefreshInterval, patternAlpha]);

  return (
  <canvas
    ref={grainRef}
    className="pointer-events-none fixed inset-0 z-[9999] w-full h-full"
    style={{
      imageRendering: "pixelated",
      mixBlendMode: "overlay",
      opacity: 1,
      ...style   
    }}
  />
);
}