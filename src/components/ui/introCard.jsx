import React from 'react';
import { motion } from 'framer-motion';


// Reusable Player Card Component
const PlayerCard = ({ name, imageUrl }) => {
    return (
        <motion.div
            className="relative w-64 h-80 rounded-lg shadow-2xl bg-gray-800"
            style={{ clipPath: 'polygon(0% 10%, 10% 10%, 20% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
            whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3 } }}
        >
            <img
                src={imageUrl}
                alt={`Image of ${name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x800/cccccc/ffffff?text=Image+Error';
                }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
                <p className="text-xl font-bold text-white text-center tracking-wide">{name}</p>
            </div>
        </motion.div>
    );
};

export default PlayerCard;