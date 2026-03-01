  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.jsx'

  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import gsap from 'gsap'
  gsap.registerPlugin(ScrollTrigger)  

  createRoot(document.getElementById('root')).render(
    
      <App />
    
  )
