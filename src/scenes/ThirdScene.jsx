import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React from "react";

const ThirdScene = () => {
  useGSAP(() => {
    // No opacity hiding — ThirdScene is always the backdrop behind SecondScene's shards
    gsap.set(".t-word", { y: 60, opacity: 0 });

    gsap.timeline({
      scrollTrigger: {
        trigger: ".third-main",
        start: "3800px top",
        end: "+=1500",
        scrub: true,
      },
    }).to(".t-word", {
      opacity: 1,
      y: 0,
      stagger: 0.3,
      duration: 1,
      ease: "power2.out",
    });
  }, []);

  return (
    <main
      className="third-main w-full h-screen fixed inset-0"
      style={{ zIndex: 1 }} // behind SecondScene (z-index: 10), always visible
    >
      <div className="absolute z-10 mix-blend-difference w-full h-screen Clash-Font center flex-col text-[6vh] tracking-widest uppercase text-white">
        <h1 className="t-word">The</h1>
        <h1 className="t-word">Final</h1>
        <h1 className="t-word">Destination</h1>
      </div>
     
    </main>
  );
};

export default ThirdScene;