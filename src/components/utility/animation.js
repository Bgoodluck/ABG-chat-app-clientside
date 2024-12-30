import { easeInOut } from "framer-motion"

export const SlideRight = (delay)=>{
    return {
        hidden: {
            x: 100,
            opacity: 0
        },
        show: {
            x: 0,
            opacity: 1,
            transition: {
                ease: easeInOut,
                duration: 0.5,
                delay: delay
            }
        },
        exit: {
            x: -100,
            opacity: 0,
            transition: {
                ease: easeInOut,
                duration: 0.2
            }
        }
    }
}