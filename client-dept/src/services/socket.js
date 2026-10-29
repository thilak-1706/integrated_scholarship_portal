
import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
  }

  return 'https://backend-nsp.onrender.com';
};

const getToken = () => {
  return localStorage.getItem('nsp_token') || localStorage.getItem('token');
};

/**
 * Get or initialize the singleton Socket.IO client instance
 */
export const getSocket = () => {
  const token = getToken();

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket) {
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }
    return socket;
  }

  const serverUrl = getSocketUrl();

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true
  });

  return socket;
};

/**
 * Explicitly connect or reconnect with fresh token (e.g. after login)
 */
export const connectSocket = (customToken) => {
  const token = customToken || getToken();
  if (!token) return null;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const serverUrl = getSocketUrl();

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true
  });

  return socket;
};

/**
 * Explicitly disconnect socket (e.g. on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
