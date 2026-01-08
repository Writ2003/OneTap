import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Upload,
    Clock,
    Shield,
    Link as LinkIcon,
    FileText,
    Zap
} from 'lucide-react';

import { CanvasRevealEffect } from "../components/ui/canvas-reveal-effect"
import { Card } from '../components/ui/aceternityUi';
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards"
import { testimonials } from "../constants/testimonials"

const LandingPage = () => {
    const features = [
        {
            icon: <Upload size={48} />,
            title: "Easy Upload",
            description: "Drag and drop your files or click to browse. Supports images, PDFs, documents, and more."
        },
        {
            icon: <Clock size={48} />,
            title: "Custom Expiry",
            description: "Set your own expiration time - from 1 hour to 30 days. Links automatically expire when time is up."
        },
        {
            icon: <Shield size={48} />,
            title: "One-Time Access",
            description: "Each link can only be accessed once. After the first view, the file becomes permanently unavailable."
        },
        {
            icon: <LinkIcon size={48} />,
            title: "Instant Sharing",
            description: "Get a secure link instantly after upload. Share it via email, messaging, or any platform."
        },
        {
            icon: <FileText size={48} />,
            title: "Multiple Formats",
            description: "Support for images (JPG, PNG, GIF), documents (PDF, DOC, DOCX), and many other file types."
        },
        {
            icon: <Zap size={48} />,
            title: "Lightning Fast",
            description: "Built for speed and reliability. Your files are processed and ready to share in seconds."
        }
    ];

    useEffect (() => {
     // Find the container element *after* the component has mounted
        const particlesContainer = document.getElementById('particles-container');

        // It's a good practice to check if the element exists
        if (!particlesContainer) {
            console.error("particles-container not found.");
            return;
        }
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            resetParticle(particle);
            particlesContainer.appendChild(particle);
            animateParticle(particle);
        }

        function resetParticle(particle) {
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                particle.style.opacity = '0';
                return { x: posX, y: posY };
            }
        
        function animateParticle(particle) {
            const pos = resetParticle(particle);
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            setTimeout(() => {
                particle.style.transition = `all ${duration}s linear`;
                particle.style.opacity = Math.random() * 0.3 + 0.1;
                const moveX = pos.x + (Math.random() * 20 - 10);
                const moveY = pos.y - Math.random() * 30;
                particle.style.left = `${moveX}%`;
                particle.style.top = `${moveY}%`;
                setTimeout(() => {
                    animateParticle(particle);
                }, duration * 1000);
            }, delay * 1000);
        }

        // Mouse interaction
        const handleMouseMove = (e) => {
            const mouseX = (e.clientX / window.innerWidth) * 100;
            const mouseY = (e.clientY / window.innerHeight) * 100;
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${mouseX}%`;
            particle.style.top = `${mouseY}%`;
            particle.style.opacity = '0.6';
            particlesContainer.appendChild(particle);
            setTimeout(() => {
                particle.style.transition = 'all 2s ease-out';
                particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
                particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
                particle.style.opacity = '0';
                setTimeout(() => {
                    particle.remove();
                }, 2000);
            }, 10);
            const spheres = document.querySelectorAll('.gradient-sphere');
            const moveX = (e.clientX / window.innerWidth - 0.5) * 5;
            const moveY = (e.clientY / window.innerHeight - 0.5) * 5;
            spheres.forEach(sphere => {
                sphere.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        };

        document.addEventListener('mousemove', handleMouseMove);

            // Cleanup function: this runs when the component unmounts
            // It prevents memory leaks by removing the event listener
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    },[]);

    const scrollToSection = useCallback((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            // Add a small delay to ensure any animations have completed
            setTimeout(() => {
                element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        }
    }, []);

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="gradient-background">
                    <div className="gradient-sphere sphere-1"></div>
                    <div className="gradient-sphere sphere-2"></div>
                    <div className="gradient-sphere sphere-3"></div>
                    <div className="glow"></div>
                    <div className="grid-overlay"></div>
                    <div className="noise-overlay"></div>
                    <div className="particles-container" id="particles-container"></div>
                </div>
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="hero-title">
                        Secure File Sharing
                        <br />
                        <span style={{ fontSize: '0.8em', opacity: 0.9 }}>
                            One-Time Access Links
                        </span>
                    </h1>
                    <p className="hero-subtitle">
                        Upload your files and get secure, time-limited links that can only be accessed once.
                        Perfect for sharing sensitive documents, images, and more with complete control over access.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
                        <Link to="/upload" className="cta-button">
                            Start Sharing Now
                        </Link>
                        <button
                            className="cta-button"
                            onClick={() => scrollToSection('demo')}
                            style={{ 
                                background: 'transparent',
                                border: '2px solid rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer'
                            }}
                        >
                            Watch Demo
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="features-container">
                    <motion.h2
                        className="section-title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <p className=''>Why Choose SecureShare?</p>
                    </motion.h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                          <Card key={index} title={feature.title} icon={feature.icon} description={feature.description}>
                            <CanvasRevealEffect
                              animationSpeed={5.1}
                              containerClassName="bg-black"
                            />
                          </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            

            {/* How It Works Section */}
            {/*<section id="how-it-works" className="features-section">
                <div className="features-container">
                    <motion.h2
                        className="section-title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        How It Works
                    </motion.h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem',
                        marginTop: '3rem'
                    }}>
                        {[
                            {
                                step: "1",
                                title: "Upload File",
                                description: "Select your file or drag it into the upload area"
                            },
                            {
                                step: "2",
                                title: "Set Expiry",
                                description: "Choose how long the link should remain active"
                            },
                            {
                                step: "3",
                                title: "Get Link",
                                description: "Receive a secure, one-time access link instantly"
                            },
                            {
                                step: "4",
                                title: "Share & Done",
                                description: "Share the link. It expires after first use or time limit"
                            }
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'white',
                                    position: 'relative'
                                }}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ 
                                    duration: 0.6, 
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{ 
                                    scale: 1.05,
                                    transition: { duration: 0.2, ease: "easeOut" }
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                }}>
                                    {step.step}
                                </div>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem',
                                    marginTop: '1rem'
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>*/}

            {/*Testimonial Section*/}
            <section className=''>
                <div className="h-[30rem] flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
                <p className='text-4xl tracking-wider font-bold text-center text-white mb-9'>Testimonials</p>
                  <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                  />
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '5rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '1.5rem'
                    }}>
                        Ready to Start Sharing Securely?
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'white',
                        opacity: 0.9,
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem auto'
                    }}>
                        Join thousands of users who trust SecureShare for their sensitive file sharing needs.
                    </p>
                    <Link to="/upload" className="cta-button" style={{ fontSize: '1.2rem', padding: '1.2rem 2.5rem' }}>
                        Get Started Now
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default LandingPage;