import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Enable cookies
    headers: {
        'Content-Type': 'application/json',
    },
})

// token management
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
    token ? api.defaults.headers.common['Authorization'] = `Bearer ${token}` : delete api.defaults.headers.common['Authorization'];
}

api.interceptors.request.use(
    (config) => {
        accessToken && (config.headers['Authorization'] = `Bearer ${accessToken}`);
        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);

// response interceptor for automatic token refresh
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const ogReq = error.config;
        if (error.res?.status === 403 && !ogReq._retry){
            ogReq._retry = true;

            try {
                const refreshRes = await api.post('/api/refresh-token')
                const newToken = refreshRes.data.accessToken;

                setAccessToken(newToken);
                ogReq.headers.Authorization = `Bearer ${newToken}`;

                return api(ogReq);
            } catch (error) {
                // refresh failed, redirect to login
                setAccessToken(null);
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export const authAPI = {
    login: async (credentials) => {
        const res = await api.post('/api/login', credentials)
        if (res.data.accessToken){
            setAccessToken(res.data.accessToken);
        }
        return res.data;
    },
    register: async (userData) => {
        const res = await api.post('/api/register', userData);
        return res.data;
    },
    logout: async () => {
        const res = await api.post('/api/logout');
        setAccessToken(null);
        return res.data;
    },
    getProfile: async () => {
        const res = await api.get('/api/profile');
        return res.data;
    },
    refreshToken: async () => {
        const res = await api.post('/api/refresh-token');
        if (res.data.accessToken){
            setAccessToken(res.data.accessToken)
        }
        return res.data;
    }
}