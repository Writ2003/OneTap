import React, { useState } from 'react'
import Profiles from "../constants/Profiles" 
import { motion, AnimatePresence } from "framer-motion"
import PlayerCard from "../components/ui/introCard"
import ProfileDetails from "../components/ui/ProfileDetails"
import { 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react';



const AboutUs = () => {
    const [[page, direction], setPage] = useState([0, 0]);

    // This handles wrapping around the players array for an infinite loop
    const profileIndex = (page % Profiles.length + Profiles.length) % Profiles.length;

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    return (
        // Main page container, matching the theme of other pages
        <div className="min-h-screen -mt-[4.3rem] bg-slate-900 text-slate-200 flex items-center justify-center p-4 py-16 selection:bg-blue-500/30">
            
            {/* Content wrapper */}
            <div className="w-full max-w-6xl mx-auto">
                
                {/* Responsive Layout: Stacks on mobile, side-by-side on desktop */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
                    
                    {/* --- Left Side: Card Carousel --- */}
                    <div className="flex-shrink-0 w-full max-w-xs">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6 text-center lg:text-left">
                            Meet Our Crew
                        </h1>
                        
                        <div className="relative w-full h-96 flex items-center justify-center">
                            <AnimatePresence initial={false} custom={direction}>
                                {/* The animated PlayerCard */}
                                <PlayerCard
                                    key={page} // This key triggers the animation
                                    name={Profiles[profileIndex].name}
                                    imageUrl={Profiles[profileIndex].profilePic}
                                    // Pass direction to the card for variants
                                    custom={direction} 
                                />
                            </AnimatePresence>

                            {/* Prev Button - Restyled for dark theme */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-8 z-10 bg-slate-700/50 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-slate-200 hover:bg-slate-600 hover:scale-105 transition-all"
                                onClick={() => paginate(-1)}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </div>
                            
                            {/* Next Button - Restyled for dark theme */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 z-10 bg-slate-700/50 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-slate-200 hover:bg-slate-600 hover:scale-105 transition-all"
                                onClick={() => paginate(1)}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* --- Right Side: Profile Details --- */}
                    <div className="w-full">
                        <AnimatePresence initial={false} mode="wait">
                            {/* The animated ProfileDetails */}
                            <ProfileDetails profile={Profiles[profileIndex]} />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs