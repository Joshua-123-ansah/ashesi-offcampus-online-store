import axios from "axios";

import {ACCESS_TOKEN} from "./Constants";

// Determine which API URL to use based on environment
const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_API_URL_PROD || process.env.REACT_APP_API_URL;
    }
    // For local development
    return process.env.REACT_APP_API_URL;
};

const api = axios.create({
    baseURL: getApiUrl()
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
})

export default api;