import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // 1. While the authentication state is loading, show a spinner.
    //    This prevents a logged-in user from being redirected on refresh.
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <Loader2 className="animate-spin text-orange-400" size={48} />
            </div>
        );
    }

    // 2. After loading, if there is no user, redirect to the Home page.
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 3. If loading is finished and a user exists, render the protected page.
    return children;
};

export default ProtectedRoute;
