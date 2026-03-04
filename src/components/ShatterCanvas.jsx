import { useEffect, useRef } from "react";

export const SHARD_POLYS = [
  [[0,0],   [58,0],   [42,38],  [0,32]],
  [[58,0],  [100,0],  [100,30], [68,44], [42,38]],
  [[100,30],[100,68], [72,58],  [68,44]],
  [[100,68],[100,100],[55,100], [62,60], [72,58]],
  [[55,100],[0,100],  [0,72],   [38,62], [62,60]],
  [[0,72],  [0,32],   [42,38],  [38,62]],
  [[42,38], [68,44],  [72,58],  [62,60], [38,62]],
  [[42,38], [58,0],   [68,44]],
];

function expandPoly(poly, W, H, px = 2) {
  const cx = poly.reduce((s, p) => s + (p[0] / 100) * W, 0) / poly.length;
  const cy = poly.reduce((s, p) => s + (p[1] / 100) * H, 0) / poly.length;
  return poly.map(([px_, py_]) => {
    const x = (px_ / 100) * W;
    const y = (py_ / 100) * H;
    const dx = x - cx, dy = y - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + (dx / len) * px, y + (dy / len) * px];
  });
}

// Props:
//   src       — video source path
//   statesRef — ref to array of { x, y, rot, a, s, blur } — owned & animated by parent
const ShatterCanvas = ({ src, statesRef }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const tryPlay = () => { video.play().catch(() => {}); };
    video.addEventListener("canplay", tryPlay);
    tryPlay();

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const ctx = canvas.getContext("2d");

      // Transparent clear — ThirdScene shows through gaps as shards fly away
      ctx.clearRect(0, 0, W, H);

      if (video.readyState >= 2) {
        SHARD_POLYS.forEach((poly, i) => {
          const st = statesRef.current[i];
          if (st.a <= 0.01) return;

          const cx = poly.reduce((s, p) => s + (p[0] / 100) * W, 0) / poly.length;
          const cy = poly.reduce((s, p) => s + (p[1] / 100) * H, 0) / poly.length;
          const expanded = expandPoly(poly, W, H);

          ctx.save();
          ctx.globalAlpha = Math.max(0, st.a);
          if (st.blur > 0.1) ctx.filter = `blur(${st.blur}px)`;

          ctx.translate(cx + st.x, cy + st.y);
          ctx.rotate((st.rot * Math.PI) / 180);
          ctx.scale(st.s, st.s);
          ctx.translate(-cx, -cy);

          ctx.beginPath();
          expanded.forEach(([px, py], j) =>
            j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          );
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(video, 0, 0, W, H);
          ctx.filter = "none";
          ctx.restore();
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: "1px",
          height: "1px",
          top: "-10px",
          left: "-10px",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          display: "block",
        }}
      />
    </>
  );
};

export default ShatterCanvas;