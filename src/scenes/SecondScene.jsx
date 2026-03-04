import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import ShatterCanvas, { SHARD_POLYS } from "../components/ShatterCanvas";

const SecondScene = () => {
  // Shard states — owned here, passed to ShatterCanvas, animated by GSAP below
  const states = useRef(
    SHARD_POLYS.map(() => ({ x: 0, y: 0, rot: 0, a: 1, s: 1, blur: 0 }))
  );

  useGSAP(() => {
    gsap.set(".main", { translateY: "100%", opacity: 0 });
    gsap.set(".words1,.words2,.words3", { opacity: 0 });

    // ── Text scroll: 1900 → 3200 ─────────────────────────────────────────────
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".main",
        start: "1900px top",
        end: "3200px top",
        scrub: true,
        onEnter: () => {
          gsap.set(".FirstPage", { opacity: 0 });
          gsap.set(".main", { opacity: 1 });
        },
        onLeaveBack: () => {
          gsap.set(".FirstPage", { opacity: 1 });
          gsap.set(".main", { opacity: 0 });
        },
      },
    });

    [".words1", ".words2", ".words3"].forEach((w) => {
      textTl.to(w, { opacity: 1, duration: 0.5 });
      textTl.to(w, { opacity: 0, duration: 0.5 });
    });
    textTl.to(".second-text", { opacity: 0, duration: 0.2 });

    // ── Shatter scroll: 3200 → 3800 ──────────────────────────────────────────
    const shatterTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".main",
        start: "3200px top",
        end: "3800px top",
        scrub: true,
      },
    });

    SHARD_POLYS.forEach((poly, i) => {
      const st = states.current[i];

      const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
      const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
      const dx = cx - 50;
      const dy = cy - 50;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      const flyX = (dx / len) * (window.innerWidth * 0.65);
      const flyY = (dy / len) * (window.innerHeight * 0.65);
      const spin = (Math.random() - 0.5) * 180;

      shatterTl.to(
        st,
        {
          x: flyX,
          y: flyY,
          rot: spin,
          s: 0.2,
          blur: 18,
          a: 0,
          duration: 1,
          ease: "power2.in",
        },
        i * 0.03
      );
    });
  }, []);

  return (
    <main
      className="main w-full h-screen fixed inset-0"
      style={{ zIndex: 10 }}
    >
      {/* Canvas + video rendering fully handled by ShatterCanvas */}
      <ShatterCanvas src="/images/SecondBgV.mp4" statesRef={states} />

      {/* Text overlay */}
      <div
        className="second-text absolute inset-0 z-30 mix-blend-difference Clash-Font center text-[6vh] tracking-widest uppercase text-white"
        style={{ pointerEvents: "none" }}
      >
        <h1 className="words1 absolute">somewhere</h1>
        <h1 className="words2 absolute">Across</h1>
        <h1 className="words3 absolute">the sea of</h1>
      </div>
    </main>
  );
};

export default SecondScene;