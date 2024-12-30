import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { summaryApi } from '../../common';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../../redux/userSlice';
import Sidebar from '../../components/Sidebar/Sidebar';
import logo from '../../asset/logo2.png';
import { useSocketStable } from './useSocketStable';

// Disable React.StrictMode double-invocation in development
if (process.env.NODE_ENV === 'production') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes('StrictMode')) return;
    originalConsoleError.apply(console, args);
  };
}

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.user);
  
  // Create stable token reference
  const token = useMemo(() => localStorage.getItem('token'), []);
console.log("Token in production:", token); 

  
  // Initialize socket with stable configuration
  const socket = useSocketStable(token);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(summaryApi.userDetails.url, {
        method: summaryApi.userDetails.method,
        credentials: 'include',
        headers: {
          // 'Content-Type': 'application/json',
          'Authorization': token // Remove 'Bearer ' prefix if not expected by backend
        }
      });
        
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized access - token may be invalid');
          // handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const userData = responseData.data.data || responseData.data;
        if (userData) {
          dispatch(setUser({
            _id: userData._id || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            picture: userData.picture || '',
            token // Store token in user state
          }));
        }
      } else {
        console.error("Invalid response format:", responseData);
        // handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (error.message.includes('401')) {
        // handleLogout();
      }
    }
  };

  const handleLogout = () => {
    try {
      if (socket?.connected) {
        socket.disconnect();
      }
      localStorage.clear(); // Clear all storage instead of just token
      dispatch(logout());
      navigate('/email', { replace: true }); // Use replace to prevent back navigation
    } catch (error) {
      console.error('Error during logout:', error);
      // Force a clean logout even if there's an error
      localStorage.clear();
      window.location.href = '/email';
    }
  };


  // Fetch user details on mount
 useEffect(() => {
  if (!token) {
    handleLogout();
    return;
  }
  
  let isSubscribed = true;
  
  const initializeUser = async () => {
    if (isSubscribed) {
      await fetchUserDetails();
    }
  };
  
  initializeUser();
  
  return () => {
    isSubscribed = false;
  };
}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Log socket and user state for debugging
  useEffect(() => {
    console.log("Socket Status:", socket?.connected);
    console.log("Redux UserDetails:", user);
  }, [socket?.connected, user]);

  const basePath = location.pathname === '/';

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && 'hidden'}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-3 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img
            src={logo}
            alt="Logo"
            width={200}
            height={200}
            className='rounded-full shadow-lg' 
          />
        </div>
        <p className='text-lg mt-2 text-slate-500'>
          Select user to send message
        </p>
      </div>
    </div>
  );
}

export default Home;