import axios from 'axios';

const api = axios.create({
    baseURL: '/api/'
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