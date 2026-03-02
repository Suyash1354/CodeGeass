import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React from "react";

const ThirdScene = () => {
  useGSAP(() => {
    // Initial State: Hidden
    gsap.set(".third-main", { opacity: 0 });
    gsap.set(".t-word", { y: 50, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".third-main", // We use a dummy spacer or height-based trigger
        start: "3800px top",      // Starts after First (1900) + Second (1900)
        end: "+=1900",
        scrub: true,
        onEnter: () => {
          gsap.set(".main", { opacity: 0 });       // Hide Scene 2
          gsap.set(".third-main", { opacity: 1 }); // Show Scene 3
        },
        onLeaveBack: () => {
          gsap.set(".main", { opacity: 1 });       // Show Scene 2
          gsap.set(".third-main", { opacity: 0 }); // Hide Scene 3
        },
      },
    });

    // Example Animation: Words sliding up
    tl.to(".t-word", { 
      opacity: 1, 
      y: 0, 
      stagger: 0.3, 
      duration: 1, 
      ease: "power2.out" 
    });
    
    // Hold the scene or add more animations here
    tl.to(".t-word", { opacity: 0, delay: 0.5 });

  }, []);

  return (
    <main className="third-main w-full h-screen fixed inset-0">
      <div className="absolute z-10 mix-blend-difference w-full h-screen Clash-Font center flex-col text-[6vh] tracking-widest uppercase text-white">
        <h1 className="t-word">The</h1>
        <h1 className="t-word">Final</h1>
        <h1 className="t-word">Destination</h1>
      </div>
      <img
        className="absolute z-0 w-full h-screen object-cover"
        src="/images/ThirdBg.jpg" // Add your third background image here
        alt="Scene 3 Background"
      />
    </main>
  );
};

export default ThirdScene;