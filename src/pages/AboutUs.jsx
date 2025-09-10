import React, { useState } from 'react'
import Profiles  from "../constants/Profiles" 
import { motion, AnimatePresence } from "framer-motion"
import PlayerCard from "../components/ui/introCard"
import ProfileDetails from "../components/ui/ProfileDetails"

// Animation variants for the carousel
const variants = {
    enter: (direction) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        };
    }
};

const AboutUs = () => {
  const [[page, direction], setPage] = useState([0, 0]);

    // This handles wrapping around the players array for an infinite loop
    const profileIndex = (page % Profiles.length + Profiles.length) % Profiles.length;

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };
  return (
    <div className='-mt-[4.3rem] h-screen bg-black'>
        <div className='pt-28 px-6 bg-blue-950 h-full'>
          <div className='mx-16 grid grid-cols-3'>
            <div className='col-span-1'>
              <p className='text-white font-bold text-4xl'>Meet Our Crew</p>
              <div className="relative w-full max-w-xs h-96 flex items-center justify-center mt-6">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        className="absolute"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                    >
                        <PlayerCard
                            name={Profiles[profileIndex].name}
                            imageUrl={Profiles[profileIndex].profilePic}
                        />
                    </motion.div>
                </AnimatePresence>

                 {/* Navigation Buttons */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-8 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => paginate(-1)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </div>
                <div 
                    className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => paginate(1)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
            <div className='col-span-2'>
              <AnimatePresence initial={false} mode="wait">
                   <ProfileDetails profile={Profiles[profileIndex]} />
              </AnimatePresence>
            </div>
          </div>
        </div>
    </div>
  )
}

export default AboutUs