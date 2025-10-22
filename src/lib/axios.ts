import axios from 'axios';

export const express = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

express.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);