import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const SecondScene = () => {
  useGSAP(() => {
  
    gsap.set(".main", { translateY: "100%", opacity: 0})

    const tl = gsap.timeline({
      
      scrollTrigger:{
        trigger:".main",
        start:"bottom top",
        end:"+=1900",
        markers:true,
        onEnter:()=>{
          gsap.set(".FirstPage", { opacity: 0 })
          gsap.set(".main", { opacity: 1 })
        },
         onLeaveBack: () => {
          gsap.set(".FirstPage", { opacity: 1 })
          gsap.set(".main", { opacity: 0 })
        },
        
      }
    })

  }, [])

  return (
    <main className='main w-full h-screen bg-amber-800 fixed inset-0'></main>
  )
}

export default SecondScene