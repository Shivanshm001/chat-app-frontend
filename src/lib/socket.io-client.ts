import {io} from 'socket.io-client';

export const socket = io('http://localhost:8000', {
    withCredentials: true,
    autoConnect: false
});

socket.connect();
socket.on('connect', () => {
    console.log("Web socket connected")
});