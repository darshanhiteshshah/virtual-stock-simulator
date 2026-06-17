import axios from "axios";

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: { "Content-Type": "application/json" },
});

// Add auth token to requests if available
apiClient.interceptors.request.use(
    (config) => {
        const storedAuthUser = localStorage.getItem('authUser');
        const token = storedAuthUser ? JSON.parse(storedAuthUser).token : localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
