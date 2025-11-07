import React from 'react';
import { motion } from 'framer-motion';

const detailsVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

// Reusable Player Card Component
const PlayerCard = ({ name, imageUrl }) => (
    <motion.div
        className="w-72 h-96 bg-slate-700 rounded-2xl overflow-hidden shadow-2xl relative"
        variants={detailsVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }}
    >
        <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover" 
            // Fallback for placeholder
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = "https://placehold.co/400x600/1e293b/e2e8f0?text=Image+Error"; 
            }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white text-2xl font-bold">{name}</h3>
        </div>
    </motion.div>
);

export default PlayerCard;