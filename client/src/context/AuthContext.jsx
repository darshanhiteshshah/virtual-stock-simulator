import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// This custom hook is now part of the context file for simplicity
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Add a loading state to track the initial authentication check
    const [loading, setLoading] = useState(true);

    // Load user from a single, reliable localStorage item
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("authUser");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem("authUser");
        } finally {
            // Set loading to false after the check is complete
            setLoading(false);
        }
    }, []);

    // Persist user to localStorage whenever the user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("authUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("authUser");
        }
    }, [user]);

    return (
        // Provide the loading state along with the user
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
