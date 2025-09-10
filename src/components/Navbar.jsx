import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Share2, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-content">
                <Link to="/" className="logo" onClick={closeMobileMenu}>
                    <Share2 size={24} />
                    <span>OneTap</span>
                </Link>

                {/* Desktop Menu */}
                <ul className="nav-links desktop-menu">
                    <li>
                        <Link to="/" onClick={closeMobileMenu}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <a href="#features" onClick={closeMobileMenu}>
                            Features
                        </a>
                    </li>
                    <li>
                        <a href="#demo" onClick={closeMobileMenu}>
                            Demo
                        </a>
                    </li>
                    <li>
                        <Link to="/upload" onClick={closeMobileMenu}>
                            Upload
                        </Link>
                    </li>
                    <li>
                        <Link to="/aboutUs" onClick={closeMobileMenu}>
                            About Us
                        </Link>
                    </li>
                </ul>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <ul className="nav-links mobile-nav-links">
                        <li>
                            <Link to="/" onClick={closeMobileMenu}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <a href="#features" onClick={closeMobileMenu}>
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#demo" onClick={closeMobileMenu}>
                                Demo
                            </a>
                        </li>
                        <li>
                            <Link to="/upload" onClick={closeMobileMenu}>
                                Upload
                            </Link>
                        </li>
                        <li>
                            <Link to="/aboutUs" onClick={closeMobileMenu}>
                                About Us
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
