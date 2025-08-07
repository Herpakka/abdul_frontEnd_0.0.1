// utils/chatApi.js

import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Enable cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
let accessToken = null;

export const setChatAccessToken = (token) => {
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

                setChatAccessToken(newToken);
                ogReq.headers.Authorization = `Bearer ${newToken}`;

                return api(ogReq);
            } catch (error) {
                // refresh failed, redirect to login
                setChatAccessToken(null);
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export const chatAPI = {
    createChat: async (chatData) => {
        try {
            const response = await api.post('/api/chatCreate', chatData);
            if (response.data.accessToken) {
                setChatAccessToken(response.data.accessToken);
            }
            return response.data;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    },
    deleteChat: async (chatId) => {
        try {
            const response = await api.delete(`/api/chatDelete/${chatId}`);
            if (response.data.accessToken) {
                setChatAccessToken(response.data.accessToken);
            }
            return response.data;
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    },
    renameChat: async (chatId, newTitle) => {
        try {
            const response = await api.put(`/api/chatRename/${chatId}`, { newTitle: newTitle });
            if (response.data.accessToken) {
                setChatAccessToken(response.data.accessToken);
            }
            return response.data;
        } catch (error) {
            console.error('Error renaming chat:', error);
            throw error;
        }
    },
    getChatList: async (userId) => {
        try {
            const res = await api.get(`/api/chatList/${userId}`);
            if (res.data.accessToken) {
                setChatAccessToken(res.data.accessToken);
            }
            return res.data;
        } catch (error) {
            console.error('Error fetching chat list:', error);
            throw error;
        }
    },
    getChatHistory: async (chatId) => {
        try {
            const res = await api.get(`/api/chatHistory/${chatId}`);
            if (res.data.accessToken) {
                setChatAccessToken(res.data.accessToken);
            }
            return res.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    },
}

