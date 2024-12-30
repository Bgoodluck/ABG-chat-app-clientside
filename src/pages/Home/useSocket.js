// useSocket.js
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { setSocketConnection, setOnlineUsers } from '../../redux/userSlice';

export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const connectSocket = () => {
      if (!token || socketRef.current?.connected) return;

      const socket = io(process.env.REACT_APP_BACKEND_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        if (isMounted) {
          console.log('Socket connected successfully');
          setIsConnected(true);
          dispatch(setSocketConnection(true));
          
          // Initialize data
          socket.emit("fetch-all-users");
          socket.emit("fetch-message-history", { page: 1, limit: 50 });
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (isMounted) {
          setIsConnected(false);
          dispatch(setSocketConnection(false));
        }
      });

      socket.on('disconnect', () => {
        if (isMounted) {
          console.log('Socket disconnected');
          setIsConnected(false);
          dispatch(setSocketConnection(false));
        }
      });

      socket.on('onlineUsers', (users) => {
        if (isMounted) {
          dispatch(setOnlineUsers(users));
        }
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, [token, dispatch]);

  return { socket: socketRef.current, isConnected };
};