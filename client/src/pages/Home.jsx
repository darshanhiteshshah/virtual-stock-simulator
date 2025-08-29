import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => (
    <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 text-gray-100 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
    >
        <motion.h1
            className="text-5xl md:text-6xl font-extrabold text-orange-500 mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            Virtual Stock Simulator
        </motion.h1>

        <motion.p
            className="text-lg md:text-xl text-blue-400 max-w-3xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
        >
            Practice. Learn. Master. Simulate real-world trading without any real risk.
        </motion.p>

        <motion.div
            className="flex gap-6 flex-wrap justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
        >
            <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-400 text-gray-900 font-semibold py-3 px-10 rounded-full shadow-md transition-all duration-300"
            >
                Login
            </Link>
            <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-gray-100 font-semibold py-3 px-10 rounded-full shadow-md transition-all duration-300"
            >
                Register
            </Link>
        </motion.div>

        <motion.div
            className="mt-20 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
        >
            <p>Made for learning, not for investment advice.</p>
        </motion.div>
    </motion.div>
);

export default Home;
