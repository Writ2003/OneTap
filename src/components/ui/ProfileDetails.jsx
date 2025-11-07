import { motion } from "framer-motion";
import { Github, Twitter, Linkedin } from "lucide-react";
// Variants for the details container to orchestrate staggered animations
const detailsContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.5 } }
};

const detailItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};


const SocialIcon = ({ href, icon }) => {
    if (!href) return null; // <-- This is the optional logic

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-blue-400 transition-colors"
            aria-label={`Visit profile`}
        >
            {icon}
        </a>
    );
};

const ProfileDetails = ({ profile }) => (
    <motion.div
        key={profile.name}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        className="w-full max-w-4xl p-4"
    >
        {/* Top Section: Image + Overlay Text */}
        <div className="relative w-full flex justify-center items-end h-72 md:h-80">
            {/* Aura */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute inset-x-0 bottom-0 h-2/3 bg-cyan-500/20 blur-3xl"
            ></motion.div>

            {/* profile Image */}
            <motion.div
                className="relative w-56 h-72 md:w-64 md:h-80"
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 80, delay: 0.1 }}
            >
                <img
                    src={profile.profilePic}
                    alt={profile.name}
                    className="w-full h-full object-cover shadow-2xl"
                    style={{ clipPath: 'polygon(0 100%, 0 15%, 25% 0, 75% 0, 100% 15%, 100% 100%)' }}
                />
            </motion.div>

            {/* Name & Profession Overlay */}
            <motion.div
                className="absolute left-0 bottom-8 md:bottom-12 p-4"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100, delay: 0.4 }}
            >
                <div className="bg-black/30 backdrop-blur-sm p-4 rounded-r-lg flex flex-col gap-3">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white/70">{profile.name}</h2>
                    <p className="text-lg md:text-xl font-semibold text-cyan-400">{profile.profession}</p>
                </div>
            </motion.div>
        </div>

        {/* Bottom Details Section */}
        <motion.div
            variants={detailsContainerVariants}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-t-2 border-gray-700/50 pt-6"
        >
            <motion.p variants={detailItemVariants} className="text-gray-300 bg-gray-800/50 p-3 rounded-lg"><span className="font-semibold text-gray-400 mr-2">Email:</span> {profile.email}</motion.p>
            <motion.p variants={detailItemVariants} className="text-gray-300 bg-gray-800/50 p-3 rounded-lg"><span className="font-semibold text-gray-400 mr-2">Contact:</span> {profile.contact}</motion.p>
            <motion.p variants={detailItemVariants} className="text-gray-300 bg-gray-800/50 p-3 rounded-lg"><span className="font-semibold text-gray-400 mr-2">Background:</span> {profile.background}</motion.p>
            <motion.p variants={detailItemVariants} className="text-gray-300 bg-gray-800/50 p-3 rounded-lg"><span className="font-semibold text-gray-400 mr-2">College:</span> {profile.college}</motion.p>
        </motion.div>


        {/* Social Icons Section */}
        <div className="flex items-center gap-5 mt-6">
            <SocialIcon href={profile.socials.github} icon={<Github size={24} />} />
            <SocialIcon href={profile.socials.linkedin} icon={<Linkedin size={24} />} />
            <SocialIcon href={profile.socials.twitter} icon={<Twitter size={24} />} />
        </div>
    </motion.div>
);

export default ProfileDetails;