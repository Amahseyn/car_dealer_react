import axios from 'axios';

// --- IMPORTANT CONFIGURATION FOR MOBILE/LOCAL DEVELOPMENT ---
// To test on a mobile device on the same network, you must use your computer's local network IP address.
// 1. Find your computer's IP (e.g., 192.168.1.10).
// 2. Change the `API_HOST` variable below.
// 3. Make sure your phone is on the same Wi-Fi network.
//
// For production or if Django serves the React app, you can leave it as an empty string.
const API_HOST = ''; // Example: 'http://192.168.1.10:8000'
// -------------------------------------------------------------

const api = axios.create({
    // The base URL is constructed from the host.
    // For a standard dev setup, this will be '/api/'.
    // For mobile testing, it will be something like 'http://192.168.1.10:8000/api/'.
    baseURL: `${API_HOST}/api/`
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const rs = await axios.post('/api/token/refresh/', { refresh: refreshToken });
                    const { access } = rs.data;
                    localStorage.setItem('accessToken', access);
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                    return api(originalRequest);
                } catch (_error) {
                    // Logout user if refresh token is invalid
                    window.location.href = '/login/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;