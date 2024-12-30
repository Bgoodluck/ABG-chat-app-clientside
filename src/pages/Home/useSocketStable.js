// // useSocketStable.js
// import { useEffect, useMemo, useRef } from 'react';
// import io from 'socket.io-client';
// import { useDispatch } from 'react-redux';
// import { setSocketConnection, setOnlineUsers } from '../../redux/userSlice';

// export const useSocketStable = (token) => {
//   const dispatch = useDispatch();
//   const connectionAttemptsRef = useRef(0);
//   const maxRetries = 3;

//   // Create stable socket instance
//   const socket = useMemo(() => {
//     if (!token) return null;

//     return io(process.env.REACT_APP_BACKEND_URL, {
//       auth: { token },
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 20000,
//       autoConnect: false // Prevent auto-connection
//     });
//   }, [token]); // Only recreate if token changes

//   useEffect(() => {
//     if (!socket || connectionAttemptsRef.current >= maxRetries) return;

//     const setupSocketListeners = () => {
//       socket.on('connect', () => {
//         console.log('Socket connected successfully');
//         dispatch(setSocketConnection(true));
//         connectionAttemptsRef.current = 0;

//         // Initialize data fetching
//         socket.emit("fetch-all-users");
//         socket.emit("fetch-message-history", { page: 1, limit: 50 });
//       });

//       socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//         dispatch(setSocketConnection(false));
//         connectionAttemptsRef.current++;
//       });

//       socket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//         dispatch(setSocketConnection(false));
//       });

//       socket.on('onlineUsers', (users) => {
//         dispatch(setOnlineUsers(users));
//       });

//       // Add other event listeners here
//     };

//     const connectWithRetry = () => {
//       if (!socket.connected && connectionAttemptsRef.current < maxRetries) {
//         socket.connect();
//       }
//     };

//     setupSocketListeners();
//     connectWithRetry();

//     // Cleanup function
//     return () => {
//       if (socket) {
//         socket.offAny(); // Remove all listeners
//         if (socket.connected) {
//           socket.disconnect();
//         }
//       }
//     };
//   }, [socket, dispatch]);

//   return socket;
// };


// useSocketStable.js
// import { useEffect, useMemo, useRef } from 'react';
// import io from 'socket.io-client';
// import { useDispatch } from 'react-redux';
// import { setSocketConnection, setOnlineUsers } from '../../redux/userSlice';
// import { useNavigate } from 'react-router-dom';

// export const useSocketStable = (token) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const reconnectAttemptsRef = useRef(0);
//   const maxReconnectAttempts = 5;
//   const baseReconnectDelay = 1000;

//   // Create stable socket instance
//   const socket = useMemo(() => {
//     if (!token) return null;

//     return io(process.env.REACT_APP_BACKEND_URL, {
//       auth: { token },
//       reconnection: true,
//       reconnectionAttempts: maxReconnectAttempts,
//       reconnectionDelay: baseReconnectDelay,
//       timeout: 10000,
//       transports: ['websocket', 'polling'],
//       autoConnect: false
//     });
//   }, [token]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleConnect = () => {
//       console.log('Socket connected successfully');
//       dispatch(setSocketConnection(true));
//       reconnectAttemptsRef.current = 0;
      
//       // Initialize data fetching
//       socket.emit("fetch-all-users");
//       socket.emit("fetch-message-history", { page: 1, limit: 50 });
//     };

//     const handleConnectError = (error) => {
//       console.error('Socket connection error:', error);
//       dispatch(setSocketConnection(false));
      
//       if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//         reconnectAttemptsRef.current++;
//         const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
//         console.log(`Attempting reconnect in ${delay}ms (Attempt ${reconnectAttemptsRef.current})`);
//         setTimeout(() => {
//           socket?.connect();
//         }, delay);
//       } else {
//         console.error('Max reconnection attempts reached');
//       }
//     };

//     const handleDisconnect = (reason) => {
//       console.log('Socket disconnected:', reason);
//       dispatch(setSocketConnection(false));
      
//       if (reason === 'io server disconnect') {
//         console.log('Server forced disconnection, checking authentication...');
//         // Handle forced disconnection
//         localStorage.removeItem('token');
//         navigate('/email');
//       } else if (reason === 'transport close' || reason === 'ping timeout') {
//         socket?.connect();
//       }
//     };

//     const handleNewSession = () => {
//       console.log('New session connected, closing current session');
//       socket?.disconnect();
//       dispatch(setSocketConnection(false));
//       localStorage.removeItem('token');
//       navigate('/email');
//     };

//     const handleOnlineUsers = (users) => {
//       console.log('Online users:', users);
//       dispatch(setOnlineUsers(users));
//     };

//     const handleUserTyping = ({ userId, typing }) => {
//       // Implement typing indicator logic here
//       console.log(`User ${userId} is ${typing ? 'typing' : 'not typing'}`);
//     };

//     // Set up event listeners
//     socket.on('connect', handleConnect);
//     socket.on('connect_error', handleConnectError);
//     socket.on('disconnect', handleDisconnect);
//     socket.on('newSessionConnected', handleNewSession);
//     socket.on('onlineUsers', handleOnlineUsers);
//     socket.on('userTyping', handleUserTyping);

//     // Add socket to window for global access
//     window.socket = socket;

//     // Initial connection
//     socket.connect();

//     // Cleanup function
//     return () => {
//       console.log('Cleaning up socket connection');
//       if (socket) {
//         socket.removeAllListeners();
//         socket.disconnect();
//         window.socket = null;
//       }
//     };
//   }, [socket, dispatch, navigate]);

//   return socket;
// };


// useSocketStable.js
// import { useEffect, useMemo, useRef } from 'react';
// import io from 'socket.io-client';
// import { useDispatch } from 'react-redux';
// import { setSocketConnection, setOnlineUsers, logout } from '../../redux/userSlice';
// import { useNavigate } from 'react-router-dom';

// export const useSocketStable = (token) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const reconnectAttemptsRef = useRef(0);
//   const maxReconnectAttempts = 5;
//   const baseReconnectDelay = 1000;
//   const socketRef = useRef(null);

//   // Create stable socket configuration
//   const socketConfig = useMemo(() => ({
//     auth: { token },
//     reconnection: true,
//     reconnectionAttempts: maxReconnectAttempts,
//     reconnectionDelay: baseReconnectDelay,
//     timeout: 10000,
//     transports: ['websocket', 'polling'],
//     autoConnect: false
//   }), [token]);

//   // Create stable socket instance
//   const socket = useMemo(() => {
//     if (!token) return null;
    
//     // Create new socket only if it doesn't exist
//     if (!socketRef.current) {
//       socketRef.current = io(process.env.REACT_APP_BACKEND_URL, socketConfig);
//     }
//     return socketRef.current;
//   }, [token, socketConfig]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleConnect = () => {
//       console.log('Socket connected successfully');
//       dispatch(setSocketConnection(true));
//       reconnectAttemptsRef.current = 0;
      
//       // Initialize data fetching
//       socket.emit("fetch-all-users");
//       socket.emit("fetch-message-history", {
//         page: 1,
//         limit: 50
//       });
//     };

//     const handleConnectError = (error) => {
//       console.error('Socket connection error:', error);
//       dispatch(setSocketConnection(false));
      
//       if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//         reconnectAttemptsRef.current++;
//         const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
//         console.log(`Attempting reconnect in ${delay}ms (Attempt ${reconnectAttemptsRef.current})`);
//         setTimeout(() => {
//           if (socket && !socket.connected) {
//             socket.connect();
//           }
//         }, delay);
//       } else {
//         console.error('Max reconnection attempts reached');
//         handleForceDisconnect();
//       }
//     };

//     const handleDisconnect = (reason) => {
//       console.log('Socket disconnected:', reason);
//       dispatch(setSocketConnection(false));
      
//       if (reason === 'io server disconnect') {
//         console.log('Server forced disconnection');
//         handleForceDisconnect();
//       } else if (reason === 'transport close' || reason === 'ping timeout') {
//         if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//           socket.connect();
//         }
//       }
//     };

//     const handleForceDisconnect = () => {
//       socket.disconnect();
//       localStorage.removeItem('token');
//       dispatch(logout());
//       navigate('/email');
//     };

//     const handleNewSession = () => {
//       console.log('New session connected, closing current session');
//       handleForceDisconnect();
//     };

//     const handleOnlineUsers = (users) => {
//       console.log('Online users:', users);
//       dispatch(setOnlineUsers(users));
//     };

//     const handleUserTyping = ({ userId, typing }) => {
//       console.log(`User ${userId} is ${typing ? 'typing' : 'not typing'}`);
//       // Implement your typing indicator logic here
//     };

//     // Set up event listeners
//     socket.on('connect', handleConnect);
//     socket.on('connect_error', handleConnectError);
//     socket.on('disconnect', handleDisconnect);
//     socket.on('newSessionConnected', handleNewSession);
//     socket.on('onlineUsers', handleOnlineUsers);
//     socket.on('userTyping', handleUserTyping);

//     // Add socket to window for global access
//     window.socket = socket;

//     // Initial connection attempt
//     if (!socket.connected) {
//       socket.connect();
//     }

//     // Cleanup function
//     return () => {
//       console.log('Cleaning up socket connection');
//       if (socket) {
//         socket.removeAllListeners();
//         socket.disconnect();
//         window.socket = null;
//         socketRef.current = null;
//       }
//     };
//   }, [socket, dispatch, navigate]);

//   return socket;
// };


// useSocketStable.js
import { useEffect, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { setSocketConnection, setOnlineUsers, logout } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';

export const useSocketStable = (token) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;
  const socketRef = useRef(null);

  // Create stable socket configuration
  const socketConfig = useMemo(() => ({
    auth: { token },
    reconnection: true,
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: baseReconnectDelay,
    timeout: 20000, // Increased timeout
    transports: ['websocket', 'polling'],
    autoConnect: false,
    forceNew: false
  }), [token]);

  // Create stable socket instance
  const socket = useMemo(() => {
    if (!token) return null;
    
    if (!socketRef.current) {
      console.log('Creating new socket instance');
      socketRef.current = io(process.env.REACT_APP_BACKEND_URL, socketConfig);
      
      // Add to window immediately
      window.socket = socketRef.current;
    }
    return socketRef.current;
  }, [token, socketConfig]);

  useEffect(() => {
    if (!socket) return;

    let reconnectTimeout;

    const handleConnect = () => {
      console.log('Socket connected successfully');
      dispatch(setSocketConnection(true));
      reconnectAttemptsRef.current = 0;
      
      // Initialize data fetching
      socket.emit("fetch-all-users");
      socket.emit("fetch-message-history", {
        page: 1,
        limit: 50
      });
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      dispatch(setSocketConnection(false));
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
        console.log(`Attempting reconnect in ${delay}ms (Attempt ${reconnectAttemptsRef.current})`);
        
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          if (socket && !socket.connected) {
            socket.connect();
          }
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
        handleForceDisconnect();
      }
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      dispatch(setSocketConnection(false));
      
      if (reason === 'io server disconnect') {
        console.log('Server forced disconnection');
        handleForceDisconnect();
      } else if (reason === 'transport close' || reason === 'ping timeout') {
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          socket.connect();
        }
      }
    };

    const handleForceDisconnect = () => {
      clearTimeout(reconnectTimeout);
      socket.disconnect();
      localStorage.removeItem('token');
      dispatch(logout());
      navigate('/email');
    };

    const handleNewSession = () => {
      console.log('New session connected, closing current session');
      handleForceDisconnect();
    };

    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('newSessionConnected', handleNewSession);
    socket.on('onlineUsers', handleOnlineUsers);

    // Initial connection attempt
    if (!socket.connected) {
      console.log('Initiating socket connection...');
      socket.connect();
    }

    // Cleanup function
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.removeAllListeners();
        // Don't disconnect on cleanup - maintain connection
        window.socket = socket; // Ensure global reference is maintained
      }
    };
  }, [socket, dispatch, navigate]);

  return socket;
};