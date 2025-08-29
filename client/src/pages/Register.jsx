import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { registerUser } from "../services/authService";
import { motion } from "framer-motion";

const Register = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await registerUser(formData);
            setUser({
                ...res.data.user,
                token: res.data.token,
            });
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.form
                onSubmit={handleSubmit}
                className="bg-gray-950 p-10 rounded-xl shadow-xl w-full max-w-md space-y-6 border border-gray-800"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-3xl font-extrabold text-orange-400 text-center">Create Account</h1>

                <div>
                    <label className="block mb-2 text-gray-300">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2 text-gray-300">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2 text-gray-300">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-gray-900 font-bold py-2 rounded-full transition-all duration-300"
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>
            </motion.form>
        </motion.div>
    );
};

export default Register;
