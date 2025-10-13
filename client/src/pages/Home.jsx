import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

const Link = ({ to, children, className, ...props }) => (
    <a href={to} className={className} {...props}>
        {children}
    </a>
);

const Home = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Video autoplay failed:", error);
            });
        }
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
            {/* Background Video */}
            <video 
                ref={videoRef}
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src="/vsm.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Subtle Gradient Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950/50 via-blue-950/40 to-slate-950/60"></div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
                <motion.div 
                    className="text-center max-w-4xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 text-white tracking-tight leading-tight drop-shadow-2xl">
                        Virtual Stock Simulator
                    </h1>

                    {/* Transparent Button Group */}
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link
                            to="/login"
                            className="bg-blue-600/30 hover:bg-blue-600/50 text-white font-semibold py-4 px-16 rounded-lg transition-all duration-300 backdrop-blur-md border border-blue-400/30 hover:border-blue-400/60 shadow-lg hover:scale-105"
                        >
                            Login
                        </Link>
                        
                        <Link
                            to="/register"
                            className="bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-semibold py-4 px-16 rounded-lg transition-all duration-300 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/60 shadow-lg hover:scale-105"
                        >
                            Register
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
