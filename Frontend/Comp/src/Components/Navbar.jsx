import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Info, Settings, Menu, X } from "lucide-react";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>

            <header className=" shadow-md border-b border-gray-800 fixed w-full z-50 mb-22">
                <div className="container mx-auto flex justify-between items-center px-4 py-4 h-16">

                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gradient-accent">
                            CompAi
                        </span>
                    </Link>


                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                        >
                            <Home size={18} /> Home
                        </Link>
                        <Link
                            to="/about"
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                        >
                            <Info size={18} /> About
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                        >
                            <Settings size={18} /> Settings
                        </Link>
                    </nav>


                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>


            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsMenuOpen(false)}
            />


            <aside
                className={`fixed top-0 right-0 w-64 h-full bg-[#1a1a1a] shadow-lg z-50 transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    } md:hidden`}
            >
                <div className="p-4 flex flex-col gap-6">

                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="self-end text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>

                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                    >
                        <Home size={18} /> Home
                    </Link>
                    <Link
                        to="/about"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                    >
                        <Info size={18} /> About
                    </Link>
                    <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                    >
                        <Settings size={18} /> Settings
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
