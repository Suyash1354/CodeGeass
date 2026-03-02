import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const SecondScene = () => {
  useGSAP(() => {
    gsap.set(".main", { translateY: "100%", opacity: 0 });
    gsap.set(".words1, .words2, .words3", { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".main",
        start: "bottom top",
        end: "+=1900",
        scrub:true,
       
        onEnter: () => {
          gsap.set(".FirstPage", { opacity: 0 });
          gsap.set(".main", { opacity: 1});
        },
        onLeaveBack: () => {
          gsap.set(".FirstPage", { opacity: 1 });
          gsap.set(".main", { opacity: 0 });
        },
      },
    });

    const words = [".words1", ".words2", ".words3"]

    words.forEach((words)=>{
      tl.to( words, { opacity: 1, ease: "power1.inOut", duration: 0.5,});
      tl.to( words, { opacity: 0, ease: "power1.inOut", duration: 0.5,});
    })

   
    
  }, []);

  return (
    <main className="main w-full h-screen  fixed inset-0">
      <div className=" absolute z-10 mix-blend-difference w-full h-screen Clash-Font center text-5xl text-[6vh] tracking-widest uppercase text-white ">
        <h1 className="words1 absolute">somewhere</h1>
        <h1 className="words2 absolute">Across</h1>
        <h1 className="words3 absolute">the sea of </h1>
      </div>
      <img
        className=" absolute z-0 w-full h-screen object-cover"
        src="/images/SecondBg.jpg"
        alt=""
      />
    </main>
  );
};

export default SecondScene;
