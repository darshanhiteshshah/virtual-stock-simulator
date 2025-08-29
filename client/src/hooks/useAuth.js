import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to provide easy access to the AuthContext.
 * This uses a default export, which is a common convention for custom hooks.
 */
const useAuth = () => {
    return useContext(AuthContext);
};

// Use 'export default' when this is the main thing being exported from the file.
export default useAuth;
